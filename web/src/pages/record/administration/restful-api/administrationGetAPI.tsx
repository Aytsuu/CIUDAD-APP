import { api } from "@/api/api";

// Fetch staffs
export const getStaffs = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("administration/staff/list/table/", {
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
export const getPositions = async () => {
  try {
    const res = await api.get("administration/position/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getFeatures = async () => {
  try {
    const res = await api.get("administration/feature/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAssignedFeatures = async (selectedPosition: string) => {
  try {
    const res = await api.get(`administration/assignment/${selectedPosition}/`);
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const getAllAssignedFeatures = async () => {
  try {
    const res = await api.get("administration/assignment/list/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};