import { useQuery } from "@tanstack/react-query";
import { getMedicineMonthly,getMedicineDetailedReports,getMedicineChart } from "../restful-api/getAPI";


export const useMedicineMonthly = (yearFilter: string) => {
  return useQuery({
    queryKey: ["medicineRecords", yearFilter],
    queryFn: () =>
      getMedicineMonthly(yearFilter === "all" ? undefined : yearFilter),
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
