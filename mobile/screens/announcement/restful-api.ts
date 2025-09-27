import { api } from "@/api/api";

// Delete announcement
export const deleteAnnouncement = async (ann_id: string) => {
    try {
        console.log("Deleting announcement with ann_id:", ann_id);
        const res = await api.delete(`announcement/${ann_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting entry:", err);
        throw err;
    }
};

// Get announcements
export const getAnnouncementRequest = async () => {
  try {
    const response = await api.get("announcement/list/");
    console.log("Announcements raw response:", JSON.stringify(response.data, null, 2));

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.data ?? [];

    const announcements = Array.isArray(data) ? data : [];

    return announcements.sort(
      (a, b) =>
        new Date(b.ann_created_at).getTime() -
        new Date(a.ann_created_at).getTime()
    );
  } catch (err) {
    console.error("API Error (getAnnouncementRequest):", err);
    return [];
  }
};

// Get recipients
export const getAnnouncementRecipientRequest = async (ann_id: number) => {
  try {
    const response = await api.get(
      `announcement/create-recipient/?ann_id=${ann_id}`
    );
    console.log("Recipients raw response:", JSON.stringify(response.data, null, 2));
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error (getAnnouncementRecipientRequest):", err);
    return [];
  }
};

// Create announcement
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

// ✅ Bulk recipients
export const postAnnouncementRecipient = async (recipients: Record<string, any>[]) => {
  try {
    console.log("Sending recipients payload:", JSON.stringify(recipients, null, 2));
    const res = await api.post("announcement/create-recipient/", recipients); // no extra object
    console.log("Recipients response:", JSON.stringify(res.data, null, 2));
    return res.data ?? {};
  } catch (error) {
    console.error("API Error (postAnnouncementRecipient):", error);
    throw error;
  }
};

// Upload files
export const postAnnouncementFile = async (files: Record<string, any>[]) => {
  try {
    console.log("Uploading files:", JSON.stringify(files, null, 2));
    const res = await api.post("announcement/upload-files/", files);
    console.log("File upload response:", JSON.stringify(res.data, null, 2));
    return res.data ?? {};
  } catch (err) {
    console.error("API Error (postAnnouncementFile):", err);
    throw err;
  }
};

export const getCreatedReceivedAnnouncements = async (staff_id: string) => {
  try {
    const response = await api.get(`announcement/created-received/${staff_id}/`);
    return response.data || { created: [], received: [] };
  } catch (err) {
    console.error("API Error:", err);
    return { created: [], received: [] };
  }
};
