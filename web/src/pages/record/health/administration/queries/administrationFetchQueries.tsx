import { useQuery} from "@tanstack/react-query";
import { getResidentsListHealth } from "@/pages/record/health-family-profiling/family-profling/restful-api/profilingGetAPI";
import {
  getFeaturesHealth,
  getPositionsHealth,
  getStaffsHealth,
  getAllAssignedFeaturesHealth,
} from "../restful-api/administrationGetAPI";

// Fetching
export const useResidentsHealth = () => {
  return useQuery({
    queryKey: ["residentsHealth"],
    queryFn: getResidentsListHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStaffsHealth = () => {
  return useQuery({
    queryKey: ["staffsHealth"],
    queryFn: getStaffsHealth,
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

export const useAllAssignedFeatures = () => {
  return useQuery({
    queryKey: ["allAssignedFeaturesHealth"],
    queryFn: getAllAssignedFeaturesHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
