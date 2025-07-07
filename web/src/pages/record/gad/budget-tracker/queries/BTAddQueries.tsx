// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { CircleCheck } from "lucide-react";
// import { useNavigate } from "react-router";
// import { GADBudgetEntry } from "../requestAPI/BTGetRequest";
// import { GADBudgetCreatePayload, createGADBudget, createGADBudgetFile, GADBudgetFile } from "../requestAPI/BTPostRequest";

// export const useCreateGADBudget = () => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
  
//   return useMutation({
//     mutationFn: async (data: {
//       budgetData: GADBudgetCreatePayload;
//       files: Omit<GADBudgetFile, 'gbud_num'>[];
//     }) => {
//       // Create budget entry first
//       const budgetEntry = await createGADBudget(data.budgetData);
      
//       // Then create files if any
//       if (data.files.length > 0) {
//         await Promise.all(data.files.map(file => 
//           createGADBudgetFile({
//             ...file,
//             gbud_num: budgetEntry.gbud_num
//           })
//         ));
//       }
      
//       return budgetEntry;
//     },
//     onSuccess: (data, variables) => {
//       const year = new Date(variables.budgetData.gbud_datetime).getFullYear();
//       queryClient.invalidateQueries({
//         queryKey: ['gad-budgets', year.toString()],
//       });
      
//       toast.success('Budget entry created successfully', {
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//       });
      
//       navigate(`/gad/gad-budget-tracker-table/${year}/`);
//     },
//     onError: (error: Error) => {
//       toast.error('Failed to create budget entry', {
//         description: error.message,
//       });
//     },
//   });
// };

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { GADBudgetEntry } from "../requestAPI/BTGetRequest";
import { GADBudgetCreatePayload, createGADBudget, createGADBudgetFile, GADBudgetFile } from "../requestAPI/BTPostRequest";
import { MediaUploadType } from "@/components/ui/media-upload";

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

export const useCreateGADBudget = (yearBudgets: BudgetYear[], budgetEntries: BudgetEntry[]) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (data: {
      budgetData: GADBudgetCreatePayload;
      files: MediaUploadType;
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
      
      // Validate and create files
      if (data.files.length > 0) {
        const validFiles = data.files.filter(
          (media) =>
            media.status === "uploaded" &&
            media.publicUrl &&
            media.storagePath &&
            media.file?.name &&
            media.file?.type
        );
        if (validFiles.length === 0) {
          throw new Error("No valid files have finished uploading");
        }
        await Promise.all(
          validFiles.map((file) => createGADBudgetFile(file, budgetEntry.gbud_num))
        );
      }
      
      return budgetEntry;
    },
    onSuccess: (data, variables) => {
      const year = new Date(variables.budgetData.gbud_datetime).getFullYear().toString();
      queryClient.invalidateQueries({
        queryKey: ['gad-budgets', year],
      });
      
      toast.success('Budget entry created successfully', {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
      
      navigate(`/gad/gad-budget-tracker-table/${year}/`);
    },
    onError: (error: any) => {
      toast.error('Failed to create budget entry', {
        description: error.message || JSON.stringify(error.response?.data),
      });
    },
  });
};