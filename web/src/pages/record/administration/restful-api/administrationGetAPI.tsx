import { api } from "@/api/api";
import { api2 } from "@/api/api";

// Fetch staffs with optional staff type filtering
export const getStaffs = async (
  page: number, 
  pageSize: number, 
  searchQuery: string, 
  staffTypeFilter?: 'Barangay Staff' | 'Health Staff'
) => {
  try {
    const params: any = { 
      page, 
      page_size: pageSize,
      search: searchQuery
    };
    
    // Add staff type filter if provided
    if (staffTypeFilter) {
      params.staff_type = staffTypeFilter;
    }
    
    const res = await api.get("administration/staff/list/table/", { params });
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch positions with optional filtering for staff type
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


//-----------Heakth Administration Get API's-----------------

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