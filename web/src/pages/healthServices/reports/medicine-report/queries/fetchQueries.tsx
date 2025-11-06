import { useQuery } from "@tanstack/react-query";
import { getMedicineMonthly,getMedicineDetailedReports,getMedicineChart } from "../restful-api/getAPI";



export const useMedicineMonthly = (page: number, pageSize: number, search: string) => {
  return useQuery({
    queryKey: ["medicineRecords", page, pageSize, search],
    queryFn: () => getMedicineMonthly(page, pageSize, search),
  });
};

export const useMedicineDetailedReports = (
  month: string, 
  page: number = 1, 
  pageSize: number = 30, 
  search: string = ""
) => {
  return useQuery({
    queryKey: ["medreport", month, page, pageSize, search],
    queryFn: () => getMedicineDetailedReports(month, page, pageSize, search),
    enabled: !!month,
  });   
};


export const useMedicineChart = (month: string) => {
  return useQuery({
    queryKey: ["medicineChart", month],
    queryFn: () => getMedicineChart(month),
  });
};
