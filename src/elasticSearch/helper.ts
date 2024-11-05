import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import 'dotenv/config';
import { DropboxFile } from "../dropbox/types";
import { FileIndex } from "./types";

export const INDEX = process.env.INDEX_NAME || 'file_search';

// Validate the query parameter
export const validateQuery = (query: string): void => {
    if (!query) {
        throw new Error('Query parameter q is required.');
    }
};

// Create the document to index
export const createDocument = (fileData: DropboxFile, content: string) => ({
    index: INDEX,
    body: {
        ...fileData,
        content,
    }
});

// Extract relevant search results from the Elasticsearch response
export const extractSearchResults = (response: SearchResponse<FileIndex>): FileIndex[] => {
    return response.hits.hits.map((hit: any) => ({
        path: hit._source.path ?? '',
        name: hit._source.name ?? '',
        content: hit._source.content ?? '',
        id: hit._source.id ?? '',
        lastUpdatedTime: hit._source.lastUpdatedTime ?? '',
        publicUrl: hit._source.publicUrl ?? '',
        type: hit._source.type ?? '',
    }));
};