import api from "@/pages/api/api";

export const getAnnouncementRequest = async () => {
  try {
    const response = await api.get(`announcement/announcements/`);
    // Handle empty/undefined responses
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error:", err);
    return [];  // Always return an array
  }
};