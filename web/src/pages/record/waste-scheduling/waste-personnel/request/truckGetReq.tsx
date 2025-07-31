import { api } from "@/api/api";
import { Personal, Position, ResidentProfile, Staff, WastePersonnel, Truck } from "../waste-personnel-types";

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

// export const getAllTrucks = async (): Promise<Truck[]> => {
//   try {
//     const response = await api.get("waste/waste-trucks/")
//     const trucksData = response.data?.data || response.data;
//     console.log('Raw personnel response:', response); // Add this
//     console.log('Processed personnel data:', trucksData); // Add this

//     if (!Array.isArray(trucksData)) {
//       throw new Error("Expected array of trucks");
//     }

//     return trucksData
//       .filter(isTruck)
//       .map(truck => ({
//         ...truck,
//         truck_last_maint: formatDate(truck.truck_last_maint)
//       }));
//   } catch (error) {
//     throw new Error("Failed to fetch trucks");
//   }
// };

export const getAllTrucks = async (): Promise<Truck[]> => {
  try {
    const response = await api.get("waste/waste-trucks/"); // Use a custom value or remove the parameter
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
