import { api2 } from "@/api/api";

export const getHealthStaffList = async () => {
  try {
    const res = await api2.get("administration/staff/health/combobox/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const searchHealthStaff = async (searchQuery: string) => {
  try {
    const res = await api2.get("administration/staff/health/combobox/", {
      params: {
        search: searchQuery
      }
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
