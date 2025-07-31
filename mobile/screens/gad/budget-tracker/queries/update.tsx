import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { updateGADBudget, createGADBudgetFile } from "../request/put";
import { deleteGADBudgetFiles } from "../request/delete";
import { api } from "@/api/api";

type BudgetYear = {
  gbudy_year: string;
  gbudy_budget: number;
  gbudy_expenses: number;
  gbudy_income: number;
};

export type MediaFileType = {
  id: string;
  uri: string;
  name: string;
  type: string;
  path: string;
  publicUrl?: string;
  status: "uploading" | "uploaded" | "error";
};

const handleFileUpdates = async (gbud_num: number, mediaFiles: MediaFileType[]) => {
  try {
    // Get current files from server
    const currentFilesRes = await api.get(`/gad/gad-budget-files/?gbud_num=${gbud_num}`);
    const currentFiles = currentFilesRes.data || [];

    // Determine files to keep and delete
    const existingFileIds = mediaFiles
      .filter((file) => file.id?.startsWith("existing-"))
      .map((file) => parseInt(file.id.replace("existing-", "")));

    // Delete files that were removed
    const filesToDelete = currentFiles
      .filter((file: any) => !existingFileIds.includes(file.gbf_id))
      .map((file: any) => file.gbf_id.toString());
    if (filesToDelete.length > 0) {
      await deleteGADBudgetFiles(filesToDelete, gbud_num);
    }

    // Add new files
    const filesToAdd = mediaFiles.filter((file) => !file.id?.startsWith("existing-"));
    const validFilesToAdd = filesToAdd.filter((file) => file.status === "uploaded" && file.publicUrl);

    if (filesToAdd.length !== validFilesToAdd.length) {
      const invalidFiles = filesToAdd.filter((file) => file.status !== "uploaded" || !file.publicUrl);
      console.warn("Skipping invalid files:", invalidFiles.map((f) => ({ name: f.name, status: f.status, publicUrl: f.publicUrl })));
    }

    await Promise.all(
      validFilesToAdd.map((file) =>
        createGADBudgetFile(
          {
            file: { name: file.name, type: file.type }, // Note: file object may need adjustment
            publicUrl: file.publicUrl!,
            storagePath: file.path,
            status: file.status,
          },
          gbud_num
        )
      )
    );
  } catch (err) {
    console.error("Error updating files:", err);
    throw err;
  }
};

export const useUpdateGADBudget = (yearBudgets: BudgetYear[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      gbud_num: number;
      budgetData: Record<string, any>;
      files: MediaFileType[];
      filesToDelete: string[];
      remainingBalance: number;
    }) => {
      // Fetch current entry
      const currentEntryRes = await api.get(`/gad/gad-budget-tracker-entry/${data.gbud_num}/`);
      const currentEntry = currentEntryRes.data;

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

        if (data.budgetData.gbud_remaining_bal !== undefined) {
          const expectedRemaining = remainingBalance - data.budgetData.gbud_actual_expense;
          if (Math.abs(data.budgetData.gbud_remaining_bal - expectedRemaining) > 0.01) {
            throw new Error(
              `Remaining balance mismatch: expected ₱${expectedRemaining.toLocaleString()}, got ₱${data.budgetData.gbud_remaining_bal.toLocaleString()}`
            );
          }
        }
      }

      // Update budget entry
      const budgetEntry = await updateGADBudget(data.gbud_num, data.budgetData);

      // Handle file updates
      await handleFileUpdates(data.gbud_num, data.files);

      return budgetEntry;
    },
    onSuccess: (data, variables) => {
      const year = new Date(variables.budgetData.gbud_datetime).getFullYear().toString();
      queryClient.invalidateQueries({ queryKey: ["gad-budgets", year] });
      queryClient.invalidateQueries({ queryKey: ["gad-budgets", variables.gbud_num] });
      queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });

      toast.success("Budget entry updated successfully");
    },
    onError: (error: any, variables) => {
      const errorMessage = error.message || JSON.stringify(error.response?.data || "Unknown error");
      toast.error("Failed to update budget entry");
      console.error("Update Error:", {
        errorMessage,
        response: error.response?.data,
        filesToDelete: variables.filesToDelete,
        gbud_num: variables.gbud_num,
      });
    },
  });
};