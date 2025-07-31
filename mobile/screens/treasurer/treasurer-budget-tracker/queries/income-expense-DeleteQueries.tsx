import { api } from "@/api/api";
import { useToastContext } from "@/components/ui/toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { archiveOrRestoreExpense } from "../request/income-expense-DeleteRequest";
import { updateIncomeExpenseMain } from "../request/income-expense-PostRequest";
import { updateExpenseParticular } from "../request/income-expense-PostRequest";
import { updateBudgetPlanDetail } from "../request/income-expense-PostRequest";
import { deleteIncomeExpense } from "../request/income-expense-DeleteRequest";
import { deleteIncome } from "../request/income-expense-DeleteRequest";
import { archiveOrRestoreIncome } from "../request/income-expense-DeleteRequest";
import { updateIncomeMain } from "../request/income-expense-PostRequest";



interface ArchivePayload {
  iet_num: number;
  iet_is_archive: boolean;
  exp_id: number;
  year: number;
  totalBudget: number;
  totalExpense: number;
  proposedBud: number;
}

export const useArchiveOrRestoreExpense = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (data: ArchivePayload) => {
      // 1. Archive the main expense entry
      await archiveOrRestoreExpense(data.iet_num, { 
        iet_is_archive: data.iet_is_archive 
      });

      // 2. Update the main expense totals
      await updateIncomeExpenseMain(data.year, {
        totalBudget: data.totalBudget,
        totalExpense: data.totalExpense,
      });


      // 3. Update the budget plan detail
      await updateExpenseParticular(data.exp_id, {
        years: data.year,
        exp_proposed_budget: data.proposedBud,
      });

      return data.iet_num;
    },
    onSuccess: (_, data) => {

      toast.success(data.iet_is_archive ? 'Successfully archived entry' : 'Successfully restored entry');

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });

      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      console.error('Error archiving entry:', err);
      toast.error(err.message || 'Failed to archive entry');
    },
  });
};




// DELETE EXPENSE
export const useDeleteIncomeExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: (iet_num: number) => deleteIncomeExpense(iet_num),
    onMutate: async (iet_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['incomeExpense'] });
      
      return { iet_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      
      // Show success toast
      toast.success("Expense Entry Deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete entry");
      console.error("Failed to delete entry:", err);
    }
  });
};


// ===================================== INCOME =======================================


//DELETING INCOME
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); 

  return useMutation({
    mutationFn: (inc_num: number) => deleteIncome(inc_num),
    onMutate: async (inc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['income'] });
      
      
      return { inc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['income'] });
      
      // Show success toast
      toast.success("Income Entry Deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete entry");
      console.error("Failed to delete entry:", err);
    }
  });
};





interface IncomeArchivePayload {
  inc_num: number;
  inc_is_archive: boolean;
  year: number;
  totalIncome: number;
}

export const useArchiveOrRestoreIncome = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext(); 
  
  return useMutation({
    mutationFn: async (data: IncomeArchivePayload) => {
      // 1. Archive/Restore the main income entry
      const response = await archiveOrRestoreIncome(data.inc_num, { 
        inc_is_archive: data.inc_is_archive 
      });
      
      // 2. Update the main income totals if provided
      if (data.year && data.totalIncome !== undefined) {
        await updateIncomeMain(data.year, {
          totalIncome: data.totalIncome,
        });
      }
      
      return response;
    },
    onSuccess: (_, data) => {

      toast.success(data.inc_is_archive ? 'Successfully archived entry' : 'Successfully restored entry');

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });

      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      console.error('Error archiving entry:', err);
      toast.error(err.message || 'Failed to archive entry');
    },
  });
};