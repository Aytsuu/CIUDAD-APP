import { api } from "@/api/api";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export const postAnnouncement = async (announcement: Record<string, any>) => {
  try {
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
    // ✅ Fetch the session/token at the moment of the request
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    const res = await api.post("announcement/create-recipient/", payload, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Pass the token in header
      },
    });
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