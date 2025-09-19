import { api } from "@/api/api";
import { DisbursementVoucher, DisbursementFile, Staff, DisbursementParams, DisbursementFileParams } from "../incDisb-types"



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