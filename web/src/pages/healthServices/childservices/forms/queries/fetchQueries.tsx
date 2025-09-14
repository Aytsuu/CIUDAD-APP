// src/hooks/useChildHealthRecord.ts
import { useQuery } from "@tanstack/react-query";
import { getNextufc, getChildHealthRecords, getNutrionalSummary, getNutritionalStatus, getChildHealthHistory } from "../restful-api/get";

export function useChildHealthRecords() {
  return useQuery({
    queryKey: ["childHealthRecords"],
    queryFn: getChildHealthRecords,
    staleTime: 1000 * 60 * 5
  });
}

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
    queryFn:getNextufc,
    staleTime: 1000 * 60 * 5
  });
};
