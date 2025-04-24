import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncomeExpense } from "../request/income-ExpenseTrackingDeleteRequest";
import { deleteIncome } from "../request/income-ExpenseTrackingDeleteRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";




//DELETING EXPENSE
export const useDeleteIncomeExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (iet_num: number) => deleteIncomeExpense(iet_num),
    onMutate: async (iet_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['incomeExpense'] });
      
      // Show loading toast
      toast.loading("Deleting entry...", { id: "deleteExpense" });
      
      return { iet_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      
      // Show success toast
      toast.success("Expense Entry Deleted", {
        id: "deleteExpense",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete entry", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to delete entry:", err);
    }
  });
};



//DELETING INCOME
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (inc_num: number) => deleteIncome(inc_num),
    onMutate: async (inc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['income'] });
      
      // Show loading toast
      toast.loading("Deleting entry...", { id: "deleteIncome" });
      
      return { inc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['income'] });
      
      // Show success toast
      toast.success("Income Entry Deleted", {
        id: "deleteIncome",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete entry", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to delete entry:", err);
    }
  });
};