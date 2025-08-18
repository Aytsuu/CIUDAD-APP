import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTemplateRec } from "../request/template-PutRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
import { z } from "zod";
import {api} from "@/api/api";


type FileData = {
    id: string;
    name: string;
    type: string;
    file?: string;
};

type ExtendedTemplateUpdateValues = z.infer<typeof documentTemplateFormSchema> & {
  files: FileData[]; 
};


export const useUpdateTemplate = (
  temp_id: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: ExtendedTemplateUpdateValues) => {
      //1. update template details
      await updateTemplateRec(temp_id, values);

      //2 update template files
      await handleFileUpdates(temp_id, values.files);

    },
    onSuccess: () => {
      toast.loading("Updating template..", { id: "updateTemplate" });

      toast.success('Template updated', {
        id: 'updateTemplate',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating template:", err);
      toast.error("Failed to update template");
    }
  });
};





const handleFileUpdates = async (temp_id: number, mediaFiles: any[]) => {
  try {
    console.log("MEDIA FILESS SA QUERY EDIT: ", mediaFiles)
    // Get current files from server
    const currentFilesRes = await api.get(`council/template-files/?temp_id=${temp_id}`);
    const currentFiles = currentFilesRes.data || [];
    
    // Determine files to keep and delete
    const existingFileIds = mediaFiles
      .filter(file => file.id?.startsWith('existing-'))
      .map(file => parseInt(file.id.replace('existing-', '')));
    
    // Delete files that were removed
   const filesToDelete = currentFiles.filter((file: any) => !existingFileIds.includes(file.ief_id));
    await Promise.all(filesToDelete.map((file: any) => 
      api.delete(`council/delete-temp-file/${file.tf_id}/`)
    ));
    
    // Add new files
    const filesToAdd = mediaFiles.filter(file => !file.id?.startsWith('existing-'));
    await Promise.all(filesToAdd.map(file =>
      api.post('council/template-file/', {
        temp_id,
        files: [{
          name: file.name,
          type: file.type,
          file: file.file // The actual file object
        }]
      })
    ));
  } catch (err) {
    console.error("Error updating files:", err);
    throw err;
  }
};