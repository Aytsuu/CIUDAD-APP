import { api } from "@/api/api";


export const arciveWasteColData = async (wc_num: number) => {
    try {
        console.log({
            wc_is_archive: true
        });

        const res = await api.put(`waste/waste-collection-sched/${wc_num}/`, {
            wc_is_archive: true
        });
        return res.data;
    } catch (err) {
        console.error("Error archiving waste schedule:", err);
        throw err;
    }
};



export const restoreWasteColData = async (wc_num: number) => {
    try {
        console.log({
            wc_is_archive: false
        });

        const res = await api.put(`waste/waste-collection-sched/${wc_num}/`, {
            wc_is_archive: false
        });
        return res.data;
    } catch (err) {
        console.error("Error restoring schedule:", err);
        throw err;
    }
};





export const deleteWasteColData = async (wc_num: number) => {
    try {

        const res = await api.delete(`waste/waste-collection-sched-delete/${wc_num}/`);

        return res.data;
    } catch (err) {
        console.error("Error deleting waste schedule:", err);
        throw err;
    }
};