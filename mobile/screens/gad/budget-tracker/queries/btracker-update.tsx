import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { updateGADBudget, updateGADBudgetFile } from "../request/btracker-put";
import { BudgetYear, GADBudgetUpdatePayload, FileUploadPayload} from "../gad-btracker-types";
import { MediaItem } from "@/components/ui/media-picker";

export const useUpdateGADBudget = (yearBudgets: BudgetYear[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      gbud_num?: number;
      budgetData: GADBudgetUpdatePayload;
      files: MediaItem[];
      filesToDelete: FileUploadPayload[];
    }) => {
      if (!data.gbud_num) {
        throw new Error("Budget entry number is required for update");
      }

      if (data.filesToDelete.length > 0) {
        await updateGADBudgetFile(data.gbud_num, data.filesToDelete, true);
      }
      const updatedEntry = await updateGADBudget(data.gbud_num, data.budgetData);

      if (data.files.length > 0) {
        const validFiles = data.files.filter(file => 
          file.file && typeof file.file === 'string' && file.file.startsWith('data:')
        );
        if (validFiles.length > 0) {
          console.log('Uploading files:', validFiles); // Debug log
          await updateGADBudgetFile(data.gbud_num, validFiles, false);
        }
      }

      return updatedEntry;
    },
    onSuccess: (_data, variables) => {
      console.log('Mutation successful');
      const year = new Date(variables.budgetData.gbud_datetime).getFullYear().toString();
      queryClient.invalidateQueries({ queryKey: ['gad-budgets', year] });
      queryClient.invalidateQueries({ queryKey: ['gad-budget-entry', variables.budgetData.gbud_num] });
      toast.success('Budget entry updated successfully');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(error.message || 'Failed to update budget entry');
    },
  });
};
