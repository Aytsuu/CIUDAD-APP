// // Custom hook (separate file or at the bottom)
import { useQuery } from "@tanstack/react-query";
import { getIndividualMedicineRecords } from "../restful-api/getAPI";

export const useIndividualMedicineRecords = (pat_id: string, page: number, pageSize: number, search?: string) => {
  return useQuery({
    queryKey: ["individualMedicineRecords", pat_id, page, pageSize, search],
    queryFn: () => getIndividualMedicineRecords(pat_id, page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0
  });
};

// export const useMedicineRecords = (
//   search?: string,
//   page?: number,
//   pageSize?: number
// ) => {
//   return useQuery({
//     queryKey: ["medicineRecords", search, page, pageSize],
//     queryFn: () => getMedicineRecords(search, page, pageSize),
//     select: (data): any => {
//       // Ensure we always return the paginated format for the main view
//       if ('results' in data && 'count' in data && !('export' in data)) {
//         return data as any;
//       }
//       // Handle export format
//       if ('export' in data) {
//         return {
//           count: data.count,
//           next: null,
//           previous: null,
//           results: data.results
//         };
//       }
//       // Fallback
//       return data as any;
//     }
//   });
// };
