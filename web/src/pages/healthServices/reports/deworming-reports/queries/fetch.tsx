// hooks/deworming-queries.ts
import { useQuery } from "@tanstack/react-query";
import { getDewormingYears, getDewormingRecords } from "../restful-api/fetch";

export const useDewormingYears = (
  page: number,
  pageSize: number,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["dewormingYears", page, pageSize, searchQuery],
    queryFn: () => getDewormingYears(page, pageSize, searchQuery),
  });
};

export const useDewormingRecords = (
  year: string,
  page: number,
  pageSize: number,
  round?: string,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: ["dewormingRecords", year, page, pageSize, round, searchQuery],
    queryFn: () => getDewormingRecords(year, page, pageSize, round, searchQuery),
  });
};