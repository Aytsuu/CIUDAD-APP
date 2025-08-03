import supabase from '@/supabase/supabase';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export const uploadPDFToSupabase = async (
    file: Blob,
    filename: string,
    bucket: string = 'files'
): Promise<UploadResult> => {
    try {
        // Create a File object from the Blob
        const pdfFile = new File([file], filename, { type: 'application/pdf' });

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(`ordinance-pdfs/${Date.now()}_${filename}`, pdfFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading to Supabase:', error);

            // If bucket doesn't exist, try to create it
            if (error.message.includes('Bucket not found')) {
                console.log('Attempting to create bucket...');
                const { error: createError } = await supabase.storage.createBucket(bucket, {
                    public: true
                });

                if (createError) {
                    console.error('Error creating bucket:', createError);
                    return {
                        success: false,
                        error: `Failed to create bucket: ${createError.message}`
                    };
                }

                // Try upload again after creating bucket
                const { data: retryData, error: retryError } = await supabase.storage
                    .from(bucket)
                    .upload(`ordinance-pdfs/${Date.now()}_${filename}`, pdfFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (retryError) {
                    return {
                        success: false,
                        error: retryError.message
                    };
                }

                // Get the public URL
                const { data: urlData } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(retryData.path);

                return {
                    success: true,
                    url: urlData.publicUrl
                };
            }

            return {
                success: false,
                error: error.message
            };
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl
        };

    } catch (error) {
        console.error('Error in uploadPDFToSupabase:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const deletePDFFromSupabase = async (
    filename: string,
    bucket: string = 'files'
): Promise<UploadResult> => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([`ordinance-pdfs/${filename}`]);

        if (error) {
            console.error('Error deleting from Supabase:', error);
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true
        };

    } catch (error) {
        console.error('Error in deletePDFFromSupabase:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const listPDFsFromSupabase = async (
    bucket: string = 'files'
): Promise<{ data: any[] | null; error: string | null }> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list('ordinance-pdfs', {
                limit: 100,
                offset: 0
            });

        if (error) {
            console.error('Error listing files from Supabase:', error);
            return {
                data: null,
                error: error.message
            };
        }

        return {
            data: data || [],
            error: null
        };

    } catch (error) {
        console.error('Error in listPDFsFromSupabase:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}; 