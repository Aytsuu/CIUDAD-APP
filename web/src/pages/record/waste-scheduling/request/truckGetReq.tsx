import axios from 'axios';
import api from '@/api/api';
import { Truck, WastePersonnel } from "../queries/truckFetchQueries";

export interface Staff {
  staff_id: string;
  position: {
    pos_title: string; // "Collector", "Watchmen", "Driver", etc.
  };
  resident_profile: {
    personal: {
      first_name: string;
      last_name: string;
    };
  };
}

function isTruck(data: any): data is Truck {
  return data &&
    typeof data.truck_id === "number" &&
    typeof data.truck_plate_num === "string" &&
    typeof data.truck_model === "string" &&
    typeof data.truck_capacity === "number";
}

function isWastePersonnel(data: any): data is WastePersonnel {
  return data &&
    typeof data.wstp_id === "number" &&
    typeof data.name === "string";
}

function isStaff(data: any): data is Staff {
  return data && typeof data.staff_id === "string";
}


/// Get all personnel from waste_personnel table
export const getAllPersonnel = async (): Promise<WastePersonnel[]> => {
  try {
    const response = await api.get("waste/waste-personnel/?expand=staff.position,staff.resident_profile.personal");
    const personnelData = response.data?.data || response.data;
    
    if (!Array.isArray(personnelData)) {
      throw new Error("Expected array of personnel");
    }
    
    return personnelData.filter(isWastePersonnel);
  } catch (error) {
    console.error("Error fetching personnel:", error);
    throw new Error("Failed to fetch personnel");
  }
};

export const getPersonnelByPosition = async (positionTitle: string): Promise<WastePersonnel[]> => {
  try {
    const response = await api.get(
      `waste/waste-personnel/?position=${positionTitle}&expand=staff.position,staff.resident_profile.personal`
    );
    const personnelData = response.data?.data || response.data;
    
    if (!Array.isArray(personnelData)) {
      throw new Error("Expected array of personnel");
    }
    
    return personnelData.filter(isWastePersonnel);
  } catch (error) {
    console.error(`Error fetching ${positionTitle} personnel:`, error);
    throw new Error(`Failed to fetch ${positionTitle} personnel`);
  }
};

export const getPersonnelById = async (wstp_id: number): Promise<WastePersonnel> => {
  try {
    const response = await api.get(`waste/waste-personnel/${wstp_id}`);
    console.log(`Personnel ${wstp_id} API response:`, response.data);

    if (!isWastePersonnel(response.data)) {
      throw new Error("Invalid personnel data format");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API Error for personnel ${wstp_id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Failed to fetch personnel ${wstp_id}`);
    }
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred");
  }
};

// ----- Truck functions -----

export const getAllTrucks = async (): Promise<Truck[]> => {
  try {
    const response = await api.get("waste/waste-personnel/");
    console.log("Trucks API response:", response.data);

    const trucksData = Array.isArray(response.data) ? response.data : response.data?.data;

    if (!Array.isArray(trucksData)) {
      console.error("Unexpected trucks format:", trucksData);
      throw new Error("Expected array of trucks");
    }

    return trucksData.filter(isTruck);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch trucks");
    }
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred");
  }
};

export const getTruckById = async (truck_id: number): Promise<Truck> => {
  try {
    const response = await api.get(`waste/waste-personnel/${truck_id}/`);
    console.log(`Truck ${truck_id} API response:`, response.data);

    if (!isTruck(response.data)) {
      throw new Error("Invalid truck data format");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API Error for truck ${truck_id}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Failed to fetch truck ${truck_id}`);
    }
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred");
  }
};