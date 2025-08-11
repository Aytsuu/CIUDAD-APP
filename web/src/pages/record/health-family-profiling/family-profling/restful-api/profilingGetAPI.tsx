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

export const getResidentsWithFamExclusionHealth = async (familyId: string) => {
  try {
    const res = await api2.get(`health-profiling/resident/exclude/fam/${familyId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const getResidentsFamSpecificListHealth = async (familyId: string) => {
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
export const getFamiliesHealth = async () => {
  try {
    const res = await api2.get("health-profiling/family/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getFamiliesTableHealth = async (page: number, pageSize: number, searchQuery: string) => {
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

export const getFamilyDataHealth = async (familyId: string) => {
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

export const getFamilyMembersHealth = async (familyId: string) => {
  if(!familyId) return [];

  try { 
    const res = await api2.get(`health-profiling/family/${familyId}/members/`)
    return res.data || [];
  } catch (err) {
    console.error('Error fetching family members:', err);
    return [];
  }
}

export const getFamFilteredByHouseHealth = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/family/list/filter/${householdId}/`)
    return res.data
  } catch (err) {
    throw err;
  }
}

// Fetch family composition
export const getFamilyCompositionHealth = async () => {
  try {
    const res = await api2.get("health-profiling/family-composition/");
    return res.data;
  } catch (err) {
    throw err
  }
}

// ==================== FETCH HOUSEHOLD ==================== (Status: Optimizing....)
export const getHouseholdTableHealth = async (page: number, pageSize: number, searchQuery: string) => {
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
export const getSitioListHealth = async () => {
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

// ==================== WATER SUPPLY / ENVIRONMENTAL ==================== 
export const getWaterSupplyOptions = async () => {
  try {
    const res = await api2.get("health-profiling/water-supply/options/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getWaterSupplyTypes = async () => {
  try {
    const res = await api2.get("health-profiling/water-supply/types/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getWaterSupplyList = async () => {
  try {
    const res = await api2.get("health-profiling/water-supply/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getWaterSupplyByHousehold = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/water-supply/household/${householdId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getEnvironmentalData = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/environmental-data/${householdId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSanitaryFacilityList = async () => {
  try {
    const res = await api2.get("health-profiling/sanitary-facility/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSanitaryFacilityByHousehold = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/sanitary-facility/household/${householdId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Solid waste management
export const getSolidWasteList = async () => {
  try {
    const res = await api2.get("health-profiling/solid-waste/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSolidWasteByHousehold = async (householdId: string) => {
  try {
    const res = await api2.get(`health-profiling/solid-waste/household/${householdId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ==================== FETCH SURVEY IDENTIFICATION ==================== (Status: Completed)
export const getSurveyIdentificationList = async () => {
  try {
    const res = await api2.get("health-profiling/survey-identification/list/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSurveyIdentificationDetail = async (siId: string) => {
  try {
    const res = await api2.get(`health-profiling/survey-identification/${siId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSurveyIdentificationByFamily = async (famId: string) => {
  try {
    const res = await api2.get(`health-profiling/survey-identification/family/${famId}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSurveyIdentificationFormData = async (famId: string) => {
  try {
    const res = await api2.get(`health-profiling/survey-identification/form/submit/?fam_id=${famId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getSurveyIdentificationDataByHousehold = async (hhId: string) => {
  try {
    const res = await api2.get(`health-profiling/survey-identification/household/${hhId}/data/`);
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