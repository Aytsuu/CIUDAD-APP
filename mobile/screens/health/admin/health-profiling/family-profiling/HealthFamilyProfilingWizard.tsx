import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { healthFamilyProfilingSchema, HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { DemographicStep } from './steps/DemographicStep';
import { ParentsStep } from './steps/ParentsStep';
import { DependentsStep } from './steps/DependentsStep';
import { EnvironmentalStep } from './steps/EnvironmentalStep';
import { HealthRecordsStep } from './steps/HealthRecordsStep';
import { SurveyStep } from './steps/SurveyStep';
import { submitEnvironmentalForm, createNCD, createTBSurveilance, submitSurveyIdentification } from '@/api/health-family-profiling-api';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const STEPS = [
  { id: 1, title: 'Demographics', component: DemographicStep },
  { id: 2, title: 'Parents', component: ParentsStep },
  { id: 3, title: 'Dependents', component: DependentsStep },
  { id: 4, title: 'Environmental', component: EnvironmentalStep },
  { id: 5, title: 'Health Records', component: HealthRecordsStep },
  { id: 6, title: 'Survey', component: SurveyStep },
];

export default function HealthFamilyProfilingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const form = useForm<HealthFamilyProfilingFormData>({
    resolver: zodResolver(healthFamilyProfilingSchema),
    mode: 'onBlur',
    defaultValues: {
      demographicInfo: {
        householdNo: '',
        building: '',
        indigenous: '',
      },
      householdHead: {},
      respondentInfo: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', dateOfBirth: '', status: '', religion: '', edAttainment: '', contact: '' },
      motherInfo: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', dateOfBirth: '', status: '', religion: '', edAttainment: '', contact: '' },
      fatherInfo: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', dateOfBirth: '', status: '', religion: '', edAttainment: '', contact: '' },
      guardInfo: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', dateOfBirth: '', status: '', religion: '', edAttainment: '', contact: '' },
      dependentsInfo: { list: [], new: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', dateOfBirth: '', sex: '' } },
      environmentalForm: { waterSupply: '', facilityType: '', toiletFacilityType: '', wasteManagement: '' },
      ncdRecords: { list: [], new: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', sex: '', dateOfBirth: '', contact: '' } },
      tbRecords: { list: [], new: { id: '', lastName: '', firstName: '', middleName: '', suffix: '', sex: '', dateOfBirth: '', contact: '' } },
      surveyForm: { filledBy: '', informant: '', checkedBy: '', date: '', signature: '' },
    },
  });

  const staffId = user?.staff?.staff_id || user?.acc_id || '1';

  // Environmental submission mutation
  const submitEnvironmentalMutation = useMutation({
    mutationFn: async (data: any) => {
      const householdId = form.getValues('demographicInfo.householdNo');
      
      const environmentalPayload = {
        hh: householdId,
        water_supply: {
          type: data.waterSupply,
          conn_type: 'Direct', // Default
          desc: '',
        },
        sanitary_facility: {
          type: data.facilityType,
          desc: data.facilityType === 'Sanitary' ? data.sanitaryFacilityType : data.unsanitaryFacilityType,
          toilet_type: data.toiletFacilityType,
        },
        solid_waste: {
          desposal_type: data.wasteManagement,
          desc: data.wasteManagementOthers || '',
        },
      };

      console.log('Submitting environmental data:', environmentalPayload);
      return await submitEnvironmentalForm(environmentalPayload);
    },
  });

  // NCD/TB submission mutations
  const submitHealthRecordsMutation = useMutation({
    mutationFn: async () => {
      const ncdRecords = form.getValues('ncdRecords.list');
      const tbRecords = form.getValues('tbRecords.list');

      // Submit NCD records
      for (const ncd of ncdRecords) {
        if (ncd.ncdFormSchema) {
          await createNCD({
            ncd_riskclass_age: ncd.ncdFormSchema.riskClassAgeGroup || null,
            ncd_comorbidities: ncd.ncdFormSchema.comorbidities === 'Others' 
              ? ncd.ncdFormSchema.comorbiditiesOthers 
              : ncd.ncdFormSchema.comorbidities,
            ncd_lifestyle_risk: ncd.ncdFormSchema.lifestyleRisk === 'Others'
              ? ncd.ncdFormSchema.lifestyleRiskOthers
              : ncd.ncdFormSchema.lifestyleRisk,
            ncd_maintenance_status: ncd.ncdFormSchema.inMaintenance || null,
            rp: ncd.id.split(' ')[0],
          });
        }
      }

      // Submit TB records
      for (const tb of tbRecords) {
        if (tb.tbSurveilanceSchema) {
          await createTBSurveilance({
            tb_meds_source: tb.tbSurveilanceSchema.srcAntiTBmeds === 'Others'
              ? tb.tbSurveilanceSchema.srcAntiTBmedsOthers
              : tb.tbSurveilanceSchema.srcAntiTBmeds,
            tb_days_taking_meds: parseInt(tb.tbSurveilanceSchema.noOfDaysTakingMeds || '0'),
            tb_status: tb.tbSurveilanceSchema.tbStatus || null,
            rp: tb.id.split(' ')[0],
          });
        }
      }
    },
  });

  // Survey submission mutation
  const submitSurveyMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!familyId) throw new Error('Family ID not found');

      const payload = {
        si_filled_by: data.filledBy,
        si_informant: data.informant,
        si_checked_by: data.checkedBy,
        si_date: data.date,
        si_signature: data.signature,
        fam: familyId,
      };

      console.log('Submitting survey:', payload);
      return await submitSurveyIdentification(payload);
    },
    onSuccess: () => {
      Alert.alert(
        'Success',
        'Health Family Profiling completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Survey submission error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to submit survey');
    },
  });

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger('demographicInfo');
        if (isValid) {
          const hhId = form.getValues('demographicInfo.householdNo');
          setHouseholdId(hhId);
        }
        break;
      case 2:
        isValid = await form.trigger(['respondentInfo']);
        break;
      case 3:
        // Will be handled by DependentsStep mutation
        return;
      case 4:
        isValid = await form.trigger('environmentalForm');
        if (isValid) {
          const envData = form.getValues('environmentalForm');
          await submitEnvironmentalMutation.mutateAsync(envData);
        }
        break;
      case 5:
        // Health records are optional, just validate and submit
        await submitHealthRecordsMutation.mutateAsync();
        isValid = true;
        break;
      case 6:
        isValid = await form.trigger('surveyForm');
        if (isValid) {
          const surveyData = form.getValues('surveyForm');
          await submitSurveyMutation.mutateAsync(surveyData);
          return;
        }
        break;
    }

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleFamilyCreated = (famId: string) => {
    console.log('Family created, ID:', famId);
    setFamilyId(famId);
    setCurrentStep(4); // Move to environmental step
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const isLoading = submitEnvironmentalMutation.isPending || 
                    submitHealthRecordsMutation.isPending || 
                    submitSurveyMutation.isPending;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Progress Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-gray-900">
            Step {currentStep} of {STEPS.length}
          </Text>
          <Text className="text-xs text-gray-600">
            {STEPS[currentStep - 1].title}
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </View>
      </View>

      {/* Step Content */}
      <View className="flex-1">
        {currentStep === 1 && <DemographicStep form={form} />}
        {currentStep === 2 && <ParentsStep form={form} />}
        {currentStep === 3 && <DependentsStep form={form} onFamilyCreated={handleFamilyCreated} staffId={staffId} />}
        {currentStep === 4 && <EnvironmentalStep form={form} />}
        {currentStep === 5 && <HealthRecordsStep form={form} familyId={familyId} />}
        {currentStep === 6 && <SurveyStep form={form} />}
      </View>

      {/* Navigation Buttons */}
      {currentStep !== 3 && (
        <View className="bg-white px-4 py-3 border-t border-gray-200 flex-row gap-3">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 bg-gray-200 rounded-lg p-4 flex-row items-center justify-center"
            disabled={isLoading}
          >
            <ChevronLeft size={20} color="#374151" />
            <Text className="text-gray-700 font-semibold ml-1">
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            className={`flex-1 rounded-lg p-4 flex-row items-center justify-center ${
              isLoading ? 'bg-blue-400' : currentStep === STEPS.length ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-semibold mr-1">
                  {currentStep === STEPS.length ? 'Submit' : 'Next'}
                </Text>
                {currentStep === STEPS.length ? (
                  <Check size={20} color="white" />
                ) : (
                  <ChevronRight size={20} color="white" />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
