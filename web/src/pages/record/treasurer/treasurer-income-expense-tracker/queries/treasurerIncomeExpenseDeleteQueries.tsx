import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncomeExpense } from "../request/income-ExpenseTrackingDeleteRequest";
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
      toast.loading("Deleting entry...", { id: "deleteToast" });
      
      return { iet_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      
      // Show success toast
      toast.success("Expense Entry Deleted", {
        id: "deleteToast",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
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