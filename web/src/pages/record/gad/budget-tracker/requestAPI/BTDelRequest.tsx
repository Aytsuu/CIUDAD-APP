import { api } from "@/api/api";

export const archiveBudgetEntry = async (gbud_num: number) => {
    try {
        const res = await api.delete(`gad/gad-budget-tracker-entry/${gbud_num}/`);
        return res.data;
    } catch (err) {
        console.error("Error archiving entry:", err);
        throw err;
    }
};

export const restoreBudgetEntry = async (gbud_num: number) => {
    try {
        const res = await api.patch(`gad/gad-budget-tracker-entry/${gbud_num}/restore/`);
        return res.data;
    } catch (err) {
        console.error("Error restoring entry:", err);
        throw err;
    }
};

export const permanentDeleteBudgetEntry = async (gbud_num: number) => {
    try {
        const res = await api.delete(`gad/gad-budget-tracker-entry/${gbud_num}/?permanent=true`);
        return res.data;
    } catch (err) {
        console.error("Error permanently deleting entry:", err);
        throw err;
    }
};

export const deleteGADBudgetFiles = async (fileIds: string[], gbud_num: number) => {
    try {
        const res = await api.delete(`gad/gad-budget-files/`, {
            data: {
                gbf_ids: fileIds,
                gbud_num: gbud_num,
            },
        });
        return res.data;
    } catch (err) {
        console.error("Error deleting file records:", {
            error: err,
            fileIds,
            gbud_num,
        });
        throw err;
    }
};