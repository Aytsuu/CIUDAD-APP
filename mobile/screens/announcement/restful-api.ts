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


export const getAnnouncementRequest = async () => {
  try {
    const response = await api.get(`announcement/list/`);
    const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
    const announcements = Array.isArray(data) ? data : [];

    // Sort announcements by created_at descending
    return announcements.sort(
      (a, b) => new Date(b.ann_created_at).getTime() - new Date(a.ann_created_at).getTime()
    );
  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
};

export const getAnnouncementRecipientRequest = async (ann_id: number) => {
  try {
    const response = await api.get(`announcement/create-recipient/?ann_id=${ann_id}`);
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
};

export const postAnnouncement = async (announcement: Record<string, any>) => {
  try {
    const now = new Date().toISOString();

    const payload: Record<string, any> = {
      ...announcement,
      ann_created_at: now,
      ann_event_start: announcement.ann_event_start || null,
      ann_event_end: announcement.ann_event_end || null,
    };

    // Only include ann_start_at if provided
    if (announcement.ann_start_at && announcement.ann_start_at.trim() !== "") {
      payload.ann_start_at = announcement.ann_start_at;
    }

    // Only include ann_end_at if provided
    if (announcement.ann_end_at && announcement.ann_end_at.trim() !== "") {
      payload.ann_end_at = announcement.ann_end_at;
    }

    console.log("Sending payload:", payload);

    const res = await api.post("announcement/create/", payload);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Updated to accept bulk payload
export const postAnnouncementRecipient = async (payload: { recipients: Record<string, any>[] }) => {
  try {
    const res = await api.post("announcement/create-recipient/", payload);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postAnnouncementFile = async (files: Record<string, any>[]) => {
  try {
    const res = await api.post("announcement/upload-files/", files);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
