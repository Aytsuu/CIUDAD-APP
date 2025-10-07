// src/hooks/useChildHealthRecord.ts
import { useQuery } from "@tanstack/react-query";
import { 
  getLatestVitals, 
  getNextufc, 
  getChildHealthRecords, 
  getNutrionalSummary, 
  getNutritionalStatus, 
  getChildHealthHistory, 
  getChildnotesfollowup ,
  getChildData
} from "../restful-api/get";

export const useChildHealthRecords = (params?: { page?: number; page_size?: number; search?: string; patient_type?: string; status?: string }) => {
  return useQuery({
    queryKey: ["ChildHealthRecords", params],
    queryFn: () => getChildHealthRecords(params),
    staleTime: 1000 * 60 * 5,
    retry: 3
  });
};

export function useNutritionalSummary(id: string) {
  return useQuery({
    queryKey: ["nutritionalSummary", id],
    queryFn: () => getNutrionalSummary(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
}

export const useChildHealthHistory = (id: string | undefined) => {
  return useQuery({
    queryKey: ["childHealthHistory", id],
    queryFn: () => getChildHealthHistory(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
};

export const useNutriotionalStatus = (id: string | undefined) => {
  return useQuery({
    queryKey: ["NutritionalStatus", id],
    queryFn: () => getNutritionalStatus(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
};

export const useNextufcno = () => {
  return useQuery({
    queryKey: ["nextufc"],
    queryFn: getNextufc,
    staleTime: 1000 * 60 * 5
  });
};

export const useChildLatestVitals = (id: string | undefined) => {
  return useQuery({
    queryKey: ["latestVitals", id],
    queryFn: () => getLatestVitals(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
};

export const useChildNotesFollowup = (id: string | undefined) => {  
  return useQuery({
    queryKey: ["childnotesfollowup", id],
    queryFn: () => getChildnotesfollowup(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5
  });
};


export const useChildData = (id: string, page?: number, pageSize?: number ) => {
	return useQuery({
		queryKey: ['childData', id, page, pageSize],
		queryFn: () => getChildData(id, page, pageSize),
		staleTime: 300000, // 5 minutes
		enabled: !!id
	})
}
