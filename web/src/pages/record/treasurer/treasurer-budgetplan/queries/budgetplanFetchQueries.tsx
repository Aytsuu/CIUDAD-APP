import { useQuery } from "@tanstack/react-query";
import { getBudgetPlan } from "../restful-API/budgetplanGetAPI";
import { getBudgetDetails } from "../restful-API/budgetplanGetAPI";
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