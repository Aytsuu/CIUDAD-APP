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


export const getNutritionalStatus = async (id: string) => {
  try {
    const response = await api2.get(`/patientrecords/body-measurements/${id}/`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;

  }
};
export const getNextufc = async () => {
  try {
    const response = await api2.get(`/child-health/next-ufcno/`);
    return response.data;
  } catch (err) {
    console.error("Error fetching next UFC number:", err);
    throw err;
  }
};
