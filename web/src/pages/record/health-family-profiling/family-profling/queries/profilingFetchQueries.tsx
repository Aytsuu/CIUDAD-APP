import { useQuery } from "@tanstack/react-query";
import {
  getFamiliesHealth,
  getFamilyCompositionHealth,
  getHouseholdsHealth,
  getRequestsHealth,
  getResidentsHealth,
  getSitioHealth,
} from "../restful-api/profilingGetAPI";

// Retrieving
export const useResidentsHealth = () => {
  return useQuery({
    queryKey: ["residents"],
    queryFn: getResidentsHealth,
    staleTime: 1000 * 60 * 30,
  });
};

export const useRequestsHealth = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: getRequestsHealth,
    staleTime: 60 * 30,
  });
};

export const useSitioHealth = () => {
  return useQuery({
    queryKey: ["sitio"],
    queryFn: getSitioHealth,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHouseholdsHealth = () => {
  return useQuery({
    queryKey: ["households"],
    queryFn: getHouseholdsHealth,
    staleTime: 1000 * 60 * 30,
  });
};

export const useFamiliesHealth = () => {
  return useQuery({
    queryKey: ["families"],
    queryFn: getFamiliesHealth,
    staleTime: 1000 * 60 * 5,
  });
};

export const useFamilyCompositionHealth = () => {
  return useQuery({
    queryKey: ["familyCompositions"],
    queryFn: getFamilyCompositionHealth,
    staleTime: 1000 * 60 * 5
  })
}


