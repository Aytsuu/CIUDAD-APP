import { api2 } from "@/api/api";

export const getVaccineStocks = async () => {
  try {
    const res = await api2.get("inventory/vaccine_stocks/");
    if (res.status !== 200) {
      console.error("Failed to fetch vaccine stocks:", res.status);
      return [];
    }
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getVaccine = async () => {
  try {
    const res = await api2.get("inventory/vac_list/");
    if (res.status !== 200) {
      console.error("Failed to fetch vaccines:", res.status);
      return [];
    }
    return res.data;
  } catch (err) {
    console.error("Error fetching vaccines:", err);
    return [];
  }
};
