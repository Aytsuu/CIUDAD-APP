import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertOrdinanceUpload } from '../restful-api/OrdinanceUploadAPI.tsx';
import { MediaUploadType } from '@/components/ui/media-upload';
import { toast } from 'sonner';

export interface OrdinanceUploadData {
    values: {
        ordinanceTitle: string;
        ordinanceDate: string;
        ordinanceCategory: string;
        ordinanceDetails: string;
        ordinanceFile: string;
        // Amendment-related fields
        ord_parent?: string;
        ord_is_ammend?: boolean;
        ord_ammend_ver?: number;
    };
    mediaFiles: MediaUploadType;
}

export const useInsertOrdinanceUpload = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ values, mediaFiles }: OrdinanceUploadData) => {
            return await insertOrdinanceUpload(values, mediaFiles);
        },
        onSuccess: () => {
            toast.success('Ordinance uploaded successfully!');
            queryClient.invalidateQueries({ queryKey: ['ordinances'] });
            onSuccess?.();
        },
        onError: (error) => {
            console.error('Error uploading ordinance:', error);
            toast.error('Failed to upload ordinance. Please try again.');
        },
    });
}; 