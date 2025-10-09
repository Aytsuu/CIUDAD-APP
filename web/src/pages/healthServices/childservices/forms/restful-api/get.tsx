import { api2 } from "@/api/api";


export const getChildHealthRecords = async (params?: { page?: number; page_size?: number; search?: string; patient_type?: string; status?: string }) => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.patient_type && params.patient_type !== "all") {
      queryParams.append("patient_type", params.patient_type);
    }
    if (params?.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }

    const url = `/child-health/records/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
}

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


export const getLatestVitals = async (id:any) => {
  try {
    const response = await api2.get(`/child-health/latest-vital-bm/${id}/`);
    console.log("Latest Vitals Response:", response.data);
    return response.data.data;
  } catch (err) {
    console.error("Error fetching next UFC number:", err);
    throw err;
  }
};


export const getChildnotesfollowup = async (chrec_id: any) => {
  try {
    const response = await api2.get(`/child-health/patients/${chrec_id}/pending-followups-with-notes/`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
  }