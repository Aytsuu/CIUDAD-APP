// src/hooks/useChildHealthRecord.ts
import { useQuery } from "@tanstack/react-query";
import { getChildHealthRecords,getNutrionalSummary } from "../restful-api/get";

export function useChildHealthRecords() {
  return useQuery({
    queryKey: ["childHealthRecords"],
    queryFn: getChildHealthRecords,
    refetchOnMount: false, // Avoid unnecessary refetches
    staleTime: 300_000,    // 5 minutes
  });
}



export function useNutritionalSummary(chrec_id: string) {
  return useQuery({
    queryKey: ["nutritionalSummary", chrec_id],
    queryFn: () => getNutrionalSummary(chrec_id),
    enabled: !!chrec_id,               // only runs if chrec_id is truthy
    staleTime: 300_000,               // 5 minutes
    refetchOnMount: false,
  });
}