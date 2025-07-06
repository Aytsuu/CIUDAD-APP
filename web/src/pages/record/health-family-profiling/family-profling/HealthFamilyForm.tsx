// import React from "react";
// import { Card } from "@/components/ui/card/card";
// import ParentsFormLayout from "@/pages/record/health-family-profiling/family-profling/parents/ParentsFormLayout";
// import DependentsInfoLayout from "./dependents/DependentsInfoLayout";
// import DemographicForm from "./demographic/DemographicForm";

// import { Button } from "@/components/ui/button/button";
// import { useLocation } from "react-router";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { familyFormSchema } from "@/form-schema/family-form-schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { generateDefaultValues } from "@/helpers/generateDefaultValues";
// import { DependentRecord } from "@/pages/record/profiling/profilingTypes";
// import { Separator } from "@/components/ui/separator";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
// import RespondentsInfoLayout from "./family/RespondentsInfoLayout";
// import HouseholdHeadLayout from "./householdInfo/HouseholdHeadLayout";
// import HealthInfoLayout from "./healthInfo/HealthInfoLayout";
// import EnvironmentalFormLayout from "./householdInfo/EnvironmentalFormLayout";
// import NoncomDiseaseFormLayout from "./householdInfo/NonComDiseaseFormLayout";
// import TbSurveilanceInfoLayout from "./householdInfo/TbSurveilanceInfoLayout";
// import { useHouseholdsListHealth, useResidentsListHealth } from "../../health-family-profiling/family-profling/queries/profilingFetchQueries";
// import { formatHouseholds, formatResidents } from "../profilingFormats";
// import { useLoading } from "@/context/LoadingContext";


// export default function HealthFamilyForm() {
//   const { showLoading, hideLoading } = useLoading();
//   const { data: householdsList, isLoading: isLoadingHouseholds } = useHouseholdsListHealth();
//   const { data: residentsList, isLoading: isLoadingResidents } = useResidentsListHealth(); 

//   const [currentStep, setCurrentStep] = React.useState<number>(1);
//   const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));

//   const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
//   const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
//   const [selectedResidentId, setSelectedResidentId] =
//     React.useState<string>("");
//   const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>(
//     []
//   );

//   const form = useForm<z.infer<typeof familyFormSchema>>({
//     resolver: zodResolver(familyFormSchema),
//     defaultValues: defaultValues.current,
//   });
//   const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList]);
//   const formattedHouseholds = React.useMemo(() => formatHouseholds(householdsList), [householdsList]);
  
//   React.useEffect(() => {
//     if (isLoadingHouseholds || isLoadingResidents) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isLoadingHouseholds, isLoadingResidents]);

//   const nextStep = React.useCallback(() => {
//     setCurrentStep((prev) => prev + 1);
//   }, []);

//   // Handler for going to the previous step
//   const prevStep = React.useCallback(() => {
//     setCurrentStep((prev) => prev - 1);
//   }, []);

//   return (
//     <LayoutWithBack
//       title="Family Profile Form"
//       description="Provide your details to complete the registration process."
//     >
//       <div>
//         <Card className="w-full h-full ">
//           {currentStep === 1 && (
//             <>
//               <DemographicForm
//                 form={form}
//                 households={formattedHouseholds}
//                 // onSubmit={() => {
//                 //   nextStep();
//                 // }}
//               />
//               <div className="flex items-center justify-between px-10">
//                 <Separator />
//               </div>
//               <RespondentsInfoLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedResidentId={selectedResidentId}
//                 setSelectedResidentId={setSelectedResidentId}
//               />
//               <div className="flex items-center justify-between px-10">
//                 <Separator />
//               </div>
//               <HouseholdHeadLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedResidentId={selectedResidentId}
//                 setSelectedResidentId={setSelectedResidentId}
//               />
//               <div className="flex items-center justify-between px-10">
//                 <Separator />
//               </div>
//               <ParentsFormLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedParents={{
//                   mother: selectedMotherId,
//                   father: selectedFatherId,
//                 }}
//                 dependentsList={dependentsList}
//                 setSelectedMotherId={setSelectedMotherId}
//                 setSelectedFatherId={setSelectedFatherId}
//                 // onSubmit={() => nextStep()}
//                 // back={() => prevStep()}
//               />
//               <div className="flex items-center justify-between px-10">
//                 <Separator />
//               </div>
//               <HealthInfoLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedResidentId={selectedResidentId}
//                 setSelectedResidentId={setSelectedResidentId}
//               />
//             </>
//           )}
//           {currentStep === 2 && (
//             <DependentsInfoLayout
//               form={form}
//               residents={{
//                 default: residentsList,
//                 formatted: formattedResidents,
//               }}
//               selectedParents={[selectedMotherId, selectedFatherId]}
//               dependentsList={dependentsList}
//               setDependentsList={setDependentsList}
//               defaultValues={defaultValues}
//               // back={() => prevStep()}
//             />
//           )}
//           {currentStep === 3 && (
//             <>
//               <EnvironmentalFormLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedResidentId={selectedResidentId}
//                 setSelectedResidentId={setSelectedResidentId}
//               />
//               <div className="flex items-center justify-between px-10">
//                 <Separator />
//               </div>
//               <NoncomDiseaseFormLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedResidentId={selectedResidentId}
//                 setSelectedResidentId={setSelectedResidentId}
//               />
//               <div className="flex items-center justify-between px-10">
//                 <Separator />
//               </div>
//               <TbSurveilanceInfoLayout
//                 form={form}
//                 residents={{
//                   default: residentsList,
//                   formatted: formattedResidents,
//                 }}
//                 selectedResidentId={selectedResidentId}
//                 setSelectedResidentId={setSelectedResidentId}
//               />
//             </>
//           )}
//           {currentStep === 4 && (
//             <NoncomDiseaseFormLayout
//               form={form}
//               residents={{
//                 default: residentsList,
//                 formatted: formattedResidents,
//               }}
//               selectedResidentId={selectedResidentId}
//               setSelectedResidentId={setSelectedResidentId}
//             />
//           )}
//           <div className="flex justify-end">
//             <div className="flex items-center pb-10 space-x-4 mr-10">
//               {currentStep > 1 && (
//                 <Button onClick={prevStep} variant="outline">
//                   Previous
//                 </Button>
//               )}
//               {currentStep < 4 && (
//                 <Button onClick={nextStep}>
//                   {currentStep === 3 ? "Finish" : "Next"}
//                 </Button>
//               )}
//             </div>
//           </div>
//         </Card>
//       </div>
//     </LayoutWithBack>
//   );
// }
