import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDisbursementVouchers, getDisbursementVoucher, getDisbursementFiles, getStaffList, addDisbursementFiles, archiveDisbursementVoucher, restoreDisbursementVoucher, permanentDeleteDisbursementVoucher, deleteDisbursementFile, restoreDisbursementFile, archiveDisbursementFile } from "./disbursement-requests";
import { DisbursementFileInput, DisbursementVoucher, FileMutationVariables } from "./disbursement-types";

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

export const useAddDisbursementFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileData: DisbursementFileInput) => addDisbursementFiles(fileData),
    onSuccess: (_data, variables: DisbursementFileInput) => {
      queryClient.invalidateQueries({
        queryKey: ["disbursementFiles", variables.dis_num],
      });
    },
    onError: (error: any) => {
    },
  });
};

export const useArchiveDisbursementVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: archiveDisbursementVoucher,
    onMutate: async (disNum: string) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementVouchers"] });
      const previousVouchers = queryClient.getQueryData(["disbursementVouchers"]);
      
      queryClient.setQueryData(["disbursementVouchers"], (old: DisbursementVoucher[] = []) =>
        old.map(voucher => 
          voucher.dis_num === disNum 
            ? { ...voucher, dis_is_archive: true } 
            : voucher
        )
      );
      
      return { previousVouchers };
    },
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
    }
  });
};

export const useRestoreDisbursementVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: restoreDisbursementVoucher,
    onMutate: async (disNum: string) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementVouchers"] });
      const previousVouchers = queryClient.getQueryData(["disbursementVouchers"]);
      
      queryClient.setQueryData(["disbursementVouchers"], (old: DisbursementVoucher[] = []) =>
        old.map(voucher => 
          voucher.dis_num === disNum 
            ? { ...voucher, dis_is_archive: false } 
            : voucher
        )
      );
      
      return { previousVouchers };
    },
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
    }
  });
};

export const usePermanentDeleteDisbursementVoucher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: permanentDeleteDisbursementVoucher,
    onMutate: async (disNum: string) => {
      await queryClient.cancelQueries({ queryKey: ["disbursementVouchers"] });
      const previousVouchers = queryClient.getQueryData(["disbursementVouchers"]);
      
      queryClient.setQueryData(["disbursementVouchers"], (old: DisbursementVoucher[] = []) =>
        old.filter(voucher => voucher.dis_num !== disNum)
      );
      
      return { previousVouchers };
    },
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
    }
  });
};

export const useDeleteDisbursementFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ disfNum }: FileMutationVariables) => {
      return deleteDisbursementFile(disfNum);
    },
    onSuccess: (_data, variables: FileMutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursementFiles", variables.disNum] });
    },
    onError: (error: Error) => {
    },
  });
};

export const useArchiveDisbursementFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ disfNum }: FileMutationVariables) => {
      return archiveDisbursementFile(disfNum);
    },
    onSuccess: (_data, variables: FileMutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursementFiles", variables.disNum] });
    },
    onError: (error: Error) => {
    },
  });
};

export const useRestoreDisbursementFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ disfNum }: FileMutationVariables) => {
      return restoreDisbursementFile(disfNum);
    },
    onSuccess: (_data, variables: FileMutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursementFiles", variables.disNum] });
    },
    onError: (error: Error) => {
    },
  });
};