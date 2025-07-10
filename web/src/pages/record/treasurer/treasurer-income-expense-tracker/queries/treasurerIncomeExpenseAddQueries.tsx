import { useMutation, useQueryClient } from "@tanstack/react-query";
import { income_expense_tracking } from "../request/income-ExpenseTrackingPostRequest";
import { income_tracking } from "../request/income-ExpenseTrackingPostRequest";
import { income_expense_file_create } from "../request/income-ExpenseTrackingPostRequest";
import { updateIncomeExpenseMain } from "../request/income-ExpenseTrackingPostRequest";
import { updateIncomeMain } from "../request/income-ExpenseTrackingPostRequest";
import { updateExpenseParticular } from "../request/income-ExpenseTrackingPostRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import IncomeExpenseFormSchema from "@/form-schema/treasurer/expense-tracker-schema";
import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
import { z } from "zod";



//CREATING EXPENSE ENTRY
// export const useCreateIncomeExpense = (onSuccess?: () => void) => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (values: z.infer<typeof IncomeExpenseFormSchema>) => 
//       income_expense_tracking(values),
//     onSuccess: () => {
//       // Invalidate and refetch
//       queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });

//       toast.loading("Creating entry...", { id: "createExpense" });
      
//       // Show success toast
//       toast.success('Expense Entry created successfully', {
//         id: "createExpense",
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000
//       });

//       if (onSuccess) onSuccess();
//     },
//     onError: (err) => {
//       console.error("Error submitting expense or income:", err);
//       toast.error(
//         "Failed to submit income or expense. Please check the input data and try again.",
//         { duration: 2000 }
//       );
//     }
//   });
// };



// ========================= LATEST EXPENSE CREATE ===========================
// export const useCreateIncomeExpense = (onSuccess?: () => void) => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//       // 1. Create main expense entry
//       const iet_num = await income_expense_tracking(values);
      
//       // 2. Create all file entries in parallel
//       if (values.iet_receipt_image?.length) {
//         await Promise.all(
//           values.iet_receipt_image.map(file => 
//             income_expense_file_create({
//               iet_num,
//               file_data: file
//             })
//           )
//         );
//       }


      
//       return iet_num;
//     },
//     onSuccess: () => {
//       // Invalidate and refetch
//       queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
//       queryClient.invalidateQueries({ queryKey: ['incomeExpenseFiles'] });

//       toast.loading("Creating entry...", { id: "createExpense" });
      
//       // Show success toast
//       toast.success('Expense Entry created successfully', {
//         id: "createExpense",
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000
//       });

//       if (onSuccess) onSuccess();
//     },
//     onError: (err) => {
//       console.error("Error submitting expense or income:", err);
//       toast.error(
//         "Failed to submit income or expense. Please check the input data and try again.",
//         { duration: 2000 }
//       );
//     }
//   });
// };


type ExtendedIncomeExpense = z.infer<typeof IncomeExpenseFormSchema> & {
  totalBudget: number;
  totalExpense: number;
  years: number;
  proposedBud: number;
  particularId: number;
};


export const useCreateIncomeExpense = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: ExtendedIncomeExpense) => {
      // 1. Create main expense entry
      const iet_num = await income_expense_tracking(values);
      
      // 2. Create all file entries in parallel
      // if (values.iet_receipt_image?.length) {
      //   await Promise.all(
      //     values.iet_receipt_image.map(file => 
      //       income_expense_file_create({
      //         iet_num,
      //         file_data: file
      //       })
      //     )
      //   );
      // }

      if (values.iet_receipt_image && values.iet_receipt_image.length > 0) {
        // Filter out any invalid files before processing
        const validFiles = values.iet_receipt_image.filter(file => 
          file && (file.url || file.path) && file.name
        );
        
        if (validFiles.length > 0) {
          await Promise.all(
            validFiles.map(file => 
              income_expense_file_create({
                iet_num,
                file_data: file
              }).catch(error => {
                console.error("Error creating file entry:", error);
                // Continue with other files even if one fails
                return null;
              })
            )
          );
        }
      }      
      
      //3. Update main for the expenses
      await updateIncomeExpenseMain(values.years, {
        totalBudget: values.totalBudget,
        totalExpense: values.totalExpense,
      });


      await updateExpenseParticular(values.particularId, {
        years: values.years,
        exp_proposed_budget: values.proposedBud,
      });
      
      return iet_num;
    },  
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['incomeExpense'] });
      queryClient.invalidateQueries({ queryKey: ['budgetItems'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] });

      toast.loading("Creating entry...", { id: "createExpense" });
      
      // Show success toast
      toast.success('Expense Entry created successfully', {
        id: "createExpense",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting expense or income:", err);
      toast.error(
        "Failed to submit income or expense. Please check the input data and try again.",
        { duration: 2000 }
      );
    }
  });
};



//CREATING INCOME
// export const useCreateIncome = (onSuccess?: () => void) => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (values: z.infer<typeof IncomeFormSchema>) => 
//       income_tracking(values),
//     onSuccess: () => {
//       // Invalidate and refetch
//       queryClient.invalidateQueries({ queryKey: ['income'] });

//       toast.loading("Creating entry...", { id: "createIncome" });
      
//       // Show success toast
//       toast.success('Income Entry created successfully', {
//         id: "createIncome",
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000
//       });

//       if (onSuccess) onSuccess();
//     },
//     onError: (err) => {
//       console.error("Error submitting income:", err);
//       toast.error(
//         "Failed to submit income. Please check the input data and try again.",
//         { duration: 2000 }
//       );
//     }
//   });
// };


type ExtendedIncomeValues = z.infer<typeof IncomeFormSchema> & {
  totalIncome: number;
  year: number;
};


export const useCreateIncome = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
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
      queryClient.invalidateQueries({ queryKey: ['income_expense_card'] }); // Assuming this contains your totals

      toast.loading("Creating entry...", { id: "createIncome" });
      
      // Show success toast
      toast.success('Income Entry created successfully', {
        id: "createIncome",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting income:", err);
      toast.error(
        "Failed to submit income. Please check the input data and try again.",
        { duration: 2000 }
      );
    }
  });
};