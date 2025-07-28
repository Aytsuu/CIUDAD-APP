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
    const response = await api2.get(`/child-health/history/${chrec}/`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;

  }
};
