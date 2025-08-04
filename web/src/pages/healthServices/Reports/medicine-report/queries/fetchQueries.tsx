import { useQuery } from "@tanstack/react-query";
import { getMedicineRecords,getMedicineMonthCount,getMedicineReports } from "../restful-api/getAPI";


export const useMedicineRecords = (yearFilter: string) => {
  return useQuery({
    queryKey: ["medicineRecords", yearFilter],
    queryFn: () =>
      getMedicineRecords(yearFilter === "all" ? undefined : yearFilter),
  });
};

export const useMedicineReports = (month: string) => {
  return useQuery({
    queryKey: ["fareport", month],
 queryFn: () =>
  getMedicineReports(month),
  });   


};

export const MeduseMonthCount = () => {
  return useQuery({
    queryKey: ["medmonthCount"],
    queryFn: getMedicineMonthCount,
    retry: 3,
    staleTime: 60 * 1000, // 1 minute
  })
}
