import { api } from "@/api/api";
import { capitalize } from "@/helpers/capitalize";
import { parseFloatSafe } from "@/helpers/floatformatter";


const addAnnualGrossSales = async (grossSales: Record<string, any>) => {
    try{
        console.log({
            ags_minimum: parseFloatSafe(grossSales.minRange),
            ags_maximum: parseFloatSafe(grossSales.maxRange),
            ags_rate: parseFloatSafe(grossSales.amount),
            ags_date: new Date().toISOString(),
            ags_is_archive: false,
        })

        const res = await api.post('treasurer/annual-gross-sales-active/', {
            ags_minimum: parseFloatSafe(grossSales.minRange),
            ags_maximum: parseFloatSafe(grossSales.maxRange),
            ags_rate: parseFloatSafe(grossSales.amount),
            ags_date: new Date().toISOString(),
            ags_is_archive: false,
        });

        return res.data.ags_id;
    } catch (error){
        console.error(error)
    }
}


const addPurposeAndRate = async (purposeAndRate: Record<string, any>) => {
    try{
        console.log({
            pr_purpose: capitalize(purposeAndRate.purpose),
            pr_rate: parseFloatSafe(purposeAndRate.amount),
            pr_category: capitalize(purposeAndRate.category),
            pr_date: new Date().toISOString(),
            pr_is_archive: false,
        })

        const res = await api.post('treasurer/purpose-and-rate/', {
            pr_purpose: capitalize(purposeAndRate.purpose),
            pr_rate: parseFloatSafe(purposeAndRate.amount),
            pr_category: capitalize(purposeAndRate.category),
            pr_date: new Date().toISOString(),
            pr_is_archive: false,
        })
        return res.data.pr_id;
    } catch(error){
        console.error(error)
    }
}

export {addAnnualGrossSales, addPurposeAndRate}
