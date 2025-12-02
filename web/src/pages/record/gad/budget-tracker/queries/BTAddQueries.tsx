import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import { createGADBudget, createGADBudgetFile } from "../requestAPI/BTPostRequest";
import { MediaUploadType } from "@/components/ui/media-upload";
import { BudgetYear, BudgetEntry, GADBudgetCreatePayload } from "../budget-tracker-types";

export const useCreateGADBudget = (yearBudgets: BudgetYear[], _budgetEntries: BudgetEntry[]) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: {
      budgetData: GADBudgetCreatePayload;
      files: MediaUploadType;
    }) => {

        const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === new Date(data.budgetData.gbud_datetime).getFullYear().toString());
        if (!currentYearBudget) {
          throw new Error("No budget found for the selected year");
        }
        const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
        const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
        const remainingBalance = initialBudget - totalExpenses;
        if (data.budgetData.gbud_actual_expense != null && data.budgetData.gbud_actual_expense > remainingBalance) {
          throw new Error(
            `Expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`
          );
      }

      // Create budget entry
      const budgetEntry = await createGADBudget(data.budgetData);

      // Create files in parallel
      if (data.files.length > 0) {
        await Promise.all(
          data.files.map(file =>
            createGADBudgetFile(budgetEntry.gbud_num, [{
              id: file.id,
              name: file.name,
              type: file.type,
              file: file.file
            }]).catch(_error => {
              // console.error("Error creating file entry:", error);
              return null;
            })
          )
        );
      }

      return budgetEntry;
    },
    onSuccess: (data, variables) => {
      const year = new Date(variables.budgetData.gbud_datetime).getFullYear().toString();
      queryClient.invalidateQueries({
        queryKey: ['gad-budgets', year],
      });
      queryClient.invalidateQueries({
        queryKey: ['gad-budget-files', data.gbud_num],
      });
      queryClient.invalidateQueries({ queryKey: ["budgetAggregates", year] });

      showSuccessToast('Budget entry created successfully');
      navigate(`/gad/gad-budget-tracker-table/${year}/`);
    },
    onError: (_error: any) => {
      showErrorToast('Failed to create budget entry');
    },
  });
};