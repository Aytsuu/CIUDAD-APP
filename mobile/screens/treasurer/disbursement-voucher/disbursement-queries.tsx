import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { getDisbursementVouchers, getDisbursementVoucher, getDisbursementFiles, getStaffList, addDisbursementFiles, archiveDisbursementVoucher, restoreDisbursementVoucher, permanentDeleteDisbursementVoucher, deleteDisbursementFile, restoreDisbursementFile, archiveDisbursementFile } from "./disbursement-requests";
import { DisbursementFileInput, DisbursementVoucher, FileMutationVariables } from "./disbursement-types";

export const useGetDisbursementVouchers = (params = {}, options = {}) => {
  const { toast } = useToastContext();

  return useQuery({
    queryKey: ["disbursementVouchers", params],
    queryFn: () =>
      getDisbursementVouchers(params).catch((error) => {
        toast.error(error.message || "Failed to fetch disbursement vouchers");
        console.error("Error fetching disbursement vouchers:", error);
        throw error;
      }),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useGetDisbursementVoucher = (disNum: any, options = {}) => {
  const { toast } = useToastContext();

  return useQuery({
    queryKey: ["disbursementVoucher", disNum],
    queryFn: () =>
      getDisbursementVoucher(disNum).catch((error) => {
        toast.error(error.message || "Failed to fetch disbursement voucher");
        console.error("Error fetching disbursement voucher:", error);
        throw error;
      }),
    enabled: !!disNum,
    ...options,
  });
};

export const useGetDisbursementFiles = (disNum: any, params = {}, options = {}) => {
  const { toast } = useToastContext();

  return useQuery({
    queryKey: ["disbursementFiles", disNum, params],
    queryFn: () =>
      getDisbursementFiles(disNum, params).catch((error) => {
        toast.error(error.message || "Failed to fetch disbursement files");
        console.error("Error fetching disbursement files:", error);
        throw error;
      }),
    enabled: !!disNum,
    ...options
  });
};

export const useGetStaffList = (options = {}) => {
  const { toast } = useToastContext();

  return useQuery({
    queryKey: ["staffList"],
    queryFn: () =>
      getStaffList().catch((error) => {
        toast.error(error.message || "Failed to fetch staff list");
        console.error("Error fetching staff list:", error);
        throw error;
      }),
    staleTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useAddDisbursementFiles = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (fileData: DisbursementFileInput) => addDisbursementFiles(fileData),
    onSuccess: (_data, variables: DisbursementFileInput) => {
      queryClient.invalidateQueries({
        queryKey: ["disbursementFiles", variables.dis_num],
      });
      toast.success("Files added successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add files");
    },
  });
};

export const useArchiveDisbursementVoucher = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher archived successfully");
      onSuccess?.();
    },
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      toast.error(error.message || "Failed to archive disbursement voucher");
    }
  });
};

export const useRestoreDisbursementVoucher = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher restored successfully");
      onSuccess?.();
    },
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      toast.error(error.message || "Failed to restore disbursement voucher");
    }
  });
};

export const usePermanentDeleteDisbursementVoucher = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher permanently deleted successfully");
      onSuccess?.();
    },
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      toast.error(error.message || "Failed to permanently delete disbursement voucher");
    }
  });
};

export const useDeleteDisbursementFile = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ disfNum }: FileMutationVariables) => {
      return deleteDisbursementFile(disfNum);
    },
    onSuccess: (_data, variables: FileMutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursementFiles", variables.disNum] });
      toast.success("File deleted successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete file");
    },
  });
};

export const useArchiveDisbursementFile = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ disfNum }: FileMutationVariables) => {
      return archiveDisbursementFile(disfNum);
    },
    onSuccess: (_data, variables: FileMutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursementFiles", variables.disNum] });
      toast.success("File archived successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive file");
    },
  });
};

export const useRestoreDisbursementFile = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ disfNum }: FileMutationVariables) => {
      return restoreDisbursementFile(disfNum);
    },
    onSuccess: (_data, variables: FileMutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["disbursementFiles", variables.disNum] });
      toast.success("File restored successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore file");
    },
  });
};