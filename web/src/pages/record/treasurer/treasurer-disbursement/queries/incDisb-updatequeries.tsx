import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { putDisbursementVoucher } from "../api/incDisb-putreq";

export const useUpdateDisbursementVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putDisbursementVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      showSuccessToast("Disbursement voucher updated successfully");
    },
    onError: (_error: any) => {
      showErrorToast("Failed to update disbursement voucher");
    },
  });
};