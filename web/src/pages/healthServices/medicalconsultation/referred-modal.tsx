import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { X, Send, AlertCircle, Ban, ArrowRightLeft } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useActionAppointment } from "./queries/update";
import { useEffect } from "react";

// Refer/Reject form schema
const actionFormSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters"),
});

type ActionFormValues = z.infer<typeof actionFormSchema>;

interface ReferredModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  patientName: string;
  mode?: "referred" | "rejected";
  onSuccess?: () => void;
}

// Custom Loader2 component with animated spin
const Loader2 = ({ className = "h-4 w-4" }: { className?: string }) => (
  <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
);

export const ReferredModal = ({ 
  isOpen, 
  onClose, 
  appointmentId, 
  patientName, 
  mode = "referred",
  onSuccess 
}: ReferredModalProps) => {
  const { mutate: actionAppointment, isPending: isSubmitting } = useActionAppointment();

  // Default reasons based on mode
  const defaultReasons = {
    referred: "Based on our assessment, you need immediate medical consultation. Please go to the nearest health center/hospital right away for proper medical care.",
    rejected: "Unfortunately, we cannot accommodate your appointment at this time. Please contact us for alternative arrangements."
  };

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      reason: defaultReasons[mode],
    },
  });

  // Modal configuration based on mode
  const modalConfig = mode === "referred" 
    ? {
        title: "Refer Appointment",
        icon: ArrowRightLeft,
        iconColor: "text-blue-600",
        buttonText: "Refer Appointment",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
        status: "referred",
        labelText: "Reason for Referral",
        placeholder: "Enter the reason for referring this appointment...",
        helperText: "This reason will be recorded and may be shared with the patient.",
      }
    : {
        title: "Reject Appointment",
        icon: Ban,
        iconColor: "text-red-600",
        buttonText: "Reject Appointment",
        buttonColor: "bg-red-600 hover:bg-red-700",
        status: "rejected",
        labelText: "Reason for Rejection",
        placeholder: "Enter the reason for rejecting this appointment...",
        helperText: "This reason will be recorded and shared with the patient.",
      };

  const IconComponent = modalConfig.icon;

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        reason: defaultReasons[mode],
      });
    } else {
      form.reset();
    }
  }, [isOpen, mode, form]);

  const handleSubmit = async (formData: ActionFormValues) => {
    actionAppointment(
      {
        appointmentId: appointmentId.toString(),
        status: modalConfig.status,
        reason: formData.reason,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${modalConfig.iconColor}`} />
            <h2 className="text-xl font-semibold text-gray-900">{modalConfig.title}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="h-8 w-8 rounded-full hover:bg-gray-100" 
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-4 space-y-2">
            <div className="text-sm space-y-1">
              <p className="text-gray-600">
                <span className="font-medium">Appointment ID:</span>{" "}
                <span className="font-semibold text-gray-900">APT-{appointmentId}</span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Patient:</span>{" "}
                <span className="font-semibold text-gray-900">{patientName}</span>
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormTextArea
                name="reason"
                control={form.control}
                label={`${modalConfig.labelText} *`}
                placeholder={modalConfig.placeholder}
                rows={6}
              />

              <p className="text-xs text-gray-500">{modalConfig.helperText}</p>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isSubmitting} 
                  className="min-w-[80px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className={`min-w-[120px] ${modalConfig.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-white" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{mode === "referred" ? "Refer" : "Reject"}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};