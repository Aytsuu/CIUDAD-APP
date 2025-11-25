import { api } from "@/api/api";
import { parseFloatSafe } from "@/helpers/floatformatter";
import { capitalize } from "@/helpers/capitalize";

const editAnnualGrossSales = async (ags_id: string, grossSales: {
  minRange: string;
  maxRange: string;
  amount: string;
}) => {
    try {
        await api.patch(`treasurer/update-annual-gross-sales/${ags_id}/`, {
        ags_is_archive: true
        });
        const newRecord = {
        ags_minimum: parseFloatSafe(grossSales.minRange),
        ags_maximum: parseFloatSafe(grossSales.maxRange),
        ags_rate: parseFloatSafe(grossSales.amount),
        ags_date: new Date().toISOString(),
        ags_is_archive: false,
        };

        console.log("Creating new record:", newRecord);

        const res = await api.post('treasurer/annual-gross-sales-active/', newRecord);

        return res.data.ags_id;
  } catch (error) {
    console.error("Error in editAnnualGrossSales:", error);
    throw error; 
  }
}

const editPurposeAndRate = async (pr_id: string, purposeAndRate: {
  purpose: string;
  amount: string;
  category: string;
}) => {
    try {
        await api.patch(`treasurer/update-purpose-and-rate/${pr_id}/`, {
        pr_is_archive: true
        });
        
        const newRecord = {
          pr_purpose: capitalize(purposeAndRate.purpose),
          pr_rate: parseFloatSafe(purposeAndRate.amount),
          pr_category: capitalize(purposeAndRate.category),
          pr_date: new Date().toISOString(),
          pr_is_archive: false,
        };

        console.log("Creating new record:", newRecord);

        const res = await api.post('treasurer/purpose-and-rate/', newRecord);

        return res.data.pr_id;
  } catch (error) {
    console.error("Error in editAnnualGrossSales:", error);
    throw error; 
  }
}

export {editAnnualGrossSales, editPurposeAndRate}