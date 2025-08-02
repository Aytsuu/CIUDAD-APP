import { useQuery, useQueries } from "@tanstack/react-query";
import { 
  getAllTrucks, 
  getTruckById, 
  getAllPersonnel,
  getPersonnelByPosition,
  getPersonnelById,
  Truck,
  WastePersonnel
} from "../request/truckGetReq";

export type PersonnelCategory = "Watchman" | "Waste Driver" | "Waste Collector" | "Trucks";

export interface PersonnelItem {
  id: string;
  name: string;
  position: string;
  contact?: string;
}

export interface PersonnelData {
  Watchman: PersonnelItem[];
  "Waste Driver": PersonnelItem[];
  "Waste Collector": PersonnelItem[];
  Trucks: TruckData[];
}

export type TruckStatus = "Operational" | "Maintenance";

export interface TruckData {
  truck_id: string;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: TruckStatus;
  truck_last_maint: string;
  truck_is_archive?: boolean;
}

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
  const positions = ["Waste Collector", "Watchman", "Waste Driver"];
  
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