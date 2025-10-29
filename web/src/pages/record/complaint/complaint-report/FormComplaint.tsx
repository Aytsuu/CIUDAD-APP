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
import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import {
  FileText,
  AlertTriangle,
  User,
  Users,
  MapPin,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePostComplaint } from "../api-operations/queries/complaintPostQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const postComplaint = usePostComplaint();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      complainant: [
        {
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
        comp_location: "",
        comp_incident_type: "Other",
        comp_allegation: "",
        comp_datetime: "",
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

      const response = await postComplaint.mutateAsync(payload);

      if (response) {
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
      {/* Progress Indicator */}
      <div className="px-4 sm:px-6 lg:px-8">
        <ProgressWithIcon
          progress={step}
          steps={steps.map((s, i) => ({
            id: s.number,
            label: s.title,
            minProgress: i + 1,
            icon: s.icon,
            onClick: (id) => setStep(id),
          }))}
        />
      </div>

      {/* Form Content */}
      <FormProvider {...methods}>
        <div className="mb-8 mt-4 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-64">
          {step === 1 && (
            <ComplainantInfo 
              onNext={nextStep}
              isSubmitting={isSubmitting}
            />
          )}
          {step === 2 && (
            <AccusedInfo 
              onNext={nextStep}
              onPrevious={prevStep}
              isSubmitting={isSubmitting}
            />
          )}
          {step === 3 && (
            <IncidentInfo
              onSubmit={handleSubmitClick}
              onPrevious={prevStep}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </FormProvider>

      {/* Footer Info */}
      <div className="flex items-center justify-center pb-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-center gap-x-2 max-w-md text-center">
          <Info size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <p className="text-gray-700 text-xs sm:text-sm text-left sm:text-center">
            All details provided are securely stored and handled with confidentiality to ensure the privacy and protection of all parties involved.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <DialogLayout
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="File a Report"
        description={
          <p className="text-left text-sm sm:text-base">
            You are about to submit your complaint report. Please review all the
            information carefully before proceeding.
          </p>
        }
        className="sm:max-w-md mx-4"
        mainContent={
          <>
            <div className="flex items-start gap-3 p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notice:</p>
                <p>
                  Once submitted, your complaint will be officially filed and
                  processed. Make sure all details are accurate and complete.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
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