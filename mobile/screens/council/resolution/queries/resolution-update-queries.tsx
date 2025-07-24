import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { z } from "zod";
import {api} from "@/api/api";
import { useUpdateResolution } from "../request/resolution-put-request";
import resolutionFormSchema from "@/form-schema/council/resolutionFormSchema";

type ExtendedResolutionUpdateValues = z.infer<typeof resolutionFormSchema> & {
  documentFiles: any[];
  mediaFiles: any[];
  res_num: number;
};

export const usingUpdateResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (values: ExtendedResolutionUpdateValues) => {
      // 1. Update main resolution data
      await useUpdateResolution(values.res_num, {
        res_title: values.res_title,
        res_date_approved: values.res_date_approved,
        res_area_of_focus: values.res_area_of_focus,
      });
      
      // 2. Handle file updates
      await handleResolutionFileUpdates(values.res_num, values.documentFiles);

      // 3. Handle Supp Docs updates
      await handleSuppDocUpdates(values.res_num, values.mediaFiles);
      
      return values.res_num;
    },
    onSuccess: () => {

      toast.success('Resolution updated successfully');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['resData'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating resolution:", err);
      toast.error("Failed to update resolution");
    }
  });
};



const handleResolutionFileUpdates = async (res_num: number, mediaFiles: any[]) => {
  try {
    // Get current files from server
    const currentFilesRes = await api.get(`council/resolution-file/?res_num=${res_num}`);
    const currentFiles = currentFilesRes.data || [];
    
    // Determine files to keep and delete
    const existingFileIds = mediaFiles
      .filter(file => file.id?.startsWith('existing-'))
      .map(file => parseInt(file.id.replace('existing-', '')));
    
    // Delete files that were removed
    const filesToDelete = currentFiles.filter((file: any) => !existingFileIds.includes(file.rf_id));
    await Promise.all(filesToDelete.map((file: any) => 
      api.delete(`council/resolution-file-delete/${file.rf_id}/`)
    ));
    
    // Add new files
    const filesToAdd = mediaFiles.filter(file => !file.id?.startsWith('existing-'));
    
    await Promise.all(filesToAdd.map(file => {
      const payload = {
        res_num: res_num,
        rf_name: file.name || `file-${Date.now()}`,
        rf_type: file.type,
        rf_path: file.path || file.storagePath || '',
        rf_url: file.publicUrl || file.uri
      };
      return api.post('council/resolution-file/', payload);
    }));
  } catch (err) {
    console.error("Error updating resolution files:", err);
    throw err;
  }
};



const handleSuppDocUpdates = async (res_num: number, mediaFiles: any[]) => {
  try {
    // Get current files from server
    const currentFilesRes = await api.get(`council/resolution-supp/?res_num=${res_num}`);
    const currentFiles = currentFilesRes.data || [];
    
    // Determine files to keep and delete
    const existingFileIds = mediaFiles
      .filter(file => file.id?.startsWith('existing-'))
      .map(file => parseInt(file.id.replace('existing-', '')));
    
    // Delete files that were removed
   const filesToDelete = currentFiles.filter((file: any) => !existingFileIds.includes(file.rsd_id));
    await Promise.all(filesToDelete.map((file: any) => 
      api.delete(`council/resolution-supp-delete/${file.rsd_id}/`)
    ));
    
    // Add new files
    const filesToAdd = mediaFiles.filter(file => !file.id?.startsWith('existing-'));
    await Promise.all(filesToAdd.map(file =>
      api.post('council/resolution-supp/', {
        res_num,
        rsd_name: file.file?.name || `file-${Date.now()}`,
        rsd_type: file.type,
        rsd_path: file.path || '',
        rsd_url: file.publicUrl
      })
    ));
  } catch (err) {
    console.error("Error updating files:", err);
    throw err;
  }
};