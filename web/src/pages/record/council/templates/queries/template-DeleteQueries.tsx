import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateTemplateRec } from "../request/template-DeleteRequest";
import { deleteTemplate } from "../request/template-DeleteRequest";


// interface deleteTemplateData {
//   temp_is_archive: boolean;
// }


// export const useDeleteTemplate = (temp_id: number, onSuccess?: () => void) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: deleteTemplateData) => {
//         return deleteTemplateRec(temp_id, data)
//     },
//    onSuccess: () => {
//       toast.loading("Updating template...", { id: "deleteTemplate" });

//       toast.success('Template deleted', {
//         id: 'deleteTemplate',
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 5000
//       });
      
//       // Invalidate any related queries if needed
//       queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      
//       if (onSuccess) onSuccess();
//     },
//     onError: (err) => {
//       console.error("Error deleting template:", err);
//       toast.error("Failed to deleting template");
//     }

//   });
// };



//ARCHIVE TEMPLATE
interface deleteTemplateData {
  temp_id: number;
  temp_is_archive: boolean;
}


export const useArchiveTemplate = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: deleteTemplateData) => {
      return updateTemplateRec(data.temp_id, data)
    },
    onSuccess: () => {
      toast.loading("Archiving template...", { id: "deleteTemplate" });
      toast.success('Template archived', {
        id: 'deleteTemplate',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });
      
      queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error archiving template:", err);
      toast.error("Failed to archive template");
    }
  });
};




//RESTORE TEMPLATE
interface restoreTemplateData {
  temp_id: number;
  temp_is_archive: boolean;
}


export const useRestoreTemplate = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: restoreTemplateData) => {
      return updateTemplateRec(data.temp_id, data)
    },
    onSuccess: () => {
      toast.loading("Restoring template...", { id: "deleteTemplate" });
      toast.success('Template restored', {
        id: 'deleteTemplate',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });
      
      queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error restoring template:", err);
      toast.error("Failed to restore template");
    }
  });
};




//DELETE TEMPLATE
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (temp_id: number) => deleteTemplate(temp_id),
    onMutate: async (temp_id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['templateRec'] });
      
      // Show loading toast
      toast.loading("Deleting template...", { id: "deleteTemp" });
      
      return { temp_id };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      
      // Show success toast
      toast.success("Template deleted", {
        id: "deleteTemp",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete template", {
        id: "deleteTemp",
        duration: 1000
      });
      console.error("Failed to delete template:", err);
    }
  });
};