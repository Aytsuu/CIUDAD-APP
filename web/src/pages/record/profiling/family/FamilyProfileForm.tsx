import React from "react";
import { Card } from "@/components/ui/card/card";
import ParentsFormLayout from "./ParentsFormLayout";
import DependentsInfoLayout from "./DependentsInfoLayout";
import DemographicInfo from "./DemographicInfo";

import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button/button";
import { useNavigate, useLocation } from "react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { formatHouseholds, formatResidents } from "../formatting";
import { father } from "../restful-api/profiingPostAPI";

export default function FamilyProfileForm() {

  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));

  const [selectedMotherId, setSelectedMotherId] = React.useState<string>('');
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>('');
  
  const form = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: defaultValues.current,
  })

  const params = React.useMemo(() => {
    return location.state?.params || {}
  }, [location.state]);

  const formattedResidents = React.useMemo(() => {
    return formatResidents(params, false)
  }, [params.residents]);

  const households = React.useMemo(() => {
    return formatHouseholds(params)
  }, [params.households])

  const nextStep = React.useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  // Handler for going to the previous step
  const prevStep = React.useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  // Calculate progress based on current step
  const calculateProgress = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        return 30;
      case 2:
        return 60;
      case 3:
        return 100;
      default:
        return 0;
    }
  }, [currentStep]);

  return (
    <>
      <div className="flex gap-2 justify-between pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Header - Stacks vertically on mobile */}
          <Button 
            className="text-black p-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <BsChevronLeft />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Family Form
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Provide your details to complete the registration process.
            </p>
          </div>  
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="flex justify-center items-center pb-4 pt-4 bg-white mt-4 rounded-t-lg">
        <ProgressWithIcon progress={calculateProgress()} />
      </div>
      <div>
        <Card className="w-full border-none shadow-none rounded-b-lg rounded-t-none">
          {currentStep === 1 && (
            <DemographicInfo
              form={form}
              households={households}
              onSubmit={()=>nextStep()}
            />
          )}
          {currentStep === 2 && (
            <ParentsFormLayout
              form={form}
              residents={{default: params.residents, formatted: formattedResidents}}
              selectedParents={{mother: selectedMotherId, father: selectedFatherId}}
              setSelectedMotherId={setSelectedMotherId}
              setSelectedFatherId={setSelectedFatherId}
              onSubmit={()=>nextStep()}
              back={()=>prevStep()}
            />
          )}
          {currentStep === 3 && (
            <DependentsInfoLayout
              form={form}
              residents={{default: params.residents, formatted: formattedResidents}}
              selectedParents={{mother: selectedMotherId, father: selectedFatherId}}
              defaultValues={defaultValues}
              back={()=>prevStep()}
            />
          )}
        </Card>
      </div>
    </>
  );
}
