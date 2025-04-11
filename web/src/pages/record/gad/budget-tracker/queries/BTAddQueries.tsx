import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { postbudgettrackreq } from "../requestAPI/BTPostRequest";
import { useNavigate } from "react-router";

export type GADBudgetInput = {
  gbud_num?: number;
  gbud_type: string;
  gbud_amount: number;
  gbud_particulars: string;
  gbud_add_notes?: string;
};

export const useAddGADBudget = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (budgetData: GADBudgetInput) => postbudgettrackreq(budgetData),
    onSuccess: (gbud_num) => {
      // Invalidate the GAD budget queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["gad-budget"] });

      // Show success toast
      toast.success("GAD budget entry added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      navigate("/gad-budget-tracker-table");
    },
    onError: (error: Error) => {
      toast.error("Failed to add GAD budget entry", {
        description: error.message,
      });
    },
  });
};