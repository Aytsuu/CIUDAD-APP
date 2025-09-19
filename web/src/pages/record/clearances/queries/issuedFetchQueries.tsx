import { AxiosError } from "axios";
import { api } from "@/api/api";

export type IssuedCertificate = {
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
};

export type IssuedBusinessPermit = {
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
};

export type Purpose = {
  pr_id: number;
  pr_purpose: string;
  pr_rate: string;
  pr_category: string;
  pr_date: string;
  pr_is_archive: boolean;
};

export const getIssuedCertificates = async (): Promise<IssuedCertificate[]> => {
  try {
    const res = await api.get('/clerk/issued-certificates/');
    const raw = (res.data || []) as any[];
    // Normalize: backend may return either serialized fields (requester, purpose, dateIssued)
    // or raw model fields (ic_date_of_issuance, etc.). Map to UI shape.
    return raw.map((item: any) => ({
      ic_id: String(item.ic_id ?? ''),
      requester: item.requester ?? item.requester_name ?? '',
      dateIssued: item.dateIssued ?? item.ic_date_of_issuance ?? '',
      purpose: item.purpose ?? item.pr_purpose ?? '',
      original_certificate: item.original_certificate,
    }));
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return [];
    }
    throw error;
  }
};

export const getIssuedBusinessPermits = async (): Promise<IssuedBusinessPermit[]> => {
  try {
    const res = await api.get('/clerk/issued-business-permits/');
    return (res.data || []) as IssuedBusinessPermit[];
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return [];
    }
    throw error;
  }
};

export const getAllPurposes = async (): Promise<Purpose[]> => {
  try {
    const res = await api.get('/treasurer/purpose-and-rate/');
    return (res.data || []) as Purpose[];
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return [];
    }
    throw error;
  }
};
