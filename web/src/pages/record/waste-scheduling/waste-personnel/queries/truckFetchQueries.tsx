import { useQuery} from "@tanstack/react-query";
import { 
  getAllTrucks, 
  getTruckById, 
  getAllPersonnel,
} from "../request/truckGetReq";
import { Trucks, WastePersonnel } from "../waste-personnel-types";

export const useGetTrucks = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  isArchive?: boolean,
  options = {}
) => {
  return useQuery<{ results: Trucks[]; count: number }, Error>({
    queryKey: ["trucks", page, pageSize, searchQuery, isArchive],
    queryFn: () => getAllTrucks(page, pageSize, searchQuery, isArchive),
    staleTime: 1000 * 60 * 5,
    ...options
  });
};

export const useGetTruckById = (truck_id: number, options = {}) => {
  return useQuery<Trucks, Error>({
    queryKey: ["trucks", truck_id],
    queryFn: () => getTruckById(truck_id),
    enabled: !!truck_id,
    ...options
  });
};

export const useGetAllPersonnel = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  position?: string,
  options = {}
) => {
  return useQuery<{ results: WastePersonnel[]; count: number }, Error>({
    queryKey: ["wastePersonnel", page, pageSize, searchQuery, position],
    queryFn: () => getAllPersonnel(page, pageSize, searchQuery, position),
    staleTime: 1000 * 60 * 5,
    ...options
  });
};
