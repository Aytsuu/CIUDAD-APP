import { api, api2 } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";
import { capitalize } from "@/helpers/capitalize";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

// POST request for personal        
export const addPersonal = async (data: Record<string, any>) => {
  
  try {
    const new_data = {
      per_lname: data.per_lname,
      per_fname: data.per_fname,
      per_mname: data.per_mname || null,
      per_suffix: data.per_suffix || null,
      per_dob: formatDate(data.per_dob),
      per_sex: data.per_sex,
      per_status: data.per_status,
      per_edAttainment: data.per_edAttainment || null,
      per_religion: data.per_religion,
      per_contact: data.per_contact,
    }
    const res = await api.post("profiling/personal/create/", new_data);
    await api2.post("health-profiling/personal/create/", new_data);

    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// POST request for address
export const addAddress =  async (data: Record<string, any>[]) => {
  try {
    console.log(data)
    const res = await api.post("profiling/address/create/", data);
    await api2.post("health-profiling/address/create/", data);
    return res.data;
  } catch (err) {
    console.log(err)
    throw err;
  }
}

// POST request for personal address
export const addPersonalAddress = async (data: Record<string, any>[], staff_id?: string, history_id?: string) => {
  try {
    const values = {
      per_add: data,
      staff_id: staff_id,
      history_id: history_id
    }
    const res = await api.post("profiling/per_address/create/", values);
    try {
      await api2.post("health-profiling/per_address/create/", values);
    } catch (healthErr: any) {
      console.error("Health database per_address creation error:", healthErr);
      if (healthErr.response) {
        console.error("Health database per_address error response:", healthErr.response.data);
      }
    }
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST request for resident_profile combined with personal model 
export const addResidentAndPersonal = async (personalInfo: Record<string, any>, staffId: string) => {
  try {
    const data = {
      per: {
        per_lname: personalInfo.per_lname || null,
        per_fname: personalInfo.per_fname || null,
        per_mname: personalInfo.per_mname || null,
        per_suffix: personalInfo.per_suffix || null,
        per_dob: formatDate(personalInfo.per_dob) || null,
        per_sex: personalInfo.per_sex || null,
        per_status: personalInfo.per_status || null,
        per_edAttainment: personalInfo.per_edAttainment || null,
        per_religion: personalInfo.per_religion || null,
        per_contact: personalInfo.per_contact || null,
      },
      per_id: +personalInfo.per_id || null,
      staff: staffId || null
    }
    const res = await api.post("profiling/resident/create/combined/", data);
    await api2.post("health-profiling/resident/create/combined/", data);
    
    return res.data
  } catch (err) { 
    console.error(err)
    throw err;
  }
}

// POST request for family model 
export const addFamily = async (
  demographicInfo: Record<string, string>,
  staffId: string
) => {
  try {

    const data = {
      fam_indigenous: capitalize(demographicInfo.indigenous),
      fam_building: capitalize(demographicInfo.building),
      hh: demographicInfo.householdNo.split(" ")[0] || null,
      staff: staffId,
    }
    const res = await api.post("profiling/family/create/", data);

    return res.data;
  } catch (err) {
    throw err;
  }
};

// POST request for family_composition model 
export const addFamilyComposition = async (data: Record<string, any>[]) => {
  try {
    const res = await api.post("profiling/family/composition/bulk/create/", data);

    return res.data
  } catch (err) {
    throw err;
  }
};

// POST request for household model 
export const addHousehold = async (householdInfo: Record<string, string>, staffId: string) => {
  try {
    const data = {
      hh_nhts: capitalize(householdInfo.nhts),
      add: householdInfo.address.split(" ")[0],
      rp: householdInfo.householdHead.split(" ")[0],
      staff: staffId
    }
    const res = await api.post("profiling/household/create/", data);
    await api2.post("health-profiling/household/create/", data);

    return res.data;
  } catch (err) {
    throw err;
  }
};

// POST request for business model 
export const addBusiness = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/business/create/", data);
    return res.data;
  } catch (err) {    
    console.error(err)
    throw err;
  }
};

export const addBusinessFile = async (data: Record<string, any>[]) => {
  try {
    const res = await api.post('profiling/business/file/create/', data);
    return res.data
  } catch (err) {
    throw err;
  }
}

// ----------------------------------------------------------------------------------------------------------------------------