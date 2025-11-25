import {api} from "@/api/api";

export const deleteBudgetPlan = async(planId: number) => {
    try{
        await api.delete(`treasurer/budget-plan/${planId}/`)
        return true
    } catch (error){
        console.error(error)
        return false
    }
}

export const deleteBudgetPlanFile = async(bpf_id: number) => {
    try{
        await api.delete(`treasurer/delete-budget-plan-file/${bpf_id}/`)
        return true
    }catch(err){
        console.error(err)
    }

}