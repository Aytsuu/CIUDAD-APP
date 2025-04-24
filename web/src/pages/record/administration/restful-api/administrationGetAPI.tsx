import {api} from "@/api/api";

// Fetch staffs
export const getStaffs = async () => {
  try {
    const res = await api.get("administration/staff/");
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
    const res = await api.get("administration/assignment/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
