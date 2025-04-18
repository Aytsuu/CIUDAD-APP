import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { generateFamilyNo } from "@/helpers/generateFamilyNo";
import { generateResidentNo } from "@/helpers/generateResidentNo";
import { capitalize } from "@/helpers/capitalize";
import { generateHouseholdNo } from "@/helpers/generateHouseholdNo";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

// POST request for personal model 
export const addPersonal = async (personalInfo: Record<string, string>) => {
  try {
    const res = await api.post("profiling/personal/", {
      per_lname: capitalize(personalInfo.per_lname),
      per_fname: capitalize(personalInfo.per_fname),
      per_mname: capitalize(personalInfo.per_mname) || null,
      per_suffix: capitalize(personalInfo.per_suffix) || null,
      per_dob: formatDate(personalInfo.per_dob),
      per_sex: capitalize(personalInfo.per_sex),
      per_status: capitalize(personalInfo.per_status),
      per_address: capitalize(personalInfo.per_address),
      per_edAttainment: capitalize(personalInfo.per_edAttainment) || null,
      per_religion: capitalize(personalInfo.per_religion),
      per_contact: capitalize(personalInfo.per_contact),
    });

    return res.data.per_id;
  } catch (err) {
    console.error(err);
  }
};

// POST request for resident_profile model 
export const addResidentProfile = async (personalId: string, staffId: string) => {
  try {
    const res = await api.post("profiling/resident/", {
      rp_id: await generateResidentNo(),
      rp_date_registered: formatDate(new Date()),
      per_id: personalId,
      staff_id: staffId,
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// POST request for family model 
export const addFamily = async (
  demographicInfo: Record<string, string>,
  staffId: string
) => {
  try {
    const res = await api.post("profiling/family/", {
      fam_id: await generateFamilyNo(demographicInfo.building),
      fam_indigenous: capitalize(demographicInfo.indigenous),
      fam_building: capitalize(demographicInfo.building),
      fam_date_registered: formatDate(new Date()),
      hh_id: demographicInfo.householdNo || null,
      staff_id: staffId,
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// POST request for family_composition model 
export const addFamilyComposition = async (familyId: string, role: string, residentId: string) => {
  try {
    const res = await api.post("profiling/family-composition/", {
      fc_role: capitalize(role),
      fam_id: familyId,
      rp_id: residentId,
    });

    return res.data
  } catch (err) {
    console.error(err);
  }
};

// POST request for household model 
export const addHousehold = async (householdInfo: Record<string, string>, staffId: string) => {
  try {
    const res = await api.post("profiling/household/", {
      hh_id: await generateHouseholdNo(),
      hh_nhts: capitalize(householdInfo.nhts),
      hh_province: "Cebu",
      hh_city: "Cebu City",
      hh_barangay: "San Roque",
      hh_street: capitalize(householdInfo.street),
      hh_date_registered: formatDate(new Date()),
      rp_id: householdInfo.householdHead.split(" ")[0],
      sitio_id: householdInfo.sitio,
      staff_id: staffId,
    });

    return res.data;
  } catch (err) {
    console.error(err);
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
    console.error(err);
  }
};

export const addBusinessFile = async (businessId: string, fileId: string) => {
  try {
    console.log({
      bus: businessId,
      file: fileId
    })
    const res = await api.post('profiling/business/file/', {
      bus: businessId,
      file: fileId
    });

    return res.data
  } catch (err) {
    console.error(err);
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
    console.error(err);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------
