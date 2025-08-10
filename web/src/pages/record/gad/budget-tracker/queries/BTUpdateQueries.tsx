import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { updateGADBudget, createGADBudgetFile } from "../requestAPI/BTPutRequest";
import { MediaUploadType } from "@/components/ui/media-upload";
import { deleteGADBudgetFiles } from "../requestAPI/BTDelRequest";
import { BudgetYear, GADBudgetUpdatePayload } from "../budget-tracker-types";

export const useUpdateGADBudget = (yearBudgets: BudgetYear[]) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: {
      gbud_num: number;
      budgetData: Record<string, any>;
      files: MediaUploadType;
      filesToDelete: string[];
      remainingBalance: number; // Add remainingBalance
    }) => {
      // Validate remaining balance for Expense
      if (data.budgetData.gbud_type === "Expense" && data.budgetData.gbud_actual_expense) {
        const currentYearBudget = yearBudgets.find(
          (b) => b.gbudy_year === new Date(data.budgetData.gbud_datetime).getFullYear().toString()
        );
        if (!currentYearBudget) {
          throw new Error("No budget found for the selected year");
        }
        const remainingBalance = data.remainingBalance; // Use passed remainingBalance
        if (data.budgetData.gbud_actual_expense > remainingBalance) {
          throw new Error(
            `Expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`
          );
        }
        // Validate gbud_remaining_bal if provided
        if (data.budgetData.gbud_remaining_bal !== undefined) {
          const expectedRemaining = remainingBalance - data.budgetData.gbud_actual_expense;
          if (Math.abs(data.budgetData.gbud_remaining_bal - expectedRemaining) > 0.01) {
            throw new Error(
              `Remaining balance mismatch: expected ₱${expectedRemaining.toLocaleString()}, got ₱${data.budgetData.gbud_remaining_bal.toLocaleString()}`
            );
          }
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

      // Validate and create new files
      if (data.files.length > 0) {
        const validFiles = data.files.filter(
          (media) =>
            media.status === "uploaded" &&
            media.publicUrl &&
            media.storagePath &&
            media.file?.name &&
            media.file?.type &&
            !media.id?.startsWith("receipt-")
        );
        if (validFiles.length > 0) {
          await Promise.all(
            validFiles.map((file) => createGADBudgetFile(file, data.gbud_num))
          );
        }
      }

      return budgetEntryResponse;
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
    onError: (error: any, _variables) => {
  console.error('Error response:', error.response?.data);
  const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
  toast.error('Failed to update budget entry', {
    description: errorMessage,
  });
},
  });
};