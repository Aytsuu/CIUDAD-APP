import { api } from "@/api/api";
import { DisbursementVoucher, DisbursementFile, Staff, DisbursementParams, DisbursementFileParams, DisbursementFileInput } from "./disbursement-types"

export const getDisbursementVouchers = async (params: DisbursementParams = {}): Promise<DisbursementVoucher[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.archive !== undefined) queryParams.append('archive', params.archive.toString());
    if (params.year) queryParams.append('year', params.year);
    
    const url = `treasurer/disbursement-vouchers/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await api.get(url);
    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    return [];
  }
};

export const getDisbursementVoucher = async (disNum: string): Promise<DisbursementVoucher> => {
  try {
    const res = await api.get(`treasurer/disbursement-vouchers/${disNum}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getDisbursementFiles = async (disNum: string, params: DisbursementFileParams = {}): Promise<DisbursementFile[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.archive !== undefined) queryParams.append('archive', params.archive.toString());
    queryParams.append('dis_num', disNum);
    
    const url = `treasurer/disbursement-files/?${queryParams.toString()}`;
    const res = await api.get(url);
    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    return [];
  }
};

export const getStaffList = async (): Promise<Staff[]> => {
  try {
    const res = await api.get('gad/api/staff/');
    const data = res.data?.data ?? res.data ?? [];
    return data.map((staff: any) => ({
      staff_id: staff.staff_id,
      full_name: staff.full_name,
      position: staff.position,
    }));
  } catch (err) {
    return [];
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