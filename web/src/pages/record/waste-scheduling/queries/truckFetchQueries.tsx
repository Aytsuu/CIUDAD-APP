import { useQuery } from "@tanstack/react-query";
import { getAllTrucks, getTruckById, getAllPersonnel, getPersonnelById } from "../request/truckGetReq";

// Type Definitions
export type Truck = {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: number;
  truck_status: string;
  truck_last_maint: string;
  // staff_id?: number;
};

export type WastePersonnel = {
  wstp_id: number;
  name: string; // Added based on usage in waste-personnel-truck.tsx
  role: string; // Added based on usage (e.g., "Watchmen", "Truck Drivers")
  // Add other view-only fields as needed
};

// Truck Queries
export const useGetTrucks = () => {
  return useQuery<Truck[], Error>({
    queryKey: ["trucks"],
    queryFn: () => getAllTrucks().catch((error) => {
      console.error("Error fetching trucks:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetTruckById = (truck_id: number) => {
  return useQuery<Truck, Error>({
    queryKey: ["truck", truck_id],
    queryFn: () => getTruckById(truck_id).catch((error) => {
      console.error(`Error fetching truck ${truck_id}:`, error);
      throw error;
    }),
    enabled: !!truck_id,
  });
};

// Personnel Queries (View-only)
export const useGetAllPersonnel = () => {
  return useQuery<WastePersonnel[], Error>({
    queryKey: ["wastePersonnel"],
    queryFn: () => getAllPersonnel().catch((error) => {
      console.error("Error fetching personnel:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetPersonnelById = (wstp_id: number) => {
  return useQuery<WastePersonnel, Error>({
    queryKey: ["personnel", wstp_id],
    queryFn: () => getPersonnelById(wstp_id).catch((error) => {
      console.error(`Error fetching personnel ${wstp_id}:`, error);
      throw error;
    }),
    enabled: !!wstp_id,
  });
};