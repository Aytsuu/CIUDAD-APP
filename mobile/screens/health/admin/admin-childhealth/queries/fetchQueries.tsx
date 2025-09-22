// src/hooks/useChildHealthRecord.ts
import { useQuery } from "@tanstack/react-query";
import { getChildHealthRecords, getNutrionalSummary, getChildHealthHistory } from "../restful-api/get";

export function useChildHealthRecords() {
  return useQuery({
    queryKey: ["childHealthRecords"],
    queryFn: getChildHealthRecords,
    staleTime: 1000 * 60 * 5, 
  });
}



export function useNutritionalSummary(chrec_id: string) {
  return useQuery({
    queryKey: ["nutritionalSummary", chrec_id],
    queryFn: () => getNutrionalSummary(chrec_id),
    enabled: !!chrec_id,              
    staleTime: 1000 * 60 * 5, 
  });
}


export const useChildHealthHistory = (chrec: string | undefined) => {

  return useQuery({
    queryKey: ["childHealthHistory", chrec],
    queryFn: () => getChildHealthHistory(chrec!),
    enabled: !!chrec,
    staleTime: 1000 * 60 * 5,
  });
};