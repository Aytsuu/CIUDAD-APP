import { api2 } from "@/api/api";

// Fetch residents
export const getResidentsHealth = async () => {
  try {
    const res = await api2.get("health-profiling/resident/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch families
export const getFamiliesHealth = async () => {
  try {
    const res = await api2.get("health-profiling/family/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch family composition
export const getFamilyCompositionHealth = async () => {
  try {
    const res = await api2.get("health-profiling/family-composition/");
    return res.data;
  } catch (err) {
    console.error(err)
  }
}

// Fetch households
export const getHouseholdsHealth = async () => {
  try {
    const res = await api2.get("health-profiling/household/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch sitio
export const getSitioHealth = async () => {
  try {
    const res = await api2.get("health-profiling/sitio/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch registration requests
export const getRequestsHealth = async () => {
  try {
    const res = await api2.get("health-profiling/request/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

