import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putDisbursementVoucher } from "../api/incDisb-putreq";

export const useUpdateDisbursementVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putDisbursementVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update disbursement voucher", {
        description: error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message,
        duration: 5000,
      });
    },
  });
};