import { api2 } from "@/api/api";

// ==================== NCD UPDATE ==================== 
export const updateNCD = async (
  ncd_id: string,
  payload: {
    ncd_riskclass_age?: string;
    ncd_comorbidities?: string;
    ncd_lifestyle_risk?: string;
    ncd_maintenance_status?: string;
    staff_id?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/ncd/${ncd_id}/`, payload);
  return res.data;
};

// ==================== TB SURVEILLANCE UPDATE ====================
export const updateTBSurveillance = async (
  tb_id: string,
  payload: {
    tb_meds_source?: string;
    tb_days_taking_meds?: number;
    tb_status?: string;
    staff_id?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/tb-surveillance/${tb_id}/`, payload);
  return res.data;
};

// ==================== SURVEY IDENTIFICATION UPDATE (with history) ====================
export const updateSurveyIdentificationWithHistory = async (
  si_id: string,
  payload: {
    si_filled_by?: string;
    si_informant?: string;
    si_checked_by?: string;
    si_date?: string;
    si_signature?: string;
    staff_id?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/survey-identification/${si_id}/update/`, payload);
  return res.data;
};

// ==================== WATER SUPPLY UPDATE (with history) ====================
export const updateWaterSupplyWithHistory = async (
  water_sup_id: string,
  payload: {
    water_sup_type?: string;
    water_conn_type?: string;
    water_sup_desc?: string;
    staff_id?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/water-supply/${water_sup_id}/`, payload);
  return res.data;
};

// ==================== SANITARY FACILITY UPDATE (with history) ====================
export const updateSanitaryFacilityWithHistory = async (
  sf_id: string,
  payload: {
    sf_type?: string;
    sf_desc?: string;
    sf_toilet_type?: string;
    staff_id?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/sanitary-facility/${sf_id}/`, payload);
  return res.data;
};

// ==================== SOLID WASTE MANAGEMENT UPDATE (with history) ====================
export const updateSolidWasteWithHistory = async (
  swm_id: string,
  payload: {
    swn_desposal_type?: string;
    swm_desc?: string;
    staff_id?: string;
  }
) => {
  const res = await api2.patch(`health-profiling/solid-waste/${swm_id}/`, payload);
  return res.data;
};

// ==================== GET HISTORY ENDPOINTS ====================

export const getNCDHistory = async (ncd_id: string) => {
  const res = await api2.get(`health-profiling/history/ncd/`, {
    params: { ncd_id }
  });
  return res.data;
};

export const getTBHistory = async (tb_id: string) => {
  const res = await api2.get(`health-profiling/history/tb/`, {
    params: { tb_id }
  });
  return res.data;
};

export const getSurveyHistory = async (si_id: string) => {
  const res = await api2.get(`health-profiling/history/survey/`, {
    params: { si_id }
  });
  return res.data;
};

export const getWaterSupplyHistory = async (water_sup_id: string) => {
  const res = await api2.get(`health-profiling/history/water-supply/`, {
    params: { water_sup_id }
  });
  return res.data;
};

export const getSanitaryFacilityHistory = async (sf_id: string) => {
  const res = await api2.get(`health-profiling/history/sanitary-facility/`, {
    params: { sf_id }
  });
  return res.data;
};

export const getSolidWasteHistory = async (swm_id: string) => {
  const res = await api2.get(`health-profiling/history/solid-waste/`, {
    params: { swm_id }
  });
  return res.data;
};

export const getEnvironmentalHealthHistory = async (hh_id: string) => {
  const res = await api2.get(`health-profiling/history/environmental/`, {
    params: { hh_id }
  });
  return res.data;
};
