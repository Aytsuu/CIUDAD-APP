// form-schema/certificates/certificate-schema.ts
import { z } from "zod";

export const CertificateFormSchema = z.object({
    cr_id: z.string().min(1, "Certificate ID is required"),
    req_pay_method: z.string().min(1, "Payment method is required"),
    req_request_date: z.string().min(1, "Request date is required"),
    req_claim_date: z.string().min(1, "Claim date is required"),
    req_type: z.enum(["clearance", "indigency", "residency", "business"]),
    req_purpose: z.string().min(1, "Purpose is required"),
    req_status: z.enum(["Pending", "Approved", "Rejected", "Completed"]),
    req_payment_status: z.enum(["Unpaid", "Paid", "Partial"]),
    req_transac_id: z.string().optional(),
    pr_id: z.string().optional(),
    ra_id: z.string().optional(),
    rp_id: z.string().optional(),
});

export const IssuedCertificateFormSchema = z.object({
    ic_id: z.string().min(1, "Issued Certificate ID is required"),
    ic_date_of_issuance: z.string().min(1, "Date of issuance is required"),
    requester: z.string().min(1, "Requester is required"),
    purpose: z.string().min(1, "Purpose is required"),
    fileUrl: z.string().optional(),
    file_details: z.object({
        file_id: z.string().optional(),
        file_name: z.string().optional(),
        file_type: z.string().optional(),
        file_path: z.string().optional(),
        file_url: z.string().optional(),
    }).optional(),
});

export const BusinessPermitFormSchema = z.object({
    bp_id: z.string().min(1, "Business Permit ID is required"),
    business_name: z.string().min(1, "Business name is required"),
    business_type: z.string().min(1, "Business type is required"),
    owner_name: z.string().min(1, "Owner name is required"),
    business_address: z.string().min(1, "Business address is required"),
    req_pay_method: z.string().min(1, "Payment method is required"),
    req_request_date: z.string().min(1, "Request date is required"),
    req_claim_date: z.string().min(1, "Claim date is required"),
    req_status: z.enum(["Pending", "Approved", "Rejected", "Completed"]),
    req_payment_status: z.enum(["Unpaid", "Paid", "Partial"]),
    req_transac_id: z.string().optional(),
    pr_id: z.string().optional(),
    ra_id: z.string().optional(),
    staff_id: z.string().optional(),
    rp: z.string().optional(),
});

export const SearchCertificateSchema = z.object({
    query: z.string().min(1, "Search query is required"),
});

export const CertificateByIdSchema = z.object({
    cr_id: z.string().min(1, "Certificate ID is required"),
});

export const IssuedCertificateByIdSchema = z.object({
    ic_id: z.string().min(1, "Issued Certificate ID is required"),
});

export const BusinessPermitByIdSchema = z.object({
    bp_id: z.string().min(1, "Business Permit ID is required"),
}); 