import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Send, AlertCircle } from "lucide-react";
import { Form } from "@/components/ui/form/form";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { toast } from "sonner";
import { api2 } from "@/api/api";

// Define the form schema
const referralFormSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason must be less than 500 characters")
});

type ReferralFormValues = z.infer<typeof referralFormSchema>;

interface RejectProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  isLoading?: boolean;
  onSuccess?: () => void; // Add callback for successful rejection
}

export const Reject = ({
  isOpen,
  onClose,
  data,
  isLoading = false,
  onSuccess
}: RejectProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(referralFormSchema),
    defaultValues: {
      reason: ""
    }
  });

  const handleSubmit = async (formData: ReferralFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare the data for API call
      const updateData = {
        status: 'rejected',
        archive_reason: formData.reason,
        is_archived: true
      };

      // Make the PATCH request
      await api2.patch(`/medicine/medicine-request-item/${data.medreqitem_id}/`, updateData);
      
      form.reset();
      toast.success("Document rejected successfully");
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("Failed to reject document");
    } finally {
      setIsSubmitting(false);
    }
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
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">Reject Document</h2>
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
        <div className="p-6 ">
          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">
              Medicine: <span className="font-semibold text-gray-900">{data.med_name}</span>
            </Label>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormTextArea
                name="reason"
                control={form.control}
                label=""
                placeholder="Enter the reason for rejection..."
                rows={4}
              />

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
                  className="min-w-[80px] bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Notification
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