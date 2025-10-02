import { api } from "@/api/api";

export interface FileUploadData {
    uri: string;
    name: string;
    type: string;
}

export interface UploadedFile {
    file_id: string;
    file_name: string;
    file_url: string;
    file_path: string;
}

/**
 * Upload a single file to the server
 */
export const uploadFile = async (fileData: FileUploadData): Promise<UploadedFile> => {
    try {
        console.log("Uploading file:", fileData.name);

        // Create FormData for file upload
        const formData = new FormData();

        // Add file to FormData
        formData.append('file', {
            uri: fileData.uri,
            name: fileData.name,
            type: fileData.type,
        } as any);

        // Add additional metadata
        formData.append('file_name', fileData.name);
        formData.append('file_type', fileData.type);

        const response = await api.post('file/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("File uploaded successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("File upload failed:", error);
        throw new Error(`Failed to upload file: ${fileData.name}`);
    }
};

/**
 * Upload multiple files concurrently
 */
export const uploadMultipleFiles = async (files: FileUploadData[]): Promise<UploadedFile[]> => {
    try {
        console.log(`Uploading ${files.length} files...`);

        const uploadPromises = files.map(file => uploadFile(file));
        const results = await Promise.all(uploadPromises);

        console.log("All files uploaded successfully");
        return results;
    } catch (error) {
        console.error("Multiple file upload failed:", error);
        throw error;
    }
};

/**
 * Generate file name based on type and timestamp
 */
export const generateFileName = (type: 'permit' | 'assessment', businessName: string): string => {
    const timestamp = Date.now();
    const sanitizedBusinessName = businessName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    return `${type}_${sanitizedBusinessName}_${timestamp}.jpg`;
};

/**
 * Prepare file data for upload
 */
export const prepareFileForUpload = (
    imageUri: string,
    type: 'permit' | 'assessment',
    businessName: string
): FileUploadData => {
    return {
        uri: imageUri,
        name: generateFileName(type, businessName),
        type: 'image/jpeg'
    };
};
