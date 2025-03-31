import api from '@/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const postdonationreq= async (budgetTrackInfo: Record<string, any>) => {
    try {

        console.log({
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

        const res = await api.post('gad/gad-budget-tracker-table/', {
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

        return res.data.gbud_num;
    } catch (err) {
        console.error(err);
    }
};