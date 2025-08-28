import { api } from "@/api/api";

export const deldonationreq = async (don_num: string) => {
    try {
        const res = await api.delete(`donation/donation-record/${don_num}/`);
        return res.data;
    } catch (err) {
        throw err;
    }
};