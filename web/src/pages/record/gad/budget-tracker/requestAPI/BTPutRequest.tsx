import api from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';

export const putbudgettrackreq = async (gbud_num: number, budgetTrackInfo: Record<string, any>) => {
    try{
        const res = await api.put(`gad/gad-budget-tracker-table/${gbud_num}/`, {
            gbud_num: budgetTrackInfo.gbud_num,
            gbud_year: budgetTrackInfo.gbud_year,
            gbud_total_amt_used: budgetTrackInfo.gbud_total_amt_used,
            gbud_remaining_bal: budgetTrackInfo.gbud_remaining_bal,
            gbud_date: formatDate(budgetTrackInfo.gbud_date),
            gbud_particulars: budgetTrackInfo.gbud_particulars,
            gbud_type: budgetTrackInfo.gbud_type,
            gbud_amount: budgetTrackInfo.gbud_amount,
            gbud_add_notes: budgetTrackInfo.gbud_add_notes,
            // feat_id:
        });

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}