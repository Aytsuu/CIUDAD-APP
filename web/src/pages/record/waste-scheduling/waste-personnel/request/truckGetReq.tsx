import { api } from "@/api/api";
import { Personal, Position, ResidentProfile, Staff, WastePersonnel, Truck } from "../waste-personnel-types";

function isPersonal(data: any): data is Personal {
  const isValid = data && (typeof data.per_id === "number" || typeof data.per_id === "string");
  if (!isValid) {
  }
  return isValid;
}

function isPosition(data: any): data is Position {
  const isValid = data && (typeof data.pos_id === "number" || typeof data.pos_id === "string");
  if (!isValid) {
  }
  return isValid;
}

function isResidentProfile(data: any): data is ResidentProfile {
  const isValid = data && isPersonal(data.personal);
  if (!isValid) {
  }
  return isValid;
}

function isStaff(data: any): data is Staff {
  if (!data) {
    return false;
  }
  if (typeof data.staff_id !== "string") {
    return false;
  }
  if (!isResidentProfile(data.profile)) {
    return false;
  }
  if (!isPosition(data.position)) {
    return false;
  }
  return true;
}

function isWastePersonnel(data: any): data is WastePersonnel {
  if (!data) {
    return false;
  }
  if (typeof data.wstp_id !== "number") {
    return false;
  }
  if (!isStaff(data.staff)) {
    return false;
  }
  return true;
}

function isTruck(data: any): data is Truck {
  const isValid = data &&
    typeof data.truck_id === "number" &&
    typeof data.truck_plate_num === "string" &&
    typeof data.truck_model === "string" &&
    (typeof data.truck_capacity === "string" || typeof data.truck_capacity === "number") &&
    typeof data.truck_status === "string" &&
    typeof data.truck_last_maint === "string";
  return isValid;
}

export const getAllPersonnel = async (): Promise<WastePersonnel[]> => {
  try {
    const response = await api.get(
      "waste/waste-personnel/?expand=staff.profile.personal,staff.position,staff.manager.profile.personal/"
    );
    const personnelData = response.data;
    if (!Array.isArray(personnelData)) {
      throw new Error(`Expected array of personnel, got: ${JSON.stringify(personnelData)}`);
    }
    const filteredData = personnelData.filter(isWastePersonnel);
    return filteredData.map(person => ({
      ...person,
      wstp_id: person.wstp_id,
      staff: {
        ...person.staff,
        profile: {
          ...person.staff.profile,
          personal: {
            ...person.staff.profile.personal,
            dob: formatDate(person.staff.profile.personal?.dob)
          }
        }
      }
    }));
  } catch (error) {
    throw error;
  }
};

export const getPersonnelByPosition = async (positionTitle: string): Promise<WastePersonnel[]> => {
  try {
    const response = await api.get(
      `waste/waste-personnel/?position=${positionTitle}&expand=staff.profile.person,staff.position/`
    );
    const personnelData = response.data?.data || response.data;
    
    if (!Array.isArray(personnelData)) {
      throw new Error("Expected array of personnel");
    }
    
    return personnelData
      .filter(isWastePersonnel)
      .map(person => ({
         ...person,
      staff: {
        ...person.staff,
        profile: {
          ...person.staff.profile,
          personal: {
            ...person.staff.profile.personal,
            dob: formatDate(person.staff.profile.personal?.dob)
          }
        }
      }
    }));
  } catch (error) {
    throw new Error(`Failed to fetch ${positionTitle} personnel`);
  }
};

export const getPersonnelById = async (wstp_id: number): Promise<WastePersonnel> => {
  try {
    const response = await api.get(
      `waste/waste-personnel/${wstp_id}/?expand=staff.profile.person,staff.position,staff.manager.profile.person/`
    );
    
    if (!isWastePersonnel(response.data)) {
      throw new Error("Invalid personnel data format");
    }
    
    return {
      ...response.data,
      staff: {
        ...response.data.staff,
        profile: {
          ...response.data.staff.profile,
          personal: {
            ...response.data.staff.profile.personal,
            dob: formatDate(response.data.staff.profile.personal.dob)
          }
        }
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch personnel ${wstp_id}`);
  }
};

export const getAllTrucks = async (): Promise<Truck[]> => {
  try {
    const response = await api.get("waste/waste-trucks/");
    const trucksData = response.data?.data || response.data;
    if (!Array.isArray(trucksData)) {
      throw new Error("Expected array of trucks");
    }
    return trucksData
      .filter(isTruck)
      .map(truck => ({
        ...truck,
        truck_last_maint: formatDate(truck.truck_last_maint)
      }));
  } catch (error) {
    throw new Error("Failed to fetch trucks");
  }
};

export const getTruckById = async (truck_id: number): Promise<Truck> => {
  try {
    const response = await api.get(`waste/waste-trucks/${truck_id}/`);

    if (!isTruck(response.data)) {
      throw new Error("Invalid truck data format");
    }

    return {
      ...response.data,
      truck_last_maint: formatDate(response.data.truck_last_maint)
    };
  } catch (error) {
    throw new Error(`Failed to fetch truck ${truck_id}`);
  }
};

// Helper Functions
function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}