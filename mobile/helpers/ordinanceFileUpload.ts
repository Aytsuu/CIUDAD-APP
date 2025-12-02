import { api } from '@/api/api';

export interface OrdinanceFileData {
    name: string;
    type: string;
    file: string; // base64 data
}

export interface OrdinanceUploadResult {
    publicUrl: string;
    storagePath: string;
    fileName: string;
    fileId: number;
}

/**
 * Upload ordinance file using backend API (same approach as resolution)
 */
export const uploadFileToOrdinanceBucket = async (
    fileData: OrdinanceFileData
): Promise<OrdinanceUploadResult> => {
    try {
        console.log("🚀 Uploading ordinance file:", fileData.name);

        // Send base64 file data to backend API (same as resolution)
        const payload = {
            files: [{
                name: fileData.name,
                type: fileData.type,
                file: fileData.file  // Send base64 data directly
            }]
        };

        console.log("🚀 Making POST request to: council/ordinance-file/");

        const response = await api.post('council/ordinance-file/', payload);

        console.log("✅ Ordinance file uploaded successfully", response.data);

        // Return the response in the expected format
        const createdFile = response.data[0]; // Get the first (and only) created file
        console.log("🔍 Created file data:", createdFile);

        if (!createdFile) {
            throw new Error("No file data returned from server");
        }

        return {
            publicUrl: createdFile.of_url,
            storagePath: createdFile.of_path,
            fileName: createdFile.of_name,
            fileId: createdFile.of_id
        };
    } catch (error) {
        console.error("❌ Ordinance file upload failed:", error);
        throw new Error(`Failed to upload ordinance file: ${fileData.name}`);
    }
};
