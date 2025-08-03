import { useQuery } from "@tanstack/react-query";
import { getMedicineRecords } from "../restful-api/getAPI";


export const useMedicineRecords = (yearFilter: string) => {
  return useQuery({
    queryKey: ["medicineRecords", yearFilter],
    queryFn: () =>
      getMedicineRecords(yearFilter === "all" ? undefined : yearFilter),
  });
};


