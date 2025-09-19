import { api } from "@/api/api"
import { parseFloatSafe } from "@/helpers/floatformatter";


const addAnnualGrossSales = async (grossSales: Record<string, any>) => {
    try{
        console.log({
            ags_minimum: parseFloatSafe(grossSales.minRange),
            ags_maximum: parseFloatSafe(grossSales.maxRange),
            ags_rate: parseFloatSafe(grossSales.amount),
            ags_date: new Date().toISOString(),
            ags_is_archive: false,
            staff_id: grossSales.staff_id
        })

        const res = await api.post('treasurer/annual-gross-sales/', {
            ags_minimum: parseFloatSafe(grossSales.minRange),
            ags_maximum: parseFloatSafe(grossSales.maxRange),
            ags_rate: parseFloatSafe(grossSales.amount),
            ags_date: new Date().toISOString(),
            ags_is_archive: false,
            staff_id: grossSales.staff_id
        });

        return res.data.ags_id;
    } catch (error){
        console.error(error)
    }
}


const addPurposeAndRate = async (purposeAndRate: Record<string, any>) => {
    try{
        console.log({
            pr_purpose: purposeAndRate.purpose,
            pr_rate: parseFloatSafe(purposeAndRate.amount),
            pr_category: purposeAndRate.category,
            pr_date: new Date().toISOString(),
            pr_is_archive: false,
            staff_id: purposeAndRate.staff_id
        })

        const res = await api.post('treasurer/purpose-and-rate/', {
            pr_purpose: purposeAndRate.purpose,
            pr_rate: parseFloatSafe(purposeAndRate.amount),
            pr_category: purposeAndRate.category,
            pr_date: new Date().toISOString(),
            pr_is_archive: false,
            staff_id: purposeAndRate.staff_id
        })
        return res.data.pr_id;
    } catch(error){
        console.error(error)
    }
}

export {addAnnualGrossSales, addPurposeAndRate}
