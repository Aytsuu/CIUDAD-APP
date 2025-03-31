import api from "@/api/api";
import { QueryClient } from "@tanstack/react-query";

export const deleteBudgetPlan = async(planId: number, queryClient: QueryClient) => {
    const confirm = window.confirm("Do you want to delete this budget plan?")
    if (confirm){
        try{
            await api.delete(`treasurer/budget-plan/${planId}/`)
    
            await queryClient.invalidateQueries({queryKey: ['plan']});
            return true
        } catch (error){
            console.error(error)
            return false
        }
    }
}