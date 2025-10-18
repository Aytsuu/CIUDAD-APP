import { useQuery } from "@tanstack/react-query";

import {  getVaccineRecords ,getVaccineReports} from "../restful-api/getAPI";

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


