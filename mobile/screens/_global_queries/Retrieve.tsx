import { useQuery } from "@tanstack/react-query";
import { getSitio } from "../_global_rest_api/Get";

export const useGetSitio = () => {
  return useQuery({
    queryKey: ['sitioList'],
    queryFn: getSitio,
    staleTime: 5000
  })
}