
import { useQuery } from "@tanstack/react-query";
import { getFirstAidInventoryList } from "../restful-api/FirstAidGetAPI";

  export const useFirstAidList = () => {
    return useQuery({
      queryKey: ["firstaidinventorylist"],
      queryFn: getFirstAidInventoryList,
      staleTime: 1000 * 60 * 30,
    });
  };