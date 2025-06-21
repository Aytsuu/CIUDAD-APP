
import { useQuery } from "@tanstack/react-query";
import {
  getFamFilteredByHouse,
  getFamiliesTable,
  getFamilyComposition,
  getFamilyData,
  getFamilyMembers,
  getHouseholdListHealth,
  getHouseholdTable,
  getPerAddressesList,
  getRequests,
  getResidentsFamSpecificList,
  getResidentsListHealth,
  getResidentsTableHealth,
  getResidentsWithFamExclusion,
  getSitioList,
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
    queryKey: ['residentsList'],
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
    queryFn: () => getResidentsWithFamExclusion(familyId),
    staleTime: 5000,
  })
}

export const useResidentsFamSpecificListHealth = (familyId: string) => {
  return useQuery({
    queryKey: ['residentsFamSpecificList', familyId],
    queryFn: () => getResidentsFamSpecificList(familyId),
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
    queryKey: ["sitioList"],
    queryFn: getSitioList,
    staleTime: 5000,
  });
}

// ================ FAMILIES ================ (Status: Optmizing....)

export const useFamiliesTableHealth = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["familiesTableData", page, pageSize, searchQuery],
    queryFn: () => getFamiliesTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
}

export const useFamilyDataHealth = (familyId: string) => {
  return useQuery({
    queryKey: ["familyData", familyId],
    queryFn: () => getFamilyData(familyId),
    staleTime: 5000,
  })
}

export const useFamilyMembersHealth = (familyId: string) => {
  return useQuery({
    queryKey: ["familyMembers", familyId],
    queryFn: () => getFamilyMembers(familyId),
    staleTime: 5000,
  })
}
export const useFamFilteredByHouseHealth = (householdId: string) => {
  return useQuery({
    queryKey: ["famFilteredByHouse", householdId],
    queryFn: () => getFamFilteredByHouse(householdId),
    staleTime: 5000,
  })
}

export const useFamilyCompositionHealth = () => {
  return useQuery({
    queryKey: ["familyCompositions"],
    queryFn: getFamilyComposition,
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
    queryKey: ['householdTable', page, pageSize, searchQuery],
    queryFn: () => getHouseholdTable(page, pageSize, searchQuery),
    staleTime: 5000,
  })
}