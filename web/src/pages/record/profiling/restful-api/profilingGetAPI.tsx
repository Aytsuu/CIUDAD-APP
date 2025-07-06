import { api } from "@/api/api";

//===================== FETCH ADDRESS ====================
export const getPerAddressesList = async () => {
  try {
    const res = await api.get("profiling/per_address/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
}

// ==================== FETCH RESIDENT ==================== (Status: Optimizing....)
export const getResidentsList = async (
  is_staff: boolean = false, 
  exclude_independent: boolean = false
) => {
  try {
    const res = await api.get("profiling/resident/", {
      params: {
        is_staff,
        exclude_independent
      }
    });
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

export const getFamilyID = async (residentId: string) => {
  try {
    const res = await api.get(`profiling/family/id/${residentId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

export const getFamilyMembers = async (familyId: string) => {
  if(!familyId) return [];

  try { 
    const res = await api.get(`profiling/family/${familyId}/members/`)
    return res.data
  } catch (err) {
    throw err;
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

export const getFamilyComposition = async () => {
  try {
    const res = await api.get("profiling/family-composition/");
    return res.data;
  } catch (err) {
    throw err
  }
}

// ==================== FETCH HOUSEHOLD ==================== (Status: Optimizing....)
export const getHouseholdTable = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/household/list/table/", {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery
      }
    });
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

// ==================== FETCH REGISTRATION REQUEST ==================== (Status: Optimizing....)
export const getRequests = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/request/list/table/", {
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
};

// ==================== FETCH BUSINESS ==================== (Status: Optimizing....)
export const getBusinesses = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/business/list/table/", {
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
};