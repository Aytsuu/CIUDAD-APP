import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { 
  archiveDisbursementVoucher, 
  restoreDisbursementVoucher,
  permanentDeleteDisbursementVoucher, 
  deleteDisbursementFile, 
  archiveDisbursementFile, 
  restoreDisbursementFile 
} from "../api/incDisb-delreq";
import { DisbursementVoucher, FileMutationVariables } from "../incDisb-types"

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
    onError: (_error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      showErrorToast("Failed to archive disbursement voucher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      showSuccessToast("Disbursement voucher archived successfully");
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
    onError: (_error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      showErrorToast("Failed to restore disbursement voucher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      showSuccessToast("Disbursement voucher restored successfully");
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
    onError: (_error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      showErrorToast("Failed to permanently delete disbursement voucher");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      showSuccessToast("Disbursement voucher permanently deleted");
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
      showSuccessToast("Disbursement file deleted successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to delete disbursement file");
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
      showSuccessToast("Disbursement file archived successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to archive disbursement file");
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
      showSuccessToast("Disbursement file restored successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to restore disbursement file");
    },
  });
};