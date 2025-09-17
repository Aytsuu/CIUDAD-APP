import api from "@/api/api";

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

export const addDisbursementFiles = async (fileData: any) => {
  if (!fileData.dis_num) {
    throw new Error("Disbursement voucher ID is required");
  }
  const response = await api.post(
    `treasurer/disbursement-vouchers/${fileData.dis_num}/files/`, 
    fileData
  );
  return response.data;
};