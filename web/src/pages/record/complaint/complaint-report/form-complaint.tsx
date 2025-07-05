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
import { DocumentUploaded } from "./document";
import { toast } from "sonner";
import { submitComplaint } from "../restful-api/complaint-api";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BsChevronLeft } from "react-icons/bs";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog";
import { useAuth } from "@/context/AuthContext";

export const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth()
  
  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
    },
  });

  const nextStep = async () => {
    const fields = stepFields[step];

    console.log("Current form values:", methods.getValues());
    console.log("Current form errors:", methods.formState.errors);

    const isValid = await methods.trigger(fields as any);
    console.log("Step validation result:", isValid);

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 5));
    } else {
      // Show specific validation errors
      const errors = methods.formState.errors;
      console.log("Validation errors:", errors);

      // Show toast with validation errors
      if (step === 4 && errors.documents) {
        toast.error("Please check your uploaded files for errors");
      }
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitClick = async () => {
    const isValid = await methods.trigger();
    console.log("Final validation result:", isValid);
    console.log("Final form values:", methods.getValues());
    console.log("Final form errors:", methods.formState.errors);

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

      const complainantData = {
        name: `${data.complainant.firstName} ${data.complainant.lastName}`,
        address: {
          province: data.complainant.address.province,
          city: data.complainant.address.city,
          barangay: data.complainant.address.barangay,
          street: data.complainant.address.street,
          sitio: data.complainant.address.sitio || "",
        },
      };

      if (
        !complainantData.name ||
        !complainantData.address.province ||
        !complainantData.address.city ||
        !complainantData.address.barangay ||
        !complainantData.address.street
      ) {
        throw new Error("Missing required complainant information");
      }

      formData.append("complainant", JSON.stringify(complainantData));

      const accusedData = data.accused.map((acc) => ({
        name: `${acc.firstName} ${acc.lastName}`,
        address: {
          province: acc.address.province,
          city: acc.address.city,
          barangay: acc.address.barangay,
          street: acc.address.street,
          sitio: acc.address.sitio || "",
        },
      }));

      for (const acc of accusedData) {
        if (
          !acc.name ||
          !acc.address.province ||
          !acc.address.city ||
          !acc.address.barangay ||
          !acc.address.street
        ) {
          throw new Error("Missing required accused information");
        }
      }

      formData.append("accused", JSON.stringify(accusedData));

      if (
        !data.incident.type ||
        !data.incident.description ||
        !data.incident.date ||
        !data.incident.time
      ) {
        throw new Error("Missing required incident information");
      }

      formData.append("incident_type", data.incident.type);
      formData.append("allegation", data.incident.description);

      const dateTimeString = `${data.incident.date}T${data.incident.time}`;
      const dateTime = new Date(dateTimeString);
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }

      formData.append("datetime", dateTimeString);
      formData.append("category", "Normal");

      // Handle uploaded files - send the Supabase URLs instead of files
      if (data.documents && data.documents.length > 0) {
        console.log(`Processing ${data.documents.length} uploaded files`);

        // Filter only successfully uploaded files
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

          // Send file metadata as JSON instead of actual files
          formData.append("uploaded_files", JSON.stringify(fileDataForBackend));
        }

        console.log(
          `Sending ${uploadedFiles.length} uploaded file URLs to backend`
        );
      }

      // Debug: Log what we're sending
      console.log("Sending form data:");
      console.log(
        "complainant:",
        JSON.parse(formData.get("complainant") as string)
      );
      console.log("accused:", JSON.parse(formData.get("accused") as string));
      console.log("incident_type:", formData.get("incident_type"));
      console.log("allegation:", formData.get("allegation"));
      console.log("datetime:", formData.get("datetime"));
      console.log("category:", formData.get("category"));

      const uploadedFilesData = formData.get("uploaded_files");
      if (uploadedFilesData) {
        console.log("uploaded_files:", JSON.parse(uploadedFilesData as string));
      }
      console.log("Created by: ", user?.username)
      await submitComplaint(formData);
      toast.success("Complaint submitted successfully");
      methods.reset();
      setStep(1);
      setShowConfirmModal(false);
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit complaint";
      toast.error(errorMessage);
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
    3: ["incident"],
    4: ["documents"], // Make sure this matches your schema field name
  };

  const steps = [
    {
      number: 1,
      title: "Complainant",
      description: "Your contact and identification detail",
    },
    {
      number: 2,
      title: "Respondent",
      description: "Details of the individual/party involved",
    },
    {
      number: 3,
      title: "Incident",
      description: "Specifics about when and where it happened",
    },
    {
      number: 4,
      title: "Documents",
      description: "Supplemental materials to support your complaint",
    },
    {
      number: 5,
      title: "Review",
      description: "Confirm the accuracy of your complaint details",
    },
  ];

  return (
    <div className="max-h-screen bg-gradient-to-br from-gray-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                className="text-black p-2 flex items-center justify-center"
                variant="outline"
              >
                <Link to="/blotter-record">
                  <BsChevronLeft />
                </Link>
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-darkBlue2">
                  {steps[step - 1].title}
                </h2>
                <p className="text-black/70 font-normal text-base">
                  {steps[step - 1].description}
                </p>
              </div>
            </div>

            {(step === 1 || step === 2) && (
              <div className="relative w-96">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder={
                    step === 1
                      ? "Search registered resident"
                      : "Search respondent details"
                  }
                  className="pl-10 pr-4 h-10 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all duration-200 rounded-lg w-full"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <FormProvider {...methods}>
              <div>
                <div className="mb-8">
                  {step === 1 && <ComplainantInfo />}
                  {step === 2 && <AccusedInfo />}
                  {step === 3 && <IncidentInfo />}
                  {step === 4 && <DocumentUploaded />}
                  {step === 5 && <ReviewInfo />}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
                  <div className="w-full sm:w-auto">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={prevStep}
                        className="w-full sm:w-auto flex items-center gap-2 text-darkGray"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    {step < 5 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={nextStep}
                        className="w-full sm:w-auto flex items-center gap-2 text-darkGray"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
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
                            <Send className="w-4 h-4" />
                            Submit Complaint
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                File a Report
              </DialogTitle>
              <DialogDescription className="text-left">
                You are about to submit your complaint report. Please review all
                the information carefully before proceeding.
              </DialogDescription>
            </DialogHeader>

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

            <DialogFooter className="flex gap-2 sm:gap-0">
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
                    <FileText className="w-4 h-4 mr-2" />
                    Confirm & Submit
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
