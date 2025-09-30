import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { X } from "@/lib/icons/X";
import { Check } from "@/lib/icons/Check";
import PageLayout from "@/screens/_PageLayout";
import { useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import React from 'react';
import { useProgressContext } from "@/contexts/ProgressContext";
import { Button } from "@/components/ui/button";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import { useAddPersonal, useAddRequest, useAddAddress, useAddPerAddress } from "../../queries/authPostQueries";
import { capitalizeAllFields } from "@/helpers/capitalize";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useToastContext } from "@/components/ui/toast";

const registrationSteps = [
  {
    id: 1,
    title: "Account Setup",
    description: "Create login credentials",
    route: "/registration/family/account-reg-new"
  },
  {
    id: 2,
    title: "Respondent Information",
    description: "Who is filling out this form?",
    route: "/registration/family/respondent"
  },
  {
    id: 3,
    title: "Father Information",
    description: "Who is the father of this family?",
    route: "/registration/family/father",
    optional: true,
    group: "parent"
  },
  {
    id: 4,
    title: "Mother Information",
    description: "Who is the mother of this family?",
    route: "/registration/family/mother",
    optional: true,
    group: "parent"
  },
  {
    id: 5,
    title: "Guardian Information",
    description: "Who is the guardian of this family?",
    route: "/registration/family/guardian",
    optional: true,
    group: "parent"
  },
  {
    id: 6,
    title: "Dependent Information",
    description: "Add family members & dependents",
    route: "/registration/family/dependent"
  },
  {
    id: 7,
    title: "Face & ID",
    description: "Scan ID card and face for verification",
    route: "/registration/family/scan"
  },
];

const StepItem = React.memo(({ 
  step, 
  isCompleted, 
  onPress 
} : { 
  step: Record<string, any>;
  isCompleted: boolean;
  onPress: () => void;
}) => {

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-4 p-4 rounded-xl border-2 ${
         isCompleted ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"}`}
      accessibilityLabel={`Step ${step.id}: ${step.title}`}
      accessibilityHint={"Tap to continue"}
    >
      <View className="flex-row items-center">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            isCompleted ? "bg-green-500" : "bg-gray-200"}`}
        >
          {isCompleted ? (
            <Check size={20} className="text-white" />
          ) : (
            <Text className="text-gray-600">{step.id}</Text>
          )}
        </View>

        <View className="flex-1">
          <Text className={`text-base font-semibold ${isCompleted ? "text-green-700" : "text-gray-900"}`}>
            {step.title}
            {step.optional && (
              <Text className="text-sm font-normal text-gray-500"> (Optional)</Text>
            )}
          </Text>
          <Text className={`text-sm mt-1 ${isCompleted ? "text-green-600": "text-gray-600"}`}>
            {step.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function FamilyRegisterNew() {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string>('');
  const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">("success");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const { toast } = useToastContext();
  const { getValues, reset } = useRegistrationFormContext();
  const { mutateAsync: addRequest } = useAddRequest();
  const { 
    currentStep, 
    completedSteps, 
    isStepCompleted, 
    resetProgress,
  } = useProgressContext();

  // Animated progress bar
  const progressWidth = useSharedValue(0);

  // Calculate required steps completed and total required steps
  const { requiredStepsCompleted, totalRequiredSteps } = React.useMemo(() => {
    const requiredSteps = registrationSteps.filter(step => !step.optional);
    const parentSteps = registrationSteps.filter(step => step.group === "parent");
    
    // Check if at least one parent step is completed
    const hasParentCompleted = parentSteps.some(step => isStepCompleted(step.id));
    
    // Count required steps completed
    const requiredCompleted = requiredSteps.filter(step => isStepCompleted(step.id)).length;
    
    // Total required steps = required steps + 1 (for at least one parent)
    const totalRequired = requiredSteps.length + 1;
    
    // Add 1 to completed count if at least one parent is completed
    const totalCompleted = requiredCompleted + (hasParentCompleted ? 1 : 0);
    
    return {
      requiredStepsCompleted: totalCompleted,
      totalRequiredSteps: totalRequired
    };
  }, [completedSteps, isStepCompleted]);

  React.useEffect(() => {
    const newProgress = (requiredStepsCompleted / totalRequiredSteps) * 100;
    progressWidth.value = withTiming(newProgress, { duration: 300 });
  }, [requiredStepsCompleted, totalRequiredSteps]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const handleClose = React.useCallback(async () => {
    router.replace("/(auth)");
    await resetProgress();
    reset();
  }, [resetProgress, router]);

  const handleStepPress = React.useCallback((step: Record<string, any>) => {
    if(step.id === 7 && !isStepCompleted(2)) {
      toast.error('Complete respondent information to proceed.');
      return;
    }
    router.push(step.route as any);
    
  }, [router]);

  const stepItems = React.useMemo(() => {
    return registrationSteps.map((step) => ({
      ...step,
      isCompleted: isStepCompleted(step.id),
      isCurrent: step.id === currentStep,
    }));
  }, [currentStep, isStepCompleted]);

  // Check if registration can be submitted
  const canSubmit = React.useMemo(() => {
    const requiredSteps = registrationSteps.filter(step => !step.optional);
    const parentSteps = registrationSteps.filter(step => step.group === "parent");
    
    const requiredCompleted = requiredSteps.every(step => isStepCompleted(step.id));
    const hasParentCompleted = parentSteps.some(step => isStepCompleted(step.id));
    
    return requiredCompleted && hasParentCompleted;
  }, [isStepCompleted]);

  const submit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setStatus('waiting');
    setShowFeedback(true);

    try {
      const { 
        accountFormSchema, 
        personalInfoSchema,   
        fatherInfoSchema,
        motherInfoSchema,
        guardianInfoSchema,
        dependentInfoSchema
      } = getValues();

      const {confirmPassword, ...account } = accountFormSchema
      const dependents = dependentInfoSchema.list

      const data = [
        fatherInfoSchema,
        motherInfoSchema,
        guardianInfoSchema,
        ...dependents
      ].map((info: any) => {
        const {role, ...per} = info;
        return JSON.stringify(per) === JSON.stringify(personalInfoSchema) ? 
          {
             per: {
              ...per,
              per_addresses: per.per_addresses.list,
              per_id: +per.per_id
            }, 
          
            role: role, 
            acc: account 
          } : { 
            per: {
              ...per,
              per_addresses: per.per_addresses.list,
              per_id: +per.per_id
            }, 
            role: role 
          }

      }).filter((info) => info.per.per_contact !== "")

      addRequest({
        comp: data
      }, {
        onSuccess: () => {
          setShowFeedback(false);
          setTimeout(() => {
            setStatus('success');
            setShowFeedback(true);
          }, 0);
        }
      })
    } catch (err) {
      setShowFeedback(false);
      setTimeout(() => {
        setStatus("failure");
        setShowFeedback(true);
        setIsSubmitting(false);
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  }

  const FeedbackContents: any = {
    success: (
      <View className="flex-1 justify-end">
        <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
          onPress={() => {
            setShowFeedback(false);  
            setTimeout(() => {
              setStatus('message')
              setFeedbackMessage("Your registration request has been submitted. Please go to the barangay to verify your account, and access verified exclusive features.")
              setShowFeedback(true);
            }, 0);
          }}
        >
          <Text className="text-white text-base font-semibold">
            Continue
          </Text>
        </Button>
      </View>
    ),
    failure: (
      <View className="flex-1 justify-end">
        <View className="flex-row gap-3">
          <Button variant={"outline"} className={`flex-1 rounded-xl native:h-[45px]`}
          >
            <Text className="text-gray-600 text-base font-semibold">
              Cancel
            </Text>
          </Button>
          <Button className={`bg-primaryBlue flex-1 rounded-xl native:h-[45px]`}
            onPress={() => {
              setShowFeedback(false)
              setTimeout(() => {
                submit();
              }, 0)
            }}
          >
            <Text className="text-white text-base font-semibold">
              Try Again
            </Text>
          </Button>
        </View>
      </View>
    ),
    message: (
      <View className="flex-1 justify-between mt-5">
        <Text className="text-base text-gray-600 text-center mb-8 leading-6 px-4 max-w-sm">
          {feedbackMessage}
        </Text>
        <Button className={`bg-primaryBlue rounded-xl native:h-[45px]`}
          onPress={() => {
            reset()
            router.replace('/(auth)/loginscreen')
          }}
        >
          <Text className="text-white text-base font-semibold">
            Continue
          </Text>
        </Button>
      </View>
    )
  }

  if (showFeedback) {
    return (
      <FeedbackScreen
        status={status}
        content={FeedbackContents[status]}
      />
    );
  }

  if (isSubmitting) {
    return
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Family Registration</Text>}
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
        className="flex-1 px-6"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Complete Your Registration
          </Text>
          <Text className="text-sm text-gray-600">
            {`${requiredStepsCompleted} of ${totalRequiredSteps} Required Step${totalRequiredSteps > 1 ? "s": ""} Completed`}
          </Text>
          
          <View className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <Animated.View
              className="h-full bg-blue-500 rounded-full"
              style={animatedProgressStyle}
            />
          </View>
        </View>

        <View className="mb-6">
          {stepItems.map((stepItem) => (
            <StepItem
              key={stepItem.id}
              step={stepItem}
              isCompleted={stepItem.isCompleted}
              onPress={() => handleStepPress(stepItem as any)}
            />
          ))}
        </View>

        <View className="bg-blue-50 p-4 rounded-lg mb-4">
          <Text className="text-sm text-blue-800 font-medium mb-1">
            Need Help?
          </Text>
          <Text className="text-sm text-blue-700">
            Complete each required step and at least one parent information (Father, Mother, or Guardian). Optional steps can be completed later.
          </Text>
        </View>

        <View className="py-6 bg-white border-t border-gray-100">
          <ConfirmationModal 
            trigger={
              <Button 
                className={`native:h-[56px] w-full rounded-xl shadow-lg ${
                  canSubmit ? 'bg-primaryBlue' : 'bg-gray-300'
                }`}
                disabled={!canSubmit}
              >
                <Text className={`font-PoppinsSemiBold text-[16px] ${
                  canSubmit ? 'text-white' : 'text-gray-500'
                }`}>
                  Continue
                </Text>
              </Button>
            }

            title="Confirm Submission"
            description="Please double check the information you provided before confirming."
            onPress={submit}
          />
          {/* Terms and Privacy */}
          <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-4 leading-4">
            By continuing, you agree to our <Text className="text-primaryBlue font-PoppinsMedium">Terms of Service</Text>{" "}
            and <Text className="text-primaryBlue font-PoppinsMedium">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
      <LoadingModal 
        visible={isSubmitting}
      />
    </PageLayout>
  );
}