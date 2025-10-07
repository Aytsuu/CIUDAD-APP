import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  type ComplaintFormData,
  complaintFormSchema,
} from "@/form-schema/complaint-schema";
import { ComplainantInfo } from "./complainant";
import { AccusedInfo } from "./accused";
import { IncidentInfo } from "./incident";
import { ProgressBar } from "@/components/progress-bar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  User,
  Users,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
// import { useNotifications } from "@/context/NotificationContext";
import { usePostComplaint } from "../api-operations/queries/complaintPostQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const postComplaint = usePostComplaint();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  // const { send } = useNotifications();
  const navigate = useNavigate();

  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      complainant: [
        {
          // type: "manual",
          rp_id: null,
          cpnt_name: "",
          cpnt_gender: "",
          cpnt_age: "",
          cpnt_relation_to_respondent: "",
          cpnt_number: "",
          cpnt_address: "",
        },
      ],
      accused: [
        {
          rp_id: null,
          acsd_name: "",
          acsd_age: "",
          acsd_address: "",
          acsd_gender: "",
          acsd_description: "",
        },
      ],
      incident: {
        location: "",
        type: "Other",
        description: "",
        date: "",
        time: "",
      },
      files: [],
    },
  });

  const nextStep = async () => {
    const fields = stepFields[step];
    const isValid = await methods.trigger(fields as any);

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    } else {
      if (step === 3 && methods.formState.errors) {
        toast.error("Please check your uploaded files for errors");
      }
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);

      // Create the payload object directly
      const payload = {
        complainant: data.complainant,
        accused: data.accused,
        comp_incident_type: data.incident.comp_incident_type,
        comp_allegation: data.incident.comp_allegation,
        comp_location: data.incident.comp_location,
        comp_datetime: data.incident.comp_datetime,
        files: data.files || [],
      };

      console.log("Payload to submit:", payload);

      // If you need to log files specifically
      if (payload.files.length > 0) {
        console.log("Files to upload:", payload.files);
        payload.files.forEach((fileItem: any, index: number) => {
          if (fileItem && fileItem.file) {
            console.log(
              `File ${index}:`,
              fileItem.file.name,
              fileItem.file.type,
              fileItem.file.size
            );
          } else {
            console.warn(`File ${index} is not a File object:`, fileItem);
          }
        });
      }

      const response = await postComplaint.mutateAsync(payload);

      if (response) {
        // await handleSendAlert();
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit complaint";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSendAlert = async () => {
  //   try {
  //     await send({
  //       title: "Complaint Report Filed",
  //       message: "Your complaint has been submitted and is now being processed",
  //       recipient_ids: [user?.acc_id || ""],
  //       metadata: {
  //         action_url: `complaint/${user?.acc_id}/`,
  //         sender_name: "Barangay System",
  //         sender_avatar: `${user?.profile_image}` || "",
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error sending notification:", error);
  //   }
  // };

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
  };

  const steps = [
    {
      number: 1,
      title: "Complainant",
      description: "Person filing",
      icon: User,
    },
    {
      number: 2,
      title: "Respondent",
      description: "Person accused",
      icon: Users,
    },
    {
      number: 3,
      title: "Incident",
      description: "Case details",
      icon: MapPin,
    },
  ];

  return (
    <LayoutWithBack
      title={"Blotter Form"}
      description="Ensure all complaint details are complete and accurate to facilitate proper action by the barangay."
    >
      <ProgressBar steps={steps} currentStep={step} showDescription={true} />

      <FormProvider {...methods}>
        <div className="mb-8 mt-4 px-32">
          {step === 1 && <ComplainantInfo />}
          {step === 2 && <AccusedInfo />}
          {step === 3 && (
            <IncidentInfo
              onSubmit={handleSubmitClick}
              isSubmitting={isSubmitting}
            />
          )}
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
            {step < 3 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={nextStep}
                className="w-full sm:w-auto flex items-center gap-2 text-darkGray hover:bg-blue-500 hover:text-white"
                disabled={isSubmitting}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </FormProvider>

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
