import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { Incident } from "./IncidentDetails";
import { Accused } from "./Accused";
import { Complainant } from "./Complainant";
import { ChevronLeft, Info } from "lucide-react-native";
import { usePostComplaint } from "../api-operations/queries/ComplaintPostQueries";
import { useFormContext } from "react-hook-form";
import { ComplaintFormData } from "@/form-schema/complaint-schema";
import { useAuth } from "@/contexts/AuthContext";
import { BlurView } from "expo-blur";

const STEPS = [
  { id: 1, title: "Complainant" },
  { id: 2, title: "Respondent" },
  { id: 3, title: "Incident" },
];

export default function ComplaintReportProcess() {
  const router = useRouter();
  const { user } = useAuth();
  const isStaff = !!user?.staff;

  // Start at step 1 for staff, step 2 for non-staff
  const [currentStep, setCurrentStep] = useState<number>(isStaff ? 1 : 2);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const postComplaint = usePostComplaint();
  const methods = useFormContext<ComplaintFormData>();

  React.useEffect(() => {
    setModalVisibility(true);
  }, []);

  const stepFields: Record<number, string[]> = {
    1: ["complainant"],
    2: ["accused"],
    3: ["incident"],
  };

  const nextStep = async () => {
    const fields = stepFields[currentStep];
    const isValid = await methods.trigger(fields as any);

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
    }
  };

  const prevStep = () => {
    // For non-staff users, don't allow going back to step 1
    const minStep = isStaff ? 1 : 2;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
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
        staff: user?.staff?.staff_id,
      };
      console.log("Complaint Data: ", JSON.stringify(payload, null, 2));
      const response = await postComplaint.mutateAsync(payload);

      if (response) {
        const message = response.comp_id
          ? `Complaint #${response.comp_id} submitted successfully`
          : "Complaint submitted successfully";

        Alert.alert("Success", message);
        methods.reset();
        setCurrentStep(isStaff ? 1 : 2);
        setTimeout(() => router.back(), 1000);
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
        return <Complainant onNext={nextStep} isSubmitting={isSubmitting} />;
      case 2:
        return (
          <Accused
            onNext={nextStep}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      case 3:
        return (
          <Incident
            onSubmit={confirmSubmit}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">Blotter Form</Text>}
      rightAction={
        <TouchableOpacity
          onPress={() => setModalVisibility(true)}
          className="w-10 h-10 items-center justify-center"
        >
          <Info size={20} color="#4B5563" />
        </TouchableOpacity>
      }
    >
      <View className="p-4 flex-1">{renderStepContent()}</View>

      {/* Modal for Blotter Info */}
      <Modal transparent visible={modalVisibility} animationType="fade">
        <BlurView intensity={50} className="absolute inset-0" />
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-11/12 max-h-[80%] shadow-lg shadow-black/30">
            <Text className="text-lg font-bold mb-2">
              Blotter Filing Process
            </Text>
            <ScrollView className="mb-4">
              <Text className="text-sm text-gray-700">
                1. Fill in the complainant details accurately.{"\n\n"}
                2. Provide information about the respondent.{"\n\n"}
                3. Enter the incident details including location, date, and
                allegations.{"\n\n"}
                4. Upload any supporting files if available.{"\n\n"}
                5. Review the information and submit the complaint.{"\n\n"}
                Once submitted, the complaint will be processed by the barangay
                staff.
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setModalVisibility(false)}
              className="mt-2 bg-gray-200 rounded-md py-2 px-4 items-center"
            >
              <Text className="text-gray-800 font-medium">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
}
