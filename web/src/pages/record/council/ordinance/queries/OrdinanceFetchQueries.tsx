import { useQuery } from "@tanstack/react-query";
import { getOrdinancesPaginated } from "../restful-api/OrdinanceGetAPI";

export const useOrdinancesPaginated = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["ordinancesPaginated", page, pageSize, searchQuery],
    queryFn: () => getOrdinancesPaginated(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};
