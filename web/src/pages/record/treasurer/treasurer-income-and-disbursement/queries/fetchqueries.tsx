import { useQuery } from "@tanstack/react-query";
import { getIncomeImages } from "../api/getreq";
import { getDisbursementImages } from "../api/getreq";
import { api } from "@/api/api";

export type Album = {
  id: number;
  type: "income" | "disbursement";
  year: string;
  images: ImageItem[];
  staff_names: string[];
  is_archive: boolean; // Derived from all images
  inf_name?: string;
  dis_name?: string;
  inf_desc?: string;
  dis_desc?: string;
};

export type ImageItem =
  | (IncomeImage & { type: "income" })
  | (DisbursementImage & { type: "disbursement" });

export type IncomeImage = {
  infi_num: number;
  infi_upload_date: string;
  infi_type: string;
  infi_name: string; 
  infi_path: string; 
  infi_url: string;
  // file_url: string; 
  inf_num: number;
  staff_name?: string;
  inf_year: string;
  infi_is_archive: boolean;
  inf_name: string;
  inf_desc?: string;
};

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

export type DisbursementImage = {
  disf_num: number;
  disf_upload_date: string;
  disf_type: string; 
  disf_name: string; 
  disf_path: string; 
  disf_url: string;
  // file_url: string; 
  dis_num: number;
  staff_name?: string;
  dis_year: string;
  disf_is_archive: boolean;
  dis_name: string;
  dis_desc?: string;
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

export type IncomeFolder = {
  inf_num: number;           
  inf_year: string;   
  inf_name: string;       
  inf_is_archive: boolean;   
  inf_desc?: string;
};

export type DisbursementFolder = {
  dis_num: number;      
  dis_year: string;       
  dis_name: string;  
  dis_is_archive: boolean;  
  dis_desc?: string;
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