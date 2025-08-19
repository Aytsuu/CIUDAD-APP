import { api } from "@/api/api";

export const archiveBudgetPlan = async (planId: number) => {
    try{
        const res = await api.put(`treasurer/update-budget-plan/${planId}/`, {
            plan_is_archive: true
        })

    }catch(err){
        console.error(err)
    }
}

export const restoreBudgetPlan = async (planId: number) => {
    try{
        const res = await api.put(`treasurer/update-budget-plan/${planId}/`, {
            plan_is_archive: false
        })

    }catch(err){
        console.error(err)
    }
}