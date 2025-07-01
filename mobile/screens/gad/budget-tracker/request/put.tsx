import api from '@/api/api';
import { MediaFileType } from '@/components/ui/multi-media-upload';
import { GADBudgetFile } from './post';

export type GADBudgetUpdatePayload = {
  gbud_type: 'Income' | 'Expense';
  gbud_datetime: string;
  gbud_add_notes?: string | null;
  gbud_inc_particulars?: string | null;
  gbud_inc_amt?: number | null;
  gbud_exp_particulars?: string | null;
  gbud_proposed_budget?: number | null;
  gbud_actual_expense?: number | null;
  gbud_remaining_bal?: number | null;
  gbud_reference_num?: string | null;
  gbudy: number;
  gdb_id?: number | null;
};

export const updateGADBudget = async (gbud_num: number, payload: GADBudgetUpdatePayload) => {
  try {
    const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);
    return response.data;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};
// const currentEntryRes = await api.get(`/gad/gad-budget-tracker-entry/${gbud_num}/`);
//     const currentEntry = currentEntryRes.data;
//     const oldActualExpense = currentEntry.gbud_type === "Expense" ? Number(currentEntry.gbud_actual_expense) || 0 : 0;
//     const oldProposedBudget = currentEntry.gbud_type === "Expense" ? Number(currentEntry.gbud_proposed_budget) || 0 : 0;

//     // Update entry
//     const response = await api.patch(`/gad/gad-budget-tracker-entry/${gbud_num}/`, payload);

//     // Update gbudy_expenses if expense
//     if (payload.gbud_type === "Expense") {
//       const newActualExpense = payload.gbud_actual_expense != null ? Number(payload.gbud_actual_expense) || 0 : 0;
//       const newProposedBudget = payload.gbud_proposed_budget != null ? Number(payload.gbud_proposed_budget) || 0 : 0;
//       // Determine old expense: use actual if exists, else proposed
//       const oldExpense = oldActualExpense !== 0 ? oldActualExpense : oldProposedBudget;
//       // Determine new expense: use actual if provided, else proposed
//       const newExpense = newActualExpense !== 0 ? newActualExpense : newProposedBudget;
//       const expenseDiff = newExpense - oldExpense;

//       if (expenseDiff !== 0) {
//         // Fetch year budget
//         const yearBudgetRes = await api.get(`/gad/year-budgets/?gbudy_num=${payload.gbudy}`);
//         const yearBudget = yearBudgetRes.data[0];
//         const currentExpenses = Number(yearBudget.gbudy_expenses) || 0;
//         console.log("Updating gbudy_expenses:", {
//           gbud_num,
//           oldActualExpense,
//           oldProposedBudget,
//           oldExpense,
//           newActualExpense,
//           newProposedBudget,
//           newExpense,
//           expenseDiff,
//           currentExpenses,
//           newExpenses: currentExpenses + expenseDiff,
//         });
//       }
//     }

//     return response.data;
//   } catch (err) {
//     console.error("API Error:", err);
//     throw err;
//   }
// };

// export const createGADBudgetFile = async (media: MediaFileType[number], gbud_num: number) => {
//      if (media.status !== 'uploaded' || !media.publicUrl || !media.storagePath) {
//        throw new Error('File upload incomplete: missing URL or path');
//      }
//      const formData = new FormData();
//      formData.append('file', media.file);
//      formData.append('gbud', gbud_num.toString());
//      formData.append('gbf_name', media.file.name);
//      formData.append('gbf_type', media.file.type || 'image/jpeg');
//      formData.append('gbf_path', media.storagePath);
//      formData.append('gbf_url', media.publicUrl);
//      try {
//        const response = await api.post('/gad/gad-budget-files/', formData, {
//          headers: { 'Content-Type': 'multipart/form-data' },
//        });
//        return response.data;
//      } catch (error: any) {
//        console.error('File upload failed:', error.response?.data || error);
//        throw error;
//      }
//    };

export const createGADBudgetFile = async (
  media: {
    publicUrl: string;
    storagePath: string;
    status: "uploading" | "uploaded" | "error";
    file: { name: string; type: string };
  },
  gbud_num: number
) => {
  if (media.status !== "uploaded" || !media.publicUrl || !media.storagePath) {
    throw new Error("File upload incomplete: missing URL, path, or valid status");
  }

  const payload = {
    gbud: gbud_num,
    gbf_name: media.file.name,
    gbf_type: media.file.type || "image/jpeg",
    gbf_path: media.storagePath,
    gbf_url: media.publicUrl,
  };

  try {
    const response = await api.post("/gad/gad-budget-files/", payload);
    return response.data;
  } catch (error: any) {
    console.error("File upload failed:", error.response?.data || error);
    throw error;
  }
};