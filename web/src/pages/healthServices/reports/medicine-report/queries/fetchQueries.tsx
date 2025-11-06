import { useQuery } from "@tanstack/react-query";
import { getMedicineMonthly,getMedicineDetailedReports,getMedicineChart } from "../restful-api/getAPI";



export const useMedicineMonthly = (page: number, pageSize: number, search: string) => {
  return useQuery({
    queryKey: ["medicineRecords", page, pageSize, search],
    queryFn: () => getMedicineMonthly(page, pageSize, search),
  });
};


export const useMedicineDetailedReports = (month: string) => {
  return useQuery({
    queryKey: ["medreport", month],
 queryFn: () =>
  getMedicineDetailedReports(month),
  });   
};

export const useMedicineChart = (month: string) => {
  return useQuery({
    queryKey: ["medicineChart", month],
    queryFn: () => getMedicineChart(month),
  });
};
