import api from "@/pages/api/api";

export const delCouncilEvent = async (ce_id: number) => {
    try {
        console.log("Deleting council event with ce_id:", ce_id);
        const res = await api.delete(`council/event-meeting/${ce_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting council event:", err);
        throw err;
    }
};

export const delAttendee = async (atn_id: number) => {
    try {
        console.log("Deleting attendee with atn_id:", atn_id);
        const res = await api.delete(`council/attendees/${atn_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting attendee:", err);
        throw err;
    }
};

export const delAttendanceSheet = async (att_id: number) => {
    try {
        console.log("Deleting attendance sheet with att_id:", att_id);
        const res = await api.delete(`council/attendance-sheet/${att_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting attendance sheet:", err);
        throw err;
    }
};