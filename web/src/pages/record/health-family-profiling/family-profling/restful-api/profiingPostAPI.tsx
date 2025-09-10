import { api2 } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";
import { capitalize } from "@/helpers/capitalize";


// API REQUESTS ---------------------------------------------------------------------------------------------------------

// POST request for address
export const addAddressHealth =  async (data: Record<string, any>[]) => {
  try {
    const res = await api2.post("health-profiling/address/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST request for personal address
export const addPersonalAddressHealth = async (data: Record<string, any>[]) => {
  try {
    const values = {
      per_add: data
    }
    const res = await api2.post("health-profiling/per_address/create/", values);
    return res.data;
  } catch (err) {
    throw err;
  }
}
// POST request for resident_profile model 
export const addResidentProfileHealth = async (personalId: string, staffId: string) => {
  try {
      const res = await api2.post("health-profiling/resident/create/", {
        rp_date_registered: formatDate(new Date()),
        per: personalId,
        staff: staffId,
      });
  
      return res.data;
    } catch (err) {
      throw err;
    }
};
// POST request for personal model 
export const addResidentAndPersonalHealth = async (personalInfo: Record<string, any>, staffId?: string) => {
  try {
      console.log('staffId received:', staffId); // Debug log
      console.log('staff value being sent:', staffId || null); // Debug log

      const res = await api2.post("health-profiling/resident/create/combined/", {
        per: {
          per_lname: personalInfo.per_lname,
          per_fname: personalInfo.per_fname,
          per_mname: personalInfo.per_mname || null,
          per_suffix: personalInfo.per_suffix || null,
          per_dob: formatDate(personalInfo.per_dob),
          per_sex: personalInfo.per_sex,
          per_status: personalInfo.per_status,
          per_edAttainment: personalInfo.per_edAttainment || null,
          per_religion: personalInfo.per_religion,
          per_contact: personalInfo.per_contact,
        },
        staff: staffId || null
      })

      console.log('Full payload:', res); // Debug log
      
      return res.data
    } catch (err) { 
      throw err;
    }
};


// POST request for family model 
export const addFamilyHealth = async (
  demographicInfo: Record<string, string>,
    staffId: string
  ) => {
    try {
      const res = await api2.post("health-profiling/family/create/", {
        fam_indigenous: capitalize(demographicInfo.indigenous),
        fam_building: capitalize(demographicInfo.building),
        hh: demographicInfo.householdNo || null,
        staff: staffId,
      });
  
      return res.data;
    } catch (err) {
      throw err;
    }
};

// POST request for family_composition model 
export const addFamilyCompositionHealth = async (data: Record<string, any>[]) => {
  try {
      console.log(data)
      const res = await api2.post("health-profiling/family/composition/bulk/create/", data);
  
      return res.data
    } catch (err) {
      throw err;
    }
};

// POST request for household model 
export const addHouseholdHealth = async (householdInfo: Record<string, string>, staffId: string) => {
  try {
      console.log({
        hh_nhts: capitalize(householdInfo.nhts),
        add: +householdInfo.add_id,
        rp: householdInfo.householdHead.split(" ")[0],
        staff: staffId
      })
      const res = await api2.post("health-profiling/household/create/", {
        hh_nhts: capitalize(householdInfo.nhts),
        add: householdInfo.add_id,
        rp: householdInfo.householdHead.split(" ")[0],
        staff: staffId
      });
  
      return res.data;
    } catch (err) {
      throw err;
    }
};

// Environmental: create individual records
export const addWaterSupply = async (payload: { hh: string; water_sup_type: string; water_conn_type: string; water_sup_desc: string; water_sup_id?: string; }) => {
  try {
    const res = await api2.post("health-profiling/water-supply/create/", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const addSanitaryFacility = async (payload: { hh: string; sf_type: string; sf_toilet_type: string; sf_id?: string; }) => {
  try {
    const res = await api2.post("health-profiling/sanitary-facility/create/", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const addSolidWaste = async (payload: { hh: string; swn_desposal_type: string; swm_desc?: string; swm_id?: string; }) => {
  try {
    const res = await api2.post("health-profiling/solid-waste/create/", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Submit combined environmental form payload
export const submitEnvironmentalForm = async (payload: {
  household_id: string;
  water_supply?: { type: 'level1' | 'level2' | 'level3' };
  sanitary_facility?: { facility_type: string; toilet_facility_type: string };
  waste_management?: { waste_management_type: string; description?: string };
}) => {
  try {
    const res = await api2.post("health-profiling/environmental-form/submit/", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// POST request for respondents table
export const addRespondentHealth = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("health-profiling/respondents/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST request for per_additional_details table
export const addPerAdditionalDetailsHealth = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("health-profiling/per_additional_details/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST request for mother health info table
export const addMotherHealthInfo = async (data: Record<string, any>) => {
  try {
    // send fam instead of family_composition
    const res = await api2.post("health-profiling/mother-health-info/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// ==================== CREATE SURVEY IDENTIFICATION ==================== (Status: Completed)
export const createSurveyIdentification = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("health-profiling/survey-identification/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const submitSurveyIdentificationForm = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("health-profiling/survey-identification/form/submit/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ==================== NCD SURVEILLANCE ==================== (Status: New)
export const createNCDRecord = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("health-profiling/ncd/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ==================== TB SURVEILLANCE ==================== (Status: New)
export const createTBRecord = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("health-profiling/tb-surveillance/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ----------------------------------------------------------------------------------------------------------------------------