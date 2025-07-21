import { api } from '@/api/api';
import { formatDate } from '@/helpers/dateFormatter';

// export const putbudgettrackreq = async (gbud_num: number, budgetTrackInfo: Record<string, any>) => {
//     try{
//         const currentDate = new Date();
//         const res = await api.put(`/gad/gad-budget-tracker-entry/${gbud_num}/`, {
//             gbud_num: budgetTrackInfo.gbud_num,         // Will be null for new entries
//             gbud_date: formatDate(currentDate),
//             gbud_remaining_bal: Number(budgetTrackInfo.gbud_remaining_bal),
//             gbud_particulars: budgetTrackInfo.gbud_particulars,
//             gbud_type: budgetTrackInfo.gbud_type,
//             gbud_amount: Number(budgetTrackInfo.gbud_amount),
//             gbud_add_notes: budgetTrackInfo.gbud_add_notes || '',
//             gbud_receipt: budgetTrackInfo.gbud_receipt || '', // Empty string if no receipt
//             gbudy_num: budgetTrackInfo.gbudy_num
//         });

//         return res.data;
//     }
//     catch (err){
//         console.error(err);
//     }
// }

export const putbudgettrackreq = async (gbud_num: number, budgetTrackInfo: Record<string, any>) => {
    try {
        const res = await api.put(`/gad/gad-budget-tracker-entry/${gbud_num}/`, {
            ...budgetTrackInfo,
            gbud_amount: Number(budgetTrackInfo.gbud_amount),
            gbud_remaining_bal: Number(budgetTrackInfo.gbud_remaining_bal || 0),
        });
        return res.data;
    } catch (err) {
        console.error("API Error:", err);
        throw err; // Important: re-throw the error for mutation to handle
    }
};