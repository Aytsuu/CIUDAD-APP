import { useQuery } from "@tanstack/react-query";
import { getVaccineRecords } from "../restful-api/getAPI";

export const useVaccineRecords = (yearFilter: string) => {
  return useQuery({
    queryKey: ["vaccineRecords", yearFilter],
    queryFn: () =>
        getVaccineRecords(yearFilter === "all" ? undefined : yearFilter),
  });
};


