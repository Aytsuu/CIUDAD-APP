import { api } from "@/api/api";

// ==================== FETCH RESIDENT ==================== (Status: Optimizing....)
export const getResidentsList = async () => {
  try {
    const res = await api.get("profiling/resident/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getResidentsWithFamExclusion = async (familyId: string) => {
  try {
    const res = await api.get(`profiling/resident/exclude/fam/${familyId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const getResidentsFamSpecificList = async (familyId: string) => {
  try {
    const res = await api.get(`profiling/resident/fam/${familyId}/list/`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

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

export const getPersonalInfo = async (residentId: string) => {
  try {
    const res = await api.get(`profiling/resident/personal/${residentId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

// ==================== FETCH FAMILY ==================== (Status: Optimizing....)
export const getFamilies = async () => {
  try {
    const res = await api.get("profiling/family/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getFamiliesTable = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/family/list/table/", {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery
      }
    })

    return res.data
  } catch (err) {
    throw err;
  }
}

export const getFamilyData = async (familyId: string) => {
  try {
    const res = await api.get(`profiling/family/${familyId}/data/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

export const getFamilyMembers = async (familyId: string) => {
  try { 
    const res = await api.get(`profiling/family/${familyId}/members/`)
    return res.data
  } catch (err) {

  }
}

export const getFamFilteredByHouse = async (householdId: string) => {
  try {
    const res = await api.get(`profiling/family/list/filter/${householdId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

// Fetch family composition
export const getFamilyComposition = async () => {
  try {
    const res = await api.get("profiling/family-composition/");
    return res.data;
  } catch (err) {
    throw err
  }
}

// ==================== FETCH HOUSEHOLD ==================== (Status: Optimizing....)
export const getHouseholdTable = async () => {
  try {
    const res = await api.get("profiling/household/list/table/");
    return res.data
  } catch (err) {
    throw err;
  }
}

export const getHouseholdList = async () => {
  try {
    const res = await api.get("profiling/household/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getHouseholdData = async (householdId: string) => {
  try {
    const res = await api.get(`profiling/household/${householdId}/data/`);
    return res.data
  } catch (err) {
    throw err;
  }
}


// ==================== FETCH SITIO ==================== (Status: Optimizing....)
export const getSitioList = async () => {
  try {
    const res = await api.get("profiling/sitio/list/");
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