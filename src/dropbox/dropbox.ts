import axios from 'axios';
import 'dotenv/config';
import { ACCESS_TOKEN, DROPBOX_API_URL, DROPBOX_CONTENT_URL, getPublicUrl, handleFileContent, mapDropboxFile } from './helper';
import { DropboxFile } from './types';

const getCommonHeaders = () => ({
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
});

// Function to list Dropbox files with public URLs
export const listDropboxFiles = async (): Promise<DropboxFile[]> => {
    const url = `${DROPBOX_API_URL}/files/list_folder`;

    try {
        const { data: { entries } } = await axios.post(url, { path: '' }, { headers: getCommonHeaders() });

        const filesWithLinks = await Promise.all(entries.map(async (file: any) => {
            const publicUrl = await getPublicUrl(file.path_display);
            return mapDropboxFile(file, publicUrl);
        }));

        return filesWithLinks;
    } catch (error: any) {
        console.error("Error listing Dropbox files:", error?.response?.data || error?.message);
        throw new Error("Failed to list Dropbox files");
    }
};

// Function to download file content from Dropbox
export const downloadFileContent = async (fileId: string, fileType: string): Promise<string> => {
    const url = `${DROPBOX_CONTENT_URL}/files/download`;

    const headers = {
        ...getCommonHeaders(),
        'Dropbox-API-Arg': JSON.stringify({ path: fileId }),
        'Content-Type': 'text/plain'
    };

    try {
        const response = await axios.post(url, null, { headers, responseType: 'arraybuffer' });

        return handleFileContent(response.data, fileType);
    } catch (error: any) {
        console.error('Error downloading file content:', error?.response?.data || error?.message);
        throw new Error(`Failed to download content for file: ${fileId}`);
    }
};
