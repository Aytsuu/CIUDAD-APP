import { useQuery } from "@tanstack/react-query";
import { getBudgetPlan, getBudgetDetails, getBudgetPlanHistory, getBudgetPlanSuppDocs} from "../restful-API/budgetPlanGetAPI";
import { BudgetPlanDetail } from "../budgetPlanInterfaces"; 
import { BudgetPlan } from "../budgetPlanInterfaces";

export type BudgetPlanType = BudgetPlan

export const usegetBudgetPlan = () => {
    return useQuery<BudgetPlanType[]>({
        queryKey: ["budgetPlan"], 
        queryFn: () => getBudgetPlan(),
        staleTime: 1000 * 60 * 30,
    });
};


export type BudgetPlanDetailType = BudgetPlanDetail

export const usegetBudgetPlanDetail = (plan_id: string) => {
    return useQuery<BudgetPlanType>({
        queryKey : ['budgetDetails', plan_id],
        queryFn: () => getBudgetDetails(plan_id!),
        staleTime: 1000 * 60 * 30,
    })
}


export type BudgetPlanHistory = {
  bph_id: string;
  bph_date_updated: string;
  bph_source_item: string;
  bph_to_item: string;
  bph_from_new_balance: number;
  bph_to_new_balance: number;
  bph_to_prev_balance: number,
  bph_from_prev_balance: number,
  bph_transfer_amount: number;
}

export const useGetBudgetPlanHistory = (planId: string) => {
  return useQuery<BudgetPlanHistory[]>({
    queryKey: ['budgetPlanHistory', planId],
    queryFn: () => getBudgetPlanHistory(planId),
    staleTime: 1000 * 60 * 30
  })
}


export type BudgetPlanSuppDoc = {
  bpf_id: number;
  bpf_url: string;
  bpf_name: string;
  bpf_upload_date: string;
}

export const useGetBudgetPlanSuppDoc = (plan_id: string) => {
  return useQuery<BudgetPlanSuppDoc[]>({
    queryKey: ["budgetPlanFiles", plan_id],
    queryFn: () => getBudgetPlanSuppDocs(plan_id),
    staleTime: 5000
  })
}