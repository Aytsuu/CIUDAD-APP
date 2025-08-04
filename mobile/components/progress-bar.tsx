import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
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
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {stepNumber}
                </Text>
              </View>
              
              {stepNumber < totalSteps && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      
      {/* Step Title */}
      <Text className="text-lg font-semibold text-gray-900 mt-3">
        {STEPS[currentStep - 1]?.title}
      </Text>
    </View>
  );
};