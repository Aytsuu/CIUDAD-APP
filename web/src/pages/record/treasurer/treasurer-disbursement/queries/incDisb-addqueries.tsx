import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postDisbursementVoucher, addDisbursementFiles } from "../api/incDisb-postreq";
import { DisbursementInput, DisbursementFileInput } from "../incDisb-types"; 

export const useAddDisbursementVoucher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (disbursementData: DisbursementInput) => postDisbursementVoucher(disbursementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursementVouchers"] });
      toast.success("Disbursement voucher added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      navigate(`/disbursement-vouchers`);
    },
    onError: (error: any) => {
      toast.error("Failed to add disbursement voucher", {
        description: error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : error.message,
        duration: 5000,
      });
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
    onError: (error: any) => {
      toast.error("Failed to add disbursement files", {
        description: error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : error.message,
        duration: 5000,
      });
    },
  });
};