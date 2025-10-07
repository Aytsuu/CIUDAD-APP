import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getFamilyHealthProfilingData,
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
  getWaterSupplyOptions,
  getWaterSupplyTypes,
  getWaterSupplyList,
  getWaterSupplyByHousehold,
  getEnvironmentalData,
  getSanitaryFacilityList,
  getSanitaryFacilityByHousehold,
  getSolidWasteList,
  getSolidWasteByHousehold,
  getSurveyIdentificationList,
  getSurveyIdentificationDetail,
  getSurveyIdentificationByFamily,
  getSurveyIdentificationFormData,
  getSurveyIdentificationDataByHousehold,
} from "../restful-api/profilingGetAPI";

// ================ FAMILY HEALTH PROFILING ================ (Status: New)
export const useFamilyHealthProfilingData = (famId: string | null) => {
  return useQuery({
    queryKey: ['familyHealthProfilingData', famId],
    queryFn: () => getFamilyHealthProfilingData(famId!),
    enabled: !!famId, // Only run query when famId exists
    staleTime: 5000,
  })
}

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
    staleTime: 30000, // Increase to 30 seconds for better performance
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

export const useFamilyDataHealth = (familyId: string | null) => {
  return useQuery({
    queryKey: ["familyDataHealth", familyId],
    queryFn: () => getFamilyDataHealth(familyId!),
    enabled: !!familyId, // Only run when familyId exists
    staleTime: 30000, // Increase stale time to 30 seconds for better performance
  })
}

export const useFamilyMembersHealth = (familyId: string | null) => {
  return useQuery({
    queryKey: ["familyMembersHealth", familyId],
    queryFn: () => getFamilyMembersHealth(familyId!),
    enabled: !!familyId, // Only run when familyId exists
    staleTime: 30000, // Increase stale time to 30 seconds
  })
}

// Combined hook to get family members with full resident details
export const useFamilyMembersWithResidentDetails = (familyId: string | null) => {
  const { data: familyMembers } = useFamilyMembersHealth(familyId);

  return React.useMemo(() => {
    // Return empty array if no familyId or if data is not available
    if (!familyId || !familyMembers) {
      return [];
    }

    // Handle paginated response structure - extract results array
    const familyMembersArray = familyMembers?.results || familyMembers;

    // Ensure familyMembersArray is an array
    const safeFamilyMembers = Array.isArray(familyMembersArray) ? familyMembersArray : [];

    if (safeFamilyMembers.length === 0) {
      return [];
    }

    // Transform family members to match expected structure (optimized)
    const transformedMembers = safeFamilyMembers.map((member: any) => {
      // Parse the name field more efficiently
      let firstName = '';
      let lastName = '';
      let middleName = '';
      
      if (member.name) {
        const [lastNamePart, ...restParts] = member.name.split(', ');
        lastName = lastNamePart?.trim() || '';
        
        if (restParts.length > 0) {
          const nameParts = restParts.join(', ').trim().split(' ');
          firstName = nameParts[0] || '';
          middleName = nameParts.slice(1).join(' ') || '';
        }
      }

      return {
        rp_id: member.rp_id,
        per: {
          per_fname: firstName,
          per_lname: lastName,
          per_mname: middleName,
          per_sex: member.sex,
          per_dob: member.dob,
          per_contact: member.contact || ''
        },
        // Also include flat structure for compatibility
        firstName,
        lastName,
        middleName,
        sex: member.sex,
        dateOfBirth: member.dob,
        contact: member.contact || '',
        fc_role: member.fc_role
      };
    });
    
    return transformedMembers;
  }, [familyId, familyMembers]);
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
    staleTime: 30000, // Increase to 30 seconds for better performance
  })
}

export const useHouseholdTableHealth = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['householdTableHealth', page, pageSize, searchQuery],
    queryFn: () => getHouseholdTableHealth(page, pageSize, searchQuery),
    staleTime: 5000,
  })
}

// ================ WATER SUPPLY / ENVIRONMENTAL ================ 

export const useWaterSupplyOptions = () => {
  return useQuery({
    queryKey: ['waterSupplyOptions'],
    queryFn: getWaterSupplyOptions,
    staleTime: 5 * 60 * 1000, // 5 minutes since this data is relatively static
  })
}

export const useWaterSupplyTypes = () => {
  return useQuery({
    queryKey: ['waterSupplyTypes'],
    queryFn: getWaterSupplyTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes since this data is relatively static
  })
}

export const useWaterSupplyList = () => {
  return useQuery({
    queryKey: ['waterSupplyList'],
    queryFn: getWaterSupplyList,
    staleTime: 5000,
  })
}

export const useWaterSupplyByHousehold = (householdId: string | null) => {
  return useQuery({
    queryKey: ['waterSupplyByHousehold', householdId],
    queryFn: () => getWaterSupplyByHousehold(householdId!),
    enabled: !!householdId,
    staleTime: 5000,
  })
}

export const useEnvironmentalData = (householdId: string | null) => {
  return useQuery({
    queryKey: ['environmentalData', householdId],
    queryFn: () => getEnvironmentalData(householdId!),
    enabled: !!householdId,
    staleTime: 5000,
  })
}

export const useSanitaryFacilityList = () => {
  return useQuery({
    queryKey: ['sanitaryFacilityList'],
    queryFn: getSanitaryFacilityList,
    staleTime: 5000,
  })
}

export const useSanitaryFacilityByHousehold = (householdId: string | null) => {
  return useQuery({
    queryKey: ['sanitaryFacilityByHousehold', householdId],
    queryFn: () => getSanitaryFacilityByHousehold(householdId!),
    enabled: !!householdId,
    staleTime: 5000,
  })
}

export const useSolidWasteList = () => {
  return useQuery({
    queryKey: ['solidWasteList'],
    queryFn: getSolidWasteList,
    staleTime: 5000,
  })
}

export const useSolidWasteByHousehold = (householdId: string | null) => {
  return useQuery({
    queryKey: ['solidWasteByHousehold', householdId],
    queryFn: () => getSolidWasteByHousehold(householdId!),
    enabled: !!householdId,
    staleTime: 5000,
  })
}

// ================ SURVEY IDENTIFICATION ================ (Status: Completed)
export const useSurveyIdentificationList = () => {
  return useQuery({
    queryKey: ['surveyIdentificationList'],
    queryFn: getSurveyIdentificationList,
    staleTime: 5000,
  })
}

export const useSurveyIdentificationDetail = (siId: string | null) => {
  return useQuery({
    queryKey: ['surveyIdentificationDetail', siId],
    queryFn: () => getSurveyIdentificationDetail(siId!),
    enabled: !!siId,
    staleTime: 5000,
  })
}

export const useSurveyIdentificationByFamily = (famId: string | null) => {
  return useQuery({
    queryKey: ['surveyIdentificationByFamily', famId],
    queryFn: () => getSurveyIdentificationByFamily(famId!),
    enabled: !!famId,
    staleTime: 5000,
  })
}

export const useSurveyIdentificationFormData = (famId: string | null) => {
  return useQuery({
    queryKey: ['surveyIdentificationFormData', famId],
    queryFn: () => getSurveyIdentificationFormData(famId!),
    enabled: !!famId,
    staleTime: 5000,
  })
}

export const useSurveyIdentificationDataByHousehold = (hhId: string | null) => {
  return useQuery({
    queryKey: ['surveyIdentificationDataByHousehold', hhId],
    queryFn: () => getSurveyIdentificationDataByHousehold(hhId!),
    enabled: !!hhId,
    staleTime: 5000,
  })
}