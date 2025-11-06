import { useQuery } from "@tanstack/react-query";

import {  getVaccineRecords ,getVaccineReports} from "../restful-api/getAPI";

export const useVaccineRecords = (page: number, pageSize: number, search: string) => {
  return useQuery({
    queryKey: ["vaccineRecords", page, pageSize, search],
    queryFn: () => getVaccineRecords(page, pageSize, search),
  });
};



export const useVaccineReports = (
  month: string, 
  page: number = 1, 
  pageSize: number = 18, 
  search: string = ""
) => {
  return useQuery({
    queryKey: ["vacreport", month, page, pageSize, search],
    queryFn: () => getVaccineReports(month, page, pageSize, search),
    enabled: !!month,
  });   
};