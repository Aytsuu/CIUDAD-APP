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

// ----------------------------------------------------------------------------------------------------------------------------