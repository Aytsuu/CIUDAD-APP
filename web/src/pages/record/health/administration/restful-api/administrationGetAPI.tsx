import { api2 } from "@/api/api";

// Fetch staffs
export const getStaffsHealth = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api2.get("administration/staff/list/table/", {
      params: { 
        page, 
        page_size: pageSize,
        search: searchQuery
      }
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch positions
export const getPositionsHealth = async () => {
  try {
    const res = await api2.get("administration/position/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getFeaturesHealth = async () => {
  try {
    const res = await api2.get("administration/feature/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAssignedFeaturesHealth = async (selectedPosition: string) => {
  try {
    const res = await api2.get(`administration/assignment/${selectedPosition}/`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAllAssignedFeaturesHealth = async () => {
  try {
    const res = await api2.get("administration/assignment/list/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};