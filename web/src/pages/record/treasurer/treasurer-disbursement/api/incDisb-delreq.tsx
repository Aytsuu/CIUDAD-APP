import { api } from "@/api/api";

export const archiveDisbursementVoucher = async (disNum: any) => {
  try {
    const res = await api.patch(`treasurer/disbursement-vouchers/${disNum}/archive/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreDisbursementVoucher = async (disNum: any) => {
  try {
    const res = await api.patch(`treasurer/disbursement-vouchers/${disNum}/restore/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const permanentDeleteDisbursementVoucher = async (disNum: any) => {
  try {
    const res = await api.delete(`treasurer/disbursement-vouchers/${disNum}/?permanent=true`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const deleteDisbursementFile = async (disfNum: any) => {
  try {
    const res = await api.delete(`treasurer/disbursement-files/${disfNum}/?permanent=true`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const archiveDisbursementFile = async (disfNum: any) => {
  try {
    const res = await api.patch(`treasurer/disbursement-files/${disfNum}/archive/`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const restoreDisbursementFile = async (disfNum: any) => {
  try {
    const res = await api.patch(`treasurer/disbursement-files/${disfNum}/restore/`);
    return res.data;
  } catch (error) {
    throw error;
  }
};