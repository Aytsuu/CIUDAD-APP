import api from "@/api/api";


export const deldonationreq = async (don_num: string) => {
    try {
        console.log("Deleting donation with don_num:", don_num);
        const res = await api.delete(`donation/donation-record/${don_num}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting entry:", err);
        throw err;
    }
};
