
import { useQuery } from "@tanstack/react-query";
import {
  getFamFilteredByHouseHealth,
  getFamiliesTableHealth,
  getFamilyCompositionHealth,
  getFamilyDataHealth,
  getFamilyMembersHealth,
  getHouseholdListHealth,
  getHouseholdTableHealth,
  getPerAddressesList,
  getRequests,
  getResidentsFamSpecificListHealth,
  getResidentsListHealth,
  getResidentsTableHealth,
  getResidentsWithFamExclusionHealth,
  getSitioListHealth,
  getPersonalInfo, // Add this import
  getHouseholdDataHealth, // Add this import
} from "../restful-api/profilingGetAPI";

// ================ RESIDENTS ================ (Status: Optmizing....)

// ================ ADDRESS =================
export const usePerAddressesListHealth = () => {
  return useQuery({
    queryKey: ['perAddressesList'],
    queryFn: () => getPerAddressesList(),
    staleTime: 5000,
  })
}

export const useResidentsListHealth = () => {
  return useQuery({
    queryKey: ['residentsListHealth'],
    queryFn: getResidentsListHealth,
    staleTime: 5000,
  })
}
export const usePersonalInfo = (residentId: string | null) => {
  return useQuery({
    queryKey: ['personal-info', residentId],
    queryFn: () => getPersonalInfo(residentId!),
    enabled: !!residentId, // Only run when residentId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (changed from cacheTime to gcTime)
  });
}

export const useHouseholdData = (householdId: string | null) => {
  return useQuery({
    queryKey: ['household-data', householdId],
    queryFn: () => getHouseholdDataHealth(householdId!),
    enabled: !!householdId, // Only run when householdId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (changed from cacheTime to gcTime)
  });
};

export const useResidentsTableHealth = (page: number, pageSize: number, searchQuery?: string) => {
  return useQuery({
    queryKey: ['residentsTableHealthData', page, pageSize, searchQuery],
    queryFn: () => getResidentsTableHealth(page, pageSize, searchQuery),
    staleTime: 5000,
  })
}

export const useResidentsWithFamExclusionHealth = (familyId: string) => {
  return useQuery({
    queryKey: ['residentsWithFamExclusion', familyId],
    queryFn: () => getResidentsWithFamExclusionHealth(familyId),
    staleTime: 5000,
  })
}

export const useResidentsFamSpecificListHealth = (familyId: string) => {
  return useQuery({
    queryKey: ['residentsFamSpecificListHealth', familyId],
    queryFn: () => getResidentsFamSpecificListHealth(familyId),
    staleTime: 5000,
  })
}

export const useRequestsHealth = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: getRequests,
    staleTime: 5000,
  });
}

export const useSitioListHealth = () => {
  return useQuery({
    queryKey: ["sitioListHealth"],
    queryFn: getSitioListHealth,
    staleTime: 5000,
  });
}

// ================ FAMILIES ================ (Status: Optmizing....)

export const useFamiliesTableHealth = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["familiesTableDataHealth", page, pageSize, searchQuery],
    queryFn: () => getFamiliesTableHealth(page, pageSize, searchQuery),
    staleTime: 5000,
  });
}

export const useFamilyDataHealth = (familyId: string) => {
  return useQuery({
    queryKey: ["familyDataHealth", familyId],
    queryFn: () => getFamilyDataHealth(familyId),
    staleTime: 5000,
  })
}

export const useFamilyMembersHealth = (familyId: string) => {
  return useQuery({
    queryKey: ["familyMembersHealth", familyId],
    queryFn: () => getFamilyMembersHealth(familyId),
    staleTime: 5000,
  })
}
export const useFamFilteredByHouseHealth = (householdId: string) => {
  return useQuery({
    queryKey: ["famFilteredByHouseHealth", householdId],
    queryFn: () => getFamFilteredByHouseHealth(householdId),
    staleTime: 5000,
  })
}

export const useFamilyCompositionHealth = () => {
  return useQuery({
    queryKey: ["familyCompositionsHealth"],
    queryFn: getFamilyCompositionHealth,
    staleTime: 5000,
  })
}
// ================ HOUSEHOLDS ================ (Status: Optmizing....)

export const useHouseholdsListHealth = () => {
  return useQuery({
    queryKey: ['householdsListHealth'],
    queryFn: getHouseholdListHealth,
    staleTime: 5000,
  })
}

export const useHouseholdTableHealth = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['householdTableHealth', page, pageSize, searchQuery],
    queryFn: () => getHouseholdTableHealth(page, pageSize, searchQuery),
    staleTime: 5000,
  })
}