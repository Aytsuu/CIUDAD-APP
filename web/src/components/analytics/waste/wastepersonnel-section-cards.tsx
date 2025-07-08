import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

// Helper Functions
function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}

export interface Personal {
  per_id: number;
  lname: string; 
  fname: string;
  mname: string | null;
  suffix: string | null;
  dob: string; 
  sex: string;
  status: string;
  address: string; 
  education: string | null;
  religion: string;
  contact: string;
}


export interface Position {
  pos_id: number;
  title: string;
  max: number;
}

export interface ResidentProfile {
  rp_id: string;
  rp_date_registered: string; 
  personal: Personal; 
}

export interface Staff {
  staff_id: string;
  assign_date: string; 
  profile: ResidentProfile; 
  position: Position; 
  manager?: Staff | null;
}

export interface WastePersonnel {
  wstp_id: number;
  staff: Staff; 
}

export interface Truck {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  truck_is_archive?: boolean;
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

export const useGetTrucks = (options = {}) => {
  return useQuery<Truck[], Error>({
    queryKey: ["trucks"],
    queryFn: getAllTrucks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};


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


export const useGetAllPersonnel = (options = {}) => {
  return useQuery<WastePersonnel[], Error>({
    queryKey: ["wastePersonnel"],
    queryFn: getAllPersonnel,
    staleTime: 1000 * 60 * 5,
    ...options
  });
};