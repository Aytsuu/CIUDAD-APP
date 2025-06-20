import { api } from "@/api/api";

export const postAnnouncement = async (announcement: Record<string, any>) => {
  try {
    const res = await api.post("announcement/create/", announcement);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postAnnouncementRecipient = async (recipient: Record<string, any>) => {
  try {
    const res = await api.post("announcement/create-recipient/", recipient);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const postAnnouncementFile = async (
  name: string,
  type: string,
  path: string,
  url: string
) => {
  try {
    const res = await api.post("announcement/upload-files", {
      af_name: name,
      af_type: type,
      af_path: path,
      af_url: url,
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};
