import { api2 } from "@/api/api";

export const getChildHealthRecords = async (params?: { page?: number; page_size?: number; search?: string; patient_type?: string; status?: string }) => {
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
};

export const getNutrionalSummary = async (chrec_id: string) => {
  const response = await api2.get(`/child-health/nutritional-summary/${chrec_id}/`);
  return response.data;
};
export const getChildHealthHistory = async (chrec: string, params?: { page?: number; page_size?: number }) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page_size", (params?.page_size ?? 10).toString());
  if (params?.page) queryParams.append("page", params.page.toString());

  const url = `/child-health/history/${chrec}/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
  const response = await api2.get(url);
  return response.data;
};

export const getChildHealthCurrentAndPreviousHistory = async (chrec: string, chhist: string) => {
  const url = `/child-health/history-current-previous/${chrec}/${chhist}/`;
  const response = await api2.get(url);
  return response.data;
};

export const getNutritionalStatus = async (id: string) => {
  const response = await api2.get(`/patientrecords/children-body-measurements/${id}/`);
  return response.data;
};

export const getNextufc = async () => {
  const response = await api2.get(`/child-health/next-ufcno/`);
  return response.data;
};

export const getLatestVitals = async (id: any) => {
  const response = await api2.get(`/child-health/latest-vital-bm/${id}/`);
  return response.data.data;
};

export const getChildnotesfollowup = async (chrec_id: any) => {
  const response = await api2.get(`/child-health/patients/${chrec_id}/pending-followups-with-notes/`);
  return response.data;
};

export const getChildData = async (id: string, page?: number, pageSize?: number): Promise<any> => {
  try {
    const res = await api2.get(`/child-health/records/by-patient/${id}/`, {
      params: {
        page: page,
        page_size: pageSize,
      },
    });
    if (res.status !== 200) {
      if (process.env.NODE_ENV === 'development') console.error("Failed to fetch child data", res);
      return null;
    }
    return res.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return null;
  }
};
