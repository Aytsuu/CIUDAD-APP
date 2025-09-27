import { useQuery } from "@tanstack/react-query";
import { getFirstAid } from "../../restful-api/firstAid/FirstAidGetAPI";

export const useFirstAid = (page: number, pageSize: number, search?: string) => {
  return useQuery({
    queryKey: ["firstAid", page, pageSize, search],
    queryFn: () => getFirstAid(page, pageSize, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};