import { useQuery} from "@tanstack/react-query";
import { getResidentsList } from "@/pages/record/health-family-profiling/family-profling/restful-api/profilingGetAPI";
import {
  getFeaturesHealth,
  getPositionsHealth,
  getStaffsHealth,
  getAllAssignedFeaturesHealth,
} from "../restful-api/administrationGetAPI";

// Fetching
export const useResidents = () => {
  return useQuery({
    queryKey: ["residents"],
    queryFn: getResidentsList,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStaffs = () => {
  return useQuery({
    queryKey: ["staffs"],
    queryFn: getStaffsHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositionsHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: getFeaturesHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllAssignedFeatures = () => {
  return useQuery({
    queryKey: ["allAssignedFeatures"],
    queryFn: getAllAssignedFeaturesHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
