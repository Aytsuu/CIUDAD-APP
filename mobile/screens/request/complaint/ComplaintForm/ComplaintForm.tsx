import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  complaintFormSchema,
  type ComplaintFormData,
} from "@/form-schema/complaint-schema";
import ScreenLayout from "@/screens/_ScreenLayout";
import { Incident } from "./IncidentDetails";
import { Accused } from "./Accused";
import { Complainant } from "./Complainant";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { usePostComplaint } from "../api-operations/queries/ComplaintPostQueries";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

const STEPS = [
  { id: 1, title: "Complainant", subtitle: "Personal details" },
  { id: 2, title: "Respondent", subtitle: "Person(s) involved" },
  { id: 3, title: "Incident", subtitle: "What happened" },
];

const ComplaintReportProcess = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const postComplaint = usePostComplaint();

  const methods = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    mode: "onChange",
    defaultValues: {
      complainant: [], 
      accused: [
        {
          acsd_name: "",
          acsd_age: "",
          acsd_gender: "Male",
          acsd_description: "",
          acsd_address: "",
          acsd_custom_gender: "",
          rp_id: null,
        },
      ],
      incident: {
        comp_location: "",
        comp_incident_type: "Theft",
        comp_allegation: "",
        comp_datetime: "",
        comp_datetime_time: "",
        comp_other_type: "",
      },
      files: [],
    },
  });

  const stepFields: Record<number, string[]> = {
    1: ["complainant"],
    2: ["accused"],
    3: [
      "incident.comp_location",
      "incident.comp_incident_type",
      "incident.comp_allegation",
      "incident.comp_datetime",
      "incident.comp_datetime_time",
    ],
  };

  const nextStep = async () => {
    const fields = stepFields[currentStep];
    const isValid = await methods.trigger(fields as any);

    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly."
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // Combine date and time
      const combinedDateTime = `${data.incident.comp_datetime} ${data.incident.comp_datetime_time}`;

      // Incident type (handle "Other")
      const incidentType =
        data.incident.comp_incident_type === "Other"
          ? data.incident.comp_other_type
          : data.incident.comp_incident_type;

      formData.append("comp_incident_type", incidentType || "");
      formData.append("comp_location", data.incident.comp_location);
      formData.append("comp_allegation", data.incident.comp_allegation);
      formData.append("comp_datetime", combinedDateTime);

      // Complainants
      const complainantsForBackend = data.complainant.map((c) => ({
        cpnt_name: c.cpnt_name || "",
        cpnt_gender:
          c.cpnt_gender === "Other" && c.cpnt_custom_gender
            ? c.cpnt_custom_gender
            : c.cpnt_gender || "",
        cpnt_age: c.cpnt_age || "",
        cpnt_number: c.cpnt_number || "",
        cpnt_relation_to_respondent: c.cpnt_relation_to_respondent,
        cpnt_address: c.cpnt_address || "",
        rp_id: c.rp_id && c.rp_id !== "" ? c.rp_id : null,
      }));

      // Accused
      const accusedForBackend = data.accused.map((a) => ({
        acsd_name: a.acsd_name,
        acsd_age: a.acsd_age,
        acsd_gender:
          a.acsd_gender === "Other" && a.acsd_custom_gender
            ? a.acsd_custom_gender
            : a.acsd_gender,
        acsd_description: a.acsd_description,
        acsd_address: a.acsd_address,
        rp_id: a.rp_id && a.rp_id !== "" ? a.rp_id : null,
      }));

      formData.append("complainant", JSON.stringify(complainantsForBackend));
      formData.append("accused_persons", JSON.stringify(accusedForBackend));

      // Documents
      // if (data.files && data.files.length > 0) {
      //   data.files.forEach((file) => {
      //     formData.append("complaint_files", {
      //       uri: file.uri,
      //       name: file.name,
      //       type: file.type,
      //     } as any);
      //   });
      // }

      const response = await postComplaint.mutateAsync(formData);

      if (response) {
        const successMessage = response.comp_id
          ? `Complaint #${response.comp_id} submitted successfully`
          : "Complaint submitted successfully";

        Alert.alert("Success", successMessage);
        methods.reset();
        setCurrentStep(1);

        setTimeout(() => {
          router.back();
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      Alert.alert("Error", "Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    const formData = methods.getValues();
    onSubmit(formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Complainant form={methods} />;
      case 2:
        return <Accused form={methods} />;
      case 3:
        return <Incident form={methods} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === 3;
  const {
    formState: { isValid },
  } = methods;

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Blotter Form</Text>}
      customRightAction={<View className="w-10 h-10" />}
    >
      {/* Step Content */}
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">{renderStepContent()}</View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="px-4 py-3 bg-white border-t border-gray-100">
        <View className="flex-row space-x-3">
          {currentStep > 1 && (
            <TouchableOpacity
              onPress={prevStep}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 flex-row items-center justify-center"
            >
              <ChevronLeft size={20} className="text-gray-600 mr-2" />
              <Text className="text-gray-700 font-medium">Previous</Text>
            </TouchableOpacity>
          )}

          {isLastStep ? (
            <ConfirmationModal
              trigger={
                <TouchableOpacity
                  disabled={!isValid || isSubmitting}
                  className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                    isValid && !isSubmitting ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <Text
                    className={`font-medium mr-2 ${
                      isValid && !isSubmitting ? "text-white" : "text-gray-500"
                    }`}
                  >
                    Submit Complaint
                  </Text>
                </TouchableOpacity>
              }
              title="File a Report"
              description="You are about to submit your complaint report. Please review all the information carefully before proceeding."
              actionLabel={
                isSubmitting ? "Filing Report..." : "Confirm & Submit"
              }
              onPress={confirmSubmit}
              loading={isSubmitting}
            />
          ) : (
            <TouchableOpacity
              onPress={nextStep}
              disabled={!isValid || isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                isValid && !isSubmitting ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <Text
                className={`font-medium mr-2 ${
                  isValid && !isSubmitting ? "text-white" : "text-gray-500"
                }`}
              >
                Next
              </Text>
              <ChevronRight
                size={20}
                className={
                  isValid && !isSubmitting ? "text-white" : "text-gray-500"
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenLayout>
  );
};

export default ComplaintReportProcess;
