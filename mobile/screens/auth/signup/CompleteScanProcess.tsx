import React from "react";
import PageLayout from "@/screens/_PageLayout";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { router } from "expo-router";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { X } from "@/lib/icons/X";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { SafeAreaView } from "react-native-safe-area-context";
import ScanID from "./ScanID";
import TakeAPhoto from "./TakeAPhoto";
import { CheckCircle } from "@/lib/icons/CheckCircle";

export default function CompleteScanProcess({params} : {params: Record<string, any>}) {
  // INITIALIZATION
  const [phase, setPhase] = React.useState<number>(1);
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
  const { reset } = useRegistrationFormContext();

  // HANDLERS
  const next = () => {
    setPhase((prev) => prev + 1);
    setCurrentStep((prev) => prev + 1)
  };

  const complete = () => {
    setCurrentStep(0);
    setIsCompleted(true);
  }

  const handleClose = React.useCallback(async () => {
    router.replace("/(auth)");
    reset();
  }, [router]);

  const submit = () => {
    if(!isCompleted) {
      setCurrentStep(phase);
      return;
    }

    params?.submit();
  }

  // RENDER
  const FirstPhase = (
    <View className="flex-1">
      <ScanID
        params={{
          next: next
        }}
      />
      <TouchableOpacity
        className="absolute top-10 right-5 mt-4 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
        accessibilityLabel="Exit registration"
        onPress={() => setCurrentStep(0)}
      >
        <X size={20} className="text-black" />
      </TouchableOpacity>
    </View>
  );

  const SecondPhase = (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <TakeAPhoto
          params={{
            complete: complete
          }}
        />
        <TouchableOpacity
          className="absolute right-5 mt-4 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          accessibilityLabel="Exit registration"
          onPress={() => setCurrentStep(0)}
        > 
          <X size={20} className="text-black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>

  );

  const StepIndicator = ({ stepNumber, title, isActive, isCompleted, isLast } : {
    stepNumber: number;
    title: string;
    isActive: boolean;
    isCompleted: boolean;
    isLast: boolean;
  }) => (
    <View className="flex-row items-start">
      <View className="items-center mr-4">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${
          isCompleted 
            ? 'bg-green-500' 
            : isActive 
              ? 'bg-blue-500' 
              : 'bg-gray-200'
        }`}>
          {isCompleted ? (
            <CheckCircle size={20} className="text-white" />
          ) : (
            <Text className={`font-semibold ${
              isActive ? 'text-white' : 'text-gray-600'
            }`}>
              {stepNumber}
            </Text>
          )}
        </View>
        {!isLast && (
          <View className={`w-1 h-10 mt-2 mb-2 rounded-full ${
            isCompleted ? 'bg-green-500' : 'bg-gray-200'
          }`} />
        )}
      </View>
      <View className="flex-1 pt-2">
        <Text className={`font-medium ${
          isActive ? 'text-gray-900' : isCompleted ? 'text-green-700' : 'text-gray-600'
        }`}>
          {title}
        </Text>
        {isActive && (
          <Text className="text-sm text-gray-500 mt-1">
            {stepNumber === 1 ? 'Scan your government-issued ID' : 'Take a clear photo of your face'}
          </Text>
        )}
      </View>
    </View>
  );

  const InitialRender = (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Face & ID</Text>}
      rightAction={
        <ConfirmationModal
          title="Exit Registration"
          description="Are you sure you want to exit? Your progress will be lost."
          trigger={
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              accessibilityLabel="Exit registration"
            >
              <X size={20} className="text-gray-700" />
            </TouchableOpacity>
          }
          variant="destructive"
          onPress={handleClose}
        />
      }
    >
      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-1">
          {/* Header Section */}
          <View className="mb-8">
            <Text className="text-gray-600 text-base leading-6">
              Complete these 2 simple steps to verify your identity and comply with regulations.
            </Text>
          </View>

          {/* Progress Steps */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Verification Steps
            </Text>
            <View className="p-4">
              <StepIndicator
                stepNumber={1}
                title="Scan Your ID"
                isActive={true}
                isCompleted={phase === 2}
                isLast={false}
              />
              <StepIndicator
                stepNumber={2}
                title="Take a Selfie"
                isActive={phase === 2}
                isCompleted={isCompleted}
                isLast={true}
              />
            </View>
          </View>

          {/* Security Notice */}
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-900 font-medium">
                Your Privacy is Protected
              </Text>
            </View>
            <Text className="text-gray-600 text-sm leading-5">
              Your personal information is encrypted and stored securely. We only use this data for identity verification purposes.
            </Text>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={submit}
            className={`${isCompleted ? 'bg-primaryBlue ' : 'bg-gray-300'} rounded-xl py-4 px-6 mt-8 shadow-sm`}
            accessibilityLabel="Start identity verification"
          >
            <Text className={`${isCompleted ? "text-white" : "text-gray-800"} font-semibold text-center text-lg`}>
              {!isCompleted ? 
                phase === 1 ? 'Start Verification' : 'Continue' 
                : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PageLayout>
  );

  switch(currentStep) {
    case 1:
      return FirstPhase;
    case 2:
      return SecondPhase;
    default:
      return InitialRender;
  }
}