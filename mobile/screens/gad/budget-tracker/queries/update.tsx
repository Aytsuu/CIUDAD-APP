import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { updateGADBudget, updateGADBudgetFile } from "../request/put";
import { BudgetYear, GADBudgetUpdatePayload, FileUploadPayload} from "../bt-types";
import { MediaItem } from "@/components/ui/media-picker";

export const useUpdateGADBudget = (yearBudgets: BudgetYear[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      budgetData: GADBudgetUpdatePayload;
      files: MediaItem[];
      filesToDelete: FileUploadPayload[];
    }) => {
      console.log('Mutation started with data:', data); // Debug log
      const { gbud_num } = data.budgetData;

      if (typeof gbud_num !== 'number') {
        throw new Error('Invalid budget entry ID');
      }

      if (data.budgetData.gbud_type === "Expense" && data.budgetData.gbud_actual_expense) {
        const currentYearBudget = yearBudgets.find(
          (b) =>
            b.gbudy_year ===
            new Date(data.budgetData.gbud_datetime).getFullYear().toString()
        );
        if (!currentYearBudget) {
          throw new Error("No budget found for the selected year");
        }
        const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
        const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
        const remainingBalance = initialBudget - totalExpenses;
        if (data.budgetData.gbud_actual_expense > remainingBalance) {
          throw new Error(
            `Expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`
          );
        }
      }

      if (data.filesToDelete.length > 0) {
        console.log('Deleting files:', data.filesToDelete); // Debug log
        await updateGADBudgetFile(gbud_num, data.filesToDelete, true);
      }

      console.log('Updating budget entry:', data.budgetData); // Debug log
      const updatedEntry = await updateGADBudget(gbud_num, data.budgetData);

      if (data.files.length > 0) {
        const validFiles = data.files.filter(file => 
          file.file && typeof file.file === 'string' && file.file.startsWith('data:')
        );
        if (validFiles.length > 0) {
          console.log('Uploading files:', validFiles); // Debug log
          await updateGADBudgetFile(gbud_num, validFiles, false);
        }
      }

      return updatedEntry;
    },
    onSuccess: (_data, variables) => {
      console.log('Mutation successful'); // Debug log
      const year = new Date(variables.budgetData.gbud_datetime).getFullYear().toString();
      queryClient.invalidateQueries({ queryKey: ['gad-budgets', year] });
      queryClient.invalidateQueries({ queryKey: ['gad-budget-entry', variables.budgetData.gbud_num] });
      toast.success('Budget entry updated successfully');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error); // Debug log
      toast.error(error.message || 'Failed to update budget entry');
    },
  });
};
