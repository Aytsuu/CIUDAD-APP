import api from "@/api/api";
import { DisbursementFileInput } from "../incDisb-types";

export const postDisbursementVoucher = async (disbursementData: any) => {
  try {
    const response = await api.post('treasurer/disbursement-vouchers/', disbursementData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addDisbursementFiles = async (data: DisbursementFileInput) => {
  if (!data.dis_num) {
    throw new Error("Disbursement voucher ID is required");
  }
  const response = await api.post(
    `treasurer/disbursement-vouchers/${data.dis_num}/files/`, 
    {
          dis_num: data.dis_num,
          files: data.files
        }
  );
  return response.data;
};