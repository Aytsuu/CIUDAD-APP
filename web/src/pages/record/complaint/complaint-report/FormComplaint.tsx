import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  type ComplaintFormData,
  complaintFormSchema,
} from "@/form-schema/complaint-schema";
import { ReviewInfo } from "./review";
import { ComplainantInfo } from "./complainant";
import { AccusedInfo } from "./accused";
import { IncidentInfo } from "./incident";
import { ProgressBar } from "@/components/progress-bar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  AlertTriangle,
  User,
  Users,
  MapPin,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { usePostComplaint } from "../api-operations/queries/complaintPostQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const postComplaint = usePostComplaint();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { send } = useNotifications();
  const navigate = useNavigate();

  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      complainant: [],
      accused: [],
      incident: {
        comp_location: "",
        comp_incident_type: "Other",
        comp_allegation: "",
        comp_datetime: "",
      },
      documents: [],
    },
  });

  const nextStep = async () => {
    const fields = stepFields[step];
    const isValid = await methods.trigger(fields as any);

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 5));
    } else {
      if (step === 4 && methods.formState.errors) {
        toast.error("Please check your uploaded files for errors");
      }
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitClick = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      setShowConfirmModal(true);
    } else {
      toast.error("Please fix all validation errors before submitting");
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      const complainantData = data.complainant.map((comp) => {
        const fullAddress = [
          comp.address?.street,
          comp.address?.barangay,
          comp.address?.city,
          comp.address?.province,
        ]
          .filter(Boolean)
          .join(", ")
          .toUpperCase();

        return {
          cpnt_name: comp.cpnt_name,
          cpnt_gender: comp.genderInput || comp.cpnt_gender,
          cpnt_number: comp.cpnt_number,
          cpnt_age: comp.cpnt_age,
          cpnt_relation_to_respondent: comp.cpnt_relation_to_respondent,
          cpnt_address: fullAddress,
          rp_id: comp.rp_id || null,
        };
      });
      formData.append(
        "complainant",
        JSON.stringify(complainantData).toUpperCase()
      );

      const accusedData = data.accused.map((acc) => {
        const fullAddress = [
          acc.address?.street,
          acc.address?.barangay,
          acc.address?.city,
          acc.address?.province,
        ]
          .filter(Boolean)
          .join(", ")
          .toUpperCase();

        return {
          acsd_name: acc.acsd_name,
          acsd_age: acc.acsd_age,
          acsd_gender: acc.genderInput || acc.acsd_gender,
          acsd_description: acc.acsd_description,
          acsd_address: fullAddress,
          rp_id: acc.rp_id || null,
        };
      });
      formData.append(
        "accused",
        JSON.stringify(accusedData).toUpperCase()
      );

      formData.append(
        "comp_incident_type",
        data.incident.comp_incident_type.toUpperCase()
      );
      formData.append(
        "comp_allegation",
        data.incident.comp_allegation.toUpperCase()
      );
      formData.append(
        "comp_location",
        data.incident.comp_location.toUpperCase() ?? ""
      );

      const dateTimeString = data.incident.comp_datetime;
      formData.append("comp_datetime", dateTimeString);

      if (data.documents && data.documents.length > 0) {
        const uploadedFiles = data.documents.filter(
          (fileData: any) =>
            fileData.status === "uploaded" && fileData.publicUrl
        );

        if (uploadedFiles.length > 0) {
          const fileDataForBackend = uploadedFiles.map((fileData: any) => ({
            cf_filename: fileData.name,
            cf_size: fileData.size,
            cf_type: fileData.type || "document",
            cf_path: fileData.publicUrl,
            cf_storage_path: fileData.storagePath,
          }));

          formData.append(
            "complaint_files",
            JSON.stringify(fileDataForBackend)
          );
        }
      }

      const response = await postComplaint.mutateAsync(formData);

      if (response) {
        await handleSendAlert();

        const successMessage = response.comp_id
          ? `Complaint #${response.comp_id} submitted successfully`
          : "Complaint submitted successfully";

        toast.success(successMessage);

        methods.reset();
        setStep(1);
        setShowConfirmModal(false);

        setTimeout(() => {
          navigate("/complaint");
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAlert = async () => {
    try {
      await send({
        title: "Complaint Report Filed",
        message: "Your complaint has been submitted and is now being processed",
        recipient_ids: [user?.acc_id || ""],
        metadata: {
          action_url: "/complaint",
          sender_name: "Barangay System",
          sender_avatar: `${user?.profile_image}` || "",
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const confirmSubmit = () => {
    const formData = methods.getValues();
    onSubmit(formData);
  };

  const stepFields: Record<number, string[]> = {
    1: ["complainant"],
    2: ["accused"],
    3: [
      "incident.comp_location",
      "incident.comp_incident_type",
      "incident.comp_allegation",
      "incident.comp_datetime",
    ],
    4: ["documents"],
  };

  const steps = [
    {
      number: 1,
      title: "Complainant",
      description: "Nagrereklamo",
      icon: User,
    },
    { number: 2, title: "Respondent", description: "Isinasakdal", icon: Users },
    {
      number: 3,
      title: "Incident",
      description: "Detalye ng Reklamo",
      icon: MapPin,
    },
    {
      number: 4,
      title: "Review",
      description: "Confirm the accuracy of your complaint details",
      icon: Eye,
    },
  ];

  return (
    <LayoutWithBack
      title={"Blotter Form"}
      description="Ensure all complaint details are complete and accurate to facilitate proper action by the barangay."
    >
      {/* Progress Bar */}
      <ProgressBar steps={steps} currentStep={step} showDescription={true}  />

      {/* Form Content */}
      <FormProvider {...methods}>
        <div className="mb-8 mt-4 px-32">
          {step === 1 && <ComplainantInfo />}
          {step === 2 && <AccusedInfo />}
          {step === 3 && <IncidentInfo />}
          {step === 4 && <ReviewInfo />}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
          <div className="w-full sm:w-auto">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                className="w-full sm:w-auto flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white"
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {step < 4 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={nextStep}
                className="w-full sm:w-auto flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white"
                disabled={isSubmitting}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmitClick}
                className="w-full sm:w-auto flex items-center gap-2 text-darkGray"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Complaint
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </FormProvider>

      {/* Confirm Submit Dialog */}
      <DialogLayout
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="File a Report"
        description={
          <p className="text-left">
            You are about to submit your complaint report. Please review all the
            information carefully before proceeding.
          </p>
        }
        className="sm:max-w-md"
        mainContent={
          <>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notice:</p>
                <p>
                  Once submitted, your complaint will be officially filed and
                  processed. Make sure all details are accurate and complete.
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Filing Report...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" /> Confirm & Submit
                  </>
                )}
              </Button>
            </div>
          </>
        }
      />
    </LayoutWithBack>
  );
};
