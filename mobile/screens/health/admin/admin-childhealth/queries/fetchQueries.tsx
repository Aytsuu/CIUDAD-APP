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
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background every 30 seconds
    retry: 3
  });
};

export function useNutritionalSummary(id: string) {
  return useQuery({
    queryKey: ["nutritionalSummary", id],
    queryFn: () => getNutrionalSummary(id),
    enabled: !!id,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, 
  });
}

export const useChildHealthHistory = (id: string | undefined) => {
  return useQuery({
    queryKey: ["childHealthHistory", id],
    queryFn: () => getChildHealthHistory(id!),
    enabled: !!id,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
};

export const useNutriotionalStatus = (id: string | undefined) => {
  return useQuery({
    queryKey: ["NutritionalStatus", id],
    queryFn: () => getNutritionalStatus(id!),
    enabled: !!id,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
};

export const useNextufcno = () => {
  return useQuery({
    queryKey: ["nextufc"],
    queryFn: getNextufc,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
};

export const useChildLatestVitals = (id: string | undefined) => {
  return useQuery({
    queryKey: ["latestVitals", id],
    queryFn: () => getLatestVitals(id!),
    enabled: !!id,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
};

export const useChildNotesFollowup = (id: string | undefined) => {  
  return useQuery({
    queryKey: ["childnotesfollowup", id],
    queryFn: () => getChildnotesfollowup(id!),
    enabled: !!id,
     staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
  });
};


export const useChildData = (id: string, page?: number, pageSize?: number ) => {
	return useQuery({
		queryKey: ['childData', id, page, pageSize],
		queryFn: () => getChildData(id, page, pageSize),
		 staleTime: 5000,
    refetchInterval: 5000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true, // Refresh even when app is in background
		enabled: !!id
	})
}
