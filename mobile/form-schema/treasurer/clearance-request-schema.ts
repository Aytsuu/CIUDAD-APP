// form-schema/treasurer/clearance-request-schema.ts
import { z } from "zod";

export const ClearanceRequestFormSchema = z.object({
    cr_id: z.string().min(1, "Clearance Request ID is required"),
    req_pay_method: z.string().min(1, "Payment method is required"),
    req_request_date: z.string().min(1, "Request date is required"),
    req_claim_date: z.string().min(1, "Claim date is required"),
    req_type: z.enum(["clearance", "indigency", "residency", "business"]), //need to update this
    req_status: z.enum(["Pending", "Approved", "Rejected", "Completed"]),
    req_payment_status: z.enum(["Unpaid", "Paid", "Partial", "Overdue"]),
    req_transac_id: z.string().optional(),
    req_amount: z.string().min(1, "Amount is required"),
    req_purpose: z.string().min(1, "Purpose is required"),
    pr_id: z.string().optional(),
    ra_id: z.string().optional(),
    staff_id: z.string().optional(),
    rp: z.string().optional(),
});

export const PaymentStatusUpdateSchema = z.object({
    cr_id: z.string().min(1, "Clearance Request ID is required"),
    payment_status: z.enum(["Unpaid", "Paid", "Partial", "Overdue"]),
    payment_amount: z.string().optional(),
    payment_date: z.string().optional(),
    payment_method: z.string().optional(),
});

export const SearchClearanceRequestSchema = z.object({
    query: z.string().min(1, "Search query is required"),
});

export const ClearanceRequestByIdSchema = z.object({
    cr_id: z.string().min(1, "Clearance Request ID is required"),
});

export const PaymentStatisticsSchema = z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    payment_status: z.enum(["Unpaid", "Paid", "Partial", "Overdue"]).optional(),
}); 