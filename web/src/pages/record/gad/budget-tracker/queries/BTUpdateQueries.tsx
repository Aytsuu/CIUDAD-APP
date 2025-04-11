import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putbudgettrackreq } from "../requestAPI/BTPutRequest";
import { GADBudgetEntry } from "./BTFetchQueries";

export const useUpdateGADBudgets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gbud_num, budgetEntryInfo }: { gbud_num: number; budgetEntryInfo: Partial<GADBudgetEntry> }) => 
      putbudgettrackreq(gbud_num, budgetEntryInfo),
    onSuccess: (updatedData, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(["budgetEntries"], (old: GADBudgetEntry[] = []) => 
        old.map(entry => 
          entry.gbud_num === variables.gbud_num ? { ...entry, ...updatedData } : entry
        )
      );
      
      toast.success("Budget entry updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update budget entry", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['budgetEntries'] });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(['budgetEntries']);

      // Optimistically update to the new value
      queryClient.setQueryData(['budgetEntries'], (old: GADBudgetEntry[] = []) => 
        old.map(entry => 
          entry.gbud_num === variables.gbud_num ? { ...entry, ...variables.budgetEntryInfo } : entry
        )
      );

      // Return a context with the previous value
      return { previousEntries };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['budgetEntries'] });
    }
  });
};