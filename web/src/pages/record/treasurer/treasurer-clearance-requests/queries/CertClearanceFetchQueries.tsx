import { useQuery } from "@tanstack/react-query";
import { getResidents } from "../restful-api/permitClearanceGetAPI";
import { getNonResidentCertReq } from "../restful-api/personalClearanceGetAPI";
import { getPersonalClearances } from "../restful-api/personalClearanceGetAPI";


export type Residents = {
    rp_id: string;
    per_id: string;
    last_name: string;
    first_name: string;
    full_name: string;
}

export const useGetResidents = () => {
     return useQuery<Residents[]>({
        queryKey: ["residents"],  
        queryFn: getResidents,
        staleTime: 1000 * 60 * 30, 
    });
}


export type NonResidentReq = {
    nrc_id: string;
    nrc_req_status: string;
    nrc_req_date: string;
    nrc_requester: string;
    nrc_address: string;
    nrc_birthdate: string;
    nrc_req_payment_status: string;
    purpose: {
        pr_id: number;
        pr_purpose: string;
        pr_rate: string;
    }
    amount: string;
}

export const useGetNonResidentCertReq = () => {
    return useQuery<NonResidentReq[]>({
        queryKey: ["nonResidentReq"],  
        queryFn: getNonResidentCertReq,
        staleTime: 1000 * 60 * 30, 
    });
}

export type ResidentReq = {
    cr_id: string;
    resident_details: {
        per_fname: string;
        per_lname: string;
    };
    cr_req_request_date: string;
    cr_req_payment_status: string;
    cr_req_status: string; 
    pr_id?: number;
    purpose?: {
        pr_purpose: string;
        pr_rate: string;
    };
    amount?: string;
}


export const usegetResidentCertReq = () => {
    return useQuery<ResidentReq[]>({
        queryKey: ["residentReq"],  
        queryFn: getPersonalClearances,
        staleTime: 1000 * 60 * 30, 
    });
}