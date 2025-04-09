import { useMutation, useQueryClient } from "@tanstack/react-query";
import { income_expense_tracking } from "../request/income-ExpenseTrackingPostRequest";
import { income_tracking } from "../request/income-ExpenseTrackingPostRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import IncomeExpenseFormSchema from "@/form-schema/treasurer/expense-tracker-schema";
import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
import { z } from "zod";



//CREATING EXPENSE ENTRY
export const useCreateIncomeExpense = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: z.infer<typeof IncomeExpenseFormSchema>) => 
      income_expense_tracking(values),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });

      toast.loading("Creating entry...", { id: "createExpense" });
      
      // Show success toast
      toast.success('Expense Entry created successfully', {
        id: "createExpense",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting expense or income:", err);
      toast.error(
        "Failed to submit income or expense. Please check the input data and try again.",
        { duration: 2000 }
      );
    }
  });
};




//CREATING INCOME
export const useCreateIncome = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: z.infer<typeof IncomeFormSchema>) => 
      income_tracking(values),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['income'] });

      toast.loading("Creating entry...", { id: "createIncome" });
      
      // Show success toast
      toast.success('Income Entry created successfully', {
        id: "createIncome",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting income:", err);
      toast.error(
        "Failed to submit income. Please check the input data and try again.",
        { duration: 2000 }
      );
    }
  });
};