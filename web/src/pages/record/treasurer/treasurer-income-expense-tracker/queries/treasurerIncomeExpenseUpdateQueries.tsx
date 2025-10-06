import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIncomeExpense } from "../request/income-ExpenseTrackingPutRequest";
import { updateIncomeTracking } from "../request/income-ExpenseTrackingPutRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";
import { updateIncomeExpenseMain } from "../request/income-ExpenseTrackingPostRequest";
import { updateIncomeMain } from "../request/income-ExpenseTrackingPostRequest";
import { expense_log } from "../request/income-ExpenseTrackingPostRequest";
import { updateExpenseParticular } from "../request/income-ExpenseTrackingPostRequest";
import IncomeExpenseEditFormSchema from "@/form-schema/treasurer/expense-tracker-edit-schema";
import IncomeEditFormSchema from "@/form-schema/treasurer/income-tracker-edit-schema";
import { z } from "zod";
import {api} from "@/api/api";




type FileData = {
    id: string;
    name: string;
    type: string;
    file?: string;
};

type ExtendedIncomeExpenseUpdateValues = z.infer<typeof IncomeExpenseEditFormSchema> & {
  files: FileData[]; 
  years: number;
  totalBudget: number;
  totalExpense: number;
  returnAmount: number;
  proposedBud: number;
  particularId: number;
  staff: string;
};


export const useUpdateIncomeExpense = (
  iet_num: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: ExtendedIncomeExpenseUpdateValues) => {
      //1. Update main expense data
      const submissionValues = {
        ...values,
        iet_particulars: values.iet_particulars.split(' ')[0] // Get just the ID part
      };
      
      //2. update the main expense record
      await updateIncomeExpense(iet_num, submissionValues);
      
      //3. handle file updates
      await handleFileUpdates(iet_num, values.files);

      //4. handle main update
      await updateIncomeExpenseMain(values.years, {
        totalBudget: values.totalBudget,
        totalExpense: values.totalExpense,
      });
  
      //5. handle particular
      await updateExpenseParticular(values.particularId, {
        years: values.years,
        exp_proposed_budget: values.proposedBud,
      });

      //5. add new expense log
      if(values.returnAmount > 0){
        await expense_log(iet_num, {
          returnAmount: values.returnAmount,
          el_proposed_budget: values.iet_amount,
          el_actual_expense: values.iet_actual_amount
        });
      }  
      
      return iet_num;
    },
    onSuccess: () => {

      showSuccessToast('Expense entry updated')
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });
      queryClient.invalidateQueries({ queryKey: ['expense_log'] });

      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating expense:", err);
      showErrorToast("Failed to update expense");
    }
  });
};



const handleFileUpdates = async (iet_num: number, mediaFiles: any[]) => {
  try {
    console.log("MEDIA FILESS SA QUERY EDIT: ", mediaFiles)
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
        files: [{
          name: file.name,
          type: file.type,
          file: file.file // The actual file object
        }]
      })
    ));
  } catch (err) {
    console.error("Error updating files:", err);
    throw err;
  }
};






type ExtendedIncomeValues = z.infer<typeof IncomeEditFormSchema> & {
  totalIncome: number;
  year: number;
  staff: string;
};

export const useUpdateIncome = (
  inc_num: number,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();
  
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

      showSuccessToast('Income entry updated')
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating income:", err);
      showErrorToast("Failed to update income");
    }
  });
};