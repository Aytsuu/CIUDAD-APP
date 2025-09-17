import { api } from "@/api/api";

// Delete announcement
export const deleteAnnouncement = async (ann_id: string) => {
  try {
    console.log("Deleting announcement with ann_id:", ann_id);
    const res = await api.delete(`announcement/announcements/${ann_id}/`);
    console.log("Delete response:", JSON.stringify(res.data, null, 2));
    return res.data ?? {};
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
    };

    if (announcement.ann_start_at?.trim()) {
      payload.ann_start_at = announcement.ann_start_at;
    }
    if (announcement.ann_end_at?.trim()) {
      payload.ann_end_at = announcement.ann_end_at;
    }

    if (announcement.ann_type === "event") {
      payload.ann_event_start = announcement.ann_event_start || payload.ann_start_at || null;
      payload.ann_event_end = announcement.ann_event_end || payload.ann_end_at || null;
    } else {
      payload.ann_event_start = null;
      payload.ann_event_end = null;
    }

    if (announcement.ann_type === "public") {
      delete payload.staff;
      delete payload.staff_group;
      delete payload.ar_type;
      delete payload.ar_category;
      payload.ann_to_sms = false;
      payload.ann_to_email = false;
    }

    console.log("Sending payload:", JSON.stringify(payload, null, 2));
    const res = await api.post("announcement/create/", payload);
    console.log("Post response:", JSON.stringify(res.data, null, 2));
    return res.data ?? {};
  } catch (error) {
    console.error("API Error (postAnnouncement):", error);
    throw error;
  }
};

// ✅ Bulk recipients
export const postAnnouncementRecipient = async (recipients: Record<string, any>[]) => {
  try {
    const payload = { recipients };
    console.log("Sending recipients payload:", JSON.stringify(payload, null, 2));
    const res = await api.post("announcement/create-recipient/", payload);
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
