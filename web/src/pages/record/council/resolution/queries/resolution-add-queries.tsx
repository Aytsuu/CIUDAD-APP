import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import IncomeExpenseFormSchema from "@/form-schema/treasurer/expense-tracker-schema";
import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolution_create } from "../request/resolution-post-request";
import { resolution_file_create } from "../request/resolution-post-request";
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';




export const useCreateResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: z.infer<typeof resolutionFormSchema>) => {
      // 1. Create main resolution
      const res_num = await resolution_create(values);
      
      // 2. Create all file resolutin in parallel
      if (values.res_file?.length) {
        await Promise.all(
          values.res_file.map(file => 
            resolution_file_create({
              res_num,
              file_data: file
            })
          )
        );
      }
      
      return res_num;
    },  
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['resData'] });

      toast.loading("Creating resolution...", { id: "createRes" });
      
      // Show success toast
      toast.success('Resolution created successfully', {
        id: "createRes",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting Resolution:", err);
      toast.error(
        "Failed to submit Resolution. Please check the input data and try again.",
        { duration: 2000 }
      );
    }
  });
};