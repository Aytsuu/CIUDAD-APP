import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addCertificationRequest, submitPermitCertificationWithBusiness } from "../restful-API/certificationReqPostAPI";
import { useRouter } from "expo-router";
import { useToastContext } from "@/components/ui/toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
    PersonalCertificationSchema, 
    BusinessPermitSchema, 
    CertificationRequestSchema,
    type PersonalCertificationFormData,
    type BusinessPermitFormData,
    type CertificationRequestFormData
} from "@/form-schema/certificates/certification-request-schema";

export const useAddPersonalCertification = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();
    const router = useRouter();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (values: PersonalCertificationFormData) => {
            
            const apiPayload = {
                cert_type: values.cert_type,
                cert_category: values.purposes[0], 
                claim_date: values.claimDate,
                payment_mode: values.payment_mode || "not-specified", 
                requester: values.requester
            };
            return addCertificationRequest(apiPayload);
        },
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
        mutationFn: (values: BusinessPermitFormData) => 
            submitPermitCertificationWithBusiness(values, "00003250722"),
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
        mutationFn: (values: CertificationRequestFormData) => {
            if (values.cert_type === 'personal') {
                return addCertificationRequest(values, "00003250722");
            } else {
                return submitPermitCertificationWithBusiness(values, "00003250722");
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
// Export schemas for use in components
export { 
    PersonalCertificationSchema, 
    BusinessPermitSchema, 
    CertificationRequestSchema 
};

