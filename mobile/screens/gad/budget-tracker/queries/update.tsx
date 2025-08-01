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
    }) => {
      // Fetch current entry
      const currentEntryRes = await api.get(`/gad/gad-budget-tracker-entry/${data.gbud_num}/`);
      const currentEntry = currentEntryRes.data;

      // Get old values (default to 0 if null/undefined)
      const oldActualExpense = Number(currentEntry.gbud_actual_expense) || 0;
      const oldProposedBudget = Number(currentEntry.gbud_proposed_budget) || 0;
      const oldExpense = oldActualExpense || oldProposedBudget;

      // Validate remaining balance for Expense entries
      if (data.budgetData.gbud_type === "Expense") {
        const currentYearBudget = yearBudgets.find(
          (b) => b.gbudy_year === new Date(data.budgetData.gbud_datetime).getFullYear().toString()
        );
        
        if (!currentYearBudget) {
          throw new Error("No budget found for the selected year");
        }

        const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
        const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
        const totalIncome = Number(currentYearBudget.gbudy_income) || 0;
        
        // Calculate current available balance
        const currentAvailable = initialBudget - (totalExpenses - oldExpense);

        // Determine new expense value (prioritize actual over proposed)
        const newExpenseValue = data.budgetData.gbud_actual_expense != null 
          ? Number(data.budgetData.gbud_actual_expense) || 0
          : Number(data.budgetData.gbud_proposed_budget) || 0;

        // Validate against available balance
        if (newExpenseValue > currentAvailable) {
          throw new Error(
            `Expense cannot exceed available balance of ₱${currentAvailable.toLocaleString()}`
          );
        }

        // Calculate expected remaining balance
        const expectedRemaining = currentAvailable - newExpenseValue;

        // Only validate remaining balance if explicitly provided
        if (data.budgetData.gbud_remaining_bal != null) {
          // Allow 1% tolerance for floating point differences
          const tolerance = currentAvailable * 0.01;
          const difference = Math.abs(Number(data.budgetData.gbud_remaining_bal) - expectedRemaining);
          
          if (difference > tolerance) {
            console.log("Budget Calculation Details:", {
              initialBudget,
              totalExpenses,
              totalIncome,
              oldActualExpense,
              oldProposedBudget,
              oldExpense,
              currentAvailable,
              newExpenseValue,
              expectedRemaining,
              receivedRemaining: data.budgetData.gbud_remaining_bal,
              difference,
              tolerance
            });
            
            throw new Error(
              `Remaining balance mismatch: expected ₱${expectedRemaining.toFixed(2)}, got ₱${Number(data.budgetData.gbud_remaining_bal).toFixed(2)}`
            );
          }
        }

        // Auto-calculate remaining balance if not provided
        data.budgetData.gbud_remaining_bal = Number(expectedRemaining.toFixed(2));
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