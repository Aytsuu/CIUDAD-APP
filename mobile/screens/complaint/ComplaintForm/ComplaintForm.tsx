import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintFormSchema, type ComplaintFormData } from '@/form-schema/complaint-schema';
import { Review } from './Review';
import { Incident } from './IncidentDetails';
import { Accused } from './Accused';
import { Complainant } from './Complainant';
import { ChevronLeft ,ChevronRight } from "lucide-react-native";
import { usePostComplaint } from '../queries/ComplaintPostQueries';

const STEPS = [
  { id: 1, title: 'Complainant Information', subtitle: 'Personal details' },
  { id: 2, title: 'Accused Information', subtitle: 'Person(s) involved' },
  { id: 3, title: 'Incident Details', subtitle: 'What happened' },
  { id: 4, title: 'Review & Submit', subtitle: 'Confirm details' },
];

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

export default function ComplaintReportProcess() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    mode: 'onChange',
    defaultValues: {
      complainant: [],
      accused: [],
      incident: {
        location: '',
        type: 'Theft',
        description: '',
        date: '',
        time: '',
      },
      documents: [],
    },
  });

    const { trigger, getValues } = form;
  const postComplaint = usePostComplaint();

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await trigger('complainant');
      case 2:
        return await trigger('accused');
      case 3:
        return await trigger('incident');
      case 4:
        return await trigger();
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    
    if (isStepValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const values = getValues();
    const formData = new FormData();

    // Match Django backend field names
    formData.append("incident_type", values.incident.type);
    formData.append(
      "datetime",
      `${values.incident.date} ${values.incident.time}`
    );
    formData.append("location", values.incident.location);
    formData.append("allegation", values.incident.description);

    formData.append("complainant", JSON.stringify(values.complainant));
    formData.append("accused", JSON.stringify(values.accused));
    formData.append("uploaded_files", JSON.stringify(values.documents));

    postComplaint.mutate(formData, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Complainant form={form} />;
      case 2:
        return <Accused form={form} />;
      case 3:
        return <Incident form={form} />;
      case 4:
        return <Review form={form} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  const canProceed = async () => {
    return await validateCurrentStep();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => currentStep === 1 ? router.back() : handlePrevious()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
        
        <Text className="text-lg font-semibold text-gray-900">
          Complaint Report
        </Text>
        
        <View className="w-10 h-10" />
      </View>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />

      {/* Step Content */}
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <View className="px-4 py-3 bg-white border-t border-gray-100">
          <View className="flex-row space-x-3">
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={handlePrevious}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 flex-row items-center justify-center"
              >
                <ChevronLeft size={20} className="text-gray-600 mr-2" />
                <Text className="text-gray-700 font-medium">Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={handleNext}
              className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
                currentStep === 1 ? 'w-full' : ''
              } bg-blue-600`}
            >
              <Text className="text-white font-medium mr-2">
                {currentStep === 3 ? 'Review' : 'Next'}
              </Text>
              <ChevronRight size={20} className="text-white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
