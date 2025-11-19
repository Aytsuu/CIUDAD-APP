import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import { 
  AccountForm, 
  PersonalForm, 
  HouseholdForm, 
  FamilyForm, 
  CompletionScreen 
} from "./forms";
import api from "@/api/api";
import { useToastContext } from "@/components/ui/toast";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { useAuth } from "@/contexts/AuthContext";
import { MultiStepProgressBar } from "@/components/healthcomponents/multi-step-progress-bar";

type RegistrationForm = z.infer<typeof CompleteResidentProfilingSchema>;

const registrationSteps = [
  {
    id: 1,
    label: "Account",
    title: "Account Setup",

    icon: CircleUserRound,
  },
  {
    id: 2,
    label: "Resident",
    title: "Personal Information",

    icon: UserRoundPlus,
  },
  {
    id: 3,
    label: "Household",
    title: "Household Details",

    icon: HousePlus,
  },
  {
    id: 4,
    label: "Family",
    title: "Family Information",

    icon: UsersRound,
  },
];

// Convert registration steps to MultiStepProgressBar format
const progressSteps = registrationSteps.map(step => ({
  id: step.id,
  label: step.label,
 
}));

export default function ResidentRegistration() {
  const router = useRouter();
  const { toast } = useToastContext();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = React.useState<number>(3); // Changed to 0-based for the progress bar
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(CompleteResidentProfilingSchema),
    defaultValues: generateDefaultValues(CompleteResidentProfilingSchema),
    mode: "onChange"
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
      setCurrentStep(stepId); // Progress bar uses 0-based index
    } else {
      setCurrentStep(registrationSteps.length); // Completion screen (one step beyond)
    }
  }, []);

  const handleStepPress = React.useCallback((stepIndex: number) => {
    // Allow navigation to any step that has been reached before
    // or to any step from the completion screen
    if (stepIndex <= currentStep || currentStep === registrationSteps.length) {
      setCurrentStep(stepIndex);
    }
  }, [currentStep]);

  const canSubmit = React.useMemo(() => {
    // Only Personal Information (step 1) and Family Information (step 3) are required (0-based indexing)
    const hasPersonalInfo = completedSteps.has(1);
    const hasFamilyInfo = completedSteps.has(3);
    
    return hasPersonalInfo && hasFamilyInfo;
  }, [completedSteps]);

  // Helper function to check if object is empty
  const isEmpty = (obj: Record<string, any>) =>
    Object.values(obj).every(val => val === "" || val === null || val === undefined || (Array.isArray(val) && val.length === 0));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = form.getValues();
      const { 
        personalSchema,
        accountSchema,
        houseSchema,
        livingSoloSchema,
        familySchema
      } = values;

      // Determine which sections are complete
      const noAccount = !completedSteps.has(0); // 0-based
      const noHouse = !completedSteps.has(2);
      const notLivingSolo = isEmpty(livingSoloSchema);
      const noFamily = isEmpty(familySchema);
      const noBusiness = true; // Business is not implemented in mobile yet

      // Prepare personal data (remove per_id as it's for updates only)
      const { per_id, per_addresses, ...personalRest } = personalSchema;

      // Capitalize only the personal info fields, not addresses
      const capitalizedPersonal = capitalizeAllFields(personalRest);
      
      // Format addresses - extract just the list array, ensure all required fields exist
      const formattedAddresses = (per_addresses?.list || []).map(addr => ({
        add_province: addr.add_province || "",
        add_city: addr.add_city || "",
        add_barangay: addr.add_barangay || "",
        add_street: addr.add_street || "",
        sitio: addr.sitio || "",
        add_external_sitio: addr.add_external_sitio || "", // Ensure this field exists
      }));
      
      const formattedPersonal = {
        ...capitalizedPersonal,
        per_addresses: formattedAddresses
      };

      // Prepare account data (remove confirmPassword)
      const { confirmPassword, ...account } = accountSchema;

      // Prepare the request payload matching web implementation
      const payload: any = {
        personal: formattedPersonal,
      };

      // Add optional sections based on completion
      if (!noAccount) {
        payload.account = account;
      }

      if (!noHouse && houseSchema.list && houseSchema.list.length > 0) {
        payload.houses = houseSchema.list;
      }

      if (!notLivingSolo && livingSoloSchema.householdNo) {
        // Extract HH-ID from the householdNo
        let householdNo = livingSoloSchema.householdNo;
        
        if (householdNo.includes(" ")) {
          householdNo = householdNo.split(" ")[0];
        }
        
        const { id, ...livingSoloRest } = livingSoloSchema;
        
        payload.livingSolo = {
          ...livingSoloRest,
          householdNo,
        };
      }

      if (!noFamily && familySchema.familyId) {
        payload.family = familySchema;
      }

      // Add staff ID if available from auth context
      if (user?.staff?.staff_id) {
        payload.staff = user.staff.staff_id;
      }

      console.log("Submitting registration payload:", JSON.stringify(payload, null, 2));

      // Call the API endpoint
      const response = await api.post("profiling/complete/registration/", payload);

      console.log("Registration response:", response.data);

      // Show success toast
      toast.success("Registration completed successfully!", 4000);

      // Reset form and state
      form.reset();
      setCompletedSteps(new Set());
      setCurrentStep(0);

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error: any) {
      console.error("Registration failed:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      
      // Extract error message
      let errorMessage = "Failed to register. Please try again.";
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : JSON.stringify(error.response.data.error);
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 0: // Account
        return <AccountForm form={form} onNext={handleNext} />;
      case 1: // Resident
        return <PersonalForm form={form} onNext={handleNext} />;
      case 2: // House
        return <HouseholdForm form={form} onNext={handleNext} />;
      case 3: // Family
        return <FamilyForm form={form} onNext={handleNext} />;
      case 4: // Completion (one step beyond the last form step)
        return (
          <CompletionScreen
            completedSteps={Array.from(completedSteps)}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onNavigateToStep={handleStepPress}
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
        {/* MultiStep Progress Bar */}
        {currentStep <= registrationSteps.length && (
          <View className="bg-white px-5 pb-5 border-b border-gray-200">
            <MultiStepProgressBar
              steps={progressSteps}
              currentStep={currentStep}
              onStepClick={handleStepPress}
              variant="numbers"
              size="sm"
              
            />

            {/* Step Counter (Centered) */}
            <View className="mt-4 items-center">
              <Text className="text-xs font-semibold text-gray-800">
                Step {currentStep + 1} of {registrationSteps.length}
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