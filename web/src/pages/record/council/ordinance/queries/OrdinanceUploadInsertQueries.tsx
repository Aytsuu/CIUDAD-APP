import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertOrdinanceUpload } from '../restful-api/OrdinanceUploadAPI.tsx';
import { updateOrdinance } from '../restful-api/OrdinanceGetAPI.tsx';
import { MediaUploadType } from '@/components/ui/media-upload';
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useAuth } from '@/context/AuthContext';

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
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ values, mediaFiles }: OrdinanceUploadData) => {
            const staffId = user?.staff?.staff_id;
            if (!staffId) {
                throw new Error("Staff information not available. Please log in again.");
            }
            return await insertOrdinanceUpload(values, mediaFiles, staffId);
        },
        onSuccess: async (_data, variables) => {
            showSuccessToast('Ordinance uploaded successfully!');
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
            showErrorToast('Failed to upload ordinance. Please try again.');
        },
    });
}; 