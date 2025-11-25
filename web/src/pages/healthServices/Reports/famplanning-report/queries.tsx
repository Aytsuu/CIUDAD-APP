import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const getFPRecords = async (year?: string): Promise<any> => {
  const url = year
    ? `/familyplanning/fp-records/monthly/?year=${year}`
    : `/familyplanning/fp-records/monthly/`;
  const { data } = await api2.get<any>(url);
  return data;
};


export const useFPRecords = (yearFilter: string) => {
  return useQuery({
    queryKey: ["fpRecords", yearFilter],
    queryFn: () => getFPRecords(yearFilter === "all" ? undefined : yearFilter),
  });
};