import { useQuery } from "@tanstack/react-query";
import {
  getBusinesses,
  getFamFilteredByHouse,
  getFamiliesTable,
  getFamilyComposition,
  getFamilyData,
  getFamilyMembers,
  getHouseholdList,
  getHouseholdTable,
  getPerAddressesList,
  getRequests,
  getResidentsFamSpecificList,
  getResidentsList,
  getResidentsTable,
  getResidentsWithFamExclusion,
  getSitioList,
} from "../restful-api/profilingGetAPI";
import { api } from "@/api/api";

// ================ ADDRESS =================
export const usePerAddressesList = () => {
  return useQuery({
    queryKey: ["perAddressesList"],
    queryFn: () => getPerAddressesList(),
    staleTime: 5000,
  });
};

// ================ RESIDENTS ================ (Status: Optmizing....)
export const useResidentsList = (
  is_staff: boolean = false,
  exclude_independent: boolean = false,
  disable: boolean = false
) => {
  return useQuery({
    queryKey: ["residentsList", is_staff, exclude_independent, disable],
    queryFn: () => {
      if(disable) return [];
      return getResidentsList(is_staff, exclude_independent)
    },
    staleTime: 5000,
  });
};

export const useResidentsTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["residentsTableData", page, pageSize, searchQuery],
    queryFn: () => getResidentsTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useResidentsWithFamExclusion = (familyId: string) => {
  return useQuery({
    queryKey: ["residentsWithFamExclusion", familyId],
    queryFn: () => getResidentsWithFamExclusion(familyId),
    staleTime: 5000,
  });
};

export const useResidentsFamSpecificList = (familyId: string) => {
  return useQuery({
    queryKey: ["residentsFamSpecificList", familyId],
    queryFn: () => getResidentsFamSpecificList(familyId),
    staleTime: 5000,
  });
};

export const useRequests = (
  page: number,
  pageSize: number,
  searchQuery: string,
  selectedRequestType: string
) => {
  return useQuery({
    queryKey: ["requests", page, pageSize, searchQuery, selectedRequestType],
    queryFn: () =>
      getRequests(page, pageSize, searchQuery, selectedRequestType),
    staleTime: 5000,
  });
};

export const useRequestCount = () => {
  return useQuery({
    queryKey: ["requestCount"],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/request/count/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
  });
};

export const useSitioList = () => {
  return useQuery({
    queryKey: ["sitioList"],
    queryFn: getSitioList,
    staleTime: 5000,
  });
};

// ================ FAMILIES ================ (Status: Optmizing....)
export const useFamiliesTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["familiesTableData", page, pageSize, searchQuery],
    queryFn: () => getFamiliesTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useFamilyData = (familyId: string) => {
  return useQuery({
    queryKey: ["familyData", familyId],
    queryFn: () => getFamilyData(familyId),
    staleTime: 5000,
  });
};

export const useFamilyMembers = (familyId: string) => {
  // if(!familyId) return [];
  return useQuery({
    queryKey: ["familyMembers", familyId],
    queryFn: () => getFamilyMembers(familyId),
    staleTime: 5000,
  });
};

export const useFamFilteredByHouse = (householdId: string) => {
  return useQuery({
    queryKey: ["famFilteredByHouse", householdId],
    queryFn: () => getFamFilteredByHouse(householdId),
    staleTime: 5000,
  });
};

export const useFamilyComposition = () => {
  return useQuery({
    queryKey: ["familyCompositions"],
    queryFn: getFamilyComposition,
    staleTime: 5000,
  });
};

// ================ BUSINESS ================
export const useBusinesses = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["businesses", page, pageSize, searchQuery],
    queryFn: () => getBusinesses(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useBusinessInfo = (busId: number) => {
  return useQuery({
    queryKey: ["businessInfo", busId],
    queryFn: async () => {
      if (!busId) return null;
      
      try {
        const res = await api.get(`profiling/business/${busId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
}

// ================ HOUSEHOLDS ================ (Status: Optmizing....)
export const useHouseholdsList = () => {
  return useQuery({
    queryKey: ["householdsList"],
    queryFn: getHouseholdList,
    staleTime: 5000,
  });
};

export const useHouseholdTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["householdTable", page, pageSize, searchQuery],
    queryFn: () => getHouseholdTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};
