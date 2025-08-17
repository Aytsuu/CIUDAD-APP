  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { template_record, template_file } from "../request/template-PostRequest";
  import { toast } from "sonner";
  import { CircleCheck } from "lucide-react";;
  import documentTemplateFormSchema from "@/form-schema/council/documentTemlateSchema";
  import { z } from "zod";

  type FileData = {
    name: string;
    type: string;
    file?: string;
  };

  type ExtendedIncomeExpense = z.infer<typeof documentTemplateFormSchema> & {
    files: FileData[]; 
  };



  //CREATING TEMPLATE
  export const useTemplateRecord = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (values: ExtendedIncomeExpense) => {
        //1. create template details
        const temp_id = await template_record(values);

        //2. create template files
        if (values.files && values.files.length > 0) {
          await Promise.all(
            values.files.map(file => 
              template_file({
                temp_id,
                file_data: {
                  name: file.name,
                  type: file.type,
                  file: file.file
                }
              }).catch(error => {
                console.error("Error creating file entry:", error);
                return null;
              })
            )
          );
        }          

      },
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