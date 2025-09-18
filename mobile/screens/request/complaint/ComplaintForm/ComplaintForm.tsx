import React, { useState, memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  complaintFormSchema,
  type ComplaintFormData,
} from "@/form-schema/complaint-schema";
import ScreenLayout from "@/screens/_ScreenLayout";
import { Review } from "./Review";
import { Incident } from "./IncidentDetails";
import { Accused } from "./Accused";
import { Complainant } from "./Complainant";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { usePostComplaint } from "../api-operations/queries/ComplaintPostQueries";

const STEPS = [
  { id: 1, title: "", subtitle: "Personal details" },
  { id: 2, title: "", subtitle: "Person(s) involved" },
  { id: 3, title: "", subtitle: "What happened" },
  { id: 4, title: "", subtitle: "Confirm details" },
];

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

// Memoized ProgressBar component
const ProgressBar: React.FC<ProgressBarProps> = memo(({
  currentStep,
  totalSteps,
}) => {
  const steps = useMemo(() => 
    Array.from({ length: totalSteps }, (_, index) => index + 1), 
    [totalSteps]
  );

  return (
    <View className="px-6 py-4 bg-white border-b border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-gray-600">
          {currentStep} of {totalSteps}
        </Text>
        <Text className="text-sm font-medium text-blue-600">
          {STEPS[currentStep - 1]?.subtitle}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="flex-row items-center space-x-2">
        {steps.map((stepNumber) => {
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isCompleted || isCurrent ? "text-white" : "text-gray-500"
                  }`}
                >
                  {stepNumber}
                </Text>
              </View>

              {stepNumber < totalSteps && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
});

ProgressBar.displayName = 'ProgressBar';

// Memoized navigation buttons
const NavigationButtons = memo(({ 
  currentStep, 
  isValid, 
  onPrevious, 
  onNext 
}: { 
  currentStep: number; 
  isValid: boolean; 
  onPrevious: () => void; 
  onNext: () => void; 
}) => {
  if (currentStep >= 4) return null;

  return (
    <View className="px-4 py-3 bg-white border-t border-gray-100">
      <View className="flex-row space-x-3">
        {currentStep > 1 && (
          <TouchableOpacity
            onPress={onPrevious}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 flex-row items-center justify-center"
          >
            <ChevronLeft size={20} className="text-gray-600 mr-2" />
            <Text className="text-gray-700 font-medium">Previous</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onNext}
          disabled={!isValid}
          className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
            currentStep === 1 ? "w-full" : ""
          } ${isValid ? "bg-blue-600" : "bg-gray-300"}`}
        >
          <Text className={`font-medium mr-2 ${isValid ? "text-white" : "text-gray-500"}`}>
            {currentStep === 3 ? "Review" : "Next"}
          </Text>
          <ChevronRight size={20} className={isValid ? "text-white" : "text-gray-500"} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

NavigationButtons.displayName = 'NavigationButtons';

// Memoized left action component
const LeftAction = memo(({ onBack }: { onBack: () => void }) => (
  <TouchableOpacity
    onPress={onBack}
    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
  >
    <ChevronLeft size={24} className="text-gray-700" />
  </TouchableOpacity>
));

LeftAction.displayName = 'LeftAction';

// Memoized header content
const HeaderContent = memo(() => (
  <Text className="text-[13px]">Blotter Form</Text>
));

HeaderContent.displayName = 'HeaderContent';

// Memoized right action component
const RightAction = memo(() => (
  <View className="w-10 h-10"/>
));

RightAction.displayName = 'RightAction';

const ComplaintReportProcess = memo(() => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    mode: "onChange",
    defaultValues: {
      complainant: [
        {
          cpnt_name: "",
          cpnt_gender: "Male",
          cpnt_age: "",
          cpnt_relation_to_respondent: "",
          cpnt_number: "",
          cpnt_address: "",
          rp_id: null,
        }
      ],
      accused: [
        {
          acsd_name: "",
          acsd_age: "",
          acsd_gender: "Male",
          acsd_description: "",
          acsd_address: "",
          rp_id: null,
        }
      ],
      incident: {
        comp_location: "",
        comp_incident_type: "Theft",
        comp_allegation: "",
        comp_datetime: "",
        comp_datetime_time: "",
      },
      documents: [],
    },
  });

  const { trigger, getValues, formState: { isValid } } = form;
  const postComplaint = usePostComplaint();

  // Memoized validation function
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await trigger("complainant");
      case 2:
        return await trigger("accused");
      case 3:
        return await trigger("incident");
      case 4:
        return await trigger();
      default:
        return true;
    }
  }, [currentStep, trigger]);

  // Memoized navigation handlers
  const handleNext = useCallback(async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert("Validation Error", "Please fill in all required fields correctly.");
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Memoized submit handler
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const values = getValues();
      
      const formData = new FormData();
      
      // Combine date and time for backend
      const combinedDateTime = `${values.incident.comp_datetime} ${values.incident.comp_datetime_time}`;
      
      // Add complaint data (matching your backend expectations)
      const incidentType = values.incident.comp_incident_type === 'Other' 
        ? values.incident.comp_other_type 
        : values.incident.comp_incident_type;
      
      formData.append("comp_incident_type", incidentType || "");
      formData.append("comp_location", values.incident.comp_location);
      formData.append("comp_allegation", values.incident.comp_allegation);
      formData.append("comp_datetime", combinedDateTime);
      
      // Transform complainants to match backend expectations
      const complainantsForBackend = values.complainant.map(c => ({
        cpnt_name: c.cpnt_name,
        cpnt_gender: c.cpnt_gender === 'Other' && c.cpnt_custom_gender ? c.cpnt_custom_gender : c.cpnt_gender,
        cpnt_age: c.cpnt_age,
        cpnt_number: c.cpnt_number,
        cpnt_relation_to_respondent: c.cpnt_relation_to_respondent,
        cpnt_address: c.cpnt_address,
        rp_id: c.rp_id && c.rp_id !== "" ? c.rp_id : null,
      }));
      
      // Transform accused to match backend expectations  
      const accusedForBackend = values.accused.map(a => ({
        acsd_name: a.acsd_name,
        acsd_age: a.acsd_age,
        acsd_gender: a.acsd_gender === 'Other' && a.acsd_custom_gender ? a.acsd_custom_gender : a.acsd_gender,
        acsd_description: a.acsd_description,
        acsd_address: a.acsd_address,
        rp_id: a.rp_id && a.rp_id !== "" ? a.rp_id : null,
      }));
      
      // Add complainants and accused as JSON strings (matching backend expectations)
      formData.append("complainant", JSON.stringify(complainantsForBackend));
      formData.append("accused_persons", JSON.stringify(accusedForBackend));
      
      // Add files if any
      if (values.documents && values.documents.length > 0) {
        values.documents.forEach((file, index) => {
          formData.append("complaint_files", {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        });
      }
      
      postComplaint.mutate(formData, {
        onSuccess: () => {
          setIsSubmitting(false);
          Alert.alert("Success", "Complaint submitted successfully");
          router.back();
        },
        onError: (error) => {
          setIsSubmitting(false);
          Alert.alert("Error", "Failed to submit complaint. Please try again.");
          console.error("Submission error:", error);
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Submission error:", error);
    }
  }, [getValues, postComplaint, router]);

  // Memoized step content renderer
  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <Complainant form={form} />;
      case 2:
        return <Accused form={form} />;
      case 3:
        return <Incident form={form} />;
      case 4:
        return (
          <Review
            form={form}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  }, [currentStep, form, handleSubmit, isSubmitting]);

  // Memoized router back function
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ScreenLayout
      customLeftAction={<LeftAction onBack={handleBack} />}
      headerBetweenAction={<HeaderContent />}
      customRightAction={<RightAction />}
    >
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

      {/* Step Content */}
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">{renderStepContent}</View>
      </ScrollView>

      {/* Navigation Buttons */}
      <NavigationButtons
        currentStep={currentStep}
        isValid={isValid}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </ScreenLayout>
  );
});

ComplaintReportProcess.displayName = 'ComplaintReportProcess';

export default ComplaintReportProcess;