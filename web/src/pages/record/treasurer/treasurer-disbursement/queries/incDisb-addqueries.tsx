import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { postDisbursementVoucher, addDisbursementFiles } from "../api/incDisb-postreq";
import { DisbursementInput, DisbursementFileInput } from "../incDisb-types"; 

export const useAddDisbursementVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (disbursementData: DisbursementInput) => postDisbursementVoucher(disbursementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      showSuccessToast("Disbursement voucher added successfully");
    },
    onError: (_error: any) => {
      showErrorToast("Failed to add disbursement voucher");
    },
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
    onError: (_error: any) => {
      showErrorToast("Failed to add disbursement files");
    },
  });
};