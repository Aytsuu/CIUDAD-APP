import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react-native";
import { useToastContext } from "@/components/ui/toast";
import IncomeExpenseFormSchema from "../schema";
import IncomeFormSchema from "@/form-schema/treasurer/treasurer-income-schema";
import { income_expense_tracking } from "../request/income-expense-PostRequest";
import { income_expense_file_create } from "../request/income-expense-PostRequest";
import { updateIncomeExpenseMain } from "../request/income-expense-PostRequest";
import { updateExpenseParticular } from "../request/income-expense-PostRequest";
import { expense_log } from "../request/income-expense-PostRequest";
import { updateBudgetPlanDetail } from "../request/income-expense-PostRequest";
import { income_tracking } from "../request/income-expense-PostRequest";
import { updateIncomeMain } from "../request/income-expense-PostRequest";


type FileData = {
    name: string;
    type: string;
    file: string;
};

type ExtendedIncomeExpense = z.infer<typeof IncomeExpenseFormSchema> & {
  returnAmount: number;
  totalBudget: number;
  totalExpense: number;
  years: number;
  proposedBud: number;
  particularId: number;
  files: FileData[]; 
};


export const useCreateIncomeExpense = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (values: ExtendedIncomeExpense) => {
      // 1. Create main expense entry
      const iet_num = await income_expense_tracking(values);
      
      // 2. Create all file entries in parallel
      if (values.files && values.files.length > 0) {
        await Promise.all(
          values.files.map(file => 
            income_expense_file_create({
              iet_num,
              file_data: {
                name: file.name,
                type: file.type,
                file: file.file
              }
            }).catch(error => {
              console.error("Error creating file entry:", error);
              return null;
            })
          )
        );
      }       
      
      //3. Update main for the expenses
      await updateIncomeExpenseMain(values.years, {
        totalBudget: values.totalBudget,
        totalExpense: values.totalExpense,
      });

      //4. Update Expense Particular
      await updateExpenseParticular(values.particularId, {
        years: values.years,
        exp_proposed_budget: values.proposedBud,
      });

      //5. Add new Expense log
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
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
        queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
        queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });
        queryClient.invalidateQueries({ queryKey: ['expense_log'] });
      
        // Show success toast
        toast.success('Expense entry created successfully');

        if (onSuccess) onSuccess();
    },
    onError: (err) => {
        console.error("Failed to submit expense.", err);
        toast.error(err.message || 'Failed to submit expense.');

    }
  });
};  



// ============================ INCOME  ===================================================



type ExtendedIncomeValues = z.infer<typeof IncomeFormSchema> & {
  totalIncome: number;
  year: number;
};


export const useCreateIncome = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async (values: ExtendedIncomeValues) => {
      // 1. Create main income entry
      const inc_num = await income_tracking(values);
      
      // 2. Update the main income total
      await updateIncomeMain(values.year, {
        totalIncome: values.totalIncome,
      });
      
      return inc_num;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['incomeParticulars'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] }); // Assuming this contains your totals

      
      // Show success toast
      toast.success('Income Entry created successfully');

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting income:", err);
      toast.error("Failed to submit income. Please check the input data and try again.");
    }
  });
};