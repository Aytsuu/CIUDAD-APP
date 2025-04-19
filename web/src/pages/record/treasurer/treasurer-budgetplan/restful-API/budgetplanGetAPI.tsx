import {api} from "@/api/api";

export const getBudgetDetails = async (planId: string) => {
    try{
        const res = await api.get(`treasurer/budget-plan/${planId}/`);
        return res.data;

    } catch(error){
        console.error(error);
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