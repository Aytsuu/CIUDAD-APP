import { api2 } from "@/api/api";

// Fetch residents
export const getResidents = async () => {
  try {
    const res = await api2.get("health-profiling/resident/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch families
export const getFamilies = async () => {
  try {
    const res = await api2.get("health-profiling/family/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch family composition
export const getFamilyComposition = async () => {
  try {
    const res = await api2.get("health-profiling/family-composition/");
    return res.data;
  } catch (err) {
    console.error(err)
  }
}

// Fetch households
export const getHouseholds= async () => {
  try {
    const res = await api2.get("health-profiling/household/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch sitio
export const getSitio = async () => {
  try {
    const res = await api2.get("health-profiling/sitio/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

// Fetch registration requests
export const getRequests = async () => {
  try {
    const res = await api2.get("health-profiling/request/");
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

