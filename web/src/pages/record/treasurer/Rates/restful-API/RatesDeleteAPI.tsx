import { api } from "@/api/api"

export const deleteAnnualGrossSales= async (ags_id: number) => {
    try{

        const res = await api.put(`treasurer/delete-annual-gross-sales/${ags_id}/`, {
            ags_is_archive: true
        })
        return res.data
    } catch(error){
        console.error(error)
    }
}


export const deletePurposeAndRate= async (pr_id: number) => {
    try{

        const res = await api.put(`treasurer/delete-purpose-and-rate/${pr_id}/`, {
            pr_is_archive: true,
        })

        const res2 = await api.delete(`council/delete-template-with-pr-id/${pr_id}/`)
        return res.data
    } catch(error){
        console.error(error)
    }
}