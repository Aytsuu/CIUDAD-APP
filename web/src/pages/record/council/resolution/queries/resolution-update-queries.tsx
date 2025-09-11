import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { z } from "zod";
import {api} from "@/api/api";
import { useUpdateResolution } from "../request/resolution-put-request";
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';


type FileData = {
    id: string;
    name: string;
    type: string;
    file?: string;
};


type ExtendedResolutionUpdateValues = z.infer<typeof resolutionFormSchema> & {
  files: FileData[]; 
  res_num: String;
  staff: string;
};

export const usingUpdateResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: ExtendedResolutionUpdateValues) => {
      // Update main resolution data
      await useUpdateResolution(values.res_num, {
        res_title: values.res_title,
        res_date_approved: values.res_date_approved,
        res_area_of_focus: values.res_area_of_focus,
        gpr_id: values.gpr_id || null,
        staff: values.staff
      });
      
      // Handle file updates
      await handleResolutionFileUpdates(values.res_num, values.files);
      
      return values.res_num;
    },
    onSuccess: () => {
      toast.loading("Updating resolution...", { id: "updateRes" });

      toast.success('Resolution updated successfully', {
        id: "updateRes",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
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



const handleResolutionFileUpdates = async (res_num: String, mediaFiles: any[]) => {
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
    await Promise.all(filesToAdd.map(file =>
      api.post('council/resolution-file/', {
        res_num,
        files: [{
          name: file.name,
          type: file.type,
          file: file.file // The actual file object
        }]
      })
    ));
  } catch (err) {
    console.error("Error updating resolution files:", err);
    throw err;
  }
};

