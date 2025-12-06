// getAPI.ts
import { api2 } from "@/api/api";

export const getFirstaidRecords = async (page: number, pageSize: number, searchQuery: string, year?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== "all") params.append("year", year);
    if (searchQuery) params.append("search", searchQuery);
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());

    const response = await api2.get<any>(`/firstaid/firstaid-records/monthly/?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching First Aid records:", error);
    }
    // Do not throw in production; only log in development
  }
};

// Update your query function
export const getFirstaidReports = async (month: string, page: number, pageSize: number, searchQuery: string): Promise<any> => {
  try {
    const url = `/firstaid/firstaid-reports/${month}/`;
    const response = await api2.get<any>(url, {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery
      }
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching First Aid records:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getFirstAidChart = async (month: string) => {
  try {
    const url = `/firstaid/firstaid-records/monthly/chart/${month}/`;
    const response = await api2.get<any>(url);
    if (process.env.NODE_ENV === 'development') {
      console.log("Chart Response:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching Vaccination Chart:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getStaffList = async () => {
  try {
    const response = await api2.get("/administration/healthstaff/");
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching staff list:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getDoctorList = async () => {
  try {
    const response = await api2.get("/administration/doctorlist/");
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching staff list:", error);
    }
    // Do not throw in production; only log in development
  }
};


export const getMidwifeList = async () => {
  try {
    const response = await api2.get("/administration/midwife/");
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching staff list:", error);
    }
    // Do not throw in production; only log in development
  }
};

