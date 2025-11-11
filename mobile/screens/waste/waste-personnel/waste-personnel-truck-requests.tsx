import { api } from "@/api/api";
import { Trucks, TruckData, WastePersonnel, TruckFormValues } from "./waste-personnel-types";

function isTruck(data: any): data is Trucks {
  const isValid = data &&
    typeof data.truck_id === "number" &&
    typeof data.truck_plate_num === "string" &&
    typeof data.truck_model === "string" &&
    (typeof data.truck_capacity === "string" || typeof data.truck_capacity === "number") &&
    typeof data.truck_status === "string" &&
    typeof data.truck_last_maint === "string";
  return isValid;
}

export const getTruckById = async (truck_id: any): Promise<Trucks> => {
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

export const getAllTrucks = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  isArchive?: boolean
): Promise<{ results: Trucks[]; count: number }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize
    };
    
    if (searchQuery) params.search = searchQuery;
    if (isArchive !== undefined) params.is_archive = isArchive;
    
    const response = await api.get("waste/waste-trucks/", { params });
    const trucksData = response.data.results || response.data;
    
    if (!Array.isArray(trucksData)) {
      throw new Error("Expected array of trucks");
    }
    
    return {
      results: trucksData
        .filter(isTruck)
        .map(truck => ({
          ...truck,
          truck_last_maint: formatDate(truck.truck_last_maint)
        })),
      count: response.data.count || trucksData.length
    };
  } catch (error) {
    throw new Error("Failed to fetch trucks");
  }
};

export const getAllPersonnel = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  position?: string
): Promise<{ results: WastePersonnel[]; count: number }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize
    };
    
    if (searchQuery) params.search = searchQuery;
    if (position) params.position = position;
    
    const response = await api.get("waste/waste-personnel/", { params });
    
    // Handle paginated response
    if (response.data.results !== undefined) {
      const returnData = {
        results: response.data.results || [],
        count: response.data.count || 0
      };

      return returnData;
    }
    
    // Handle non-paginated response
    const fallbackData = {
      results: response.data || [],
      count: response.data?.length || 0
    };
    return fallbackData;
  } catch (error) {
    throw error;
  }
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
    staff: response.data.staff,
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