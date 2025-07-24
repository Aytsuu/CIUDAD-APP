import { api } from "@/api/api";

export const deleteAnnouncement = async (ann_id: string) => {
    try {
        console.log("Deleting announcement with ann_id:", ann_id);
        const res = await api.delete(`announcement/announcements/${ann_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting entry:", err);
        throw err;
    }
};