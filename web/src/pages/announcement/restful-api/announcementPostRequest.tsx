import { api } from "@/api/api";

export const postAnnouncement = async (announcement: Record<string, any>) => {
  try {
    console.log("Sending payload:", announcement);
    const res = await api.post("announcement/create/", announcement);
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
