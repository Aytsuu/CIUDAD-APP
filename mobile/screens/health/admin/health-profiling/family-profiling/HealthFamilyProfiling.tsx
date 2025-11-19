import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { healthFamilyProfilingSchema, HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { DemographicStep } from './forms/DemographicForm';
import { ParentsStep } from './forms/ParentsForm';
import { DependentsStep } from './forms/DependentsForm';
import { EnvironmentalStep } from './forms/EnvironmentalForm';
import { HealthRecordsStep } from './forms/HealthRecordsForm';
import { SurveyStep } from './forms/SurveyIdentificationForm';
import { 
  useSubmitEnvironmentalForm, 
  useCreateNCD, 
  useCreateTBSurveillance, 
  useSubmitSurveyIdentification 
} from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { 
  ChevronLeft, 
  Home, 
  Users, 
  UsersRound, 
  Leaf, 
  Heart, 
  ClipboardCheck 
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/screens/_PageLayout';
import { MultiStepProgressBar } from '@/components/healthcomponents/multi-step-progress-bar';

const STEPS = [
  { id: 1, title: 'Demographics', label: 'Demographics', icon: Home },
  { id: 2, title: 'Parents', label: 'Parents', icon: Users },
  { id: 3, title: 'Dependents', label: 'Dependents', icon: UsersRound },
  { id: 4, title: 'Environmental & Health', label: 'Env & Health', icon: Leaf },
  { id: 5, title: 'Survey', label: 'Survey', icon: ClipboardCheck },
];

// Convert steps to MultiStepProgressBar format
const progressSteps = STEPS.map(step => ({
  id: step.id - 1, // Convert to 0-based indexing
  label: step.label,
}));

export default function HealthFamilyProfiling() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // 0-based indexing: 0=Demographics, 1=Parents, 2=Dependents, 3=Env&Health, 4=Survey
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  // Mutation hooks
  const submitEnvironmentalMut = useSubmitEnvironmentalForm();
  const createNCDMut = useCreateNCD();
  const createTBMut = useCreateTBSurveillance();
  const submitSurveyMut = useSubmitSurveyIdentification();

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

  // Environmental submission handler
  const handleEnvironmentalSubmit = async () => {
    try {
      const data = form.getValues('environmentalForm');
      const householdId = form.getValues('demographicInfo.householdNo');
      
      const environmentalPayload = {
        household_id: householdId,
        water_supply: data.waterSupply ? {
          type: data.waterSupply as 'level1' | 'level2' | 'level3'
        } : undefined,
        sanitary_facility: data.facilityType ? {
          facility_type: data.facilityType,
          // Pass the specific subtype based on facility type so backend can resolve sf_desc
          ...(data.facilityType === 'SANITARY'
            ? { sanitary_facility_type: data.sanitaryFacilityType || undefined }
            : {}),
          ...(data.facilityType === 'UNSANITARY'
            ? { unsanitary_facility_type: data.unsanitaryFacilityType || undefined }
            : {}),
          toilet_facility_type: data.toiletFacilityType || ''
        } : undefined,
        waste_management: data.wasteManagement ? {
          waste_management_type: (data.wasteManagement || "").toUpperCase() === "OTHERS"
            ? data.wasteManagementOthers || "OTHERS"
            : data.wasteManagement,
          description: (data.wasteManagement || "").toUpperCase() === "OTHERS"
            ? data.wasteManagementOthers || ""
            : undefined
        } : undefined
      };

      console.log('Submitting environmental data:', environmentalPayload);
      return await submitEnvironmentalMut.mutateAsync(environmentalPayload);
    } catch (error) {
      throw error;
    }
  };

  // NCD/TB submission handler (optional - only submits if records exist)
  const handleHealthRecordsSubmit = async () => {
    try {
      const ncdRecords = form.getValues('ncdRecords.list');
      const tbRecords = form.getValues('tbRecords.list');

      // Only submit if there are records (both are optional)
      if (!ncdRecords?.length && !tbRecords?.length) {
        console.log('No health records to submit (optional)');
        return;
      }

      // Submit NCD records (optional)
      if (ncdRecords?.length > 0) {
        for (const ncd of ncdRecords) {
          if (ncd.ncdFormSchema) {
            const ncdPayload = {
              rp_id: ncd.id, // Use the resident ID from the form
              ncd_riskclass_age: ncd.ncdFormSchema.riskClassAgeGroup || '',
              ncd_comorbidities: ncd.ncdFormSchema.comorbidities || '', // Direct value from combobox
              ncd_lifestyle_risk: ncd.ncdFormSchema.lifestyleRisk === "Others" && ncd.ncdFormSchema.lifestyleRiskOthers
                ? ncd.ncdFormSchema.lifestyleRiskOthers
                : ncd.ncdFormSchema.lifestyleRisk || '',
              ncd_maintenance_status: ncd.ncdFormSchema.inMaintenance || 'no'
            };
            
            console.log('Submitting NCD record with payload:', ncdPayload);
            await createNCDMut.mutateAsync(ncdPayload);
          }
        }
      }

      // Submit TB records (optional)
      if (tbRecords?.length > 0) {
        for (const tb of tbRecords) {
          if (tb.tbSurveilanceSchema) {
            const tbPayload = {
              rp_id: tb.id, // Use the resident ID from the form
              tb_meds_source: tb.tbSurveilanceSchema.srcAntiTBmeds === "Others" && tb.tbSurveilanceSchema.srcAntiTBmedsOthers
                ? tb.tbSurveilanceSchema.srcAntiTBmedsOthers
                : tb.tbSurveilanceSchema.srcAntiTBmeds || '',
              tb_days_taking_meds: parseInt(tb.tbSurveilanceSchema.noOfDaysTakingMeds || '0'),
              tb_status: tb.tbSurveilanceSchema.tbStatus || ''
            };
            
            console.log('Submitting TB record with payload:', tbPayload);
            await createTBMut.mutateAsync(tbPayload);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Survey submission handler
  const handleSurveySubmit = async () => {
    try {
      if (!familyId) throw new Error('Family ID not found');

      const data = form.getValues('surveyForm');
      
      // Format date to YYYY-MM-DD format expected by Django DateField
      const formatDateForBackend = (dateValue: any): string => {
        if (!dateValue) return new Date().toISOString().split('T')[0];
        
        // If it's already a string in YYYY-MM-DD format, return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        
        // Convert to Date object and format to YYYY-MM-DD
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          // If invalid date, use current date
          return new Date().toISOString().split('T')[0];
        }
        
        return date.toISOString().split('T')[0];
      };
      
      const payload = {
        fam_id: familyId,
        filledBy: data.filledBy || '',
        informant: data.informant || '',
        checkedBy: data.checkedBy || '',
        date: formatDateForBackend(data.date),
        signature: data.signature || ''
      };

      console.log('Submitting survey:', payload);
      const result = await submitSurveyMut.mutateAsync(payload);
      
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
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 0: // Demographics (0-based)
        isValid = await form.trigger('demographicInfo');
        if (isValid) {
          const hhId = form.getValues('demographicInfo.householdNo');
          setHouseholdId(hhId);
          setCurrentStep(1);
        }
        break;
      case 1: // Parents
        isValid = await form.trigger(['respondentInfo']);
        if (isValid) {
          setCurrentStep(2);
        }
        break;
      case 2: // Dependents
        // Will be handled by DependentsStep mutation
        return;
      case 3: // Environmental & Health Records (Combined)
        isValid = await form.trigger('environmentalForm');
        if (isValid) {
          // Just move to next step - don't submit data yet
          setCurrentStep(4);
        }
        break;
      case 4: // Survey
        // Debug: Log the survey form values before validation
        const surveyFormValues = form.getValues('surveyForm');
        console.log('Survey form values before validation:', surveyFormValues);
        console.log('filledBy:', surveyFormValues.filledBy);
        console.log('informant:', surveyFormValues.informant);
        console.log('checkedBy:', surveyFormValues.checkedBy);
        console.log('date:', surveyFormValues.date);
        console.log('signature:', surveyFormValues.signature);
        
        isValid = await form.trigger('surveyForm');
        console.log('Survey form validation result:', isValid);
        
        if (!isValid) {
          const errors = form.formState.errors;
          console.log('Survey form errors:', errors);
          console.log('Survey form errors.surveyForm:', errors.surveyForm);
        }
        
        if (isValid) {
          try {
            // Submit environmental data (required)
            await handleEnvironmentalSubmit();
            // Submit health records (optional - only if records exist)
            await handleHealthRecordsSubmit();
            // Submit survey data (final step)
            await handleSurveySubmit();
            return;
          } catch (error) {
            console.error('Error submitting data:', error);
            Alert.alert('Error', 'Failed to submit data. Please try again.');
          }
        }
        break;
    }

    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleStepPress = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleFamilyCreated = (famId: string) => {
    console.log('Family created, ID:', famId);
    setFamilyId(famId);
    
    // Also set household ID from the form
    const hhId = form.getValues('demographicInfo.householdNo');
    console.log('Household ID from form:', hhId);
    setHouseholdId(hhId);
    
    setCurrentStep(3); // Move to environmental & health records step (0-based)
  };

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 0: // Demographics
        return <DemographicStep form={form} onNext={handleNext} onBack={handleBack} />;
      case 1: // Parents
        return <ParentsStep form={form} onNext={handleNext} onBack={handleBack} />;
      case 2: // Dependents
        return <DependentsStep form={form} onFamilyCreated={handleFamilyCreated} staffId={staffId} />;
      case 3: // Environmental & Health Records (Combined)
        console.log('Rendering step 3 - Family ID:', familyId);
        return (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <EnvironmentalStep form={form} />
            <HealthRecordsStep 
              form={form} 
              familyId={familyId}
              onNext={handleNext}
              onBack={handleBack}
            />
          </ScrollView>
        );
      case 4: // Survey
        // Get respondent info from form to pass to SurveyStep
        const respondentData = form.getValues('respondentInfo');
        const respondentInfo = respondentData ? {
          id: respondentData.id || '',
          firstName: respondentData.firstName || '',
          lastName: respondentData.lastName || '',
          middleName: respondentData.middleName || '',
        } : undefined;
        
        return (
          <SurveyStep 
            form={form} 
            onNext={handleNext} 
            famId={familyId || undefined}
            respondentInfo={respondentInfo}
          />
        );
      default:
        return null;
    }
  };

  const isLoading = submitEnvironmentalMut.isPending || 
                    createNCDMut.isPending || 
                    createTBMut.isPending ||
                    submitSurveyMut.isPending;

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
            Health Family Profiling
          </Text>
        </View>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* MultiStep Progress Bar */}
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
              Step {currentStep + 1} of {STEPS.length}
            </Text>
          </View>
        </View>

        {/* Form Content */}
        <View className="flex-1">
          {renderCurrentForm()}
        </View>
      </View>
    </PageLayout>
  );
}
