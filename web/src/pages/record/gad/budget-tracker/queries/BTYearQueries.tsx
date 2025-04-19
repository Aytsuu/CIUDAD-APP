import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

// types.ts
export type BudgetYear = {
  year: string;
  budget: number;
  income: number;
  expenses: number;
  remainingBal: number;
};

export type BudgetYearResponse = {
  exists: boolean;
  year: string;
  error?: string;
};

const fetchBudgetYears = async (): Promise<BudgetYear[]> => {
  const response = await api.get('gad/gad-budget-tracker-table/');
  return response.data;
};

export const useBudgetYears = () => {
  return useQuery<BudgetYear[]>({
    queryKey: ["gad-budget-years"],
    queryFn: fetchBudgetYears,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

const createCurrentYearBudget = async (): Promise<BudgetYearResponse> => {
  try {
    const res = await api.post('gad/gad-budget-tracker-main/');
    return res.data;
  } catch (err) {
    console.error('Error creating current year budget:', err);
    throw err;
  }
};

export const useCreateCurrentYearBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCurrentYearBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["gad-budget-years"] 
      });
    }
  });
};

export const useCreateCurrentYearBudgetWithFeedback = () => {
  const queryClient = useQueryClient();
  const mutation = useCreateCurrentYearBudget();

  return {
    ...mutation,
    mutate: () => {
      mutation.mutate(undefined, {
        onSuccess: (data) => {
          toast.success(`Budget for ${data.year} created successfully`, {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          });
        },
        onError: (error) => {
          toast.error("Failed to create budget", {
            description: error.message,
          });
        }
      });
    }
  };
};