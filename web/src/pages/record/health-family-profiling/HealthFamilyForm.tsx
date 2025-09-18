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
import { formatHouseholds, formatResidents } from "../../record/profiling/ProfilingFormats";
import { DependentRecord } from "../../record/profiling/ProfilingTypes";
import { FaHome, FaUsers, FaBriefcaseMedical, FaHouseUser, FaClipboardList } from "react-icons/fa";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useHouseholdsListHealth, useResidentsListHealth, useFamilyMembersWithResidentDetails, useFamilyDataHealth } from "./family-profling/queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { useSubmitEnvironmentalForm, useSubmitSurveyIdentificationForm, useSubmitNCDRecord, useSubmitTBRecord } from "./family-profling/queries/profilingAddQueries";
// These imports are currently unused but may be needed when implementing step 4
import EnvironmentalFormLayout from "./family-profling/householdInfo/EnvironmentalFormLayout";
import NoncomDiseaseFormLayout from "./family-profling/householdInfo/NonComDiseaseFormLayout";
import TbSurveilanceInfoLayout from "./family-profling/householdInfo/TbSurveilanceInfoLayout";
import { Separator } from "@/components/ui/separator";
import SurveyIdentificationForm, { SurveyIdentificationFormHandle } from "./family-profling/householdInfo/SurveyIdentificationForm";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function HealthFamilyForm() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { data: householdsListHealth, isLoading: isLoadingHouseholds } = useHouseholdsListHealth();
  const { data: residentsListHealth, isLoading: isLoadingResidents } = useResidentsListHealth(); 
  const [currentStep, setCurrentStep] = React.useState<number>(4);
  const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));
  const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
  // const [selectedGuardianId, setSelectedGuardianId] = React.useState<string>("");
  const [selectedResidentId, setSelectedResidentId] = React.useState<string>("");
  const [selectedRespondentId, setSelectedRespondentId] = React.useState<string>(""); 
  const [famId, setFamId] = React.useState<string>("250918000010-R"); 
  const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);
  
  // State to track survey submission (no longer needed with integrated approach)
  // const [surveySubmitted, setSurveySubmitted] = React.useState<boolean>(false);
  
  // Ref for survey form to access its data
  const surveyFormRef = React.useRef<SurveyIdentificationFormHandle>(null);
  
  // Mutation hooks for data submission
  const submitEnvironmentalMutation = useSubmitEnvironmentalForm();
  const submitSurveyMutation = useSubmitSurveyIdentificationForm();
  const submitNCDMutation = useSubmitNCDRecord();
  const submitTBMutation = useSubmitTBRecord();
  const form = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: defaultValues.current,
  });
 
  // Optimize: Only format residents data when needed and memoize properly
  const formattedResidents = React.useMemo(() => {
    if (!residentsListHealth || currentStep >= 4) return [];
    return formatResidents(residentsListHealth);
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
  
  // Validation function for step 4
  const validateStep4 = React.useCallback(() => {
    const formData = form.getValues();
    const errors: string[] = [];

    // Validate Environmental Form
    if (!formData.environmentalForm?.waterSupply) {
      errors.push("Water supply type is required");
    }
    if (!formData.environmentalForm?.facilityType) {
      errors.push("Facility type is required");
    }
    if (!formData.environmentalForm?.toiletFacilityType) {
      errors.push("Toilet facility type is required");
    }
    if (!formData.environmentalForm?.wasteManagement) {
      errors.push("Waste management type is required");
    }
    
    // Validate "others" fields if selected
    if (formData.environmentalForm?.wasteManagement === "others" && 
        !formData.environmentalForm?.wasteManagementOthers?.trim()) {
      errors.push("Please specify waste management type");
    }

    // Check if environmental form has any data at all
    const hasEnvironmentalData = formData.environmentalForm && (
      formData.environmentalForm.waterSupply ||
      formData.environmentalForm.facilityType ||
      formData.environmentalForm.toiletFacilityType ||
      formData.environmentalForm.wasteManagement
    );

    if (!hasEnvironmentalData) {
      errors.push("Environmental form must be completed");
    }

    // Validate NCD Records - check if any records have incomplete required fields
    if (formData.ncdRecords?.list && formData.ncdRecords.list.length > 0) {
      formData.ncdRecords.list.forEach((record, index) => {
        if (record.ncdFormSchema) {
          if (!record.ncdFormSchema.riskClassAgeGroup) {
            errors.push(`NCD Record ${index + 1}: Risk class age group is required`);
          }
          if (!record.ncdFormSchema.comorbidities) {
            errors.push(`NCD Record ${index + 1}: Comorbidities is required`);
          }
          if (!record.ncdFormSchema.lifestyleRisk) {
            errors.push(`NCD Record ${index + 1}: Lifestyle risk is required`);
          }
          if (!record.ncdFormSchema.inMaintenance) {
            errors.push(`NCD Record ${index + 1}: Maintenance status is required`);
          }
          
          // Check "others" fields
          if (record.ncdFormSchema.comorbidities === "Others" && 
              !record.ncdFormSchema.comorbiditiesOthers?.trim()) {
            errors.push(`NCD Record ${index + 1}: Please specify comorbidities`);
          }
          if (record.ncdFormSchema.lifestyleRisk === "Others" && 
              !record.ncdFormSchema.lifestyleRiskOthers?.trim()) {
            errors.push(`NCD Record ${index + 1}: Please specify lifestyle risk`);
          }
        }
      });
    }

    // Validate TB Records - check if any records have incomplete required fields
    if (formData.tbRecords?.list && formData.tbRecords.list.length > 0) {
      formData.tbRecords.list.forEach((record, index) => {
        if (record.tbSurveilanceSchema) {
          if (!record.tbSurveilanceSchema.srcAntiTBmeds) {
            errors.push(`TB Record ${index + 1}: Source of anti-TB medication is required`);
          }
          if (!record.tbSurveilanceSchema.noOfDaysTakingMeds) {
            errors.push(`TB Record ${index + 1}: Number of days taking medication is required`);
          }
          if (!record.tbSurveilanceSchema.tbStatus) {
            errors.push(`TB Record ${index + 1}: TB status is required`);
          }
          
          // Check "others" field
          if (record.tbSurveilanceSchema.srcAntiTBmeds === "Others" && 
              !record.tbSurveilanceSchema.srcAntiTBmedsOthers?.trim()) {
            errors.push(`TB Record ${index + 1}: Please specify source of anti-TB medication`);
          }
        }
      });
    }

    return errors;
  }, [form]);

  // Validation function for step 5
  const validateStep5 = React.useCallback(() => {
    const errors: string[] = [];

    if (surveyFormRef.current) {
      const surveyData = surveyFormRef.current.getFormData();
      
      if (!surveyData.filledBy?.trim()) {
        errors.push("Filled by field is required");
      }
      if (!surveyData.informant?.trim()) {
        errors.push("Informant/Conforme field is required");
      }
      if (!surveyData.checkedBy?.trim()) {
        errors.push("Checked by field is required");
      }
      if (!surveyData.date) {
        errors.push("Date is required");
      }
      if (!surveyData.signature?.trim()) {
        errors.push("Signature is required");
      }
    } else {
      errors.push("Survey form is not available");
    }

    return errors;
  }, []);

  // Enhanced next step function with validation
  const nextStep = React.useCallback(async () => {
    setIsValidating(true);
    
    try {
      let errors: string[] = [];

      // Validate based on current step
      if (currentStep === 4) {
        errors = validateStep4();
      } else if (currentStep === 5) {
        errors = validateStep5();
      }

      if (errors.length > 0) {
        // Group errors by category for better UX
        const environmentalErrors = errors.filter(e => !e.includes('NCD Record') && !e.includes('TB Record'));
        const ncdErrors = errors.filter(e => e.includes('NCD Record'));
        const tbErrors = errors.filter(e => e.includes('TB Record'));

        // Show grouped error messages
        if (environmentalErrors.length > 0) {
          toast.error(`Environmental Form: ${environmentalErrors.join(', ')}`);
        }
        if (ncdErrors.length > 0) {
          toast.error(`NCD Records: ${ncdErrors.length} record(s) have incomplete fields`);
        }
        if (tbErrors.length > 0) {
          toast.error(`TB Records: ${tbErrors.length} record(s) have incomplete fields`);
        }
        
        // Trigger form validation to show field-level errors
        form.trigger();
        return; // Don't proceed to next step
      }

      // If validation passes, proceed to next step
      setCurrentStep((prev) => prev + 1);
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, validateStep4, validateStep5, form]);

  // Handler for going to the previous step
  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  // Comprehensive submission handler for step 4 and 5 data
  const handleFinalSubmission = React.useCallback(async () => {
    if (!famId) {
      toast.error("Family ID is required for submission");
      return;
    }

    setIsValidating(true);
    
    try {
      // Validate all required fields before submission
      const step4Errors = validateStep4();
      const step5Errors = validateStep5();
      const allErrors = [...step4Errors, ...step5Errors];

      if (allErrors.length > 0) {
        // Group errors by category for better UX
        const environmentalErrors = step4Errors.filter(e => !e.includes('NCD Record') && !e.includes('TB Record'));
        const ncdErrors = step4Errors.filter(e => e.includes('NCD Record'));
        const tbErrors = step4Errors.filter(e => e.includes('TB Record'));

        // Show grouped error messages
        if (environmentalErrors.length > 0) {
          toast.error(`Environmental Form incomplete: ${environmentalErrors.length} field(s) required`);
        }
        if (ncdErrors.length > 0) {
          toast.error(`NCD Records incomplete: ${ncdErrors.length} validation error(s)`);
        }
        if (tbErrors.length > 0) {
          toast.error(`TB Records incomplete: ${tbErrors.length} validation error(s)`);
        }
        if (step5Errors.length > 0) {
          toast.error(`Survey Form incomplete: ${step5Errors.length} field(s) required`);
        }
        
        // Trigger form validation to show field-level errors
        form.trigger();
        toast.error("Please complete all required fields before submitting");
        return; // Don't proceed with submission
      }

      setIsSubmitting(true);
      showLoading();

      // Get all form data
      const formData = form.getValues();
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
            toilet_facility_type: formData.environmentalForm.toiletFacilityType || ''
          } : undefined,
          waste_management: formData.environmentalForm.wasteManagement ? {
            waste_management_type: formData.environmentalForm.wasteManagement === "others"
              ? formData.environmentalForm.wasteManagementOthers || ""
              : formData.environmentalForm.wasteManagement
          } : undefined
        };

        console.log('Submitting environmental data:', environmentalPayload);
        await submitEnvironmentalMutation.mutateAsync(environmentalPayload);
        toast.success("Environmental data submitted successfully!");
      }

      // 2. Submit NCD Records (Step 4) - if any records exist
      if (formData.ncdRecords?.list && formData.ncdRecords.list.length > 0) {
        console.log('NCD Records to submit:', formData.ncdRecords.list);
        
        for (const ncdRecord of formData.ncdRecords.list) {
          if (ncdRecord.ncdFormSchema && ncdRecord.id) {
            const ncdPayload = {
              rp_id: ncdRecord.id,
              ncd_riskclass_age: ncdRecord.ncdFormSchema.riskClassAgeGroup || null,
              ncd_comorbidities: ncdRecord.ncdFormSchema.comorbidities === "Others" 
                ? ncdRecord.ncdFormSchema.comorbiditiesOthers || null
                : ncdRecord.ncdFormSchema.comorbidities || null,
              ncd_lifestyle_risk: ncdRecord.ncdFormSchema.lifestyleRisk === "Others"
                ? ncdRecord.ncdFormSchema.lifestyleRiskOthers || null
                : ncdRecord.ncdFormSchema.lifestyleRisk || null,
              ncd_maintenance_status: ncdRecord.ncdFormSchema.inMaintenance || null
            };
            
            console.log('Submitting NCD record with payload:', ncdPayload);
            console.log('NCD record resident ID check:', ncdRecord.id);
            console.log('NCD form schema data:', ncdRecord.ncdFormSchema);
            
            try {
              await submitNCDMutation.mutateAsync(ncdPayload);
              console.log('NCD record submitted successfully for resident:', ncdRecord.id);
            } catch (ncdError) {
              console.error('Error submitting NCD record for resident', ncdRecord.id, ':', ncdError);
              toast.error(`Failed to submit NCD record for resident ${ncdRecord.id}`);
              throw ncdError; // Re-throw to stop the submission process
            }
          }
        }
        toast.success(`${formData.ncdRecords.list.length} NCD records submitted successfully!`);
      }

      // 3. Submit TB Records (Step 4) - if any records exist
      if (formData.tbRecords?.list && formData.tbRecords.list.length > 0) {
        console.log('TB Records to submit:', formData.tbRecords.list);
        
        for (const tbRecord of formData.tbRecords.list) {
          if (tbRecord.tbSurveilanceSchema && tbRecord.id) {
            const tbPayload = {
              rp_id: tbRecord.id,
              tb_meds_source: tbRecord.tbSurveilanceSchema.srcAntiTBmeds === "Others"
                ? tbRecord.tbSurveilanceSchema.srcAntiTBmedsOthers || null
                : tbRecord.tbSurveilanceSchema.srcAntiTBmeds || null,
              tb_days_taking_meds: parseInt(tbRecord.tbSurveilanceSchema.noOfDaysTakingMeds) || 0,
              tb_status: tbRecord.tbSurveilanceSchema.tbStatus || null
            };
            
            console.log('Submitting TB record:', tbPayload);
            await submitTBMutation.mutateAsync(tbPayload);
          }
        }
        toast.success(`${formData.tbRecords.list.length} TB surveillance records submitted successfully!`);
      }

      // 4. Submit Survey Identification Form (Step 5)
      if (surveyFormRef.current) {
        const surveyData = surveyFormRef.current.getFormData();
        console.log('Survey identification data:', surveyData);
        
        if (surveyFormRef.current.isFormValid()) {
          // Prepare survey data for backend submission
          const surveyPayload = {
            fam_id: famId,
            filledBy: surveyData.filledBy,
            informant: surveyData.informant,
            checkedBy: surveyData.checkedBy,
            date: surveyData.date?.toISOString().split('T')[0], // Format as YYYY-MM-DD
            signature: surveyData.signature
          };
          
          console.log('Submitting survey data:', surveyPayload);
          await submitSurveyMutation.mutateAsync(surveyPayload);
          toast.success("Survey identification submitted successfully!");
        } else {
          console.log('Survey form is not valid');
          toast.warning("Please complete the survey identification form");
        }
      } else {
        console.log('Survey form ref not available');
        toast.warning("Survey identification form not available");
      }

      // 5. Final success message and navigation
      const allCompleted = 
        (formData.environmentalForm && householdId) || 
        (formData.ncdRecords?.list?.length > 0) || 
        (formData.tbRecords?.list?.length > 0) || 
        (surveyFormRef.current?.isFormValid());
        
      if (allCompleted) {
        toast.success("Health family profiling data submitted successfully!");
        console.log('Health Family Profiling completed successfully!');
        
        // Navigate back to family page after a short delay to show success message
        setTimeout(() => {
          navigate("/family");
        }, 2000); // 2 second delay
      } else {
        toast.info("Please fill out the required forms before submitting");
      }
      
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error("Failed to submit health family profiling data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
      hideLoading();
    }
  }, [famId, householdId, form, submitEnvironmentalMutation, submitSurveyMutation, submitNCDMutation, submitTBMutation, showLoading, hideLoading, navigate, validateStep4, validateStep5]);


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
                    <Button variant="outline" className="w-full sm:w-32" onClick={() => prevStep()}>
                      Back
                    </Button>
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