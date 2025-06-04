// import axios from 'axios';
// import api from '@/api/api';
// import { Truck, WastePersonnel } from "../queries/truckFetchQueries";

// export interface Staff {
//   staff_id: string;
//   position: {
//     pos_title: string; // "Collector", "Watchmen", "Driver", etc.
//   };
//   resident_profile: {
//     personal: {
//       first_name: string;
//       last_name: string;
//     };
//   };
// }

// function isTruck(data: any): data is Truck {
//   return data &&
//     typeof data.truck_id === "number" &&
//     typeof data.truck_plate_num === "string" &&
//     typeof data.truck_model === "string" &&
//     typeof data.truck_capacity === "number";
// }

// function isWastePersonnel(data: any): data is WastePersonnel {
//   return data &&
//     typeof data.wstp_id === "number" &&
//     typeof data.name === "string";
// }

// function isStaff(data: any): data is Staff {
//   return data && typeof data.staff_id === "string";
// }


// /// Get all personnel from waste_personnel table
// export const getAllPersonnel = async (): Promise<WastePersonnel[]> => {
//   try {
//     const response = await api.get("waste/waste-personnel/?expand=staff.position,staff.resident_profile.personal");
//     const personnelData = response.data?.data || response.data;
    
//     if (!Array.isArray(personnelData)) {
//       throw new Error("Expected array of personnel");
//     }
    
//     return personnelData.filter(isWastePersonnel);
//   } catch (error) {
//     console.error("Error fetching personnel:", error);
//     throw new Error("Failed to fetch personnel");
//   }
// };

// export const getPersonnelByPosition = async (positionTitle: string): Promise<WastePersonnel[]> => {
//   try {
//     const response = await api.get(
//       `waste/waste-personnel/?position=${positionTitle}&expand=staff.position,staff.resident_profile.personal`
//     );
//     const personnelData = response.data?.data || response.data;
    
//     if (!Array.isArray(personnelData)) {
//       throw new Error("Expected array of personnel");
//     }
    
//     return personnelData.filter(isWastePersonnel);
//   } catch (error) {
//     console.error(`Error fetching ${positionTitle} personnel:`, error);
//     throw new Error(`Failed to fetch ${positionTitle} personnel`);
//   }
// };

// export const getPersonnelById = async (wstp_id: number): Promise<WastePersonnel> => {
//   try {
//     const response = await api.get(`waste/waste-personnel/${wstp_id}`);
//     console.log(`Personnel ${wstp_id} API response:`, response.data);

//     if (!isWastePersonnel(response.data)) {
//       throw new Error("Invalid personnel data format");
//     }

//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error(`API Error for personnel ${wstp_id}:`, error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || `Failed to fetch personnel ${wstp_id}`);
//     }
//     console.error("Unexpected error:", error);
//     throw new Error("An unexpected error occurred");
//   }
// };

// // ----- Truck functions -----

// export const getAllTrucks = async (): Promise<Truck[]> => {
//   try {
//     const response = await api.get("waste/waste-personnel/");
//     console.log("Trucks API response:", response.data);

//     const trucksData = Array.isArray(response.data) ? response.data : response.data?.data;

//     if (!Array.isArray(trucksData)) {
//       console.error("Unexpected trucks format:", trucksData);
//       throw new Error("Expected array of trucks");
//     }

//     return trucksData.filter(isTruck);
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error("API Error:", error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || "Failed to fetch trucks");
//     }
//     console.error("Unexpected error:", error);
//     throw new Error("An unexpected error occurred");
//   }
// };

// export const getTruckById = async (truck_id: number): Promise<Truck> => {
//   try {
//     const response = await api.get(`waste/waste-personnel/${truck_id}/`);
//     console.log(`Truck ${truck_id} API response:`, response.data);

//     if (!isTruck(response.data)) {
//       throw new Error("Invalid truck data format");
//     }

//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error(`API Error for truck ${truck_id}:`, error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || `Failed to fetch truck ${truck_id}`);
//     }
//     console.error("Unexpected error:", error);
//     throw new Error("An unexpected error occurred");
//   }
// };

import axios from 'axios';
import { api } from "@/api/api";

export interface Personal {
  per_id: number;
  lname: string; // API returns lname, not per_lname
  fname: string;
  mname: string | null;
  suffix: string | null;
  dob: string; // API returns dob, not per_dob
  sex: string;
  status: string;
  address: string; // Added per_address
  education: string | null;
  religion: string;
  contact: string;
}

export interface Position {
  pos_id: number;
  title: string; // API returns title, not pos_title
  max: number;
}

export interface ResidentProfile {
  rp_id: string;
  rp_date_registered: string; // API returns string
  personal: Personal; // API returns personal, not per
}

export interface Staff {
  staff_id: string;
  assign_date: string; // API returns assign_date, not staff_assign_date
  profile: ResidentProfile; // API returns profile, not rp
  position: Position; // API returns position, not pos
  manager?: Staff | null;
}

export interface WastePersonnel {
  wstp_id: number;
  staff: Staff; // Expanded from staff_id foreign key
}

export interface Truck {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
}

function isPersonal(data: any): data is Personal {
  const isValid = data && (typeof data.per_id === "number" || typeof data.per_id === "string");
  if (!isValid) {
    console.log('Rejected personal: Invalid per_id', data);
  }
  return isValid;
}

function isPosition(data: any): data is Position {
  const isValid = data && (typeof data.pos_id === "number" || typeof data.pos_id === "string");
  if (!isValid) {
    console.log('Rejected position: Invalid pos_id', data);
  }
  return isValid;
}

function isResidentProfile(data: any): data is ResidentProfile {
  const isValid = data && isPersonal(data.personal);
  if (!isValid) {
    console.log('Rejected profile: Invalid personal', data);
  }
  return isValid;
}

function isStaff(data: any): data is Staff {
  if (!data) {
    console.log('Rejected staff: No data');
    return false;
  }
  if (typeof data.staff_id !== "string") {
    console.log('Rejected staff: Invalid staff_id', data.staff_id);
    return false;
  }
  if (!isResidentProfile(data.profile)) {
    console.log('Rejected staff: Invalid profile', data.profile);
    return false;
  }
  if (!isPosition(data.position)) {
    console.log('Rejected staff: Invalid position', data.position);
    return false;
  }
  return true;
}

function isWastePersonnel(data: any): data is WastePersonnel {
  if (!data) {
    console.log('Rejected: No data');
    return false;
  }
  if (typeof data.wstp_id !== "number") {
    console.log('Rejected: Invalid wstp_id', data.wstp_id);
    return false;
  }
  if (!isStaff(data.staff)) {
    console.log('Rejected: Invalid staff', data.staff);
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
  if (!isValid) {
    console.log('Rejected truck:', data);
  }
  return isValid;
}

// export const getAllPersonnel = async (): Promise<WastePersonnel[]> => {
//   try {
//     const response = await api.get("waste/waste-personnel/?expand=staff.rp.per,staff.pos,staff.manager.rp.per/");
//     console.log('Raw personnel response:', response); // Add this
//     const personnelData = response.data?.data || response.data;
//     console.log('Processed personnel data:', personnelData); // Add this
//     if (!Array.isArray(personnelData)) {
//       throw new Error("Expected array of personnel");
//     }
//     return personnelData
//       .filter(isWastePersonnel)
//       .map(person => ({
//         ...person,
//         staff: {
//           ...person.staff,
//           rp: {
//             ...person.staff.rp,
//             per: {
//               ...person.staff.rp.per,
//               per_dob: formatDate(person.staff.rp.per.per_dob)
//             }
//           }
//         }
//       }));
//   } catch (error) {
//     handleApiError(error, "Error fetching personnel");
//     throw new Error("Failed to fetch personnel");
//   }
// };

export const getAllPersonnel = async (): Promise<WastePersonnel[]> => {
  try {
    const response = await api.get(
      "waste/waste-personnel/?expand=staff.profile.personal,staff.position,staff.manager.profile.personal/"
    );
    const personnelData = response.data;
    console.log('Raw personnel data:', JSON.stringify(personnelData, null, 2));
    console.log('Raw position titles:', personnelData.map((p: WastePersonnel) => p.staff?.position?.title || 'Missing'));
    if (!Array.isArray(personnelData)) {
      throw new Error(`Expected array of personnel, got: ${JSON.stringify(personnelData)}`);
    }
    const filteredData = personnelData.filter(isWastePersonnel);
    console.log('Filtered personnel:', filteredData);
    console.log('Rejected personnel:', personnelData.filter(item => !isWastePersonnel(item)));
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
    console.error('Error fetching personnel:', error);
    handleApiError(error, "Error fetching personnel");
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
    handleApiError(error, `Error fetching ${positionTitle} personnel`);
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
    handleApiError(error, `Error fetching personnel ${wstp_id}`);
    throw new Error(`Failed to fetch personnel ${wstp_id}`);
  }
};

export const getAllTrucks = async (): Promise<Truck[]> => {
  try {
    const response = await api.get("waste/waste-trucks/");
    const trucksData = response.data?.data || response.data;
    console.log('Raw personnel response:', response); // Add this
    console.log('Processed personnel data:', trucksData); // Add this

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
    handleApiError(error, "Error fetching trucks");
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
    handleApiError(error, `Error fetching truck ${truck_id}`);
    throw new Error(`Failed to fetch truck ${truck_id}`);
  }
};

// Helper Functions
function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}

function handleApiError(error: unknown, context: string): void {
  console.error(context + ":", error);
  if (axios.isAxiosError(error)) {
    console.error("API Error Details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}