import { api2 } from "@/api/api";

export const getChildHealthRecords = async () => {
  try {
    const response = await api2.get("/child-health/records/");
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

export const getNutrionalSummary = async (chrec_id: string) => {
  try {
    const response = await api2.get(
      `/child-health/nutritional-summary/${chrec_id}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};


export const getChildHealthHistory = async (chrec: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await api2.get(`/child-health/history/${chrec}/`, {
      signal: controller.signal,
      timeout: 30000, // Additional timeout for axios
    });

    clearTimeout(timeoutId);
    return response.data;
  } catch (err: any) {
    if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
      throw new Error('Request timeout: Please check your internet connection and try again');
    }
    
    if (err.response?.status === 500) {
      throw new Error('Server error: Please try again later');
    }
    
    console.error('Error fetching child health history:', err);
    throw err;
  }
};