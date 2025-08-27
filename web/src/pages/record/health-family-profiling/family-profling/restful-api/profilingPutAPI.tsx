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