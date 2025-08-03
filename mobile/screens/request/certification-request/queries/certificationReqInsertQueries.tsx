import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addCertificationRequest, submitPermitCertificationWithBusiness } from "../restful-API/certificationReqPostAPI";
import { useRouter } from "expo-router";
import { useToastContext } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import z from "zod";

// Schema for personal certification request
const personalCertificationSchema = z.object({
    cert_type: z.literal('personal'),
    cert_category: z.string().min(1, "Certification category is required"),
    claim_date: z.string().min(1, "Claim date is required"),
    payment_mode: z.string().min(1, "Payment mode is required"),
    pr_id: z.string().optional(),
});

// Schema for business permit request
const businessPermitSchema = z.object({
    cert_type: z.literal('permit'),
    business_name: z.string().min(1, "Business name is required"),
    business_address: z.string().min(1, "Business address is required"),
    gross_sales: z.string().min(1, "Annual gross sales is required"),
    claim_date: z.string().min(1, "Claim date is required"),
    payment_mode: z.string().min(1, "Payment mode is required"),
    business_existence_image: z.array(z.any()).optional(),
    gross_sales_image: z.array(z.any()).optional(),
});

// Union schema for both types
export const certificationRequestSchema = z.discriminatedUnion('cert_type', [
    personalCertificationSchema,
    businessPermitSchema
]);

export const useAddPersonalCertification = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
    const router = useRouter();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (values: z.infer<typeof personalCertificationSchema>) => 
            addCertificationRequest(values, user?.staff?.staff_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personalCertifications'] });
            queryClient.invalidateQueries({ queryKey: ['businessPermitRequests'] });

            toast.success('Personal Certification Request Submitted!');
            onSuccess?.();
            router.back();
        },
        onError: (err) => {
            console.error("Error submitting personal certification request:", err);
            toast.error("Failed to submit request. Please check the input data and try again.");
        }
    });
};

export const useAddBusinessPermit = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
    const router = useRouter();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (values: z.infer<typeof businessPermitSchema>) => 
            submitPermitCertificationWithBusiness(values, user?.staff?.staff_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personalCertifications'] });
            queryClient.invalidateQueries({ queryKey: ['businessPermitRequests'] });

            toast.success('Business Permit Request Submitted!');
            onSuccess?.();
            router.back();
        },
        onError: (err) => {
            console.error("Error submitting business permit request:", err);
            toast.error("Failed to submit request. Please check the input data and try again.");
        }
    });
};

// Generic mutation for both types
export const useAddCertificationRequest = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
    const router = useRouter();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (values: z.infer<typeof certificationRequestSchema>) => {
            if (values.cert_type === 'personal') {
                return addCertificationRequest(values, user?.staff?.staff_id);
            } else {
                return submitPermitCertificationWithBusiness(values, user?.staff?.staff_id);
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['personalCertifications'] });
            queryClient.invalidateQueries({ queryKey: ['businessPermitRequests'] });

            const message = variables.cert_type === 'personal' 
                ? 'Personal Certification Request Submitted!' 
                : 'Business Permit Request Submitted!';
            
            toast.success(message);
            onSuccess?.();
            router.back();
        },
        onError: (err) => {
            console.error("Error submitting certification request:", err);
            toast.error("Failed to submit request. Please check the input data and try again.");
        }
    });
};
