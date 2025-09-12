import { useQuery } from "@tanstack/react-query";
import { getIncomeImages } from "../api/incDisb-getreq";
import { getDisbursementImages } from "../api/incDisb-getreq";
import { IncomeImage, DisbursementImage} from "../incDisb-types";

export const useGetIncomeImages = (archive: boolean = false, folderId?: number) => {
  return useQuery<IncomeImage[], Error>({
    queryKey: ["incomeImages", archive, folderId],
    queryFn: () => getIncomeImages(archive, folderId).catch((error) => {
      throw error;
    }),
    enabled: folderId === undefined || folderId !== null,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetDisbursementImages = (archive: boolean = false, folderId?: number) => {
  return useQuery<DisbursementImage[], Error>({
    queryKey: ["disbursementImages", archive, folderId],
    queryFn: () => getDisbursementImages(archive, folderId).catch((error) => {
      throw error;
    }),
    enabled: folderId === undefined || folderId !== null,
    staleTime: 1000 * 60 * 5,
  });
};