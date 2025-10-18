import { api2 } from "@/api/api";
// medicineApi.js
export const getMedicinesTable = async (page?: number, pageSize?: number, search?: string) => {
  try {
    const res = await api2.get("inventory/medicinetable/", {
      params: { page, page_size: pageSize, search: search?.trim() || undefined }
    });
    console.log("Medicine API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Medicine API Error:", error);
    throw error;
  }
};

export const getMedicines = async () => {
  try {
    const res = await api2.get("inventory/medicinecreateview/");
    if (res.status === 200) {
      return res.data;
    }
    console.error(res.status);
    return [];
  } catch (error) {
    console.error(error);
    throw error;
   }
};
