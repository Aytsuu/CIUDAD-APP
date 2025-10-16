
  // queries/fetch.ts
  import { useQuery } from "@tanstack/react-query";
  import { getMonthlyData } from "../restful-api/fetch";
 
  export const useMonthlyData = (
    page: number,
    pageSize: number,
    yearFilter: string,
    searchQuery: string = ""
  ) => {
    return useQuery({
      queryKey: ["monthlyData", page, pageSize, yearFilter, searchQuery],
      queryFn: () =>
        getMonthlyData(
          page,
          pageSize,
          yearFilter === "all" ? undefined : yearFilter,
          searchQuery
        ),
    });
  };