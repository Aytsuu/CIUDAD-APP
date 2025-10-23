import { api2 } from "@/api/api";

export const getMedicinesTable = async (
  page?: number, 
  pageSize?: number, 
  search?: string,
  category?: string
) => {
  try {
    const res = await api2.get("inventory/medicine-avaiable-records/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        med_type: category !== 'All' ? category : undefined
      }
    });

    console.log("🔍 RAW API Response:", res.data);

    // Handle the nested structure
    let medicines = [];
    let count = 0;

    if (res.data && res.data.results && res.data.results.medicines) {
      medicines = res.data.results.medicines;
      count = res.data.results.total_count || res.data.count;
    } else if (res.data && Array.isArray(res.data.results)) {
      medicines = res.data.results;
      count = res.data.count;
    } else if (res.data && Array.isArray(res.data.medicines)) {
      medicines = res.data.medicines;
      count = res.data.count;
    } else if (Array.isArray(res.data)) {
      medicines = res.data;
      count = res.data.length;
    }

    console.log("🔍 Processed medicines:", medicines);
    console.log("🔍 Processed count:", count);

    return {
      medicines,
      count,
      next: res.data.next,
      previous: res.data.previous
    };

  } catch (error) {
    console.error("Medicine API Error:", error);
    return {
      medicines: [],
      count: 0,
      next: null,
      previous: null
    };
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
    return [];
  }
};