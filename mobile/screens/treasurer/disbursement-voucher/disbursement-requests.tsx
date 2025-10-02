import { api } from "@/api/api";
import { DisbursementVoucher, DisbursementFile, Staff, DisbursementParams, DisbursementFileParams, DisbursementFileInput } from "./disbursement-types"

export const getDisbursementVouchers = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  year?: string,
  archive?: boolean
): Promise<{ results: DisbursementVoucher[]; count: number }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };
    
    if (searchQuery) params.search = searchQuery;
    if (year && year !== "all") params.year = year;
    if (archive !== undefined) params.archive = archive;
    
    const res = await api.get('treasurer/disbursement-vouchers/', { params });
    
    // Handle paginated response
    if (res.data.results) {
      return {
        results: res.data.results || [],
        count: res.data.count || 0
      };
    }
    
    // Handle non-paginated response (fallback)
    const data = res.data?.data ?? res.data ?? [];
    return {
      results: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0
    };
  } catch (err) {
    console.error('Error fetching disbursement vouchers:', err);
    return { results: [], count: 0 };
  }
};

export const getDisbursementVoucherYears = async (): Promise<number[]> => {
  try {
    const res = await api.get('treasurer/disbursement-vouchers/years/');
    return res.data || [];
  } catch (err) {
    console.error('Error fetching disbursement years:', err);
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