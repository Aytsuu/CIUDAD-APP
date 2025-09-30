import { useQuery } from "@tanstack/react-query";
import { getDisbursementVouchers, getDisbursementVoucher, getDisbursementFiles, getStaffList } from "../api/incDisb-getreq";

export const useGetDisbursementVouchers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["disbursementVouchers", params],
    queryFn: () => getDisbursementVouchers(params),
    staleTime: 1000 * 60 * 5,
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