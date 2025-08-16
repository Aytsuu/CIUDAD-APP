import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { createGADBudget, createGADBudgetFile } from "../request/post";
import { GADBudgetCreatePayload, BudgetYear, BudgetEntry} from "../bt-types";
import { MediaItem } from "@/components/ui/media-picker";

export const useCreateGADBudget = (yearBudgets: BudgetYear[], budgetEntries: BudgetEntry[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (data: {
      budgetData: GADBudgetCreatePayload;
       files: MediaItem[];
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
      
       // ✅ Fixed: Only process files that have proper data
      if (data.files && data.files.length > 0) {
        // Filter for valid files with base64 data (already formatted with data: prefix)
        const validFiles = data.files.filter(file => 
          file.file && 
          typeof file.file === 'string' && 
          file.file.startsWith('data:')
        );

        console.log(`Processing ${validFiles.length} valid files out of ${data.files.length} total files`);

        if (validFiles.length > 0) {
          await Promise.all(
            validFiles.map(async (file) => {
              try {
                // ✅ Fixed: Send the file with proper base64 data
                const filePayload = {
                  id: file.id,
                  name: file.name,
                  type: file.type,
                  file: file.file, // This now contains the properly formatted base64 data
                };

                return await createGADBudgetFile(budgetEntry.gbud_num, [filePayload]);
              } catch (error) {
                console.error("Error creating file entry:", error);
                return null;
              }
            })
          );
        } else {
          console.warn('No valid files to upload after filtering');
        }
      }

      return budgetEntry;
    },
    onSuccess: (_data, variables) => {
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