// // import api from '@/pages/api/api';
// // import { formatDate } from '@/helpers/dateFormatter';

// // export const postbudgettrackreq= async (budgetTrackInfo: Record<string, any>) => {
// //     try {
// //         const currentDate = new Date();
// //         console.log({
// //             gbud_num: budgetTrackInfo.gbud_num,
// //             // gbud_year: budgetTrackInfo.gbud_year,
// //             // gbud_total_amt_used: budgetTrackInfo.gbud_total_amt_used,
// //             gbud_remaining_bal: parseFloat(budgetTrackInfo.gbud_remaining_bal),
// //             gbud_date: formatDate(currentDate),
// //             gbud_particulars: budgetTrackInfo.gbud_particulars,
// //             gbud_type: budgetTrackInfo.gbud_type,
// //             gbud_amount: parseFloat(budgetTrackInfo.gbud_amount),
// //             gbud_add_notes: budgetTrackInfo.gbud_add_notes,
// //             // feat_id:
// //         });

// //         const res = await api.post('/gad/gad-budget-tracker-table/:year/', {
// //             gbud_num: budgetTrackInfo.gbud_num,
// //             // gbud_year: budgetTrackInfo.gbud_year,
// //             // gbud_total_amt_used: budgetTrackInfo.gbud_total_amt_used,
// //             gbud_remaining_bal: parseFloat(budgetTrackInfo.gbud_remaining_bal),
// //             gbud_date: formatDate(currentDate),
// //             gbud_particulars: budgetTrackInfo.gbud_particulars,
// //             gbud_type: budgetTrackInfo.gbud_type,
// //             gbud_amount: parseFloat(budgetTrackInfo.gbud_amount),
// //             gbud_add_notes: budgetTrackInfo.gbud_add_notes,
// //             // feat_id:
// //         });

// //         return res.data.gbud_num;
// //     } catch (err) {
// //         console.error(err);
// //     }
// // };

// import api from '@/pages/api/api';
// import { formatDate } from '@/helpers/dateFormatter';

// interface BudgetTrackInfo {
//   gbud_num?: number;
//   gbud_date: string; 
//   gbud_remaining_bal: number;
//   gbud_particulars: string;
//   gbud_type: string;
//   gbud_amount: number;
//   gbud_add_notes?: string;
//   gbudy_num: number;
//   budget_item?: number;  
//   gbud_receipt: string;
//   year?: string;
// }

// export const postbudgettrackreq = async (budgetTrackInfo: BudgetTrackInfo) => {
//     try {
//         if (!budgetTrackInfo.year) {
//             throw new Error('Year parameter is required');
//         }

//         const currentDate = new Date();
//         const payload: Record<string, any> = {
//             gbud_num: budgetTrackInfo.gbud_num,   
//             gbud_date: formatDate(currentDate),
//             gbud_remaining_bal: budgetTrackInfo.gbud_remaining_bal,
//             gbud_particulars: budgetTrackInfo.gbud_particulars,
//             gbud_type: budgetTrackInfo.gbud_type,
//             gbud_amount: budgetTrackInfo.gbud_amount,
//             gbud_add_notes: budgetTrackInfo.gbud_add_notes || '',
//             gbud_receipt: budgetTrackInfo.gbud_receipt || '', // Empty string if no receipt
//             gbudy_num: budgetTrackInfo.gbudy_num
//         };

//         // Only add gbud_num if it exists
//         if (budgetTrackInfo.gbud_num !== undefined) {
//             payload.gbud_num = budgetTrackInfo.gbud_num;
//         }

//         console.log('Submitting budget track:', payload);

//         const res = await api.post(
//             `/gad/gad-budget-tracker-entry/${budgetTrackInfo.year}/`, 
//             payload
//         );

//         return res.data;
//     } catch (err) {
//         console.error('Error submitting budget track:', err);
//         throw err;
//     }
// };

import api from "@/pages/api/api";

// export const postbudgettrackreq = async (budgetInfo: Record<string, any>) => {
//     try {
//         const res = await api.post(`gad-budget-tracker-table/`, {
//             gbud_num: budgetInfo.gbud_num,
//             gbud_type: budgetInfo.gbud_type,
//             gbud_amount: Number(budgetInfo.gbud_amount),
//             gbud_particulars: budgetInfo.gbud_particulars,
//             gbud_add_notes: budgetInfo.gbud_add_notes || "",
//             gbud_date: budgetInfo.gbud_date,
//             gbud_remaining_bal: Number(budgetInfo.gbud_remaining_bal),
//             gbudy_num: Number(budgetInfo.gbudy_num),
//             gbud_receipt: budgetInfo.gbud_receipt,
//         });

//         return res.data.gbud_num;
//     } catch (err) {
//         console.error("API Error:", err);
//         throw err;
//     }
// };

export const postbudgettrackreq = async (budgetInfo: Record<string, any>) => {
    try {
        // Use the correct creation endpoint
        const endpoint = '/gad/gad-budget-tracker-table/';
        
        const payload = {
            gbud_type: budgetInfo.gbud_type,
            gbud_amount: Number(budgetInfo.gbud_amount),
            gbud_particulars: budgetInfo.gbud_particulars,
            gbud_add_notes: budgetInfo.gbud_add_notes || "",
            gbud_date: budgetInfo.gbud_date,
            gbud_remaining_bal: Number(budgetInfo.gbud_remaining_bal),
            gbudy_num: Number(budgetInfo.gbudy_num),
            gbud_receipt: budgetInfo.gbud_receipt,
        };

        const res = await api.post(endpoint, payload);
        return res.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("API Error:", {
                message: err.message,
                response: (err as any).response?.data,
                status: (err as any).response?.status,
                config: (err as any).config
            });
        } else {
            console.error("Unexpected error", err);
        }
        throw err;
    }
};