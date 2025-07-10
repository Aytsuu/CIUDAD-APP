
import React from "react";
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
    enabled: !!familyId, // Only run when familyId exists
    staleTime: 5000,
  })
}

// Combined hook to get family members with full resident details
export const useFamilyMembersWithResidentDetails = (familyId: string) => {
  const { data: familyMembers } = useFamilyMembersHealth(familyId);
  const { data: allResidents } = useResidentsListHealth();

  return React.useMemo(() => {
    // Debug logging
    console.log('Family ID for fetch:', familyId);
    console.log('Family Members API Response:', familyMembers);
    console.log('All Residents API Response:', allResidents);

    // Return empty array if no familyId or if data is not available
    if (!familyId || !familyMembers || !allResidents) return [];

    // Ensure familyMembers is an array
    const familyMembersArray = Array.isArray(familyMembers) ? familyMembers : [];
    const allResidentsArray = Array.isArray(allResidents) ? allResidents : [];

    if (familyMembersArray.length === 0 || allResidentsArray.length === 0) return [];

    // Extract rp_ids from family members
    const memberIds = familyMembersArray.map((member: any) => {
      const rpId = member.rp?.rp_id || member.rp_id || member.id;
      return rpId;
    }).filter(Boolean); // Remove any undefined/null values
    
    console.log('Extracted Member IDs:', memberIds);
    
    // Filter residents to get only family members
    const familyMembersWithDetails = allResidentsArray.filter((resident: any) => 
      memberIds.includes(resident.rp_id)
    );
    console.log('Family Members with Details:', familyMembersWithDetails);

    return familyMembersWithDetails;
  }, [familyId, familyMembers, allResidents]);
};
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