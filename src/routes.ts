import { Router, Request, Response } from 'express';
import { downloadFileContent, listDropboxFiles } from './dropbox/dropbox';
import { indexFileContent, searchFiles } from './elasticSearch/elasticSearch';
import { logger } from './app';

const router = Router();

// Health Route
router.get('/health', (req: Request, res: Response) => {
    res.json({ message: 'Status Up!' });
})

// Route to index files
router.get('/api/index-files', async (req: Request, res: Response) => {
    try {
        const files = await listDropboxFiles();
        let fileProcessingError = false;

        await Promise.all(files.map(async (file) => {
            try {
                const content = await downloadFileContent(file.path, file.type);
                await indexFileContent(file, content);
            } catch (fileError) {
                fileProcessingError = true;
                logger.error(`Error processing file ${file.path}: `, fileError);
            }
        }));

        if (fileProcessingError) {
            res.status(207).json({ message: "Some files encountered errors during indexing"});
        } else {
            res.json({ message: 'Files indexed successfully' });
        }
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