import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { X, Send, AlertCircle, Forward } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useUpdateMedicineRequestItem } from "../queries/post";
import { useEffect } from "react";

// Define the form schema
const reasonFormSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters")
});

type ReasonFormValues = z.infer<typeof reasonFormSchema>;

type ModalMode = "reject" | "refer";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  mode: ModalMode;
  isLoading?: boolean;
}

// Custom Loader2 component with animated spin
const Loader2 = ({ className = "h-4 w-4" }: { className?: string }) => <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;

export const ActionModal = ({ isOpen, onClose, data, mode }: ActionModalProps) => {
  const { mutate: updateMedicineRequest, isPending: isSubmitting } = useUpdateMedicineRequestItem();

  const form = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonFormSchema),
    defaultValues: {
      reason: ""
    }
  });

  // Get modal configuration based on mode
  const modalConfig = {
    reject: {
      title: "Reject Document",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      buttonText: "Send Notification",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
      status: "rejected",
      isArchived: true,
      archive_reason: "The document was rejected because it was invalid or did not match the request."
    },
    refer: {
      title: "Refer Request",
      icon: Forward,
      iconColor: "text-blue-600",
      buttonText: "Submit",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      status: "referred",
      archive_reason: ``
    }
  };

  const config = modalConfig[mode];
  const IconComponent = config.icon;
  useEffect(() => {
    form.setValue("reason", config.archive_reason || "");
  }, [isOpen]);
  const handleSubmit = async (formData: ReasonFormValues) => {
    const updateData = {
      status: config.status,
      archive_reason: config.archive_reason || formData.reason,
      is_archived: true
    };

    // Call the mutation
    updateMedicineRequest(
      { medreqitem_id: data.medreqitem_id, data: updateData },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        }
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
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full hover:bg-gray-100" disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 ">
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">
              Medicine: <span className="font-semibold text-gray-900">{data.med_name}</span>
            </Label>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormTextArea name="reason" control={form.control} label="" placeholder={`Enter the reason for ${mode}...`} rows={10} />

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="min-w-[80px]">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className={`min-w-[80px] ${config.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-white" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {config.buttonText}
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
