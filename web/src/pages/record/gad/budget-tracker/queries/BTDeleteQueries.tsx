import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delbudgettrackreq } from "../requestAPI/BTDelRequest";

export type GADBudgetEntry = {
  gbud_num?: number;
  gbud_date: string; 
  gbud_remaining_bal: number;
  gbud_particulars: string;
  gbud_type: string;
  gbud_amount: number;
  gbud_add_notes?: string;
  gbud_receipt?: string;
  gbudy_num: number;
  budget_item?: number;
  year?: string;
  gbudy_budget?: number; 
};

export const useDeleteGADBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gbud_num: number) => delbudgettrackreq(gbud_num),
    onSuccess: (_, gbud_num) => {
      // Optimistically update the cache
      queryClient.setQueryData(["gad-budgets"], (old: GADBudgetEntry[] = []) => 
        old.filter(entry => entry.gbud_num !== gbud_num)
      );
      
      // Invalidate the query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });

      toast.success("Budget entry deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
    },
    onError: (error: Error) => {
      toast.error("Failed to delete budget entry", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (gbud_num) => {
      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['gad-budgets'] });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(['gad-budgets']);

      // Optimistically update to the new value
      queryClient.setQueryData(['gad-budget'], (old: GADBudgetEntry[] = []) => 
        old.filter(entry => entry.gbud_num !== gbud_num)
      );

      // Return a context with the previous value
      return { previousEntries };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['gad-budgets'] });
    }
  });
};
