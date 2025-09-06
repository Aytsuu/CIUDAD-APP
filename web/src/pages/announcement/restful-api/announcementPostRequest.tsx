import { api } from "@/api/api";

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
