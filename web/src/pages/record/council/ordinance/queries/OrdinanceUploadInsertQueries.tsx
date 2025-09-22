import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertOrdinanceUpload } from '../restful-api/OrdinanceUploadAPI.tsx';
import { updateOrdinance } from '../restful-api/OrdinanceGetAPI.tsx';
import { MediaUploadType } from '@/components/ui/media-upload';
import { toast } from 'sonner';

export interface OrdinanceUploadData {
    values: {
        ordinanceTitle: string;
        ordinanceDate: string;
        ordinanceCategory: string;
        ordinanceDetails: string;
        ordinanceFile: string;
        ord_repealed?: boolean;
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
        onSuccess: async (_data, variables) => {
            toast.success('Ordinance uploaded successfully!');
            // If this upload was a repeal, mark the targeted base ordinance as repealed
            try {
                const wasRepeal = Boolean(variables?.values?.ord_repealed);
                const baseOrdNum = variables?.values?.ord_parent;
                if (wasRepeal && baseOrdNum && baseOrdNum !== 'new') {
                    await updateOrdinance(baseOrdNum, { ord_repealed: true });
                }
            } catch (e) {
                console.error('Failed to mark base ordinance as repealed:', e);
            }
            queryClient.invalidateQueries({ queryKey: ['ordinances'] });
            onSuccess?.();
        },
        onError: (error) => {
            console.error('Error uploading ordinance:', error);
            toast.error('Failed to upload ordinance. Please try again.');
        },
    });
}; 