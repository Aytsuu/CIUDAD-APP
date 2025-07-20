import { api } from "@/api/api";

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
export const getPositions = async (
  staffType?: 'Admin' | 'Health Staff' | 'Barangay Staff'
) => {
  try {
    const params: any = {};
    
    // Add staff type parameter for backend filtering
    if (staffType) {
      params.staff_type = staffType;
    }
    
    const res = await api.get("administration/position/", { params });
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