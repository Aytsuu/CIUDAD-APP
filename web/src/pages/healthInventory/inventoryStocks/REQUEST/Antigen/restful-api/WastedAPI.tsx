// WastedAPI.ts (update these functions)
import { api2 } from "@/api/api"; // Your axios instance

// API functions
export const handleVaccineWasteAPI = async (id: number, data: { wastedAmount: number; staff_id?: string; action_type: string }) => {
  try {
    const response = await api2.post(`/inventory/waste/vaccine/${id}/`, data);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in handleVaccineWasteAPI:", error);
    }
    throw error;
  }
};

export const handleSupplyWasteAPI = async (id: number, data: { wastedAmount: number; staff_id?: string; action_type: string }) => {
  try {
    const response = await api2.post(`/inventory/waste/supply/${id}/`, data);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in handleSupplyWasteAPI:", error);
    }
    throw error;
  }
};

// You can keep these for other purposes if needed, but they won't be used for waste handling
export const fetchVaccineStockById = async (id: number) => {
  try {
    const response = await api2.get(`/inventory/vaccine-stocks/${id}/`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in fetchVaccineStockById:", error);
    }
    throw error;
  }
};

export const fetchImzSupplyStockById = async (id: number) => {
  try {
    const response = await api2.get(`/inventory/immunization-stocks/${id}/`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in fetchImzSupplyStockById:", error);
    }
    throw error;
  }
};
