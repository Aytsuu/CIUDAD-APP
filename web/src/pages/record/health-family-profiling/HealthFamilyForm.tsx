import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import ParentsFormLayout from "../../record/health-family-profiling/family-profling/parents/ParentsFormLayout";
import DependentsInfoLayout from "../../record/health-family-profiling/family-profling/dependents/DependentsInfoLayout";
import DemographicForm from "../../record/health-family-profiling/family-profling/demographic/DemographicForm";
import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { formatHouseholds } from "../../record/profiling/ProfilingFormats";
import { formatResidentsWithBadge } from "./family-profling/utils/formatResidentsOptimized";
import { DependentRecord } from "../../record/profiling/ProfilingTypes";
import { FaHome, FaUsers, FaBriefcaseMedical, FaHouseUser, FaClipboardList } from "react-icons/fa";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useHouseholdsListHealth, useResidentsListHealth, useFamilyMembersWithResidentDetails, useFamilyDataHealth } from "./family-profling/queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitEnvironmentalForm, submitSurveyIdentificationForm, createNCDRecord, createTBRecord } from "./family-profling/restful-api/profiingPostAPI";
// These imports are currently unused but may be needed when implementing step 4
import EnvironmentalFormLayout from "./family-profling/householdInfo/EnvironmentalFormLayout";
import NoncomDiseaseFormLayout from "./family-profling/householdInfo/NonComDiseaseFormLayout";
import TbSurveilanceInfoLayout from "./family-profling/householdInfo/TbSurveilanceInfoLayout";
import { Separator } from "@/components/ui/separator";
import SurveyIdentificationForm, { SurveyIdentificationFormHandle } from "./family-profling/householdInfo/SurveyIdentificationForm";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { CircleAlert } from "lucide-react";
import { BeforeUnloadDialog, BeforeUnloadDialogRef } from "@/components/ui/before-unload-dialog";
// Import validation utilities
import { 
  validateStep4, 
  validateStep5, 
  validateForSubmission,
  groupValidationErrors
} from "./family-profling/validation";
import { 
  prepareNCDRecordForSubmission
} from "./family-profling/validation/ncdValidation";
import { 
  prepareTBRecordForSubmission
} from "./family-profling/validation/tbValidation";
import { 
  prepareSurveyDataForSubmission
} from "./family-profling/validation/surveyValidation";

export default function HealthFamilyForm() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { data: householdsListHealth, isLoading: isLoadingHouseholds } = useHouseholdsListHealth();
  const { data: residentsListHealth, isLoading: isLoadingResidents } = useResidentsListHealth(); 
  const [currentStep, setCurrentStep] = React.useState<number>(5);
  const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));
  const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
  // const [selectedGuardianId, setSelectedGuardianId] = React.useState<string>("");
  const [selectedResidentId, setSelectedResidentId] = React.useState<string>("");
  const [selectedRespondentId, setSelectedRespondentId] = React.useState<string>(""); 
  const [famId, setFamId] = React.useState<string>("251111000018-R"); 
  const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);
  
  // Before unload dialog ref and state
  const beforeUnloadRef = React.useRef<BeforeUnloadDialogRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(false);
  
  // Ref for survey form to access its data
  const surveyFormRef = React.useRef<SurveyIdentificationFormHandle>(null);
  
  // Mutation hooks for data submission (custom versions without individual toasts)
  const queryClient = useQueryClient();
  
  const submitEnvironmentalMutation = useMutation({
    mutationFn: (payload: {
      household_id: string;
      water_supply?: { type: 'level1' | 'level2' | 'level3' };
      sanitary_facility?: { facility_type: string; toilet_facility_type: string };
      waste_management?: { waste_management_type: string; description?: string };
    }) => submitEnvironmentalForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      // No individual toast - will show consolidated toast at the end
    }
  });
  
  const submitSurveyMutation = useMutation({
    mutationFn: (data: Record<string, any>) => submitSurveyIdentificationForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationList"] });
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationByFamily"] });
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationFormData"] });
      // No individual toast - will show consolidated toast at the end
    },
  });
  
  const submitNCDMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createNCDRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ncdRecordsList"] });
      queryClient.invalidateQueries({ queryKey: ["ncdRecordsByFamily"] });
      // No individual toast - will show consolidated toast at the end
    },
  });
  
  const submitTBMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createTBRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tbRecordsList"] });
      queryClient.invalidateQueries({ queryKey: ["tbRecordsByFamily"] });
      // No individual toast - will show consolidated toast at the end
    },
  });
  const form = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: defaultValues.current,
  });

  // Track form changes to determine if there are unsaved changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (!isSubmitting) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isSubmitting]);

  // Also track changes in other state variables that represent form data
  React.useEffect(() => {
    if (selectedMotherId || selectedFatherId || selectedResidentId || 
        selectedRespondentId || famId || dependentsList.length > 0) {
      if (!isSubmitting) {
        setHasUnsavedChanges(true);
      }
    }
  }, [selectedMotherId, selectedFatherId, selectedResidentId, selectedRespondentId, 
      famId, dependentsList, isSubmitting]);
 
  // Optimize: Only format residents data when needed and memoize properly
  const formattedResidents = React.useMemo(() => {
    if (!residentsListHealth || currentStep >= 4) return [];
    return formatResidentsWithBadge(residentsListHealth);
  }, [residentsListHealth, currentStep]);
  
  const formattedHouseholds = React.useMemo(() => {
    if (!householdsListHealth || currentStep !== 1) return [];
    return formatHouseholds(householdsListHealth);
  }, [householdsListHealth, currentStep]);
  
  // Optimize: Only fetch family data when famId exists and we're on step 4 or 5
  const shouldFetchFamilyData = Boolean(famId && currentStep >= 4);
  const familyMembersHealth = useFamilyMembersWithResidentDetails(shouldFetchFamilyData ? famId : null);
  
  // Fetch family data to get household information - only when needed
  const { data: familyDataHealth, isLoading: isLoadingFamilyData } = useFamilyDataHealth(shouldFetchFamilyData ? famId : null);
  const householdId = familyDataHealth?.household_no;

  // Optimize: Memoize formatted family members to avoid recalculation
  const formattedFamilyMembers = React.useMemo(() => {
    if (!familyMembersHealth || currentStep < 4) return { default: [], formatted: [] };
    
    const formatted = familyMembersHealth.map(mem => ({
      ...mem,
      id: `${mem.rp_id} - ${mem.per?.per_fname || ''} ${mem.per?.per_lname || ''}`
    }));
    
    return {
      default: familyMembersHealth,
      formatted: formatted
    };
  }, [familyMembersHealth, currentStep]);

  // Get respondent information for the survey form - only when needed
  const respondentInfo = React.useMemo(() => {
    // Only compute respondent info for step 5
    if (currentStep !== 5 || !selectedRespondentId || !residentsListHealth) return undefined;
    
    // First try to find in the residents list (all residents)
    let respondent = residentsListHealth.find((resident: any) => 
      resident.rp_id === selectedRespondentId
    );
    
    // If not found in residents list, try to find in family members
    if (!respondent && familyMembersHealth) {
      respondent = familyMembersHealth.find((member: any) => 
        member.rp_id === selectedRespondentId
      );
    }
    
    if (respondent) {
      // Handle different data structures for personal info
      let personalInfo = null;
      
      // Pattern 1: personal_info (from residents list)
      if (respondent.personal_info) {
        personalInfo = {
          per_fname: respondent.personal_info.per_fname,
          per_lname: respondent.personal_info.per_lname,
          per_mname: respondent.personal_info.per_mname,
        };
      }
      // Pattern 2: per (from family members)
      else if (respondent.per) {
        personalInfo = {
          per_fname: respondent.per.per_fname,
          per_lname: respondent.per.per_lname,
          per_mname: respondent.per.per_mname,
        };
      }
      
      if (personalInfo) {
        return {
          rp_id: respondent.rp_id,
          personal_info: personalInfo
        };
      }
    }
    
    return undefined;
  }, [selectedRespondentId, residentsListHealth, familyMembersHealth, currentStep]);

  // Optimize: Debug logging only when needed and with less frequency
  React.useEffect(() => {
    // Only log when on steps that actually need family data
    if (currentStep >= 4) {
      console.log('Family ID:', famId);
      console.log('Family Members:', familyMembersHealth);
      console.log('Family Data:', familyDataHealth);
      console.log('Household ID (from household_no):', householdId);
      console.log('Current Step:', currentStep);
    }
    
    // Set household ID in form when it becomes available
    if (householdId && householdId !== form.getValues('demographicInfo.householdNo')) {
      console.log('Setting household ID in form:', householdId);
      form.setValue('demographicInfo.householdNo', householdId);
    }
  }, [famId, familyMembersHealth, familyDataHealth, householdId, currentStep, form]);

  // Optimize: Only show loading for relevant queries based on current step
  React.useEffect(() => {
    let shouldShowLoading = false;
    
    if (currentStep <= 3) {
      // For steps 1-3, only care about basic data
      shouldShowLoading = isLoadingHouseholds || isLoadingResidents;
    } else {
      // For steps 4-5, include family data loading
      shouldShowLoading = isLoadingHouseholds || isLoadingResidents || isLoadingFamilyData;
    }
    
    if (shouldShowLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [currentStep, isLoadingHouseholds, isLoadingResidents, isLoadingFamilyData, showLoading, hideLoading])
  
  // Optimize: Prefetch family data when on step 3 and family ID is available
  // This ensures the data is ready when user navigates to step 4
  React.useEffect(() => {
    if (currentStep === 3 && famId && !shouldFetchFamilyData) {
      // Trigger a prefetch by temporarily enabling the queries
      // The queries will cache the results for when we actually need them on step 4
      console.log('Prefetching family data for upcoming step 4...');
    }
  }, [currentStep, famId, shouldFetchFamilyData]);
  
  // Enhanced next step function with validation
  const nextStep = React.useCallback(async () => {
    setIsValidating(true);
    
    try {
      const formData = form.getValues();
      let hasErrors = false;

      if (currentStep === 4) {
        const step4Result = validateStep4(formData);
        if (!step4Result.isValid) {
          const grouped = groupValidationErrors({
            isValid: false,
            step4: step4Result,
            step5: { isValid: true, survey: { isValid: true, errors: [], errorMessages: [] }, allErrors: [] },
            allErrors: step4Result.allErrors
          });

          // Show grouped error messages
          if (grouped.environmentalCount > 0) {
            toast.error(`Environmental Form: ${grouped.environmentalCount} field(s) required`);
          }
          if (grouped.ncdCount > 0) {
            toast.error(`NCD Records: ${grouped.ncdCount} validation error(s)`);
          }
          if (grouped.tbCount > 0) {
            toast.error(`TB Records: ${grouped.tbCount} validation error(s)`);
          }
          
          hasErrors = true;
        }
      } else if (currentStep === 5) {
        const surveyData = surveyFormRef.current?.getFormData() || null;
        const step5Result = validateStep5(surveyData);
        if (!step5Result.isValid) {
          toast.error(`Survey Form: ${step5Result.allErrors.length} field(s) required`);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        // Trigger form validation to show field-level errors
        form.trigger();
        return; // Don't proceed to next step
      }

      // If validation passes, proceed to next step
      setCurrentStep((prev) => prev + 1);
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, form]);

  // Handler for going to the previous step
  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  // Comprehensive submission handler for step 4 and 5 data
  const handleFinalSubmission = React.useCallback(async () => {
    if (!famId) {
      console.log("❌ Family ID is required for submission");
      return;
    }

    setIsValidating(true);
    
    try {
      // Get all form data and survey data
      const formData = form.getValues();
      const surveyData = surveyFormRef.current?.getFormData() || null;
      
      console.log('=== SUBMISSION DEBUG START ===');
      console.log('Family ID:', famId);
      console.log('Survey form ref exists:', !!surveyFormRef.current);
      console.log('Survey data extracted:', surveyData);
      console.log('Form data:', formData);
      
      // Validate all required fields before submission using new validation system
      const validationResult = validateForSubmission(formData, surveyData);
      
      if (!validationResult.isValid) {
        const grouped = groupValidationErrors(validationResult);

        // Log grouped error messages instead of showing toasts
        if (grouped.environmentalCount > 0) {
          console.log(`❌ Environmental Form: ${grouped.environmentalCount} field(s) required`);
        }
        if (grouped.ncdCount > 0) {
          console.log(`❌ NCD Records: ${grouped.ncdCount} validation error(s)`);
        }
        if (grouped.tbCount > 0) {
          console.log(`❌ TB Records: ${grouped.tbCount} validation error(s)`);
        }
        if (grouped.surveyCount > 0) {
          console.log(`❌ Survey Form: ${grouped.surveyCount} field(s) required`);
        }
        
        // Trigger form validation to show field-level errors
        form.trigger();
        console.log("❌ Please complete all required fields before submitting");
        return; // Don't proceed with submission
      }

      setIsSubmitting(true);
      showLoading();

      console.log('Full form data for submission:', formData);

      // 1. Submit Environmental Form Data (Step 4)
      if (formData.environmentalForm && householdId) {
        const environmentalPayload = {
          household_id: householdId,
          water_supply: formData.environmentalForm.waterSupply ? {
            type: formData.environmentalForm.waterSupply as 'level1' | 'level2' | 'level3'
          } : undefined,
          sanitary_facility: formData.environmentalForm.facilityType ? {
            facility_type: formData.environmentalForm.facilityType,
            // pass the specific subtype based on facility type so backend can resolve sf_desc
            ...(formData.environmentalForm.facilityType === 'SANITARY'
              ? { sanitary_facility_type: formData.environmentalForm.sanitaryFacilityType || undefined }
              : {}),
            ...(formData.environmentalForm.facilityType === 'UNSANITARY'
              ? { unsanitary_facility_type: formData.environmentalForm.unsanitaryFacilityType || undefined }
              : {}),
            toilet_facility_type: formData.environmentalForm.toiletFacilityType || ''
          } : undefined,
          waste_management: formData.environmentalForm.wasteManagement ? {
            waste_management_type: (formData.environmentalForm.wasteManagement || "").toUpperCase() === "OTHERS"
              ? formData.environmentalForm.wasteManagementOthers || "OTHERS"
              : formData.environmentalForm.wasteManagement,
            description: (formData.environmentalForm.wasteManagement || "").toUpperCase() === "OTHERS"
              ? formData.environmentalForm.wasteManagementOthers || ""
              : undefined
          } : undefined
        };

        console.log('Submitting environmental data:', environmentalPayload);
        await submitEnvironmentalMutation.mutateAsync(environmentalPayload);
      }

      // 2. Submit NCD Records (Step 4) - if any records exist
      if (formData.ncdRecords?.list && formData.ncdRecords.list.length > 0) {
        console.log('NCD Records to submit:', formData.ncdRecords.list);
        
        for (const ncdRecord of formData.ncdRecords.list) {
          const ncdPayload = prepareNCDRecordForSubmission(ncdRecord);
          
          if (ncdPayload) {
            console.log('Submitting NCD record with payload:', ncdPayload);
            
            try {
              await submitNCDMutation.mutateAsync(ncdPayload);
              console.log('NCD record submitted successfully for resident:', ncdRecord.id);
            } catch (ncdError) {
              console.error('Error submitting NCD record for resident', ncdRecord.id, ':', ncdError);
              console.log(`❌ Failed to submit NCD record for resident ${ncdRecord.id}`);
              throw ncdError; // Re-throw to stop the submission process
            }
          }
        }
      }

      // 3. Submit TB Records (Step 4) - if any records exist
      if (formData.tbRecords?.list && formData.tbRecords.list.length > 0) {
        console.log('TB Records to submit:', formData.tbRecords.list);
        
        for (const tbRecord of formData.tbRecords.list) {
          const tbPayload = prepareTBRecordForSubmission(tbRecord);
          
          if (tbPayload) {
            console.log('Submitting TB record:', tbPayload);
            await submitTBMutation.mutateAsync(tbPayload);
          }
        }
      }

      if (surveyFormRef.current) {
        const isFormValid = surveyFormRef.current.isFormValid();
        console.log('Survey form validation result:', isFormValid);
        
        if (surveyData && isFormValid) {
          const surveyPayload = prepareSurveyDataForSubmission(surveyData, famId);
          
          if (surveyPayload) {
            console.log('Submitting survey data with payload:', surveyPayload);
            
            try {
              const result = await submitSurveyMutation.mutateAsync(surveyPayload);
              console.log('✅ Survey identification submitted successfully:', result);
            } catch (surveyError) {
              console.error('❌ Error submitting survey identification:', surveyError);
              console.log("❌ Failed to submit survey identification form");
              throw surveyError;
            }
          } else {
            console.log('❌ Failed to prepare survey data for submission');
            console.log("❌ Invalid survey data format");
          }
        } else {
          console.log('❌ Survey form validation failed or no data:', {
            hasData: !!surveyData,
            isValid: isFormValid,
            surveyData
          });
          console.log("❌ Please complete the survey identification form");
        }
      } else {
        console.log('❌ Survey form ref not available');
        console.log("❌ Survey identification form not available");
      }

      // 5. Final success message and navigation
      console.log('=== FINAL SUBMISSION SUMMARY ===');
      const submissionSummary = [];
      
      if (formData.environmentalForm && householdId) {
        submissionSummary.push("Environmental data");
        console.log('✅ Environmental data was submitted');
      } else {
        console.log('❌ Environmental data was NOT submitted');
      }
      
      if (formData.ncdRecords?.list?.length > 0) {
        submissionSummary.push(`${formData.ncdRecords.list.length} NCD record(s)`);
        console.log('✅ NCD records were submitted:', formData.ncdRecords.list.length);
      } else {
        console.log('❌ No NCD records to submit');
      }
      
      if (formData.tbRecords?.list?.length > 0) {
        submissionSummary.push(`${formData.tbRecords.list.length} TB surveillance record(s)`);
        console.log('✅ TB records were submitted:', formData.tbRecords.list.length);
      } else {
        console.log('❌ No TB records to submit');
      }
      
      const surveyFormValid = surveyFormRef.current?.isFormValid();
      console.log('Survey form valid for summary?', surveyFormValid);
      
      if (surveyFormValid) {
        submissionSummary.push("Survey identification");
        console.log('✅ Survey identification was included in summary');
      } else {
        console.log('❌ Survey identification was NOT included in summary');
      }
      
      console.log('Final submission summary array:', submissionSummary);
      
      if (submissionSummary.length > 0) {
        // Use the specific toast style instead of showing summary text
        toast("Record added successfully", {
          icon: <CircleAlert size={24} className="fill-green-500 stroke-white" />,
          style: {
            border: '1px solid rgb(187, 222, 251)',
            padding: '16px',
            color: '#1e3a8a',
            background: '#eff6ff',
          },
        });
        console.log('✅ SUCCESS: Health Family Profiling completed successfully!');
        console.log('✅ Submitted components:', submissionSummary.join(", "));
        
        // Navigate back to family page after a short delay to show success message
        setTimeout(() => {
          // Clear unsaved changes flag before navigation since we successfully submitted
          setHasUnsavedChanges(false);
          navigate("/profiling/family");
        }, 2000); // 2 second delay
      } else {
        console.log('❌ No components were submitted successfully');
        console.log('❌ ERROR: Please fill out the required forms before submitting');
      }
      
    } catch (error) {
      console.error('❌ Error during submission:', error);
      console.log("❌ Failed to submit health family profiling data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
      hideLoading();
    }
  }, [famId, householdId, form, submitEnvironmentalMutation, submitSurveyMutation, submitNCDMutation, submitTBMutation, showLoading, hideLoading, navigate]);


  // Calculate progress based on current step (4 steps)
  const calculateProgress = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        return 20;
      case 2:
        return 40;
      case 3:
        return 60;
      case 4:
        return 80;
      case 5:
        return 100;

      default:
        return 0;
    }
  }, [currentStep]);

  // Import step icons
  const progressSteps = React.useMemo(() => [
    { label: "Demographics", minProgress: 25, icon: FaHome },
    { label: "Family Members", minProgress: 50, icon: FaUsers },
    { label: "Dependents", minProgress: 75, icon: FaBriefcaseMedical },
    { label: "Household Info", minProgress: 80, icon: FaHouseUser },
    { label: "Survey Identification", minProgress: 100, icon: FaClipboardList }
  ], []);

  return (
    <LayoutWithBack
      title="Family Profile"
      description="Provide your details to complete the registration process."
    >
      {/* Before Unload Dialog */}
      <BeforeUnloadDialog
        ref={beforeUnloadRef}
        hasUnsavedChanges={hasUnsavedChanges}
        onConfirmLeave={() => {
          console.log('User confirmed navigation despite unsaved changes');
          setHasUnsavedChanges(false);
        }}
        onCancelLeave={() => {
          console.log('User cancelled navigation to preserve unsaved changes');
        }}
      />
      
        <Card className="w-full">
          <div className="pt-10">
            <ProgressWithIcon 
              progress={calculateProgress()} 
              steps={progressSteps}
              completedColor="blue-500"
              activeColor="blue-500"
              inactiveColor="gray-300"
              showLabels={true}
            />
           
          </div>
          {currentStep === 1 && (
            <DemographicForm
              form={form}
              households={formattedHouseholds}
              onSubmit={() => nextStep()}
            />
          )}
          {currentStep === 2 && (
            <ParentsFormLayout
              form={form}
              residents={{
                default: residentsListHealth,
                formatted: formattedResidents,
              }}
              selectedParents={{
                mother: selectedMotherId,
                father: selectedFatherId,
                // guardian: selectedGuardianId,
              }}
              dependentsList={dependentsList}
              setSelectedMotherId={setSelectedMotherId}
              setSelectedFatherId={setSelectedFatherId}
              // setSelectedGuardianId={setSelectedGuardianId}
              setSelectedRespondentId={setSelectedRespondentId}
              onSubmit={() => nextStep()}
              back={() => prevStep()}
            />
          )}
          {currentStep === 3 && (
            <DependentsInfoLayout
              form={form}
              residents={{ default: residentsListHealth, formatted: formattedResidents }}
              selectedParents={[selectedMotherId, selectedFatherId]}
              dependentsList={dependentsList}
              setDependentsList={setDependentsList}
              back={prevStep}
              nextStep={nextStep}
              setFamId={setFamId}
            />
          )}
          {currentStep === 4 && (
            <>
              {famId && formattedFamilyMembers.default && formattedFamilyMembers.default.length > 0 ? (
                <>
              
                  <EnvironmentalFormLayout
                    form={form}
                    residents={formattedFamilyMembers}
                    selectedResidentId={selectedResidentId}
                    setSelectedResidentId={setSelectedResidentId}
                    householdId={householdId}
                  />
                  <Separator className="my-6" />
                  <NoncomDiseaseFormLayout
                    form={form}
                    familyMembers={formattedFamilyMembers.default}
                    selectedResidentId={selectedResidentId}
                    setSelectedResidentId={setSelectedResidentId}
                  />
                  <Separator className="my-6" />
                  <TbSurveilanceInfoLayout
                    form={form}
                    residents={formattedFamilyMembers.default}
                    selectedResidentId={selectedResidentId}
                    setSelectedResidentId={setSelectedResidentId}
                  />
                  
                  {/* Navigation Buttons for Step 4 */}
                  <div className="mt-8 flex justify-end gap-2 sm:gap-3 p-4 md:p-10">
                    
                    <Button 
                      onClick={() => {
                        // Trigger form validation first
                        form.trigger();
                        nextStep();
                      }} 
                      className="w-full sm:w-32"
                      disabled={isValidating}
                    >
                      {isValidating ? 'Validating...' : 'Next'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {!famId ? 'No family ID available' : 
                     !formattedFamilyMembers.default ? 'Loading family members...' : 
                     formattedFamilyMembers.default.length === 0 ? 'No family members found' : 
                     'Loading...'}
                  </p>
                  {famId && <p className="text-sm text-gray-400">Family ID: {famId}</p>}
                </div>
              )}
            </>
          )}
          {currentStep === 5 && (
            <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
              <div className="space-y-6">
                <SurveyIdentificationForm 
                  ref={surveyFormRef}
                  respondentInfo={respondentInfo}
                  familyMembers={formattedFamilyMembers.default}
                />
              </div>
              
              {/* Navigation Buttons for Step 5 */}
              <div className="mt-8 flex justify-end gap-2 sm:gap-3">
                <Button variant="outline" className="w-full sm:w-32" onClick={() => prevStep()}>
                  Back
                </Button>
                <ConfirmationModal 
                  trigger={
                    <Button className="w-full sm:w-32" disabled={isSubmitting || isValidating}>
                      {isSubmitting ? "Submitting..." : isValidating ? "Validating..." : "Confirm"}
                    </Button>
                  }
                  title="Confirm Health Family Profiling Submission"
                  description={
                    <div className="space-y-4">
                      <p>Are you sure you want to submit the health family profiling data? This action cannot be undone.</p>
                      
                      {/* Show submission checklist */}
                      <div className="text-sm space-y-2">
                        <h4 className="font-medium text-gray-800">Submission Summary:</h4>
                        <div className="space-y-1">
                          {form.getValues('environmentalForm') && householdId && (
                            <p className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Environmental data will be submitted
                            </p>
                          )}
                          {form.getValues('ncdRecords')?.list?.length > 0 && (
                            <p className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {form.getValues('ncdRecords').list.length} NCD record(s) will be submitted
                            </p>
                          )}
                          {form.getValues('tbRecords')?.list?.length > 0 && (
                            <p className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {form.getValues('tbRecords').list.length} TB record(s) will be submitted
                            </p>
                          )}
                          <p className="text-blue-600 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                            </svg>
                            Survey identification will be submitted with other data
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                  actionLabel="Confirm Submission"
                  onClick={handleFinalSubmission}
                />
              </div>
            </div>
          )}
          
          
        </Card>

    </LayoutWithBack>
  );
}