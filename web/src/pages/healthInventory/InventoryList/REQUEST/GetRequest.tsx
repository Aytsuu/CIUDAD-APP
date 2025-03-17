import api from "@/pages/api/api";

// Fetches the list of medicines from the API
export const getMedicines = async () => {
  try {
    const response = await api.get("inventory/medicinelist/");
    if (response.status === 200) {
      return response.data; // Assuming API returns an array of medicines
    }
    console.error("⚠️ Unexpected response status:", response.status);
    return [];
  } catch (error) {
    console.error("🔥 Error fetching medicines:", error);
    return [];
  }
};
