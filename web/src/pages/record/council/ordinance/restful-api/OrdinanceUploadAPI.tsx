import { api } from '@/api/api';
import { MediaUploadType } from '@/components/ui/media-upload';
import supabase from '@/supabase/supabase';

// Upload file directly to ordinance bucket
export const uploadFileToOrdinanceBucket = async (mediaFile: MediaUploadType[0]) => {
    try {
        console.log('Starting direct file upload to ordinance bucket...');
        console.log('Media file:', mediaFile);
        
        // Get the file object
        const file = (mediaFile as any).file;
        if (!file) {
            throw new Error('No file object found in mediaFile');
        }
        
        console.log('File object:', file);
        console.log('File name:', file.name);
        console.log('File type:', file.type);
        console.log('MediaFile structure:', mediaFile);

        // Try different ways to get the filename
        const actualFileName = file.name || 
                              (mediaFile as any).name || 
                              (mediaFile as any).fileName || 
                              'file';
        
        console.log('Actual filename to use:', actualFileName);

        // Convert base64 data URL to proper File object if needed
        let fileToUpload = file;
        if (typeof file === 'string' && file.startsWith('data:')) {
            console.log('Converting base64 data URL to File object...');
            const response = await fetch(file);
            const blob = await response.blob();
            fileToUpload = new File([blob], actualFileName, { type: blob.type });
            console.log('Converted to File object:', fileToUpload);
        }

        // Upload directly to ordinance bucket
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${actualFileName}`;
        const filePath = `ordinances/${fileName}`;
        
        console.log('Uploading to ordinance bucket with path:', filePath);

        const { error: uploadError } = await supabase.storage
            .from('ordinance-bucket')
            .upload(filePath, fileToUpload, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
        }
        
        console.log('File uploaded successfully to ordinance bucket');

        // Get public URL from ordinance bucket
        const { data: { publicUrl } } = supabase.storage
            .from('ordinance-bucket')
            .getPublicUrl(filePath);
            
        console.log('Public URL generated:', publicUrl);

        return { publicUrl, storagePath: filePath, fileName: actualFileName };
    } catch (error) {
        console.error('Error uploading file to ordinance bucket:', error);
        throw error;
    }
};

export const createOrdinanceFile = async (mediaFile: MediaUploadType[0]) => {
    try {
        console.log('Starting ordinance file creation...');
        console.log('Media file:', mediaFile);
        
        // Upload file directly to ordinance bucket
        console.log('Uploading file to ordinance bucket...');
        const uploadResult = await uploadFileToOrdinanceBucket(mediaFile);
        console.log('File uploaded successfully:', uploadResult);
        
        const fileData = {
            of_url: uploadResult.publicUrl,
            of_name: uploadResult.fileName,
            of_type: ((mediaFile as any).type || 'unknown').substring(0, 50), // Limit to 50 characters
            of_path: uploadResult.storagePath, // Use the storage path
        };
        
        console.log('Sending file data to backend:', fileData);
        const fileResponse = await api.post('council/ordinance-file/', fileData);
        console.log('Backend file response:', fileResponse.data);
        
        return fileResponse.data;
    } catch (error) {
        console.error('Error creating ordinance file:', error);
        throw error;
    }
};

export const insertOrdinanceUpload = async (ordinanceInfo: Record<string, any>, mediaFiles: MediaUploadType) => {
    try {
        // Extract year from date
        const date = new Date(ordinanceInfo.ordinanceDate);
        const year = date.getFullYear();

        // 1. Handle file upload first if exists
        let fileId = null;
        console.log('Media files:', mediaFiles);
        console.log('Media files length:', mediaFiles.length);
        
        if (mediaFiles.length > 0) {
            console.log('First media file:', mediaFiles[0]);
            console.log('File status:', (mediaFiles[0] as any).status);
            console.log('File object exists:', !!(mediaFiles[0] as any).file);
            
            // Check if file is ready for upload
            const mediaFile = mediaFiles[0];
            const hasFile = !!(mediaFile as any).file;
            const isUploaded = (mediaFile as any).status === 'uploaded';
            
            console.log('File ready for upload:', hasFile && isUploaded);
            
            if (hasFile) {
                try {
                    const fileResponse = await createOrdinanceFile(mediaFile);
                    console.log('File upload response:', fileResponse);
                    fileId = fileResponse.of_id;
                    console.log('File ID obtained:', fileId);
                } catch (fileError) {
                    console.error('Error uploading file:', fileError);
                    // Continue without file if upload fails
                }
            } else {
                console.log('No file object found in media file');
            }
        } else {
            console.log('No media files provided');
        }

        // 2. Create ordinance record with file
        const ordinanceData: any = {
            ord_title: ordinanceInfo.ordinanceTitle,
            ord_date_created: ordinanceInfo.ordinanceDate,
            ord_category: ordinanceInfo.ordinanceCategory,
            ord_details: ordinanceInfo.ordinanceDetails,
            ord_year: year,
            ord_is_archive: false,
            ord_repealed: Boolean(ordinanceInfo.ord_repealed),
            staff: "00003250722", // Default staff ID
            of_id: fileId
        };

        // Add amendment-related fields if this is an amendment
        if (ordinanceInfo.ord_parent && ordinanceInfo.ord_parent !== "new") {
            ordinanceData.ord_parent = ordinanceInfo.ord_parent;
            ordinanceData.ord_is_ammend = ordinanceInfo.ord_is_ammend;
            ordinanceData.ord_ammend_ver = ordinanceInfo.ord_ammend_ver;
        }
        
        console.log('Final ordinance data being sent to backend:', ordinanceData);
        console.log('File ID being sent:', fileId);

        const ordinanceResponse = await api.post('council/ordinance/', ordinanceData);
        console.log('Backend response:', ordinanceResponse.data);

        return ordinanceResponse.data;
    } catch (error) {
        console.error('Error creating Ordinance Upload:', error);
        throw error;
    }
}; 