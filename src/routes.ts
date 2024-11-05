import { Router, Request, Response } from 'express';
import { downloadFileContent, listDropboxFiles } from './dropbox/dropbox';
import { indexFileContent, searchFiles } from './elasticSearch/elasticSearch';
import pino from 'pino';

const router = Router();
const logger = pino();

// Route to index files
router.get('/api/index-files', async (req: Request, res: Response) => {
    try {
        const files = await listDropboxFiles();

        await Promise.all(files.map(async (file) => {
            try {
                const content = await downloadFileContent(file.path, file.type);
                await indexFileContent(file, content);
            } catch (fileError) {
                logger.error(`Error processing file ${file.path}: `, fileError);
            }
        }));

        res.json({ message: "Files indexed successfully" });
    } catch (error) {
        logger.error("Error in indexing files: ", error);
        res.status(500).json({ error: 'Failed to index files' });
    }
});

// Route to search files
router.get('/api/search', async (req: Request, res: Response) => {
    const query = req.query.q as string;

    try {
        const results = await searchFiles(query);
        res.json({ files: results });
    } catch (error) {
        logger.error("Error in searching files: ", error);
        res.status(500).json({ error: 'Failed to search files' });
    }
});

export default router;