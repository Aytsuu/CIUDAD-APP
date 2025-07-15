// src/hooks/useChildHealthRecord.ts
import { useQuery } from "@tanstack/react-query";
import { fetchChildHealthRecord } from "../restful-api/fetch";

export const useChildHealthRecord = (chrecId?: string) => {
  return useQuery({
    queryKey: ["childHealthRecord", chrecId],
    queryFn: () => fetchChildHealthRecord(chrecId!),
    enabled: !!chrecId,              // only run if chrecId exists
    staleTime: 5 * 60 * 1000,       // cache for 5 minutes
  });
};
