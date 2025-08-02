import { useQuery } from "@tanstack/react-query";
import { getFirstAid } from "../../restful-api/firstAid/FirstAidFetchAPI";

export const useFirstAid = () => {
    return useQuery({
      queryKey: ["firstAid"],
      queryFn: getFirstAid,
      refetchOnMount: true,
      staleTime: 0,
    });
  };