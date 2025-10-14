import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
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
    onError: (error: Error, _disNum: string, context?: { previousVouchers?: any }) => {
      if (context?.previousVouchers) {
        queryClient.setQueryData(["disbursementVouchers"], context.previousVouchers);
      }
      toast.error("Failed to archive disbursement voucher", {
        description: error.message,
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher archived successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
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
      toast.error("Failed to restore disbursement voucher", {
        description: error.message,
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
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
      toast.error("Failed to permanently delete disbursement voucher", {
        description: error.message,
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher permanently deleted", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
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
      toast.success("Disbursement file deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete disbursement file", {
        description: error.message,
        duration: 2000,
      });
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
      toast.success("Disbursement file archived successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to archive disbursement file", {
        description: error.message,
        duration: 2000,
      });
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
      toast.success("Disbursement file restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to restore disbursement file", {
        description: error.message,
        duration: 2000,
      });
    },
  });
};