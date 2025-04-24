// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { CircleCheck } from "lucide-react";
// import { postbudgettrackreq } from "../requestAPI/BTPostRequest";
// import { useNavigate } from "react-router";

// export type GADBudgetInput = {
//   gbud_num?: number;
//   gbud_type: string;
//   gbud_amount: number;
//   gbud_particulars: string;
//   gbud_add_notes?: string;
//   gbud_date: string;
//   gbud_remaining_bal: number;
//   gbudy_num: number;
//   gbud_receipt: string;
// };

// export const useAddGADBudget = (options?: {
//   onSuccess?: (data: any) => void 
// }) => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
  
//   return useMutation({
//     mutationFn: (budgetData: GADBudgetInput) => postbudgettrackreq(budgetData),
//     onSuccess: (data) => {
//       // Invalidate the GAD budget queries to trigger refetch
//       queryClient.invalidateQueries({ queryKey: ["gad-budget"] });

//       // Show success toast
//       toast.success("GAD budget entry added successfully", {
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000
//       });

//       navigate("/gad-budget-tracker-table/<year>");
//     },
//     onError: (error: Error) => {
//       toast.error("Failed to add GAD budget entry", {
//         description: error.message,
//       });
//     },
//   });
// };

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postbudgettrackreq } from "../requestAPI/BTPostRequest";

export type GADBudgetInput = {
  gbud_num?: number;
  gbud_type: string;
  gbud_amount: number;
  gbud_particulars: string;
  gbud_add_notes?: string;
  gbud_date: string;
  gbud_remaining_bal: number;
  gbudy_num: number;
  gbud_receipt: string;
};

export const useAddGADBudget = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (budgetData: GADBudgetInput) => postbudgettrackreq(budgetData),
    onSuccess: (_data, variables) => {
      const year = variables.gbud_date.split("-")[0]; // extract year from date string
      toast.success("Budget entry added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      }); 
      navigate(`/gad/gad-budget-tracker-table/${year}/`);
    },
    
    onError: (error: Error) => {
      toast.error("Failed to add budget entry", {
        description: error.message,
      });
    },
  });
};