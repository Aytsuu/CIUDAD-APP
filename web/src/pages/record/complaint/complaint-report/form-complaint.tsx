import { useState, useEffect } from "react";
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
import { ProgressBar } from "@/components/progress-bar";
import { toast } from "sonner";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card/card";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  FileText,
  AlertTriangle,
  Search,
  User,
  Users,
  MapPin,
  Paperclip,
  Eye,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { BsChevronLeft } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useDebounce } from "@/hooks/use-debounce";
import {
  searchComplainants,
  searchAccused,
} from "../restful-api/complaint-api";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

export const ComplaintForm = () => {
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [showIntroModal, setShowIntroModal] = useState(() => {
    return localStorage.getItem("hideIntroDialog") !== "true";
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const { user } = useAuth();
  const { send } = useNotifications();
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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

  // Search effect
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        let results;
        if (step === 1) {
          results = await searchComplainants(debouncedSearchQuery);
        } else if (step === 2) {
          results = await searchAccused(debouncedSearchQuery);
        }
        setSearchResults(results || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, step]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
  };

  const handleResultClick = (result: any) => {
    if (step === 1) {
      // Auto-fill complainant fields
      methods.setValue(`complainant.0.fullName`, result.cpnt_name || "");
      methods.setValue(`complainant.0.gender`, result.cpnt_gender || "");
      methods.setValue(`complainant.0.age`, result.cpnt_age || "");
      methods.setValue(`complainant.0.contactNumber`, result.cpnt_number || "");
      methods.setValue(
        `complainant.0.relation_to_respondent`,
        result.cpnt_relation_to_respondent || ""
      );
      // Address fields
      methods.setValue(
        `complainant.0.address.province`,
        result.add?.add_province || ""
      );
      methods.setValue(
        `complainant.0.address.city`,
        result.add?.add_city || ""
      );
      methods.setValue(
        `complainant.0.address.barangay`,
        result.add?.add_barangay || ""
      );
      methods.setValue(
        `complainant.0.address.street`,
        result.add?.add_street || ""
      );
      methods.setValue(
        `complainant.0.address.sitio`,
        result.add?.sitio?.sitio_name || result.add?.add_external_sitio || ""
      );
    } else if (step === 2) {
      // Auto-fill accused fields
      methods.setValue(`accused.0.alias`, result.acsd_name || "");
      methods.setValue(`accused.0.age`, result.acsd_age || "");
      methods.setValue(`accused.0.gender`, result.acsd_gender || "");
      methods.setValue(`accused.0.description`, result.acsd_description || "");
      // Address fields
      methods.setValue(
        `accused.0.address.province`,
        result.add?.add_province || ""
      );
      methods.setValue(`accused.0.address.city`, result.add?.add_city || "");
      methods.setValue(
        `accused.0.address.barangay`,
        result.add?.add_barangay || ""
      );
      methods.setValue(
        `accused.0.address.street`,
        result.add?.add_street || ""
      );
      methods.setValue(
        `accused.0.address.sitio`,
        result.add?.sitio?.sitio_name || result.add?.add_external_sitio || ""
      );
    }

    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

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

      const complainantData = data.complainant.map((comp) => ({
        name: comp.fullName,
        gender: comp.gender,
        contactNumber: comp.contactNumber,
        age: comp.age,
        relation_to_respondent: comp.relation_to_respondent,
        address: {
          province: comp.address.province,
          city: comp.address.city,
          barangay: comp.address.barangay,
          street: comp.address.street,
          sitio: comp.address.sitio || "",
        },
      }));
      formData.append("complainant", JSON.stringify(complainantData));

      const accusedData = data.accused.map((data) => ({
        alias: `${data.alias} `,
        age: data.age,
        gender: data.gender,
        description: data.description,
        address: {
          province: data.address.province,
          city: data.address.city,
          barangay: data.address.barangay,
          street: data.address.street,
          sitio: data.address.sitio || "",
        },
      }));
      formData.append("accused", JSON.stringify(accusedData));
      formData.append("incident_type", data.incident.type);
      formData.append("allegation", data.incident.description);
      formData.append("location", data?.incident?.location ?? "");

      const dateTimeString = `${data.incident.date}T${data.incident.time}`;
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

      await api.post("complaint/create/", formData);
      await handleSendAlert();

      toast.success("Complaint submitted successfully");
      // methods.reset();
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

  // Fixed dialog handlers
  const handleDismissIntro = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideIntroDialog", "true");
    }
    setShowIntroModal(false);
  };

  // Manual trigger function to show dialog
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
    4: ["documents"],
  };

  const steps = [
    {
      number: 1,
      title: "Complainant",
      description: "(Nagrereklamo)",
      icon: User,
    },
    {
      number: 2,
      title: "Respondent",
      description: "(Isinasakdal)",
      icon: Users,
    },
    {
      number: 3,
      title: "Incident",
      description: "(Detalye ng Reklamo)",
      icon: MapPin,
    },
    {
      number: 4,
      title: "Documents",
      description: "Supplemental materials to support your complaint",
      icon: Paperclip,
    },
    {
      number: 5,
      title: "Review",
      description: "Confirm the accuracy of your complaint details",
      icon: Eye,
    },
  ];

  return (
    <div className="max-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        <Card className="overflow-hidden h-full">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                className="text-black p-2 flex items-center justify-center"
                variant="outline"
              >
                <Link to="/complaint">
                  <BsChevronLeft />
                </Link>
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-darkBlue2">
                  Barangay Complaint Form
                </h2>
                <p className="text-black/70 font-normal text-base italic">
                  (Pormularyo ng Reklamo)
                </p>
              </div>
            </div>
          </CardHeader>

          <ProgressBar
            steps={steps}
            currentStep={step}
            showDescription={false}
          />

          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-row items-center justify-between px-6 py-4">
              <div className="flex items-center gap-x-2">
                <div>
                  <h2 className="text-2xl font-semibold text-darkBlue2">
                    {steps[step - 1].title}
                  </h2>
                  <p className="text-black/70 font-normal text-base italic mt-1">
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
                    placeholder={step === 1 ? "Search..." : "Search..."}
                    className="pl-10 pr-4 h-10 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all duration-200 rounded-lg w-full"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchResults(true)}
                  />

                  {showSearchResults &&
                    (searchResults.length > 0 || isSearching) && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                        {isSearching ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            Searching...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No results found
                          </div>
                        ) : (
                          searchResults.map((result) => (
                            <div
                              key={result.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => handleResultClick(result)}
                            >
                              {step === 1 ? (
                                <>
                                  <div className="font-medium">
                                    {result.cpnt_name}
                                  </div>
                                  <div className="text-gray-500">
                                    {result.add?.add_barangay},{" "}
                                    {result.add?.add_city}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-medium">
                                    {result.acsd_name}
                                  </div>
                                  <div className="text-gray-500">
                                    {result.acsd_description}
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>

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
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={showIntroManually}
            className="text-blue-600 hover:text-blue-800"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </Button>
        </div>
      </div>

      {/* Fixed Intro Dialog */}
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
              <Button onClick={() => setShowIntroModal(false)}>Continue</Button>
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
                    <FileText className="w-4 h-4 mr-2" />
                    Confirm & Submit
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
