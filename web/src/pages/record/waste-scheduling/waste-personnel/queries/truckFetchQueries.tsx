import { useQuery, useQueries } from "@tanstack/react-query";
import { 
  getAllTrucks, 
  getTruckById, 
  getAllPersonnel,
  getPersonnelByPosition,
  getPersonnelById,
} from "../request/truckGetReq";
import { Truck, WastePersonnel } from "../waste-personnel-types";

// Truck Queries
export const useGetTrucks = (options = {}) => {
  return useQuery<Truck[], Error>({
    queryKey: ["trucks"],
    queryFn: getAllTrucks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  });
};

export const useGetTruckById = (truck_id: number, options = {}) => {
  return useQuery<Truck, Error>({
    queryKey: ["trucks", truck_id],
    queryFn: () => getTruckById(truck_id),
    enabled: !!truck_id,
    ...options
  });
};

// Personnel Queries
export const useGetAllPersonnel = (options = {}) => {
  return useQuery<WastePersonnel[], Error>({
    queryKey: ["wastePersonnel"],
    queryFn: getAllPersonnel,
    staleTime: 1000 * 60 * 5,
    ...options
  });
};

export const useGetPersonnelByPosition = (positionTitle: string, options = {}) => {
  return useQuery<WastePersonnel[], Error>({
    queryKey: ["wastePersonnel", positionTitle],
    queryFn: () => getPersonnelByPosition(positionTitle),
    enabled: !!positionTitle,
    staleTime: 1000 * 60 * 5,
    ...options
  });
};

export const useGetPersonnelById = (wstp_id: number, options = {}) => {
  return useQuery<WastePersonnel, Error>({
    queryKey: ["personnel", wstp_id],
    queryFn: () => getPersonnelById(wstp_id),
    enabled: !!wstp_id,
    ...options
  });
};

// Combined hook for all staff types
export const useGetAllStaff = () => {
  const positions = ["WASTE COLLECTOR", "WATCHMAN", "WASTE DRIVER"];
  
  const queries = positions.map(position => ({
    queryKey: ["staff", position],
    queryFn: () => getPersonnelByPosition(position),
    staleTime: 1000 * 60 * 5
  }));

  return useQueries({
    queries,
    combine: (results) => {
      return {
        data: positions.reduce((acc, position, index) => {
          acc[position] = results[index].data || [];
          return acc;
        }, {} as Record<string, WastePersonnel[]>),
        isLoading: results.some(result => result.isLoading),
        isError: results.some(result => result.isError),
        error: results.find(result => result.error)?.error
      };
    }
  });
};