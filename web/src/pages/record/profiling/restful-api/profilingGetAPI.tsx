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
export const getDeceasedResidentsList = async () => {
  try {
    const res = await api.get("profiling/resident/", {
      params: {
        deceased_only: true
      }
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getResidentsList = async (
  is_staff: boolean = false, 
  exclude_independent: boolean = false,
  isSearchOnly: boolean = false,
  search: string = ""
) => {
  try {
    const res = await api.get("profiling/resident/", {
      params: {
        is_staff,
        exclude_independent,
        is_search_only: isSearchOnly,
        search
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

export const getHouseholdList = async (search?: string) => {
  try {
    const res = await api.get("profiling/household/list/", {
      params: {
        search,
        is_search: search != undefined
      }
    });
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
export const getRequests = async (page: number, pageSize: number, searchQuery: string, selectedRequestType: string) => {
  try {
    const res = await api.get("profiling/request/list/table/", {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery,
        request_type: selectedRequestType
      }
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ==================== FETCH BUSINESS ==================== (Status: Optimizing....)
export const getActiveBusinesses = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/business/active/list/table/", {
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

export const getPendingBusinesses = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/business/pending/list/table/", {
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

export const getBusinessRespondent = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api.get("profiling/business/respondent/list/table/", {
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
