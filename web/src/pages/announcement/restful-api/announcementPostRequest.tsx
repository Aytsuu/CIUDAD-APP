import {api} from "@/api/api";
import { useMutation } from "@tanstack/react-query";

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


export const postAnnouncementFile = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>[]) => {
      try {
        const res = await api.post('announcement/upload-files/', data);
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}