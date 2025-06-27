import { api2 } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";
import { generateFamilyNo } from "@/helpers/generateFamilyNo";
import { generateResidentNo } from "@/helpers/generateResidentNo";
import { capitalize } from "@/helpers/capitalize";
import { generateHouseholdNo } from "@/helpers/generateHouseholdNo";

// API REQUESTS ---------------------------------------------------------------------------------------------------------

// POST request for personal model 
export const addPersonalHealth = async (personalInfo: Record<string, string>) => {
  try {
    console.log({
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
    })
    
    const res = await api2.post("health-profiling/personal/", {
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
export const addResidentProfileHealth = async (personalId: string, staffId: string) => {
  try {

    console.log({
      rp_id: await generateResidentNo(),
      rp_date_registered: formatDate(new Date()),
      per_id: personalId,
      staff_id: staffId,
    })
    const res = await api2.post("health-profiling/resident/", {
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
export const addFamilyHealth = async (
  demographicInfo: Record<string, string>,
  staffId: string
) => {
  try {
    const res = await api2.post("health-profiling/family/", {
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
export const addFamilyCompositionHealth = async (familyId: string, role: string, residentId: string) => {
  try {
    const res = await api2.post("health-profiling/family-composition/", {
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
export const addHouseholdHealth = async (householdInfo: Record<string, string>, staffId: string) => {
  try {
    const res = await api2.post("health-profiling/household/", {
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





// ----------------------------------------------------------------------------------------------------------------------------