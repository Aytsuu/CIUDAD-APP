import { useQuery } from "@tanstack/react-query";
import { getBudgetPlan } from "../restful-API/budgetplanGetAPI";
import { getBudgetDetails, getBudgetPlanHistory, getBudgetPlanAndDetailHistory, getBudgetPlanSuppDocs } from "../restful-API/budgetplanGetAPI";
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
  bph_budgetaryObligations: number;
  bph_balUnappropriated: number;
  bph_change_date: string;
  bph_year: string;
}

export const useGetBudgetPlanHistory = (planId: string) => {
  return useQuery<BudgetPlanHistory[]>({
    queryKey: ['budgetPlanHistory', planId],
    queryFn: () => getBudgetPlanHistory(planId),
    staleTime: 1000 * 60 * 30
  })
}

export type BudgetPlanDetailHistory = {
  bpdh_id: number;
  bpdh_budget_item: string;
  bpdh_proposed_budget: number;
  bpdh_budget_category: string;
  bpdh_is_changed: boolean;
  bph: number; 
};

export type BudgetPlanHistoryWithDetails = {
  bph_id: number;
  plan: number;
  bph_year: string;
  bph_change_date: string;
  bph_actual_income: number;
  bph_rpt_income: number;
  bph_balance: number;
  bph_tax_share: number;
  bph_tax_allotment: number;
  bph_cert_fees: number;
  bph_other_income: number;
  bph_budgetaryObligations: number;
  bph_balUnappropriated: number;
  bph_personalService_limit: number;
  bph_miscExpense_limit: number;
  bph_localDev_limit: number;
  bph_skFund_limit: number;
  bph_calamityFund_limit: number;
  detail_history: BudgetPlanDetailHistory[];
};

export const useGetBudgetPlanAndDetailHistory = (bph_id: string) => {
  return useQuery<BudgetPlanHistoryWithDetails>({
    queryKey: ["budgetPlanAndDetailHistory", bph_id],
    queryFn: () => getBudgetPlanAndDetailHistory(bph_id),
    staleTime: 1000 * 60 * 30, 
    enabled: !!bph_id, 
  });
};

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