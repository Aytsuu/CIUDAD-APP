import { useQuery } from "@tanstack/react-query";
import { getVaccineRecords ,getVaccinationMonthCount,getVaccineReports} from "../restful-api/getAPI";

export const useVaccineRecords = (yearFilter: string) => {
  return useQuery({
    queryKey: ["vaccineRecords", yearFilter],
    queryFn: () =>
        getVaccineRecords(yearFilter === "all" ? undefined : yearFilter),
  });
};


export const useVaccineReports = (month: string) => {
  return useQuery({
    queryKey: ["vacreport", month],
 queryFn: () =>
  getVaccineReports(month),
  });   


};


export const VacuseMonthCount = () => {
  return useQuery({
    queryKey: ["vacmonthCount"],
    queryFn: getVaccinationMonthCount,
    retry: 3,
    staleTime: 60 * 1000, // 1 minute
  })
}


