import { z } from "zod";
import {api} from "@/api/api";
import { useToastContext } from "@/components/ui/toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import IncomeExpenseFormSchema from "../schema";
import IncomeFormSchema from "@/form-schema/treasurer/treasurer-income-schema";
import { updateIncomeExpense } from "../request/income-expense-PutRequest";
import { updateIncomeExpenseMain } from "../request/income-expense-PostRequest";
import { updateBudgetPlanDetail } from "../request/income-expense-PostRequest";
import { updateIncomeTracking } from "../request/income-expense-PutRequest";
import { updateIncomeMain } from "../request/income-expense-PostRequest";



type ExtendedIncomeExpenseUpdateValues = z.infer<typeof IncomeExpenseFormSchema> & {
  mediaFiles: any[];
  years: number;
  totalBudget: number;
  totalExpense: number;
  proposedBud: number;
  particularId: number;
};


export const useUpdateIncomeExpense = (
  iet_num: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (values: ExtendedIncomeExpenseUpdateValues) => {
      // Update main expense data
      const submissionValues = {
        ...values,
        iet_particulars: values.iet_particulars.split(' ')[0] // Get just the ID part
      };
      
      // First update the main expense record
      await updateIncomeExpense(iet_num, submissionValues);
      
      // Then handle file updates
      await handleFileUpdates(iet_num, values.mediaFiles);

      //handle main update
      await updateIncomeExpenseMain(values.years, {
        totalBudget: values.totalBudget,
        totalExpense: values.totalExpense,
      });
  
      //handle particular
      await updateBudgetPlanDetail(values.particularId, {
        years: values.years,
        dtl_proposed_budget: values.proposedBud,
      });
      
      return iet_num;
    },
    onSuccess: () => {
      
        // Invalidate any related queries if needed
        queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
        queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
        queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });
        
        toast.success('Expense entry updated');
      
        if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating expense:", err);
      toast.error("Failed to update expense entry");
    }
  });
};



const handleFileUpdates = async (iet_num: number, mediaFiles: any[]) => {
  try {
    // Get current files from server
    const currentFilesRes = await api.get(`treasurer/income-expense-files/?iet_num=${iet_num}`);
    const currentFiles = currentFilesRes.data || [];
    
    // Determine files to keep and delete
    const existingFileIds = mediaFiles
      .filter(file => file.id?.startsWith('existing-'))
      .map(file => parseInt(file.id.replace('existing-', '')));
    
    // Delete files that were removed
   const filesToDelete = currentFiles.filter((file: any) => !existingFileIds.includes(file.ief_id));
    await Promise.all(filesToDelete.map((file: any) => 
      api.delete(`treasurer/income-expense-file/${file.ief_id}/`)
    ));
    
    // Add new files
    const filesToAdd = mediaFiles.filter(file => !file.id?.startsWith('existing-'));
    await Promise.all(filesToAdd.map(file =>
      api.post('treasurer/inc-exp-file/', {
        iet_num,
        ief_name: file.file?.name || `file-${Date.now()}`,
        ief_type: file.type,
        ief_path: file.path || '',
        ief_url: file.publicUrl
      })
    ));
  } catch (err) {
    console.error("Error updating files:", err);
    throw err;
  }
};








type ExtendedIncomeValues = z.infer<typeof IncomeFormSchema> & {
  totalIncome: number;
  year: number;
};

export const useUpdateIncome = (
  inc_num: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (values: ExtendedIncomeValues) => {
      // 1. Update main income entry
      const response = await updateIncomeTracking(inc_num, values);
      
      // 2. Update the main income totals
      await updateIncomeMain(values.year, {
        totalIncome: values.totalIncome,
      });
      
      return response;
    },
    onSuccess: () => {

      toast.success('Income Entry updated');
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating income:", err);
      toast.error("Failed to update income entry");
    }
  });
};