import api from "./api";

const HEALTH_SERVER_BASE = "http://10.0.2.2:8001"; // server-2 for health profiling

// Household APIs
export const fetchHouseholds = async () => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/household/list/`);
  return response.data;
};

export const fetchHouseholdData = async (householdId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/household/${householdId}/data/`);
  return response.data;
};

// Resident APIs
export const fetchResidents = async (params?: any) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/resident/`, { params });
  return response.data;
};

export const fetchResidentPersonalInfo = async (rpId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/resident/personal/${rpId}/`);
  return response.data;
};

export const fetchResidentsExcludingFamily = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/resident/exclude/fam/${famId}/`);
  return response.data;
};

// Family APIs
export const createFamily = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/family/create/`, data);
  return response.data;
};

export const fetchFamilyMembers = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/family/${famId}/members/`);
  return response.data;
};

export const fetchFamilyData = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/family/${famId}/data/`);
  return response.data;
};

export const fetchFamilyList = async () => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/family/list/table/`);
  return response.data;
};

// Family Composition APIs
export const createFamilyCompositionBulk = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/family/composition/bulk/create/`, data);
  return response.data;
};

// Respondent APIs
export const createRespondent = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/respondents/create/`, data);
  return response.data;
};

// Health Details APIs
export const createHealthRelatedDetails = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/per_additional_details/create/`, data);
  return response.data;
};

// Mother Health Info APIs
export const createMotherHealthInfo = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/mother-health-info/`, data);
  return response.data;
};

// Dependent Under Five APIs
export const createDependentUnderFive = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/dependent-under-five/create/`, data);
  return response.data;
};

// Environmental APIs
export const fetchWaterSupplyOptions = async () => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/water-supply/options/`);
  return response.data;
};

export const submitEnvironmentalForm = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/environmental-form/submit/`, data);
  return response.data;
};

export const fetchEnvironmentalData = async (hhId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/environmental-data/${hhId}/`);
  return response.data;
};

// NCD APIs
export const createNCD = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/ncd/create/`, data);
  return response.data;
};

export const fetchNCDByFamily = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/ncd/family/${famId}/`);
  return response.data;
};

// TB Surveillance APIs
export const createTBSurveilance = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/tb-surveillance/create/`, data);
  return response.data;
};

export const fetchTBByFamily = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/tb-surveillance/family/${famId}/`);
  return response.data;
};

// Survey Identification APIs
export const submitSurveyIdentification = async (data: any) => {
  const response = await api.post(`${HEALTH_SERVER_BASE}/health/survey-identification/form/submit/`, data);
  return response.data;
};

export const fetchSurveyByFamily = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/survey-identification/family/${famId}/`);
  return response.data;
};

// Comprehensive Family Health Profiling APIs
export const fetchFamilyHealthProfiling = async (famId: string) => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/family-health-profiling/${famId}/`);
  return response.data;
};

export const fetchFamilyHealthProfilingSummary = async () => {
  const response = await api.get(`${HEALTH_SERVER_BASE}/health/family-health-profiling/summary/all/`);
  return response.data;
};
