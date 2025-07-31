import { api } from "@/api/api";


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