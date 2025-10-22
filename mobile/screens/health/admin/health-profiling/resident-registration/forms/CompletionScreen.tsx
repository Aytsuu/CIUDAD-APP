import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { 
  CheckCircle, 
  Circle,
  CircleUserRound,
  UserRoundPlus,
  HousePlus,
  UsersRound,
  AlertCircle
} from "lucide-react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence 
} from 'react-native-reanimated';

interface CompletionScreenProps {
  completedSteps: number[];
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onNavigateToStep?: (stepId: number) => void;
}

const stepDetails = [
  { id: 1, label: "Account Setup", icon: CircleUserRound, required: true },
  { id: 2, label: "Personal Information", icon: UserRoundPlus, required: true },
  { id: 3, label: "Household Details", icon: HousePlus, required: false },
  { id: 4, label: "Family Information", icon: UsersRound, required: false },
];

export default function CompletionScreen({ 
  completedSteps, 
  canSubmit, 
  isSubmitting, 
  onSubmit,
  onNavigateToStep 
}: CompletionScreenProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (canSubmit) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05),
          withSpring(1)
        ),
        -1,
        true
      );
    }
  }, [canSubmit]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const StepStatusItem = ({ step }: { step: typeof stepDetails[0] }) => {
    const isCompleted = completedSteps.includes(step.id);
    const IconComponent = step.icon;

    return (
      <TouchableOpacity
        onPress={() => onNavigateToStep?.(step.id)}
        className="flex-row items-center mb-4 bg-white rounded-xl p-4 shadow-sm active:bg-gray-50"
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            isCompleted ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          {isCompleted ? (
            <CheckCircle size={24} color="white" />
          ) : (
            <Circle size={24} color="#9CA3AF" />
          )}
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className={`font-semibold ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
              {step.label}
            </Text>
            {step.required && (
              <View className="ml-2 bg-red-100 px-2 py-0.5 rounded">
                <Text className="text-red-600 text-xs font-semibold">Required</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500 mt-1">
            {isCompleted ? "Completed • Tap to edit" : "Not completed • Tap to complete"}
          </Text>
        </View>

        <IconComponent 
          size={20} 
          color={isCompleted ? "#10B981" : "#9CA3AF"} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
            canSubmit ? "bg-green-100" : "bg-blue-100"
          }`}>
            {canSubmit ? (
              <CheckCircle size={48} color="#10B981" />
            ) : (
              <AlertCircle size={48} color="#3B82F6" />
            )}
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            {canSubmit ? "Ready to Submit!" : "Almost There!"}
          </Text>
          
          <Text className="text-gray-600 text-center">
            {canSubmit 
              ? "Review your information and submit the registration."
              : "Complete the required sections to proceed with submission."
            }
          </Text>
        </View>

        {/* Completion Status */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Completion Status</Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-semibold">
                {completedSteps.length}/{stepDetails.length} Steps
              </Text>
            </View>
          </View>

          {/* Step Status List */}
          {stepDetails.map((step) => (
            <StepStatusItem key={step.id} step={step} />
          ))}
        </View>

        {/* Requirements Notice */}
        {!canSubmit && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <AlertCircle size={20} color="#F59E0B" className="mt-0.5 mr-3" />
              <View className="flex-1">
                <Text className="text-amber-900 font-semibold mb-1">
                  Missing Required Information
                </Text>
                <Text className="text-amber-700 text-sm">
                  Please complete at least the Account and Personal Information sections. 
                  You must also provide either Household or Family information.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Summary Info */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-900 font-semibold mb-2">What Happens Next?</Text>
          <Text className="text-blue-700 text-sm leading-5">
            {canSubmit 
              ? "Once you submit this registration, the resident profile will be created in the system. You'll be able to view and manage this resident's information from the records section."
              : "Complete the required sections above, then return here to submit the registration."
            }
          </Text>
        </View>

        {/* Submit Button */}
        {canSubmit && (
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitting}
              className={`rounded-xl py-4 items-center ${
                isSubmitting ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold ml-2">
                    Submitting Registration...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Submit Registration
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {!canSubmit && (
          <TouchableOpacity
            disabled
            className="bg-gray-300 rounded-xl py-4 items-center"
          >
            <Text className="text-gray-500 font-semibold">
              Complete Required Steps First
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
