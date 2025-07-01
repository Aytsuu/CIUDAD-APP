import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { GADBudgetEntry } from "../request/get";
import { GADBudgetCreatePayload, createGADBudget, createGADBudgetFile, GADBudgetFile } from "../request/post";

type BudgetYear = {
  gbudy_year: string;
  gbudy_budget: number;
  gbudy_expenses: number;
  gbudy_income: number;
};

type BudgetEntry = {
  gbud_type: string;
  gbud_actual_expense?: number;
};

type FileData = {
  name: string;
  type: string;
  path: string;
  uri: string;
};

export const useCreateGADBudget = (yearBudgets: BudgetYear[], budgetEntries: BudgetEntry[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      budgetData: GADBudgetCreatePayload;
      files?: FileData[]; // Changed from MediaUploadType to FileData[]
    }) => {
      // Validate remaining balance for Expense
      if (data.budgetData.gbud_type === "Expense" && data.budgetData.gbud_actual_expense) {
        const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === new Date(data.budgetData.gbud_datetime).getFullYear().toString());
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

      // Create budget entry
      const budgetEntry = await createGADBudget(data.budgetData);
      
      // Upload files if they exist
      if (data.files && data.files.length > 0) {
        await Promise.all(
          data.files.map((file) => 
            createGADBudgetFile({
              gbud_num: budgetEntry.gbud_num,
              file_data: file
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
      
      toast.success('Budget entry created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create budget entry');
    },
  });
};