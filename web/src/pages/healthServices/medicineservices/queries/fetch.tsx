// // Custom hook (separate file or at the bottom)
import { useQuery } from "@tanstack/react-query";
import { getIndividualMedicineRecords,getMedicineRecords} from "../restful-api/getAPI";

export const useIndividualMedicineRecords = (pat_id: string, page: number, pageSize: number, search?: string) => {
  return useQuery({
    queryKey: ["individualMedicineRecords", pat_id, page, pageSize, search],
    queryFn: () => getIndividualMedicineRecords(pat_id, page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0
  });
};

export const useMedicineRecords = (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
  return useQuery({
    queryKey: ["medicineRecords", params],
    queryFn: () => getMedicineRecords(params),
    staleTime: 1000 * 60 * 5,
    retry: 3
  });
};
