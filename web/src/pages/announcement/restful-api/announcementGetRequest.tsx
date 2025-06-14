import api from "@/pages/api/api";

export const getAnnouncementRequest = async () => {
  try {
    const response = await api.get(`announcement/announcements/`);
    const data = response.data?.data ?? response.data ?? [];
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

export const getAnnouncementRecipientRequest = async () => {
  try {
    const response = await api.get(`announcement/create-recipient/`);
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
};
