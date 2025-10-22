import { useQuery } from "@tanstack/react-query";
import { getDisbursementVouchers, getDisbursementVoucher, getDisbursementFiles, getStaffList, getDisbursementVoucherYears } from "../api/incDisb-getreq";
import { DisbursementVoucher } from "../incDisb-types";

export const useGetDisbursementVouchers = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  year?: string,
  archive?: boolean,
  options = {}
) => {
  return useQuery<{ results: DisbursementVoucher[]; count: number }, Error>({
    queryKey: ["disbursementVouchers", page, pageSize, searchQuery, year, archive],
    queryFn: () => getDisbursementVouchers(page, pageSize, searchQuery, year, archive),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useGetDisbursementVoucherYears = (options = {}) => {
  return useQuery<number[], Error>({
    queryKey: ["disbursementVoucherYears"],
    queryFn: getDisbursementVoucherYears,
    staleTime: 1000 * 60 * 30, 
    ...options,
  });
};

export const useGetDisbursementVoucher = (disNum: any, options = {}) => {
  return useQuery({
    queryKey: ["disbursementVoucher", disNum],
    queryFn: () => getDisbursementVoucher(disNum),
    enabled: !!disNum,
    ...options,
  });
};

export const useGetDisbursementFiles = (disNum: any, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["disbursementFiles", disNum, params],
    queryFn: () => getDisbursementFiles(disNum, params),
    enabled: !!disNum,
    ...options
  });
};


export const useGetStaffList = (options = {}) => {
  return useQuery({
    queryKey: ["staffList"],
    queryFn: getStaffList,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
};