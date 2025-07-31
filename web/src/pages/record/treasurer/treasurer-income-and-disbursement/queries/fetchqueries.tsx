import { useQuery } from "@tanstack/react-query";
import { getIncomeImages } from "../api/getreq";
import { getDisbursementImages } from "../api/getreq";
import { api } from "@/api/api";
import { IncomeImage, DisbursementImage, IncomeFolder, DisbursementFolder } from "../inc-disb-types";

export const useGetIncomeImages = (archive: boolean = false, folderId?: number) => {
  return useQuery<IncomeImage[], Error>({
    queryKey: ["incomeImages", archive, folderId],
    queryFn: () => getIncomeImages(archive, folderId).catch((error) => {
      console.error("Error fetching income images:", error);
      throw error;
    }),
    enabled: folderId === undefined || folderId !== null, // Changed this line
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetDisbursementImages = (archive: boolean = false, folderId?: number) => {
  return useQuery<DisbursementImage[], Error>({
    queryKey: ["disbursementImages", archive, folderId],
    queryFn: () => getDisbursementImages(archive, folderId).catch((error) => {
      console.error("Error fetching disbursement images:", error);
      throw error;
    }),
    enabled: folderId === undefined || folderId !== null, // Changed this line
    staleTime: 1000 * 60 * 5,
  });
};


export const useGetIncomeFolder = (inf_num: number | null) => {
  return useQuery<IncomeFolder, Error>({
    queryKey: ["incomeFolder", inf_num],
    queryFn: () => api.get(`treasurer/income-tab/folders/${inf_num}/`).then(res => res.data),
    enabled: !!inf_num,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetDisbursementFolder = (dis_num: number | null) => {
  return useQuery<DisbursementFolder, Error>({
    queryKey: ["disbursementFolder", dis_num],
    queryFn: () => api.get(`treasurer/disbursement-tab/folders/${dis_num}/`).then(res => res.data),
    enabled: !!dis_num,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};