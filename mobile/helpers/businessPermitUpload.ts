import { api } from "@/api/api";

export interface BusinessPermitFileData {
    uri: string;
    name: string;
    type: string;
}

export interface BusinessPermitUploadResult {
    file_url: string;
    file_name: string;
    file_path: string;
}

/**
 * Upload business permit file to Supabase Storage
 */
export const uploadBusinessPermitFile = async (
    fileData: BusinessPermitFileData
): Promise<BusinessPermitUploadResult> => {
    try {
        console.log("🚀 Uploading business permit file:", fileData.name);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', {
            uri: fileData.uri,
            name: fileData.name,
            type: fileData.type,
        } as any);

        // Add metadata for business permit file
        formData.append('file_name', fileData.name);
        formData.append('file_type', fileData.type);
        formData.append('bucket_name', 'business-permit-file-bucket');

        console.log("🚀 Making POST request to: clerk/business-permit/upload/");

        const response = await api.post('clerk/business-permit/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("✅ Business permit file uploaded", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Business permit file upload failed:", error);
        throw new Error(`Failed to upload business permit file: ${fileData.name}`);
    }
};

/**
 * Upload multiple business permit files
 */
export const uploadMultipleBusinessPermitFiles = async (
    files: BusinessPermitFileData[]
): Promise<BusinessPermitUploadResult[]> => {
    try {
        console.log(`🚀 Uploading ${files.length} business permit files...`);

        const results: BusinessPermitUploadResult[] = [];
        for (const file of files) {
            try {

                const result = await uploadBusinessPermitFile(file);
                results.push(result);
            } catch (err) {

                console.warn(`⚠️ Retry uploading file: ${file.name}`);
                const retryResult = await uploadBusinessPermitFile(file);
                results.push(retryResult);
            }
        }

        console.log("✅ All business permit files uploaded");
        return results;
    } catch (error) {
        console.error("❌ Multiple business permit file upload failed:", error);
        throw error;
    }
};

/**
 * Generate file name for business permit files
 */
export const generateBusinessPermitFileName = (
    type: 'permit' | 'assessment',
    businessName: string
): string => {
    const timestamp = Date.now();
    const sanitizedBusinessName = businessName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    return `business_permit_${type}_${sanitizedBusinessName}_${timestamp}.jpg`;
};

/**
 * Prepare business permit file data for upload
 */
export const prepareBusinessPermitFileForUpload = (
    imageUri: string,
    type: 'permit' | 'assessment',
    businessName: string
): BusinessPermitFileData => {
    return {
        uri: imageUri,
        name: generateBusinessPermitFileName(type, businessName),
        type: 'image/jpeg'
    };
};
