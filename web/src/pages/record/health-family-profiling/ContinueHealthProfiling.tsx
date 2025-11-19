import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner";
import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { formatResidentsWithBadge } from "./family-profling/utils/formatResidentsOptimized";
import { DependentRecord } from "../profiling/ProfilingTypes";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { 
  useFamilyDataHealth, 
  useFamilyMembersWithResidentDetails,
  useResidentsListHealth
} from "./family-profling/queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { FaHome, FaUsers, FaBriefcaseMedical, FaHouseUser, FaClipboardList } from "react-icons/fa";
import ParentsFormLayout from "./family-profling/parents/ParentsFormLayout";
import DependentsInfoLayout from "./family-profling/dependents/DependentsInfoLayout";
import EnvironmentalFormLayout from "./family-profling/householdInfo/EnvironmentalFormLayout";
import NoncomDiseaseFormLayout from "./family-profling/householdInfo/NonComDiseaseFormLayout";
import TbSurveilanceInfoLayout from "./family-profling/householdInfo/TbSurveilanceInfoLayout";
import SurveyIdentificationForm, { SurveyIdentificationFormHandle } from "./family-profling/householdInfo/SurveyIdentificationForm";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  submitEnvironmentalForm,
  createNCDRecord,
  createTBRecord,
  submitSurveyIdentificationForm
} from "./family-profling/restful-api/profiingPostAPI";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { BeforeUnloadDialog, BeforeUnloadDialogRef } from "@/components/ui/before-unload-dialog";
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

export default function ContinueHealthProfiling() {
  const { famId } = useParams<{ famId: string }>();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const queryClient = useQueryClient();

  // Fetch existing family data
  const { data: familyDataHealth, isLoading: isLoadingFamilyData } = useFamilyDataHealth(famId || null);
  const familyMembersHealth = useFamilyMembersWithResidentDetails(famId || null);
  const { data: residentsListHealth, isLoading: isLoadingResidents } = useResidentsListHealth();

  // State management
  const [currentStep, setCurrentStep] = React.useState<number>(2); // Start at step 2
  const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
  const [selectedResidentId, setSelectedResidentId] = React.useState<string>("");
  const [selectedRespondentId, setSelectedRespondentId] = React.useState<string>("");
  const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>([]);
  const [isDataPrePopulated, setIsDataPrePopulated] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(false);

  const beforeUnloadRef = React.useRef<BeforeUnloadDialogRef>(null);
  const surveyFormRef = React.useRef<SurveyIdentificationFormHandle>(null);

  const householdId = familyDataHealth?.household_no;

  // Initialize form with pre-loaded data
  const defaultValues = React.useMemo(() => {
    const base = generateDefaultValues(familyFormSchema);
    
    if (familyDataHealth) {
      return {
        ...base,
        demographicInfo: {
          householdNo: familyDataHealth.household_no || "",
          building: familyDataHealth.family_building || "",
          indigenous: familyDataHealth.family_indigenous || "",
        },
      };
    }
    
    return base;
  }, [familyDataHealth]);

  const form = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues,
  });

  // Mutations
  const submitEnvironmentalMutation = useMutation({
    mutationFn: (payload: any) => submitEnvironmentalForm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
    }
  });

  const submitSurveyMutation = useMutation({
    mutationFn: (data: Record<string, any>) => submitSurveyIdentificationForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveyIdentificationList"] });
    },
  });

  const submitNCDMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createNCDRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ncdRecordsList"] });
    },
  });

  const submitTBMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createTBRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tbRecordsList"] });
    },
  });

  // Track form changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (!isSubmitting) {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isSubmitting]);

  // Format data
  const formattedResidents = React.useMemo(() => {
    if (!residentsListHealth || currentStep >= 4) return [];
    return formatResidentsWithBadge(residentsListHealth);
  }, [residentsListHealth, currentStep]);

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

  // Get respondent information
  const respondentInfo = React.useMemo(() => {
    if (currentStep !== 5 || !selectedRespondentId || !residentsListHealth) return undefined;
    
    let respondent = residentsListHealth.find((resident: any) => 
      resident.rp_id === selectedRespondentId
    );
    
    if (!respondent && familyMembersHealth) {
      respondent = familyMembersHealth.find((member: any) => 
        member.rp_id === selectedRespondentId
      );
    }
    
    if (respondent) {
      let personalInfo = null;
      
      if (respondent.personal_info) {
        personalInfo = {
          per_fname: respondent.personal_info.per_fname,
          per_lname: respondent.personal_info.per_lname,
          per_mname: respondent.personal_info.per_mname,
        };
      } else if (respondent.per) {
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

  // Loading management
  React.useEffect(() => {
    if (isLoadingFamilyData || isLoadingResidents) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoadingFamilyData, isLoadingResidents, showLoading, hideLoading]);

  // Pre-populate family member selections and dependents when data is loaded
  React.useEffect(() => {
    if (familyMembersHealth && familyMembersHealth.length > 0 && residentsListHealth && !isDataPrePopulated) {
      console.log("Pre-populating family members...", familyMembersHealth);
      
      // Find mother and father by fc_role
      const mother = familyMembersHealth.find((member: any) => 
        member.fc_role?.toUpperCase() === 'MOTHER'
      );
      const father = familyMembersHealth.find((member: any) => 
        member.fc_role?.toUpperCase() === 'FATHER'
      );
      
      // Find dependents
      const dependents = familyMembersHealth.filter((member: any) => 
        member.fc_role?.toUpperCase() !== 'MOTHER' && 
        member.fc_role?.toUpperCase() !== 'FATHER'
      );

      // Set mother ID and form value
      if (mother && mother.rp_id) {
        console.log("Setting mother ID:", mother.rp_id);
        const motherFullName = `${mother.rp_id} - ${mother.per?.per_fname || ''} ${mother.per?.per_lname || ''}`.trim();
        setSelectedMotherId(mother.rp_id);
        form.setValue('motherInfo.id', motherFullName);
      }

      // Set father ID and form value
      if (father && father.rp_id) {
        console.log("Setting father ID:", father.rp_id);
        const fatherFullName = `${father.rp_id} - ${father.per?.per_fname || ''} ${father.per?.per_lname || ''}`.trim();
        setSelectedFatherId(father.rp_id);
        form.setValue('fatherInfo.id', fatherFullName);
      }

      // Set dependents list
      if (dependents.length > 0) {
        console.log("Setting dependents:", dependents);
        // Map dependents to DependentRecord format
        const formattedDependents: DependentRecord[] = dependents.map((dep: any) => ({
          id: dep.rp_id || '',
          lname: dep.per?.per_lname || '',
          fname: dep.per?.per_fname || '',
          mname: dep.per?.per_mname || '',
          suffix: dep.per?.per_suffix || '',
          sex: dep.per?.per_sex || '',
          dateOfBirth: dep.per?.per_dob || '',
        }));
        setDependentsList(formattedDependents);
      }

      setIsDataPrePopulated(true);
    }
  }, [familyMembersHealth, residentsListHealth, isDataPrePopulated, form]);

  // Navigation handlers
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
        form.trigger();
        return;
      }

      setCurrentStep((prev) => prev + 1);
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, form]);

  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  // Final submission
  const handleFinalSubmission = React.useCallback(async () => {
    if (!famId) {
      toast.error("Family ID is required for submission");
      return;
    }

    setIsValidating(true);
    
    try {
      const formData = form.getValues();
      const surveyData = surveyFormRef.current?.getFormData() || null;
      
      const validationResult = validateForSubmission(formData, surveyData);
      
      if (!validationResult.isValid) {
        const grouped = groupValidationErrors(validationResult);

        if (grouped.environmentalCount > 0) {
          toast.error(`Environmental Form: ${grouped.environmentalCount} field(s) required`);
        }
        if (grouped.ncdCount > 0) {
          toast.error(`NCD Records: ${grouped.ncdCount} validation error(s)`);
        }
        if (grouped.tbCount > 0) {
          toast.error(`TB Records: ${grouped.tbCount} validation error(s)`);
        }
        if (grouped.surveyCount > 0) {
          toast.error(`Survey Form: ${grouped.surveyCount} field(s) required`);
        }
        
        form.trigger();
        return;
      }

      setIsSubmitting(true);
      showLoading();

      // Submit Environmental Form Data
      if (formData.environmentalForm && householdId) {
        const environmentalPayload = {
          household_id: householdId,
          water_supply: formData.environmentalForm.waterSupply ? {
            type: formData.environmentalForm.waterSupply as 'level1' | 'level2' | 'level3'
          } : undefined,
          sanitary_facility: formData.environmentalForm.facilityType ? {
            facility_type: formData.environmentalForm.facilityType,
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

        await submitEnvironmentalMutation.mutateAsync(environmentalPayload);
      }

      // Submit NCD Records
      if (formData.ncdRecords?.list && formData.ncdRecords.list.length > 0) {
        for (const ncdRecord of formData.ncdRecords.list) {
          const ncdPayload = prepareNCDRecordForSubmission(ncdRecord);
          if (ncdPayload) {
            await submitNCDMutation.mutateAsync(ncdPayload);
          }
        }
      }

      // Submit TB Records
      if (formData.tbRecords?.list && formData.tbRecords.list.length > 0) {
        for (const tbRecord of formData.tbRecords.list) {
          const tbPayload = prepareTBRecordForSubmission(tbRecord);
          if (tbPayload) {
            await submitTBMutation.mutateAsync(tbPayload);
          }
        }
      }

      // Submit Survey
      if (surveyFormRef.current) {
        const isFormValid = surveyFormRef.current.isFormValid();
        
        if (surveyData && isFormValid) {
          const surveyPayload = prepareSurveyDataForSubmission(surveyData, famId);
          if (surveyPayload) {
            await submitSurveyMutation.mutateAsync(surveyPayload);
          }
        }
      }

      toast("Health profiling completed successfully", {
        icon: <CircleAlert size={24} className="fill-green-500 stroke-white" />,
        style: {
          border: '1px solid rgb(187, 222, 251)',
          padding: '16px',
          color: '#1e3a8a',
          background: '#eff6ff',
        },
      });

      setTimeout(() => {
        setHasUnsavedChanges(false);
        navigate("/profiling/family");
      }, 2000);
      
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error("Failed to submit health family profiling data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
      hideLoading();
    }
  }, [famId, householdId, form, submitEnvironmentalMutation, submitSurveyMutation, submitNCDMutation, submitTBMutation, showLoading, hideLoading, navigate]);

  const calculateProgress = React.useCallback(() => {
    switch (currentStep) {
      case 2: return 40;
      case 3: return 60;
      case 4: return 80;
      case 5: return 100;
      default: return 20;
    }
  }, [currentStep]);

  const progressSteps = React.useMemo(() => [
    { label: "Demographics", minProgress: 25, icon: FaHome },
    { label: "Family Members", minProgress: 50, icon: FaUsers },
    { label: "Dependents", minProgress: 75, icon: FaBriefcaseMedical },
    { label: "Household Info", minProgress: 80, icon: FaHouseUser },
    { label: "Survey Identification", minProgress: 100, icon: FaClipboardList }
  ], []);

  if (isLoadingFamilyData) {
    return (
      <LayoutWithBack
        title="Continue Health Family Profiling"
        description="Loading family data..."
      >
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading family information...</p>
          </div>
        </Card>
      </LayoutWithBack>
    );
  }

  if (!familyDataHealth) {
    return (
      <LayoutWithBack
        title="Continue Health Family Profiling"
        description="Family not found"
      >
        <Card className="p-12">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium">Family not found</p>
            <p className="text-muted-foreground">The selected family could not be loaded.</p>
            <Button onClick={() => navigate("/profiling/family")}>
              Go Back to Family Records
            </Button>
          </div>
        </Card>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack
      title="Continue Health Family Profiling"
      description={`Completing health information for Family ${famId}`}
    >
      <BeforeUnloadDialog
        ref={beforeUnloadRef}
        hasUnsavedChanges={hasUnsavedChanges}
        onConfirmLeave={() => setHasUnsavedChanges(false)}
        onCancelLeave={() => {}}
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
            }}
            dependentsList={dependentsList}
            setSelectedMotherId={setSelectedMotherId}
            setSelectedFatherId={setSelectedFatherId}
            setSelectedRespondentId={setSelectedRespondentId}
            onSubmit={() => nextStep()}
            back={() => navigate("/profiling/family")}
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
            setFamId={() => {}} // Family ID already set from URL
            existingFamId={famId}
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
                
                <div className="mt-8 flex justify-end gap-2 sm:gap-3 p-4 md:p-10">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
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
                <p className="text-gray-500">Loading family members...</p>
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
                description="Are you sure you want to submit the health family profiling data? This action cannot be undone."
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
