import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIncomeExpense } from "../request/income-ExpenseTrackingPutRequest";
import { updateIncomeTracking } from "../request/income-ExpenseTrackingPutRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import IncomeExpenseEditFormSchema from "@/form-schema/treasurer/expense-tracker-edit-schema";
import IncomeEditFormSchema from "@/form-schema/treasurer/income-tracker-edit-schema";
import { z } from "zod";


//UPDATE EXPENSE
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
      toast.loading("Updating entry...", { id: "updateExpense" });

      toast.success('Expense Entry updated', {
        id: 'updateExpense',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating expense:", err);
      toast.error("Failed to update expense entry");
    }
  });
};





//UPDATE INCOME
export const useUpdateIncome = (
  inc_num: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: z.infer<typeof IncomeEditFormSchema>) => {
      const submissionValues = {
        ...values
      };
      return updateIncomeTracking(inc_num, submissionValues);
    },
    onSuccess: () => {
      toast.loading("Updating entry...", { id: "updateIncome" });

      toast.success('Income Entry updated', {
        id: "updateIncome",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['income'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating income:", err);
      toast.error("Failed to update income entry");
    }
  });
};