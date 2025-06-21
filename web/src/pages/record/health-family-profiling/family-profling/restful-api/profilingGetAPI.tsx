import { api2 } from "@/api/api";

// ==================== FETCH RESIDENT ==================== (Status: Optimizing....)
export const getPerAddressesList = async () => {
  try {
    const res = await api2.get("health-profiling/per_address/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const getResidentsListHealth = async () => {
  try {
    const res = await api2.get("health-profiling/resident/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getResidentsWithFamExclusion = async (familyId: string) => {
  try {
    const res = await api2.get(`health-profiling/resident/exclude/fam/${familyId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const getResidentsFamSpecificList = async (familyId: string) => {
  try {
    const res = await api2.get(`health-profiling/resident/fam/${familyId}/list/`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const getResidentsTableHealth = async (page: number, pageSize: number, searchQuery?: string) => {
  try {
    const res = await api2.get("health-profiling/resident/list/table/", {
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
    const res = await api2.get(`health-profiling/resident/personal/${residentId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

// ==================== FETCH FAMILY ==================== (Status: Optimizing....)
export const getFamilies = async () => {
  try {
    const res = await api2.get("health-profiling/family/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getFamiliesTable = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api2.get("health-profiling/family/list/table/", {
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
    const res = await api2.get(`health-profiling/family/${familyId}/data/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

export const getFamilyID = async (residentId: string) => {
  try {
    const res = await api2.get(`health-profiling/family/id/${residentId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

export const getFamilyMembers = async (familyId: string) => {
  if(!familyId) return;

  try { 
    const res = await api2.get(`health-profiling/family/${familyId}/members/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

export const getFamFilteredByHouse = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/family/list/filter/${householdId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

// Fetch family composition
export const getFamilyComposition = async () => {
  try {
    const res = await api2.get("health-profiling/family-composition/");
    return res.data;
  } catch (err) {
    throw err
  }
}

// ==================== FETCH HOUSEHOLD ==================== (Status: Optimizing....)
export const getHouseholdTable = async (page: number, pageSize: number, searchQuery: string) => {
  try {
    const res = await api2.get("health-profiling/household/list/table/", {
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

export const getHouseholdListHealth = async () => {
  try {
    const res = await api2.get("health-profiling/household/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getHouseholdDataHealth = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/household/${householdId}/data/`);
    return res.data
  } catch (err) {
    throw err;
  }
}


// ==================== FETCH SITIO ==================== (Status: Optimizing....)
export const getSitioList = async () => {
  try {
    const res = await api2.get("health-profiling/sitio/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Fetch registration requests
export const getRequests = async () => {
  try {
    const res = await api2.get("health-profiling/request/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

// // Fetch businesses
// export const getBusinesses = async () => {
//   try {
//     const res = await api2.get("health-profiling/business/");
//     return res.data;
//   } catch (err) {
//     throw err;
//   }
// };