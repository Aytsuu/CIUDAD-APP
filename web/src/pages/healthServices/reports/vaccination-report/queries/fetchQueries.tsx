import { useQuery } from "@tanstack/react-query";
import { getVaccinationChart, getVaccineRecords ,getVaccineReports} from "../restful-api/getAPI";

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


export const useVaccineChart = (month: string) => {
  return useQuery({
    queryKey: ["vaccineChart", month],
    queryFn: () => getVaccinationChart(month),
  });
}
