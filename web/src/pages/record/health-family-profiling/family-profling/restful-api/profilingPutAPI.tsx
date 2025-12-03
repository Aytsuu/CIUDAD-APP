import { api2 } from "@/api/api";


export const updateProfileHealth = async (
  perId: string,
  data: Record<string, string>
) => {
  try {
    const res = await api2.put(
      `health-profiling/personal/update/${perId}/`, data
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};


export const updateFamilyHealth = async (
  data: Record<string, any>,
  familyId: string
) => {
  try {
      const res = await api2.put(`health-profiling/family/update/${familyId}/`, data)
      return res.data;
    } catch (err) {
      console.error(err);
    }
}

export const updateFamilyRoleHealth = async (familyId: string, residentId: string, fc_role: string | null) => {
  try {
    const res = await api2.put(`health-profiling/family/role/update/${familyId}/${residentId}/`, {
      fc_role
    })
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const updateHouseholdHealth = async (householdInfo: Record<string, any>) => {
  try {
    const res = await api2.put(`health-profiling/household/update/${householdInfo.hh_id}/`, {
      rp: householdInfo.householdHead.split(" ")[0],
      hh_nhts: householdInfo.nhts,
    })
    
    return res.data
  } catch (err) {
    throw err;
  }
}

// Environmental: update endpoints
export const updateWaterSupply = async (
  water_sup_id: string,
  payload: { water_sup_type?: string; water_conn_type?: string; water_sup_desc?: string }
) => {
  const res = await api2.put(`health-profiling/water-supply/${water_sup_id}/`, payload);
  return res.data;
};

export const updateSanitaryFacility = async (
  sf_id: string,
  payload: { sf_type?: string; sf_toilet_type?: string }
) => {
  const res = await api2.put(`health-profiling/sanitary-facility/${sf_id}/`, payload);
  return res.data;
};

export const updateSolidWaste = async (
  swm_id: string,
  payload: { swn_desposal_type?: string; swm_desc?: string }
) => {
  const res = await api2.put(`health-profiling/solid-waste/${swm_id}/`, payload);
  return res.data;
};

// ==================== UPDATE SURVEY IDENTIFICATION ==================== (Status: Completed)
export const updateSurveyIdentification = async (
  si_id: string,
  payload: { 
    si_filled_by?: string; 
    si_informant?: string; 
    si_checked_by?: string; 
    si_date?: string; 
    si_signature?: string;
    fam_id?: string;
  }
) => {
  const res = await api2.put(`health-profiling/survey-identification/${si_id}/update/`, payload);
  return res.data;
};

// ==================== UPDATE HEALTH RELATED DETAILS ====================
export const updateHealthRelatedDetails = async (
  rp_id: string,
  payload: {
    per_add_bloodType?: string;
    per_add_philhealth_id?: string;
    per_add_covid_vax_status?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/per_additional_details/${rp_id}/update/`, payload);
  return res.data;
};

// ==================== UPDATE MOTHER HEALTH INFO ====================
export const updateMotherHealthInfo = async (
  mhi_id: number,
  payload: {
    mhi_healthRisk_class?: string;
    mhi_immun_status?: string;
    mhi_famPlan_method?: string;
    mhi_famPlan_source?: string;
    mhi_lmp_date?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/mother-health-info/${mhi_id}/update/`, payload);
  return res.data;
};

// ==================== CREATE DEPENDENTS UNDER FIVE ====================
export const createDependentsUnderFive = async (
  payload: {
    duf_fic?: string;
    duf_nutritional_status?: string;
    duf_exclusive_bf?: string;
    fc: number;
    rp: number;
  }
) => {
  const res = await api2.post(`health-profiling/dependent-under-five/create/`, payload);
  return res.data;
};

// ==================== UPDATE DEPENDENTS UNDER FIVE ====================
export const updateDependentsUnderFive = async (
  duf_id: number,
  payload: {
    duf_fic?: string;
    duf_nutritional_status?: string;
    duf_exclusive_bf?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/dependent-under-five/${duf_id}/update/`, payload);
  return res.data;
};
