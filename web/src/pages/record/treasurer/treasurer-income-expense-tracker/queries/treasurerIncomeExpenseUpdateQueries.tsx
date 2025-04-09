import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIncomeExpense } from "../request/income-ExpenseTrackingPutRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import IncomeExpenseEditFormSchema from "@/form-schema/treasurer/expense-tracker-edit-schema";
import { z } from "zod";



export const useUpdateIncomeExpense = (
  iet_num: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {
      const submissionValues = {
        ...values,
        iet_particulars: values.iet_particulars.split(' ')[0] // Get just the ID part
      };
      return updateIncomeExpense(iet_num, submissionValues);
    },
    onSuccess: () => {
      toast.success('Entry updated', {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating expense or income:", err);
      toast.error("Failed to update entry");
    }
  });
};