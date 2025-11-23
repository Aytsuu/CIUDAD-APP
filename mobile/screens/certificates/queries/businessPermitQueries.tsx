import { AxiosError } from "axios";
import { 
  getBusinessPermits as getBusinessPermitsAPI, 
  getIssuedBusinessPermits as getIssuedBusinessPermitsAPI
} from "../restful-api/businessGetAPI";


export interface BusinessPermit {
  bp_id?: string;
  bpr_id: string;
  business_name: string;
  business_type?: string;
  purpose?: string;
  owner_name?: string;
  requestor?: string;
  business_address: string;
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_status: string;
  req_payment_status: string;
  req_transac_id: string;
  pr_id?: string;
  ra_id?: string;
  staff_id?: string;
  rp?: string;
}

export interface IssuedBusinessPermit {
  ibp_id: string;
  business_name: string;
  dateIssued: string;
  purpose: string;
  original_permit?: {
    bpr_id: string;
    req_purpose: string;
    req_type: string;
    req_request_date: string;
    req_claim_date: string;
    req_pay_method: string;
    req_payment_status: string;
    req_transac_id: string;
  };
}


export const getBusinessPermits = async (
  search?: string,
  page?: number,
  pageSize?: number,
  status?: string,
  paymentStatus?: string,
  businessType?: string
): Promise<{results: BusinessPermit[], count: number, next: string | null, previous: string | null}> => {
  try {
    const rawData = await getBusinessPermitsAPI(search, page, pageSize, status, paymentStatus, businessType);
    
    const mapped: BusinessPermit[] = (rawData.results || []).map((item: any) => {
      return {
        bp_id: item.bp_id,
        bpr_id: item.bpr_id || item.bp_id || '',
        business_name: item.business_name ?? item.bus_permit_name ?? '',
        business_type: item.business_type || item.purpose || '',
        purpose: item.purpose || item.business_type || '',
        owner_name: item.owner_name || item.requestor || '',
        requestor: item.requestor || item.owner_name || '',
        business_address: item.business_address ?? item.bus_permit_address ?? '',
        req_pay_method: item.req_pay_method || 'Walk-in',
        req_request_date: item.req_request_date || '',
        req_claim_date: item.req_claim_date || '',
        req_status: item.req_status || 'Pending',
        req_payment_status: item.req_payment_status || 'Unpaid',
        req_transac_id: item.req_transac_id || '',
        pr_id: item.pr_id,
        ra_id: item.ra_id,
        staff_id: item.staff_id,
        rp: item.rp,
      } as BusinessPermit;
    });
    
    return {
      results: mapped,
      count: rawData.count,
      next: rawData.next,
      previous: rawData.previous
    };
  } catch (err) {
    const error = err as AxiosError;
    throw error;
  }
};


export const getIssuedBusinessPermits = async (
  search?: string,
  page?: number,
  pageSize?: number,
  purpose?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{results: IssuedBusinessPermit[], count: number, next: string | null, previous: string | null}> => {
  try {
    const rawData = await getIssuedBusinessPermitsAPI(search, page, pageSize, purpose, dateFrom, dateTo);
    
    const mapped: IssuedBusinessPermit[] = (rawData.results || []).map((item: any) => {
      return {
        ibp_id: item.ibp_id,
        business_name: item.business_name,
        dateIssued: item.dateIssued,
        purpose: item.purpose,
        original_permit: item.original_permit || undefined,
      } as IssuedBusinessPermit;
    });
    
    return {
      results: mapped,
      count: rawData.count,
      next: rawData.next,
      previous: rawData.previous
    };
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    }
    throw error;
  }
};


export { 
  getBusinessPermitById, 
  searchBusinessPermits, 
  getPermitClearances 
} from '../restful-api/businessGetAPI';
