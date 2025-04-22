import { api } from "@/api/api";

// ==================== FETCH RESIDENT ==================== (Status: Optimizing....)
export const getResidents = async () => {
  try {
    const res = await api.get("profiling/resident/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getResidentsTable = async (page: number, pageSize: number, searchQuery?: string) => {
  try {
    const res = await api.get("profiling/resident/list/table/", {
      params: { 
        page, 
        page_size: pageSize,
        search: searchQuery
      }
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}

// Fetch families
export const getFamilies = async () => {
  try {
    const res = await api.get("profiling/family/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch family composition
export const getFamilyComposition = async () => {
  try {
    const res = await api.get("profiling/family-composition/");
    return res.data;
  } catch (err) {
    throw err
  }
}

// Fetch households
export const getHouseholds = async () => {
  try {
    const res = await api.get("profiling/household/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch sitio
export const getSitio = async () => {
  try {
    const res = await api.get("profiling/sitio/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch registration requests
export const getRequests = async () => {
  try {
    const res = await api.get("profiling/request/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch businesses
export const getBusinesses = async () => {
  try {
    const res = await api.get("profiling/business/");
    return res.data;
  } catch (err) {
    throw err;
  }
};
