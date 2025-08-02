import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { z } from "zod";
import { archiveTemplateRec } from "../request/template-DeleteRequest";
import { deleteTemplate } from "../request/template-DeleteRequest";



//ARCHIVE TEMPLATE
interface deleteTemplateData {
  temp_id: number;
  temp_is_archive: boolean;
}

export const useArchiveTemplate = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: deleteTemplateData) => {
      return archiveTemplateRec(data.temp_id, data)
    },
    onSuccess: () => {
      toast.success('Template archived successfully');
      
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
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: restoreTemplateData) => {
      return archiveTemplateRec(data.temp_id, data)
    },
    onSuccess: () => {
      toast.success('Template restored successfully');
      
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
  const { toast } = useToastContext();    
  
  return useMutation({
    mutationFn: (temp_id: number) => deleteTemplate(temp_id),
    onMutate: async (temp_id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['templateRec'] });
     
      return { temp_id };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      
      // Show success toast
      toast.success("Successfully deleted template");
    },
    onError: (err) => {
      toast.error("Failed to delete template");
      console.error("Failed to delete template:", err);
    }
  });
};

