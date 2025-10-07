import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  type ComplaintFormData,
  complaintFormSchema,
} from "@/form-schema/complaint-schema";
import { ReviewInfo } from "./Review";
import { ComplainantInfo } from "./Complainant";
import { AccusedInfo } from "./Accused";
import { IncidentInfo } from "./Incident";
import { ProgressBar } from "@/components/progress-bar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Info,
} from "lucide-react";
import { BsChevronLeft } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { usePostComplaint } from "../api-operations/queries/complaintPostQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

export const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const postComplaint = usePostComplaint();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(() => {
    return localStorage.getItem("hideIntroDialog") !== "true";
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const { user } = useAuth();
  const { send } = useNotifications();
  const navigate = useNavigate();

  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      complainant: [],
      accused: [],
      incident: {
        location: "",
        type: "Other",
        description: "",
        date: "",
        time: "",
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

      const complainantData = data.complainant?.map((comp) => {
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
          name: comp.fullName,
          gender: comp.gender,
          contactNumber: comp.contactNumber,
          age: comp.age,
          relation_to_respondent: comp.relation_to_respondent,
          address: fullAddress,
        };
      });
      formData.append("complainant", JSON.stringify(complainantData));

      const accusedData = data.accused?.map((acc) => {
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
          alias: acc.alias,
          age: acc.age,
          gender: acc.gender,
          description: acc.description,
          address: fullAddress,
        };
      });
      formData.append("accused_persons", JSON.stringify(accusedData));

      formData.append("comp_incident_type", data.incident?.type as any);
      formData.append("comp_allegation", data.incident?.description as any);
      formData.append("comp_location", data.incident?.location ?? "");

      // DateTime - backend expects string format
      const dateTimeString = `${data.incident?.date}T${data.incident?.time}`;
      const dateTime = new Date(dateTimeString);
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }

      formData.append("datetime", dateTimeString);

      // Handle uploaded files
      if (data.documents && data.documents.length > 0) {
        const uploadedFiles = data.documents.filter(
          (fileData: any) =>
            fileData.status === "uploaded" && fileData.publicUrl
        );

        if (uploadedFiles.length > 0) {
          const fileDataForBackend = uploadedFiles.map((fileData: any) => ({
            name: fileData.name,
            size: fileData.size,
            type: fileData.type,
            publicUrl: fileData.publicUrl,
            storagePath: fileData.storagePath,
          }));

          formData.append("uploaded_files", JSON.stringify(fileDataForBackend));
        }
      }

      console.log("Submitting complaint with data:", {
        complainant: complainantData,
        accused_persons: accusedData,
        comp_incident_type: data.incident?.type,
        comp_allegation: data.incident?.description,
        comp_location: data.incident?.location,
        comp_datetime: dateTimeString,
      });

      const response = await postComplaint.mutateAsync(formData);

      if (response) {
        await handleSendAlert();
      }

      toast.success("Complaint submitted successfully");
      setTimeout(() => {
        navigate("/complaint");
      }, 1000);
      setStep(1);
      setShowConfirmModal(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit complaint";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissIntro = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideIntroDialog", "true");
    }
    setShowIntroModal(false);
  };

  const showIntroManually = () => {
    setShowIntroModal(true);
  };

  const handleSendAlert = async () => {
    await send({
      title: "Complaint Report Filed",
      message: "Your request has been processed",
      recipient_ids: [user?.acc_id || ""],
      metadata: {
        action_url: "/home",
        sender_name: "System",
        sender_avatar: `${user?.profile_image}` || "",
      },
    });
  };

  const confirmSubmit = () => {
    const formData = methods.getValues();
    onSubmit(formData);
  };

  const stepFields: Record<number, string[]> = {
    1: ["complainant"],
    2: ["accused"],
    3: ["incident"],
    4: ["review"],
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
    <div className="max-h-screen">
      <div className="flex-1">
        <Card className="overflow-hidden h-full border-none p-0 m-0">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Button
                className="text-black p-2 flex items-center justify-center"
                variant="outline"
              >
                <Link to="/complaint">
                  <BsChevronLeft />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-x-2">
                  <h2 className="text-2xl font-bold text-darkBlue2">
                    Barangay Complaint Form
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={showIntroManually}
                    className="p-0 h-auto w-auto 
                                  rounded-full
                               text-blue-500 
                               hover:text-white 
                               hover:bg-blue-500 
                               transition-colors duration-200"
                  >
                    <Info />
                  </Button>
                </div>
                <p className="text-black/70 font-normal text-sm">
                  Ensure all complaint details are complete and accurate to
                  facilitate proper action by the barangay.
                </p>
              </div>
            </div>
          </CardHeader>

          <ProgressBar
            steps={steps}
            currentStep={step}
            showDescription={true}
          />

          <CardContent className="mt-4">
            <FormProvider {...methods}>
              <div className="mb-8">
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
          </CardContent>
        </Card>
      </div>

      {/* Intro Dialog */}
      <DialogLayout
        isOpen={showIntroModal}
        onOpenChange={setShowIntroModal}
        title="Barangay Complaint Report"
        description={
          <p className="text-left">
            This form is used to submit barangay blotter reports. Please review
            the process carefully before proceeding.
          </p>
        }
        className="sm:max-w-lg"
        mainContent={
          <div className="space-y-4 text-sm text-gray-700">
            <div className="mt-4 p-2 mx-4 rounded-md border border-blue-200 bg-blue-50 text-blue-900 flex items-start gap-3">
              <FileText className="w-5 h-5 mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  Confidentiality Acknowledgment
                </p>
                <p className="text-sm mt-1">
                  All information provided in this report will be treated with
                  the utmost confidentiality and will only be used for official
                  and lawful purposes.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="dontShowAgain"
                  className="text-sm text-gray-700"
                >
                  Don't show this again
                </label>
              </div>
              <Button onClick={handleDismissIntro}>Continue</Button>
            </div>
          </div>
        }
      />

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
    </div>
  );
};
