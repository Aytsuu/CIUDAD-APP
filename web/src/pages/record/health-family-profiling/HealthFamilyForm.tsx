import React from "react";
import { Card } from "@/components/ui/card/card";
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
import { formatHouseholds, formatResidents } from "./profilingFormats";
import { DependentRecord } from "./profilingTypes";
import { FaHome, FaUsers, FaBriefcaseMedical, FaHouseUser } from "react-icons/fa";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useHouseholdsListHealth, useResidentsListHealth, useFamilyMembersWithResidentDetails } from "./family-profling/queries/profilingFetchQueries";
import { useLoading } from "@/context/LoadingContext";
// These imports are currently unused but may be needed when implementing step 4
import EnvironmentalFormLayout from "./family-profling/householdInfo/EnvironmentalFormLayout";
import NoncomDiseaseFormLayout from "./family-profling/householdInfo/NonComDiseaseFormLayout";
import TbSurveilanceInfoLayout from "./family-profling/householdInfo/TbSurveilanceInfoLayout";
import { Separator } from "@/components/ui/separator";
// import SurveyIdentificationForm from "./family-profling/householdInfo/SurveyIdentificationForm";

export default function HealthFamilyForm() {
  const { showLoading, hideLoading } = useLoading();
  const { data: householdsListHealth, isLoading: isLoadingHouseholds } = useHouseholdsListHealth();
  const { data: residentsListHealth, isLoading: isLoadingResidents } = useResidentsListHealth(); 
  const [currentStep, setCurrentStep] = React.useState<number>(4);
  const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));
  const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
  const [selectedGuardianId, setSelectedGuardianId] = React.useState<string>("");
  const [selectedResidentId, setSelectedResidentId] = React.useState<string>("");
  const [famId, setFamId] = React.useState<string>("250804000004-R"); // Family ID from backend
  const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>(
    []
  );
  const form = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: defaultValues.current,
  });
 
  const formattedResidents = React.useMemo(() => formatResidents(residentsListHealth), [residentsListHealth]);
  const formattedHouseholds = React.useMemo(() => formatHouseholds(householdsListHealth), [householdsListHealth]);
  const familyMembersHealth = useFamilyMembersWithResidentDetails(famId);

  // Debug logging
  React.useEffect(() => {
    console.log('Family ID:', famId);
    console.log('Family Members:', familyMembersHealth);
    console.log('Current Step:', currentStep);
  }, [famId, familyMembersHealth, currentStep]);

  React.useEffect(() => {
      if(isLoadingHouseholds || isLoadingResidents) {
        showLoading();
      } else {
        hideLoading();
      }
    }, [isLoadingHouseholds, isLoadingResidents])
  
  const nextStep = React.useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  // Handler for going to the previous step
  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);


  // Calculate progress based on current step (4 steps)
  const calculateProgress = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        return 25;
      case 2:
        return 50;
      case 3:
        return 75;
      case 4:
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
    // { label: "Household Info", minProgress: 100, icon: FaHouseUser },
    // { label: "Survey Identification", minProgress: 100, icon: FaClipboardList }
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
                guardian: selectedGuardianId,
              }}
              dependentsList={dependentsList}
              setSelectedMotherId={setSelectedMotherId}
              setSelectedFatherId={setSelectedFatherId}
              setSelectedGuardianId={setSelectedGuardianId}
              onSubmit={() => nextStep()}
              back={() => prevStep()}
            />
          )}
          {currentStep === 3 && (
            <DependentsInfoLayout
              form={form}
              residents={{ default: residentsListHealth, formatted: formattedResidents }}
              selectedParents={[selectedMotherId, selectedFatherId, selectedGuardianId]}
              dependentsList={dependentsList}
              setDependentsList={setDependentsList}
              back={prevStep}
              nextStep={nextStep}
              setFamId={setFamId}
            />
          )}
          {currentStep === 4 && (
            <>
              {famId && familyMembersHealth && familyMembersHealth.length > 0 ? (
                <>
                  <EnvironmentalFormLayout
                    form={form}
                    residents={{
                      default: familyMembersHealth,
                      formatted: familyMembersHealth.map(mem => ({
                        ...mem,
                        id: `${mem.rp_id} - ${mem.per?.per_fname || ''} ${mem.per?.per_lname || ''}`
                      }))
                    }}
                    selectedResidentId={selectedResidentId}
                    setSelectedResidentId={setSelectedResidentId}
                  />
                  <Separator className="my-6" />
                  <NoncomDiseaseFormLayout
                    form={form}
                    familyMembers={familyMembersHealth}
                    selectedResidentId={selectedResidentId}
                    setSelectedResidentId={setSelectedResidentId}
                  />
                  <Separator className="my-6" />
                  <TbSurveilanceInfoLayout
                    form={form}
                    residents={familyMembersHealth}
                    selectedResidentId={selectedResidentId}
                    setSelectedResidentId={setSelectedResidentId}
                  />
                  
                  {/* Navigation Buttons for Step 4 */}
                  <div className="mt-8 flex justify-end gap-2 sm:gap-3 p-4 md:p-10">
                    <Button onClick={() => nextStep()} className="w-full sm:w-32">
                      Confirm
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {!famId ? 'No family ID available' : 
                     !familyMembersHealth ? 'Loading family members...' : 
                     familyMembersHealth.length === 0 ? 'No family members found' : 
                     'Loading...'}
                  </p>
                  {famId && <p className="text-sm text-gray-400">Family ID: {famId}</p>}
                </div>
              )}
            </>
          )}
          
          
          
        </Card>

    </LayoutWithBack>
  );
}


// {currentStep === 4 && (
//             <>
//               {famId && familyMembersHealth && familyMembersHealth.length > 0 ? (
//                 <>
//                   <EnvironmentalFormLayout
//                     form={form}
//                     residents={{
//                       default: familyMembersHealth,
//                       formatted: familyMembersHealth.map(mem => ({
//                         ...mem,
//                         id: `${mem.rp_id} - ${mem.per?.per_fname || ''} ${mem.per?.per_lname || ''}`
//                       }))
//                     }}
//                     selectedResidentId={selectedResidentId}
//                     setSelectedResidentId={setSelectedResidentId}
//                   />
//                   <Separator className="my-6" />
//                   <NoncomDiseaseFormLayout
//                     form={form}
//                     familyMembers={familyMembersHealth}
//                     selectedResidentId={selectedResidentId}
//                     setSelectedResidentId={setSelectedResidentId}
//                   />
//                   <Separator className="my-6" />
//                   <TbSurveilanceInfoLayout
//                     form={form}
//                     residents={familyMembersHealth}
//                     selectedResidentId={selectedResidentId}
//                     setSelectedResidentId={setSelectedResidentId}
//                   />
                  
//                   {/* Navigation Buttons for Step 4 */}
//                   <div className="mt-8 flex justify-end gap-2 sm:gap-3 p-4 md:p-10">
//                     <Button onClick={() => nextStep()} className="w-full sm:w-32">
//                       Confirm
//                     </Button>
//                   </div>
//                 </>
//               ) : (
//                 <div className="p-8 text-center">
//                   <p className="text-gray-500">
//                     {!famId ? 'No family ID available' : 
//                      !familyMembersHealth ? 'Loading family members...' : 
//                      familyMembersHealth.length === 0 ? 'No family members found' : 
//                      'Loading...'}
//                   </p>
//                   {famId && <p className="text-sm text-gray-400">Family ID: {famId}</p>}
//                 </div>
//               )}
//             </>
//           )}
          
// {currentStep === 5 && (
//             // <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
//             //   <div className="space-y-6">
//             //     <SurveyIdentificationForm onSubmit={(_data) => { /* handle survey form submission here */ }} />
//             //   </div>
              
//             //   {/* Navigation Buttons for Step 5 */}
//             //   <div className="mt-8 flex justify-end gap-2 sm:gap-3">
//             //     <Button variant="outline" className="w-full sm:w-32" onClick={() => prevStep()}>
//             //       Back
//             //     </Button>
//             //     <Button onClick={() => {
//             //       // Handle form submission/completion here
//             //       console.log('Survey completed!');
//             //     }} className="w-full sm:w-32">
//             //       Confirm
//             //     </Button>
//             //   </div>
//             // </div>
//           )}