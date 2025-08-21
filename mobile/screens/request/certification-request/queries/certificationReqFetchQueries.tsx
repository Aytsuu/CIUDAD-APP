import { useQuery } from "@tanstack/react-query";
import { getPersonalCertifications, getBusinessPermitRequests } from "../restful-API/certificationReqGetAPI";

export type PersonalCertification = {
    cr_id: string;
    req_pay_method: string;
    req_request_date: string;
    req_claim_date: string;
    req_transac_id: string;
    req_type: string;
    req_status: string;
    req_payment_status: string;
    pr_id?: string;
    ra_id?: string;
    staff_id?: string;
    rp: string;
}

export type BusinessPermitRequest = {
    bpr_id: string;
    req_pay_method: string;
    req_request_date: string;
    req_claim_date: string;
    req_transac_id: string;
    req_sales_proof: string;
    req_status: string;
    req_payment_status: string;
    business: string;
    ags_id?: string;
    pr_id?: string;
    ra_id?: string;
    staff_id?: string;
}

export const useGetPersonalCertifications = (residentId: string) => {
    return useQuery<PersonalCertification[]>({
        queryKey: ["personalCertifications", residentId],
        queryFn: async () => {
            const response = await getPersonalCertifications(residentId);
            return Array.isArray(response) ? response : response?.data || [];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        enabled: !!residentId,
    });
};

export const useGetBusinessPermitRequests = (residentId: string) => {
    return useQuery<BusinessPermitRequest[]>({
        queryKey: ["businessPermitRequests", residentId],
        queryFn: async () => {
            const response = await getBusinessPermitRequests(residentId);
            return Array.isArray(response) ? response : response?.data || [];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        enabled: !!residentId,
    });
};
