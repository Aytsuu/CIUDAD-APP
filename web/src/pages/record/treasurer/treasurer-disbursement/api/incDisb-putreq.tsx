import api from "@/api/api";

export const putDisbursementVoucher = async (disbursementData: any) => {
  if (!disbursementData.dis_num) {
    throw new Error("Disbursement voucher ID is required for updates");
  }

  const response = await api.put(
    `treasurer/disbursement-vouchers/${disbursementData.dis_num}/`, 
    disbursementData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};
