import { useQuery} from "@tanstack/react-query";
import { getResidentsListHealth } from "@/pages/record/health-family-profiling/family-profling/restful-api/profilingGetAPI";
import {
  getFeaturesHealth,
  getPositionsHealth,
  getStaffsHealth,
  getAllAssignedFeaturesHealth,
} from "../restful-api/administrationGetAPI";
import { api2 } from "@/api/api";

// Fetching
export const useResidentsHealth = () => {
  return useQuery({
    queryKey: ["residentsHealth"],
    queryFn: getResidentsListHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStaffsHealth = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["staffsHealth", page, pageSize, searchQuery],
    queryFn: () => getStaffsHealth(page, pageSize, searchQuery),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositionsHealth = () => {
  return useQuery({
    queryKey: ["positionsHealth"],
    queryFn: getPositionsHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeaturesHealth = () => {
  return useQuery({
    queryKey: ["featuresHealth"],
    queryFn: getFeaturesHealth, 
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllAssignedFeaturesHealth = () => {
  return useQuery({
    queryKey: ["allAssignedFeaturesHealth"],
    queryFn: getAllAssignedFeaturesHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositionGroupsHealth = () => {
  return useQuery({
    queryKey: ['positionGroupsHealth'],
    queryFn: async () => {
      try {
        const res = await api2.get('administration/position/group/list/');
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}