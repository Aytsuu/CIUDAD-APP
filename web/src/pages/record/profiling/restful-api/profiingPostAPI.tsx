import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { capitalize } from "@/helpers/capitalize";
import { generateHouseholdNo } from "@/helpers/generateHouseholdNo";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

// POST request for resident_profile model 
export const addResidentProfile = async (personalId: string, staffId: string) => {
  try {
    const res = await api.post("profiling/resident/create/", {
      rp_date_registered: formatDate(new Date()),
      per: personalId,
      staff: staffId,
    });

    return res.data;
  } catch (err) {
    throw err;
  }
}; 

// POST request for resident_profile combined with personal model 
export const addResidentAndPersonal = async (personalInfo: Record<string, any>, staffId: string) => {
  try {
    const res = await api.post("profiling/resident/create/combined/", {
      per: {
        per_lname: personalInfo.per_lname,
        per_fname: personalInfo.per_fname,
        per_mname: personalInfo.per_mname || null,
        per_suffix: personalInfo.per_suffix || null,
        per_dob: formatDate(personalInfo.per_dob),
        per_sex: personalInfo.per_sex,
        per_status: personalInfo.per_status,
        per_address: personalInfo.per_address,
        per_edAttainment: personalInfo.per_edAttainment || null,
        per_religion: personalInfo.per_religion,
        per_contact: personalInfo.per_contact,
      },
      staff: staffId
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
    const res = await api.post("profiling/household/create/", {
      hh_nhts: capitalize(householdInfo.nhts),
      hh_street: capitalize(householdInfo.street),
      rp: householdInfo.householdHead.split(" ")[0],
      sitio: householdInfo.sitio,
      staff: staffId,
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

// POST request for business model 
export const addBusiness = async (businessInfo: Record<string, string>, staffId: string) => {
  try {
    console.log({
      bus_name: businessInfo.bus_name,
      bus_gross_sales: parseFloat(businessInfo.bus_gross_sales),
      bus_province: "Cebu",
      bus_city: "Cebu City",
      bus_barangay: "San Roque",
      bus_street: businessInfo.bus_street,
      bus_respondentLname: businessInfo.bus_respondentLname,
      bus_respondentFname: businessInfo.bus_respondentFname,
      bus_respondentMname: businessInfo.bus_respondentMname,
      bus_respondentSex: businessInfo.bus_respondentSex,
      bus_respondentDob: businessInfo.bus_respondentDob,
      bus_date_registered: formatDate(new Date()),
      sitio_id: businessInfo.sitio,
      staff_id: staffId,
    })
    const res = await api.post("profiling/business/", {
      bus_name: businessInfo.bus_name,
      bus_gross_sales: parseFloat(businessInfo.bus_gross_sales),
      bus_province: "Cebu",
      bus_city: "Cebu City",
      bus_barangay: "San Roque",
      bus_street: businessInfo.bus_street,
      bus_respondentLname: businessInfo.bus_respondentLname,
      bus_respondentFname: businessInfo.bus_respondentFname,
      bus_respondentMname: businessInfo.bus_respondentMname,
      bus_respondentSex: businessInfo.bus_respondentSex,
      bus_respondentDob: businessInfo.bus_respondentDob,
      bus_date_registered: formatDate(new Date()),
      sitio_id: businessInfo.sitio,
      staff_id: staffId,
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const addBusinessFile = async (businessId: string, fileId: string) => {
  try {
    const res = await api.post('profiling/business/file/', {
      bus: businessId,
      file: fileId
    });

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
