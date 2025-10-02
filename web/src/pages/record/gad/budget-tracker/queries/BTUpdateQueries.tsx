import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { updateGADBudget, createGADBudgetFile } from "../requestAPI/BTPutRequest";
import { deleteGADBudgetFiles } from "../requestAPI/BTDelRequest";
import { api } from "@/api/api";
import { BudgetYear, GADBudgetUpdatePayload } from "../budget-tracker-types";

export const useUpdateGADBudget = (yearBudgets: BudgetYear[]) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: {
      gbud_num?: number;
      budgetData: Record<string, any>;
      files: Array<{ id: string; name: string; type: string; file: string | File }>;
      filesToDelete: string[];
      remainingBalance: number;
    }) => {

      if (!data.gbud_num) {
        throw new Error("Budget entry number is required for update");
      }

      if (data.budgetData.gbud_remaining_bal !== undefined) {
        const currentYearBudget = yearBudgets.find(
          (b) => b.gbudy_year === new Date(data.budgetData.gbud_datetime).getFullYear().toString()
        );
        if (!currentYearBudget) throw new Error("No budget found for the selected year");
        
        const remainingBalance = data.remainingBalance;
        const expectedRemaining = remainingBalance - (data.budgetData.gbud_actual_expense || 0);
        
        // Only check for significant discrepancies (server-side consistency)
        if (Math.abs(data.budgetData.gbud_remaining_bal - expectedRemaining) > 0.01) {
          throw new Error(`Remaining balance mismatch: expected ₱${expectedRemaining.toLocaleString()}, got ₱${data.budgetData.gbud_remaining_bal.toLocaleString()}`);
        }
      }

      // Delete removed files
      if (data.filesToDelete.length > 0) {
        await deleteGADBudgetFiles(data.filesToDelete, data.gbud_num);
      }

      // Update budget entry
      const budgetEntryResponse = await updateGADBudget(
        data.gbud_num,
        data.budgetData as GADBudgetUpdatePayload
      );

      // Fetch current files and sync
      const currentFilesRes = await api.get(`/gad/gad-budget-tracker-entry/${data.gbud_num}/`);
      const currentFiles = currentFilesRes.data.files || [];

      // Add new files
      const newFiles = data.files.filter(file => !file.id.startsWith('existing-'));
      if (newFiles.length > 0) {
        await createGADBudgetFile(data.gbud_num, newFiles);
      }

      return { ...budgetEntryResponse, files: currentFiles };
    },
    onSuccess: (_data, variables) => {
      const year = new Date(variables.budgetData.gbud_datetime).getFullYear().toString();
      queryClient.invalidateQueries({ queryKey: ['gad-budgets', year] });
      queryClient.invalidateQueries({ queryKey: ['gad-budget-entry', variables.gbud_num] });
      queryClient.invalidateQueries({ queryKey: ['gadYearBudgets'] });

      toast.success('Budget entry updated successfully', {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });

      navigate(`/gad/gad-budget-tracker-table/${year}/`);
    },
  });
};