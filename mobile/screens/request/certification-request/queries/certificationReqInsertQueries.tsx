import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addCertificationRequest, addBusinessClearance } from "../restful-API/certificationReqPostAPI";
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
                payment_mode: values.payment_mode || "not-specified", 
                requester: values.requester,
                pr_id: values.pr_id // Pass the purpose ID
            };
            return addCertificationRequest(apiPayload, undefined, user?.rp);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personalCertifications'] });
            queryClient.invalidateQueries({ queryKey: ['businessPermitRequests'] });
            // Ensure tracking list reflects the new item
            if (user?.rp) {
                queryClient.invalidateQueries({ queryKey: ['cert-tracking', user.rp] });
            }

            toast.success('Personal Certification Request Submitted!');
            onSuccess?.();
            router.back();
        },
        onError: (err) => {
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
            addCertificationRequest(values, undefined, user?.rp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personalCertifications'] });
            queryClient.invalidateQueries({ queryKey: ['businessPermitRequests'] });
            if (user?.rp) {
                queryClient.invalidateQueries({ queryKey: ['cert-tracking', user.rp] });
            }

            toast.success('Business Permit Request Submitted!');
            onSuccess?.();
            router.back();
        },
        onError: (err) => {
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
            return addCertificationRequest(values, undefined, user?.rp);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['personalCertifications'] });
            queryClient.invalidateQueries({ queryKey: ['businessPermitRequests'] });
            if (user?.rp) {
                queryClient.invalidateQueries({ queryKey: ['cert-tracking', user.rp] });
            }

            const message = variables.cert_type === 'personal' 
                ? 'Personal Certification Request Submitted!' 
                : 'Business Permit Request Submitted!';
            
            toast.success(message);
            onSuccess?.();
            router.back();
        },
        onError: (err) => {
            toast.error("Failed to submit request. Please check the input data and try again.");
        }
    });
};

export const useAddBusinessClearance = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: (data: BusinessPermitFormData) => addBusinessClearance(data, undefined, user?.rp),
    onSuccess: (data) => {
      // Business clearance request submitted successfully
    },
    onError: (error) => {
      // Error submitting business clearance request
    },
  });
};

// Export schemas for use in components
export { 
    PersonalCertificationSchema, 
    BusinessPermitSchema, 
    CertificationRequestSchema 
};

