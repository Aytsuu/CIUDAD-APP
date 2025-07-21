import { useQuery} from "@tanstack/react-query";
import { getResidentsList } from "../../profiling/restful-api/profilingGetAPI";
import {
  getFeatures,
  getPositions,
  getStaffs,
  getAllAssignedFeatures,
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
    queryFn: getStaffs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllAssignedFeatures = () => {
  return useQuery({
    queryKey: ["allAssignedFeatures"],
    queryFn: getAllAssignedFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
