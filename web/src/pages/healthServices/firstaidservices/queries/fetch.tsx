import { useQuery } from "@tanstack/react-query";
import { getFirstaidRecords } from "../restful-api/getAPI";

export const useFirstaidRecords = (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
    return useQuery({
      queryKey: ["firstaidRecords", params],
      queryFn: () => getFirstaidRecords(params),
      staleTime: 1000 * 60 * 5,
      retry: 3
    });
  };