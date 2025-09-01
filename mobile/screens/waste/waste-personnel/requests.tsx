import { api } from "@/api/api";
import { Truck, TruckData, PersonnelItem, TruckFormValues } from "./waste-personnel-types";

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

export const getTruckById = async (truck_id: string): Promise<Truck> => {
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

// Truck API functions
export const fetchTrucks = async (): Promise<TruckData[]> => {
  const response = await api.get("/waste/waste-trucks/");
  return response.data.map((truck: any) => ({
    truck_id: truck.truck_id.toString(),
    truck_plate_num: truck.truck_plate_num,
    truck_model: truck.truck_model,
    truck_capacity: truck.truck_capacity.toString(),
    truck_status: truck.truck_status,
    truck_last_maint: truck.truck_last_maint,
    truck_is_archive: truck.truck_is_archive,
  }));
};

export const fetchPersonnel = async (): Promise<PersonnelItem[]> => {
  const response = await api.get("/waste/waste-personnel/");
  return response.data.map((person: any) => ({
    id: person.wstp_id.toString(),
    name: `${person.staff.profile.personal.fname} ${person.staff.profile.personal.lname}`,
    position: person.staff.position.title,
    contact: person.staff.profile.personal.contact,
  }));
};

export const addTruck = async (data: TruckFormValues): Promise<TruckData> => {
  const response = await api.post("/waste/waste-trucks/", data);
  return {
    truck_id: response.data.truck_id.toString(),
    truck_plate_num: response.data.truck_plate_num,
    truck_model: response.data.truck_model,
    truck_capacity: response.data.truck_capacity.toString(),
    truck_status: response.data.truck_status,
    truck_last_maint: response.data.truck_last_maint,
  };
};

export const updateTruck = async (
  id: string,
  data: TruckFormValues
): Promise<TruckData> => {
  const response = await api.put(`/waste/waste-trucks/${id}/`, data);
  return {
    truck_id: response.data.truck_id.toString(),
    truck_plate_num: response.data.truck_plate_num,
    truck_model: response.data.truck_model,
    truck_capacity: response.data.truck_capacity.toString(),
    truck_status: response.data.truck_status,
    truck_last_maint: response.data.truck_last_maint,
  };
};

export const deleteTruck = async (
  id: string,
  permanent: boolean = false
): Promise<void> => {
  await api.delete(`/waste/waste-trucks/${id}/?permanent=${permanent}`);
};

export const restoreTruck = async (id: string): Promise<void> => {
  await api.patch(`/waste/waste-trucks/${id}/restore/`);
};

function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}