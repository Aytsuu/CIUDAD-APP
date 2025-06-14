import api from "@/pages/api/api";

export const postAnnouncement = async (announcement: Record<string, any>) => {
  try {
    const res = await api.post('announcement/create/', announcement);
    return res.data; // Should contain ann_id
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postAnnouncementRecipient = async (recipient: Record<string, any>) => {
  try {
    const res = await api.post('announcement/create-recipient/', recipient);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
