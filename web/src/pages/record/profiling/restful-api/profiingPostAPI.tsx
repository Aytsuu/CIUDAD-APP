import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { capitalize } from "@/helpers/capitalize";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

// POST request for address
export const addAddress =  async (data: Record<string, any>[]) => {
  try {
    const res = await api.post("profiling/address/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST request for personal address
export const addPersonalAddress = async (data: Record<string, any>[]) => {
  try {
    const res = await api.post("profiling/per_address/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// POST request for resident_profile combined with personal model 
export const addResidentAndPersonal = async (personalInfo: Record<string, any>, staffId: string) => {
  try {
    const res = await api.post("profiling/resident/create/combined/", {
      per: {
        per_id: +personalInfo.per_id || null,
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
      staff: staffId || null
    })
    
    return res.data
  } catch (err) { 
    throw err;
  }
}

// POST request for family model 
export const addFamily = async (
  demographicInfo: Record<string, string>,
  staffId: string
) => {
  try {
    const res = await api.post("profiling/family/create/", {
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
export const addFamilyComposition = async (data: Record<string, any>[]) => {
  try {
    console.log(data)
    const res = await api.post("profiling/family/composition/bulk/create/", data);

    return res.data
  } catch (err) {
    throw err;
  }
};

// POST request for household model 
export const addHousehold = async (householdInfo: Record<string, string>, staffId: string) => {
  try {
    console.log({
      hh_nhts: capitalize(householdInfo.nhts),
      add: +householdInfo.add_id,
      rp: householdInfo.householdHead.split(" ")[0],
      staff: staffId
    })
    const res = await api.post("profiling/household/create/", {
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

// POST request for business model 
export const addBusiness = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/business/create/", data);
    return res.data;
  } catch (err) {
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

export const addFile = async (name: string, type: string, path: string, url: string) => {
  try {
    const res = await api.post('file/upload/', {
      file_name: name,
      file_type: type,
      file_path: path,
      file_url: url
    })

    return res.data
  } catch (err) {
    throw err;
  }
}

// ----------------------------------------------------------------------------------------------------------------------------