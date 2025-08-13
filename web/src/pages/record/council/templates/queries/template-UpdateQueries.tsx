import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTemplateRec } from "../request/template-PutRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import documentTemplateFormSchema from "@/form-schema/council/documentTemplateSchema";
import { z } from "zod";




export const useUpdateTemplate = (
  temp_id: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: z.infer<typeof documentTemplateFormSchema>) => {
      const submissionValues = {
        ...values,
      };
      return updateTemplateRec(temp_id, submissionValues);
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