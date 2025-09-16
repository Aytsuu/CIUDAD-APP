import { api } from "@/api/api";

export const archiveBudgetEntry = async (gbud_num: number) => {
    try {
        const res = await api.delete(`gad/gad-budget-tracker-entry/${gbud_num}/`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const restoreBudgetEntry = async (gbud_num: number) => {
    try {
        const res = await api.patch(`gad/gad-budget-tracker-entry/${gbud_num}/restore/`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const permanentDeleteBudgetEntry = async (gbud_num: number) => {
    try {
        const res = await api.delete(`gad/gad-budget-tracker-entry/${gbud_num}/?permanent=true`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const deleteGADBudgetFiles = async (fileIds: string[], _gbud_num: number) => {
  const deletePromises = fileIds.map(async (fileId) => {
    const response = await api.delete(`/gad/gad-budget-files/${fileId}/`);
    return response.data;
  });
  return Promise.all(deletePromises);
};