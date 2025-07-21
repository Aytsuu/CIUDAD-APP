import { api } from "@/api/api";
// import { QueryClient } from "@tanstack/react-query";

export const deleteBudgetPlan = async(planId: number) => {
    try{
        await api.delete(`treasurer/budget-plan/${planId}/`)
        console.log('deleted', planId)
        return true
    } catch (error){
        console.error(error)
        return false
    }
}