import React from "react";
import { Card } from "@/components/ui/card/card";
import ParentsFormLayout from "./parent/ParentsFormLayout";
import DependentsInfoLayout from "./dependent/DependentsInfoLayout";
import DemographicForm from "./demographic/DemographicForm";

import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button/button";
import { useNavigate, useLocation } from "react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { formatHouseholds, formatResidents } from "../profilingFormats";
import { DependentRecord } from "../profilingTypes";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function FamilyProfileForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));

  const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
  const [selectedGuardianId, setSelectedGuardianId] =
    React.useState<string>("");
  const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>(
    []
  );

  const form = useForm<z.infer<typeof familyFormSchema>>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: defaultValues.current,
  });

  const params = React.useMemo(() => {
    return location.state?.params || {};
  }, [location.state]);

  const formattedResidents = React.useMemo(() => {
    return formatResidents(params, false);
  }, [params.residents]);

  const households = React.useMemo(() => {
    return formatHouseholds(params);
  }, [params.households]);

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
    <LayoutWithBack
      title="Family Profile"
      description="Provide your details to complete the registration process."
    >
        <Card className="w-full">
          <div className="pt-10">
            <ProgressWithIcon progress={calculateProgress()} />
          </div>
          {currentStep === 1 && (
            <DemographicForm
              form={form}
              households={households}
              onSubmit={() => nextStep()}
            />
          )}
          {currentStep === 2 && (
            <ParentsFormLayout
              form={form}
              residents={{
                default: params.residents,
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
              residents={{
                default: params.residents,
                formatted: formattedResidents,
              }}
              selectedParents={[
                selectedMotherId,
                selectedFatherId,
                selectedGuardianId,
              ]}
              dependentsList={dependentsList}
              setDependentsList={setDependentsList}
              defaultValues={defaultValues}
              back={() => prevStep()}
            />
          )}
        </Card>

    </LayoutWithBack>
  );
}
