import { api } from "@/api/api";
import { AxiosError } from "axios";

export type BusinessPermit = {
  bpr_id: string;
  business_name: string;
  business_gross_sales: string;
  business_address?: string;
  req_request_date: string;
  req_status: string;
  req_payment_status: string;
  req_amount?: number;
  ags_id?: number;
  bus_id?: string;
  pr_id?: number;
  staff_id?: string;
  rp_id?: string;
  req_date_completed?: string;
  bus_permit_name?: string;
  bus_permit_address?: string;
  bpf_id?: string | null;
  purpose?: string;
  amount_to_pay?: number;
  requestor?: string;
};

export const getBusinessPermit = async (): Promise<BusinessPermit[]> => {
  try {
    // Fetch all pages if the API is paginated ({ count, next, results })
    const firstResponse = await api.get('/clerk/business-permit/');
    const firstPayload = firstResponse.data as any;

    let itemsAccumulator: any[] = [];
    let nextUrl: string | null | undefined = undefined;

    if (Array.isArray(firstPayload)) {
      itemsAccumulator = firstPayload;
      nextUrl = null;
    } else if (Array.isArray(firstPayload?.data)) {
      itemsAccumulator = firstPayload.data;
      nextUrl = firstPayload?.next ?? null;
    } else if (Array.isArray(firstPayload?.results)) {
      itemsAccumulator = firstPayload.results;
      nextUrl = firstPayload?.next ?? null;
    } else {
      console.warn('Unexpected business permit payload shape:', firstPayload);
      itemsAccumulator = [];
      nextUrl = null;
    }

    // Follow pagination if present
    // Hard cap to avoid infinite loops in case of server issues
    const MAX_PAGES = 10;
    let pagesFetched = 1;
    while (nextUrl && pagesFetched < MAX_PAGES) {
      const pageRes = await api.get(nextUrl);
      const pagePayload = pageRes.data as any;
      const pageItems = Array.isArray(pagePayload)
        ? pagePayload
        : Array.isArray(pagePayload?.data)
        ? pagePayload.data
        : Array.isArray(pagePayload?.results)
        ? pagePayload.results
        : [];
      itemsAccumulator = itemsAccumulator.concat(pageItems);
      nextUrl = pagePayload?.next ?? null;
      pagesFetched += 1;
    }

    // Normalize backend field names to the UI's expected keys
    return itemsAccumulator.map((item: any) => {
      return {
        bpr_id: item.bpr_id,
        // Prefer canonical fields if present; fall back to alternate backend names
        business_name: item.business_name ?? item.bus_permit_name ?? "",
        business_gross_sales:
          item.business_gross_sales ?? item.bus_clearance_gross_sales ?? "",
        business_address: item.business_address ?? item.bus_permit_address ?? "",
        req_request_date: item.req_request_date,
        req_status: item.req_status,
        req_payment_status: item.req_payment_status,
        req_amount: item.req_amount,
        ags_id: item.ags_id,
        bus_id: item.bus_id,
        pr_id: item.pr_id,
        staff_id: item.staff_id,
        rp_id: item.rp_id,
        req_date_completed: item.req_date_completed,
        bus_permit_name: item.bus_permit_name,
        bus_permit_address: item.bus_permit_address,
        bpf_id: item.bpf_id ?? null,
        purpose: item.purpose,
        amount_to_pay: item.amount_to_pay,
        requestor: item.requestor,
      } as BusinessPermit;
    });
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching business permits:', error.response?.data || error.message);
    throw error;
  }
};

