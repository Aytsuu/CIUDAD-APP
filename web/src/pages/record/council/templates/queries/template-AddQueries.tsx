  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { template_record } from "../request/template-PostRequest";
  import { toast } from "sonner";
  import { CircleCheck } from "lucide-react";;
  import documentTemplateFormSchema from "@/form-schema/council/documentTemplateSchema";
  import { z } from "zod";



  //CREATING TEMPLATE
  export const useTemplateRecord = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (values: z.infer<typeof documentTemplateFormSchema>) => 
        template_record(values),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['templateRec'] });

        toast.loading("Creating template...", { id: "createTemplate" });
        
        // Show success toast
        toast.success('Template created successfully', {
          id: "createTemplate",
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 5000
        });

        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        console.error("Error submitting template:", err);
        toast.error(
          "Failed to submit template. Please check the input data and try again.",
          { duration: 2000 }
        );
      }
    });
  };