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

export type PaginatedResult<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

export const getIssuedCertificates = async (
  search?: string,
  page?: number,
  pageSize?: number,
  purpose?: string
): Promise<PaginatedResult<IssuedCertificate>> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', String(page));
    if (pageSize) params.append('page_size', String(pageSize));
    if (purpose && purpose !== 'All') params.append('purpose', purpose);
    const url = `/clerk/issued-certificates/${params.toString() ? `?${params.toString()}` : ''}`;

    const res = await api.get(url);
    const payload = res.data as any;

    const rawItems: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    const normalized: IssuedCertificate[] = rawItems.map((item: any) => ({
      ic_id: String(item.ic_id ?? item.id ?? ''),
      requester: item.requester ?? item.requester_name ?? item.name ?? '',
      dateIssued: item.dateIssued ?? item.ic_date_of_issuance ?? item.date_issued ?? '',
      purpose: item.purpose ?? item.pr_purpose ?? item.req_purpose ?? '',
      original_certificate: item.original_certificate,
    }));

    const count = payload?.count ?? normalized.length;
    const next = payload?.next ?? null;
    const previous = payload?.previous ?? null;
    return { results: normalized, count, next, previous };
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      // Fallback: backend may not support pagination params; retry without query
      try {
        const res = await api.get('/clerk/issued-certificates/');
        const payload = res.data as any;
        const rawItems: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const normalized: IssuedCertificate[] = rawItems.map((item: any) => ({
          ic_id: String(item.ic_id ?? item.id ?? ''),
          requester: item.requester ?? item.requester_name ?? item.name ?? '',
          dateIssued: item.dateIssued ?? item.ic_date_of_issuance ?? item.date_issued ?? '',
          purpose: item.purpose ?? item.pr_purpose ?? item.req_purpose ?? '',
          original_certificate: item.original_certificate,
        }));

        return {
          results: normalized,
          count: normalized.length,
          next: null,
          previous: null,
        };
      } catch (_fallbackErr) {
        return { results: [], count: 0, next: null, previous: null };
      }
    }
    throw error;
  }
};

export const getIssuedBusinessPermits = async (
  search?: string,
  page?: number,
  pageSize?: number,
  purpose?: string
): Promise<PaginatedResult<IssuedBusinessPermit>> => {
  try {
    // Backend paginated endpoint errors when passing page/page_size (ordering by date_issued).
    // Fetch full list without query and paginate/filter on the client to avoid 500s.
    const res = await api.get('/clerk/issued-business-permits/');
    const payload = res.data as any;

    const rawItems: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    let normalized: IssuedBusinessPermit[] = rawItems.map((item: any) => ({
      ibp_id: String(item.ibp_id ?? item.id ?? ''),
      business_name: item.business_name ?? item.name ?? item.permit_request?.business_name ?? '',
      dateIssued: item.dateIssued ?? item.ibp_date_of_issuance ?? item.permit_request?.req_date_completed ?? '',
      purpose: item.purpose ?? item.pr_purpose ?? item.req_purpose ?? item.permit_request?.purpose ?? '',
      original_permit: item.original_permit ?? item.permit_request,
    }));

    // Apply optional purpose filter
    if (purpose && purpose !== 'All') {
      const p = purpose.toLowerCase();
      normalized = normalized.filter((it) => (it.purpose || '').toLowerCase().includes(p));
    }
    // Apply optional search across business name and purpose
    if (search) {
      const s = search.toLowerCase();
      normalized = normalized.filter(
        (it) => it.business_name.toLowerCase().includes(s) || (it.purpose || '').toLowerCase().includes(s)
      );
    }

    const total = normalized.length;
    const current = page && pageSize ? normalized.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : normalized;
    return { results: current, count: total, next: null, previous: null };
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return { results: [], count: 0, next: null, previous: null };
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