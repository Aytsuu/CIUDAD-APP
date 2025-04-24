import {api} from "@/api/api";
import { BudgetPlan } from "../budgetPlanInterfaces";

export const getBudgetDetails = async (planId: string): Promise<BudgetPlan> => {
    try {
        const res = await api.get<BudgetPlan>(`treasurer/budget-plan/${planId}/`);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch budget details:", error);
        throw error; 
    }
}

export const getBudgetPlan = async () => {
    try{
        const res = await api.get('/treasurer/budget-plan/');
        return res.data
    } catch(error){
        console.error(error);
    }
}
