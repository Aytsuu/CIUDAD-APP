import { useQuery } from "@tanstack/react-query";
import {
  getBusinesses,
  getFamilies,
  getHouseholds,
  getRequests,
  getResidents,
  getSitio,
} from "../restful-api/profilingGetAPI";

// Retrieving
export const useResidents = () => {
  return useQuery({
    queryKey: ["residents"],
    queryFn: getResidents,
    staleTime: 1000 * 60 * 30,
  });
};

export const useRequests = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: getRequests,
    staleTime: 60 * 30,
  });
};

export const useSitio = () => {
  return useQuery({
    queryKey: ["sitio"],
    queryFn: getSitio,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHouseholds = () => {
  return useQuery({
    queryKey: ["households"],
    queryFn: getHouseholds,
    staleTime: 1000 * 60 * 30,
  });
};

export const useFamilies = () => {
  return useQuery({
    queryKey: ["families"],
    queryFn: getFamilies,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBusinesses = () => {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: getBusinesses,
    staleTime: 1000 * 60 * 5,
  })
}


