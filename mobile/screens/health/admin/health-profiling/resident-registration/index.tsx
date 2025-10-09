import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageLayout from "@/screens/_PageLayout";
import { 
  ChevronLeft, 
  Check, 
  CircleUserRound,
  UserRoundPlus,
  HousePlus,
  UsersRound
} from "lucide-react-native";
import { CompleteResidentProfilingSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Button } from "@/components/ui/button";
import { 
  AccountForm, 
  PersonalForm, 
  HouseholdForm, 
  FamilyForm, 
  CompletionScreen 
} from "./forms";

type RegistrationForm = z.infer<typeof CompleteResidentProfilingSchema>;

const registrationSteps = [
  {
    id: 1,
    label: "Account",
    title: "Account Setup",
    description: "Create login credentials",
    icon: CircleUserRound,
  },
  {
    id: 2,
    label: "Resident",
    title: "Personal Information",
    description: "Basic resident details",
    icon: UserRoundPlus,
  },
  {
    id: 3,
    label: "House",
    title: "Household Details",
    description: "Housing information",
    icon: HousePlus,
  },
  {
    id: 4,
    label: "Family",
    title: "Family Information",
    description: "Family composition",
    icon: UsersRound,
  },
];

export default function ResidentRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(CompleteResidentProfilingSchema),
    defaultValues: generateDefaultValues(CompleteResidentProfilingSchema),
    mode: "onChange"
  });

  // Animated progress bar
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    const newProgress = (currentStep / registrationSteps.length) * 100;
    progressWidth.value = withTiming(newProgress, { duration: 300 });
  }, [currentStep]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const handleNext = React.useCallback((stepId: number, isComplete: boolean) => {
    if (isComplete) {
      setCompletedSteps((prev) => new Set([...prev, stepId]));
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
    }
    
    // Move to next step or completion screen
    if (stepId < registrationSteps.length) {
      setCurrentStep(stepId + 1);
    } else {
      setCurrentStep(registrationSteps.length + 1); // Completion screen
    }
  }, []);

  const handleStepPress = React.useCallback((stepId: number) => {
    // Allow navigation to completed steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  }, [currentStep]);

  const canSubmit = React.useMemo(() => {
    // At minimum: Account, Resident, and either House or Family must be completed
    const hasAccount = completedSteps.has(1);
    const hasResident = completedSteps.has(2);
    const hasHouseOrFamily = completedSteps.has(3) || completedSteps.has(4);
    
    return hasAccount && hasResident && hasHouseOrFamily;
  }, [completedSteps]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      console.log("Form values:", values);
      
      // TODO: Implement API call to submit registration
      // await api.post("profiling/complete/registration/", values);
      
      // Success - navigate back or show success message
      setTimeout(() => {
        setIsSubmitting(false);
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({ step }: { step: typeof registrationSteps[0] }) => {
    const isCompleted = completedSteps.has(step.id);
    const isCurrent = currentStep === step.id;
    const IconComponent = step.icon;

    return (
      <TouchableOpacity
        onPress={() => handleStepPress(step.id)}
        disabled={step.id > currentStep}
        className="flex-1"
      >
        <View className="items-center">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
              isCompleted
                ? "bg-green-500"
                : isCurrent
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          >
            {isCompleted ? (
              <Check size={20} color="white" />
            ) : (
              <IconComponent 
                size={20} 
                color={isCurrent ? "white" : "#9CA3AF"} 
              />
            )}
          </View>
          <Text
            className={`text-xs text-center ${
              isCompleted || isCurrent ? "text-gray-900 font-semibold" : "text-gray-500"
            }`}
          >
            {step.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return <AccountForm form={form} onNext={handleNext} />;
      case 2:
        return <PersonalForm form={form} onNext={handleNext} />;
      case 3:
        return <HouseholdForm form={form} onNext={handleNext} />;
      case 4:
        return <FamilyForm form={form} onNext={handleNext} />;
      case 5:
        return (
          <CompletionScreen
            completedSteps={Array.from(completedSteps)}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
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
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="items-center">
          <Text className="text-gray-900 text-base font-semibold">
            Resident Registration
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* Progress Bar and Step Indicators */}
        {currentStep <= registrationSteps.length && (
          <View className="bg-white px-5 pt-4 pb-5 border-b border-gray-200">
            {/* Animated Progress Bar */}
            <View className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <Animated.View 
                style={[
                  animatedProgressStyle,
                  { height: '100%', backgroundColor: '#3B82F6', borderRadius: 9999 }
                ]}
              />
            </View>

            {/* Step Indicators */}
            <View className="flex-row justify-between items-center mb-3">
              {registrationSteps.map((step) => (
                <StepIndicator key={step.id} step={step} />
              ))}
            </View>

            {/* Current Step Title */}
            <View className="mt-2">
              <Text className="text-lg font-bold text-gray-900">
                {registrationSteps[currentStep - 1]?.title}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {registrationSteps[currentStep - 1]?.description}
              </Text>
            </View>
          </View>
        )}

        {/* Form Content */}
        <View className="flex-1">
          {renderCurrentForm()}
        </View>
      </View>
    </PageLayout>
  );
}
