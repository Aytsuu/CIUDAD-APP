import { api2 } from "@/api/api";

export const getImzSupTables = async (page: number, pageSize: number, search?: string) => {
  try {
    const res = await api2.get("inventory/imz_supplieslist-table/", {
      params: {
        page,
        page_size: pageSize,
        search: search || undefined
      }
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return { results: [], pagination: { total_count: 0, total_pages: 0, current_page: 1 } };
  }
};

export const getImzSuplist = async () => {
  try {
    const res = await api2.get("inventory/imz_supplieslist-view/");
    return res.data;
  } catch (err) {
    console.error("Error fetching IMZ supplies data:", err);
    return [];
  }
};

export const getVaccineList = async () => {
  try {
    const res = await api2.get("inventory/vac_list/");
    return res.data; // Return the actual data
  } catch (err) {
    console.error("Error fetching vaccine data:", err);
    return [];
  }
};

export const getVaccineListCombine = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const response = await api2.get("/inventory/combined_vaccine_data/", {
      params: {
        page,
        page_size: pageSize,
        search
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching combined vaccine data:", error);
    return [];
  }
};