import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { elasticClient, logger } from '../app';
import { DropboxFile } from '../dropbox/types';
import { FileIndex } from './types';
import { createDocument, extractSearchResults, INDEX, validateQuery } from './helper';


// Index a file's content in Elasticsearch
export const indexFileContent = async (fileData: DropboxFile, content: string): Promise<void> => {
    const document = createDocument(fileData, content);

    try {
        await elasticClient.index(document);
        logger.info(`Successfully indexed file: ${fileData.name}`);
    } catch (error: any) {
        logger.error("Error indexing file content: ", error?.message);
        throw new Error("Indexing failed for the file.");
    }
};

// Search for files in Elasticsearch based on a query
export const searchFiles = async (query: string): Promise<FileIndex[]> => {
    validateQuery(query);

    try {
        const response: SearchResponse<FileIndex> = await elasticClient.search({
            index: INDEX,
            body: {
                query: {
                    match: { content: query }
                }
            }
        });

        return extractSearchResults(response);
    } catch (error: any) {
        logger.error("Error searching files: ", error?.message);
        throw new Error("Search operation failed.");
    }
};
