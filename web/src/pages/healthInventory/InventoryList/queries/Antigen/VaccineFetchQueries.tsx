

import { useQuery } from "@tanstack/react-query";
import { getAntigen } from "../../restful-api/Antigen/fetchAPI";

export const useAntigen = () => {
    return useQuery({
      queryKey: ["antigen"],
      queryFn: getAntigen,
      refetchOnMount: true,
      staleTime: 0,
    });
  };