import axios from "axios";
import { DropboxFile } from "./types";
import { logger } from "../app";

export const DROPBOX_API_URL = "https://api.dropboxapi.com/2";
export const DROPBOX_CONTENT_URL = "https://content.dropboxapi.com/2";
export const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

// Helper function to get headers
const getHeaders = () => ({
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
});


// Helper function to fetch public URL for a file
export const getPublicUrl = async (path: string): Promise<string | null> => {
    const createUrl = `${DROPBOX_API_URL}/sharing/create_shared_link_with_settings`;
    const listUrl = `${DROPBOX_API_URL}/sharing/list_shared_links`;

    try {
        // Check for existing shared links
        const { data: { links } } = await axios.post(listUrl, { path }, { headers: getHeaders() });

        // Return existing link if available
        if (links.length > 0) {
            return formatPublicUrl(links[0].url);
        }

        // Create a new shared link
        const { data } = await axios.post(createUrl, {
            path,
            settings: {
                access: "viewer",
                allow_download: true,
                audience: "public",
                requested_visibility: "public"
            }
        }, { headers: getHeaders() });

        return formatPublicUrl(data.url);
    } catch (error: any) {
        logger.error(`Error generating public URL for ${path}:`, error?.response?.data || error?.message);
        return null;
    }
};

// Helper function to format Dropbox URLs
const formatPublicUrl = (url: string) => url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "");

// Function to map Dropbox API response to DropboxFile type
export const mapDropboxFile = (file: any, publicUrl: string | null): DropboxFile => ({
    path: file.path_display,
    type: file.path_display.split('.').pop() || 'unknown',
    id: file.id,
    lastUpdatedTime: file.server_modified,
    name: file.name,
    publicUrl: publicUrl || ''
});

// Helper function to handle file content based on type
export const handleFileContent = (data: ArrayBuffer, fileType: string): string => {
    if (fileType === 'txt') {
        return Buffer.from(data).toString('utf8');
    } else {
        logger.warn('File type handling is not supported for:', fileType);
        return '';
    }
};