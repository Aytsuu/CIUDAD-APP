import api from "@/pages/api/api";


export const delEvent_meetingreq = async (ce_id: number) => {
    try {
        console.log("Deleting event/meeting with ce_id:", ce_id);
        const res = await api.delete(`council/event-meeting/${ce_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting entry:", err);
        throw err;
    }
};