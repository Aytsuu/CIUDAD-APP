import api from "@/api/api";
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


export const getBudgetPlanActive = async (page: number, pageSize: number, searchQuery: string) => {
    try{
        const res = await api.get('treasurer/budget-plan-active/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        });
        return res.data
    } catch(error){
        console.error(error);
    }
}

export const getBudgetPlanInactive = async (page: number, pageSize: number, searchQuery: string) => {
    try{
        const res = await api.get('treasurer/budget-plan-inactive/', {
            params: {
                page,
                page_size: pageSize,
                search: searchQuery
            }
        });
        return res.data
    } catch(error){
        console.error(error);
    }
}


export const getBudgetPlanHistory = async (planId: string) => {
    try{
        const res = await api.get(`treasurer/budget-plan-history/${planId}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getBudgetPlanSuppDocs = async (plan_id: string) => {
    try{
        const res = await api.get(`treasurer/budget-plan-file/${plan_id}/`)
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getBudgetPlanFromPreviousYear = async() => {
    try{
        const res = await api.get('treasurer/previous-budget-plan/')
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getBudgetPlanDetailFromPreviousYear = async () => {
    try{
        const res = await api.get('treasurer/previous-budget-plan-details/')
        return res.data
    }catch(err){
        console.error(err)
    }
}

export const getExpenseParticulars = async (year?: number) => {
    try {
        const params = year ? { params: { year } } : {};
        const res = await api.get('treasurer/get-expense_particular/', params);
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
