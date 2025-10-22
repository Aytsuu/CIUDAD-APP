import { AxiosError } from "axios";
import { getIssuedCertificates as getIssuedCertificatesAPI } from "../restful-api/issuedCertGetAPI";


export interface IssuedCertificate {
  ic_id: string;
  requester: string;
  dateIssued: string;
  purpose: string;
  original_certificate?: {
    cr_id: string;
    req_purpose: string;
    req_type: string;
    req_request_date: string;
    req_claim_date: string;
    req_pay_method: string;
    req_payment_status: string;
    req_transac_id: string;
  };
}


export const getIssuedCertificates = async (
  search?: string,
  page?: number,
  pageSize?: number,
  purpose?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{results: IssuedCertificate[], count: number, next: string | null, previous: string | null}> => {
  try {
    console.log('Fetching issued certificates with web backend mapping...');
    const rawData = await getIssuedCertificatesAPI(search, page, pageSize, purpose, dateFrom, dateTo);
    
    const mapped: IssuedCertificate[] = (rawData.results || []).map((item: any) => {
      return {
        ic_id: item.ic_id,
        requester: item.requester,
        dateIssued: item.dateIssued,
        purpose: item.purpose,
        original_certificate: item.original_certificate || undefined,
      } as IssuedCertificate;
    });
    
    console.log('Web backend mapped issued certificates:', mapped);
    return {
      results: mapped,
      count: rawData.count,
      next: rawData.next,
      previous: rawData.previous
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error in issued certificate queries:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.log('No issued certificates found, returning empty array');
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


export { getIssuedCertificateById, searchIssuedCertificates } from '../restful-api/issuedCertGetAPI';
