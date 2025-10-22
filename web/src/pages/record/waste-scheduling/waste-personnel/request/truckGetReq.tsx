import { api } from "@/api/api";
import { WastePersonnel, Trucks } from "../waste-personnel-types";

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

export const getTruckById = async (truck_id: number): Promise<Trucks> => {
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