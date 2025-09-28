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
    throw err;
  }
};

// Fetch positions with optional filtering for staff type
export const getPositions = async (staff_type: string) => {
  try {
    const res = await api.get("administration/position/", {
      params: {
        staff_type
      }
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getFeatures = async (category: string) => {
  try {
    const res = await api.get("administration/feature/", {
      params: {
        category
      }
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getAssignedFeatures = async (selectedPosition: string) => {
  try {
    const path = `administration/assignment/${selectedPosition}/`;
    const res = await api.get(path);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getAllAssignedFeatures = async () => {
  try {
    const res = await api.get("administration/assignment/list/");
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
