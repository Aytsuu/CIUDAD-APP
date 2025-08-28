import { z } from "zod";


export const PersonalCertificationSchema = z.object({
    cert_type: z.literal('personal'),
    requester: z.string().min(1, "Requester is required"),
    purposes: z.array(z.string()).min(1, "At least one purpose is required"),
    payment_mode: z.string().optional(),
    pr_id: z.number().optional(), // Add purpose ID field
});


export const BusinessPermitSchema = z.object({
    cert_type: z.literal('permit'),
    business_name: z.string().min(1, "Business name is required"),
    business_address: z.string().min(1, "Business address is required"),
    gross_sales: z.string().min(1, "Annual gross sales is required"),
    // Image fields for the new backend
    previous_permit_image: z.string().optional(), // Previous permit image for existing businesses
    assessment_image: z.string().optional(), // Assessment document for all businesses
    rp_id: z.string().optional(), // Resident profile ID
});


export const CertificationRequestSchema = z.discriminatedUnion('cert_type', [
    PersonalCertificationSchema,
    BusinessPermitSchema
]);

export const CertificateRequestSubmissionSchema = z.object({
    cr_id: z.string().min(1, "Certificate ID is required"),
    req_request_date: z.string().min(1, "Request date is required"),
    req_transac_id: z.string().optional(),
    req_purpose: z.string().min(1, "Purpose is required"),
    req_status: z.enum(["Pending", "Approved", "Rejected", "Completed"]).default("Pending"),
    req_payment_status: z.enum(["Unpaid", "Paid", "Partial"]).default("Unpaid"),
    pr_id: z.string().optional(),
    rp_id: z.string().min(1, "Resident profile ID is required"),
    staff_id: z.string().optional(),
    serial_no: z.string().optional(),
    requester: z.string().optional(),
});


export const BusinessPermitRequestSubmissionSchema = z.object({
    bpr_id: z.string().min(1, "Business Permit Request ID is required"),
    req_request_date: z.string().min(1, "Request date is required"),
    req_transac_id: z.string().optional(),
    req_sales_proof: z.string().optional(),
    req_status: z.enum(["Pending", "Approved", "Rejected", "Completed"]).default("Pending"),
    req_payment_status: z.enum(["Unpaid", "Paid", "Partial"]).default("Unpaid"),
    business: z.string().optional(),
    ags_id: z.string().optional(),
    pr_id: z.string().optional(),
    ra_id: z.string().optional(),
    staff_id: z.string().optional(),
    bus_address: z.string().optional(),
    business_name: z.string().optional(),
    business_address: z.string().optional(),
    business_gross_sales: z.string().optional(),
    requestor: z.string().optional(),
});


export const SearchCertificationRequestSchema = z.object({
    query: z.string().min(1, "Search query is required"),
});

export const CertificationRequestByIdSchema = z.object({
    cr_id: z.string().min(1, "Certificate ID is required"),
});

export const BusinessPermitRequestByIdSchema = z.object({
    bpr_id: z.string().min(1, "Business Permit Request ID is required"),
});


export type PersonalCertificationFormData = z.infer<typeof PersonalCertificationSchema>;
export type BusinessPermitFormData = z.infer<typeof BusinessPermitSchema>;
export type CertificationRequestFormData = z.infer<typeof CertificationRequestSchema>;
export type CertificateRequestSubmissionData = z.infer<typeof CertificateRequestSubmissionSchema>;
export type BusinessPermitRequestSubmissionData = z.infer<typeof BusinessPermitRequestSubmissionSchema>;
