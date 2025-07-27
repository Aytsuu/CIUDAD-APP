import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncomeExpense } from "../request/income-ExpenseTrackingDeleteRequest";
import { archiveOrRestoreExpense } from "../request/income-ExpenseTrackingDeleteRequest";
import { archiveOrRestoreIncome } from "../request/income-ExpenseTrackingDeleteRequest";
import { updateIncomeExpenseMain } from "../request/income-ExpenseTrackingPostRequest";
import { updateIncomeMain } from "../request/income-ExpenseTrackingPostRequest";
import { updateBudgetPlanDetail } from "../request/income-ExpenseTrackingPostRequest";
import { deleteIncome } from "../request/income-ExpenseTrackingDeleteRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";




//DELETING EXPENSE
export const useDeleteIncomeExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (iet_num: number) => deleteIncomeExpense(iet_num),
    onMutate: async (iet_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['incomeExpense'] });
      
      // Show loading toast
      toast.loading("Deleting entry...", { id: "deleteExpense" });
      
      return { iet_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      
      // Show success toast
      toast.success("Expense Entry Deleted", {
        id: "deleteExpense",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete entry", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to delete entry:", err);
    }
  });
};



// ARCHIVE or RESTORE EXPENSE
// interface ExpenseData {
//   iet_num: number;
//   iet_is_archive: boolean; // Adjust to string if needed
// }

// export const useArchiveOrRestoreExpense = (onSuccess?: () => void) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ iet_num, iet_is_archive }: ExpenseData) => {
//       return archiveOrRestoreExpense(iet_num, { iet_is_archive });
//     },
//     onSuccess: (_, { iet_is_archive }: ExpenseData) => {

//       toast.loading(iet_is_archive ? 'Archiving entry...' : 'Restoring entry...', { id: 'updateWasteReport' });

//       toast.success(iet_is_archive ? 'Successfully archived entry' : 'Successfully restored entry', {
//         id: 'updateWasteReport',
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 5000,
//       });

//       queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });

//       if (onSuccess) onSuccess();
//     },
//     onError: (err: any) => {
//       console.error('Error archiving entry:', err);
//       toast.error(err.message || 'Failed to archive entry');
//     },
//   });
// };



interface ArchivePayload {
  iet_num: number;
  iet_is_archive: boolean;
  dtl_id: number;
  year: number;
  totalBudget: number;
  totalExpense: number;
  proposedBud: number;
}

export const useArchiveOrRestoreExpense = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

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
      await updateBudgetPlanDetail(data.dtl_id, {
        years: data.year,
        dtl_proposed_budget: data.proposedBud,
      });

      return data.iet_num;
    },
    onSuccess: (_, data) => {
      toast.loading(data.iet_is_archive ? 'Archiving entry...' : 'Restoring entry...', { 
        id: 'updateWasteReport' 
      });

      toast.success(data.iet_is_archive ? 'Successfully archived entry' : 'Successfully restored entry', {
        id: 'updateWasteReport',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000,
      });

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

//DELETING INCOME
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (inc_num: number) => deleteIncome(inc_num),
    onMutate: async (inc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['income'] });
      
      // Show loading toast
      toast.loading("Deleting entry...", { id: "deleteIncome" });
      
      return { inc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['income'] });
      
      // Show success toast
      toast.success("Income Entry Deleted", {
        id: "deleteIncome",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete entry", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to delete entry:", err);
    }
  });
};




//LATEST INCOMEE ARCHIVE
// interface IncomeData {
//   inc_num: number;
//   inc_is_archive: boolean; // Adjust to string if needed
// }

// export const useArchiveOrRestoreIncome = (onSuccess?: () => void) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ inc_num, inc_is_archive }: IncomeData) => {
//       return archiveOrRestoreIncome(inc_num, { inc_is_archive });
//     },
//     onSuccess: (_, { inc_is_archive }: IncomeData) => {

//       toast.loading(inc_is_archive ? 'Archiving entry...' : 'Restoring entry...', { id: 'updateWasteReport' });

//       toast.success(inc_is_archive ? 'Successfully archived entry' : 'Successfully restored entry', {
//         id: 'updateWasteReport',
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 5000,
//       });

//       queryClient.invalidateQueries({ queryKey: ['income'] });

//       if (onSuccess) onSuccess();
//     },
//     onError: (err: any) => {
//       console.error('Error archiving entry:', err);
//       toast.error(err.message || 'Failed to archive entry');
//     },
//   });
// };



interface IncomeArchivePayload {
  inc_num: number;
  inc_is_archive: boolean;
  year: number;
  totalIncome: number;
}

export const useArchiveOrRestoreIncome = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

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
      toast.loading(data.inc_is_archive ? 'Archiving entry...' : 'Restoring entry...', { 
        id: 'updateIncomeReport' 
      });

      toast.success(data.inc_is_archive ? 'Successfully archived entry' : 'Successfully restored entry', {
        id: 'updateIncomeReport',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000,
      });

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
