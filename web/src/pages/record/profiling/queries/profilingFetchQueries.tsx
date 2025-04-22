
import { useQuery } from "@tanstack/react-query";
import {
  getBusinesses,
  getFamilies,
  getFamilyComposition,
  getHouseholds,
  getRequests,
  getResidents,
  getResidentsTable,
  getSitio,
} from "../restful-api/profilingGetAPI";

// ================ RESIDENTS ================ (Status: Optmizing....)
export const useResidents = () => {
  return useQuery({
    queryKey: ["residents"],
    queryFn: getResidents,
  });
};


export const useResidentsTable = (page: number, pageSize: number, searchQuery?: string) => {
  return useQuery({
    queryKey: ['residentsTableData', page, pageSize, searchQuery],
    queryFn: () => getResidentsTable(page, pageSize, searchQuery),
    staleTime: 5000,
  })
}

export const useRequests = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: getRequests,
  });
};

export const useSitio = () => {
  return useQuery({
    queryKey: ["sitio"],
    queryFn: getSitio,
  });
};

export const useHouseholds = () => {
  return useQuery({
    queryKey: ["households"],
    queryFn: getHouseholds,
  });
};

export const useFamilies = () => {
  return useQuery({
    queryKey: ["families"],
    queryFn: getFamilies,
  });
};

export const useFamilyComposition = () => {
  return useQuery({
    queryKey: ["familyCompositions"],
    queryFn: getFamilyComposition,
  })
}

export const useBusinesses = () => {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: getBusinesses,
  })
}


