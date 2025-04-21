import React from "react";
import { Card } from "@/components/ui/card/card";
import ParentsFormLayout from "@/pages/record/health-family-profiling/family-profling/parents/ParentsFormLayout";
import DependentsInfoLayout from "./family-profling/dependents/DependentsInfoLayout";
import DemographicForm from "./family-profling/demographic/DemographicForm";

import { Button } from "@/components/ui/button/button";
import { useLocation } from "react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { familyFormSchema } from "@/form-schema/family-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import {
  formatHouseholds,
  formatResidents,
} from "@/pages/record/profiling/profilingFormats";
import { DependentRecord } from "@/pages/record/profiling/profilingTypes";
import { Separator } from "@/components/ui/separator";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import RespondentsInfoLayout from "./family-profling/family/RespondentsInfoLayout";
import HouseholdHeadLayout from "./family-profling/householdInfo/HouseholdHeadLayout";
import HealthInfoLayout from "./family-profling/healthInfo/HealthInfoLayout";
import EnvironmentalFormLayout from "./family-profling/householdInfo/EnvironmentalFormLayout";
import NoncomDiseaseFormLayout from "./family-profling/householdInfo/NonComDiseaseFormLayout";
import TbSurveilanceInfoLayout from "./family-profling/householdInfo/TbSurveilanceInfoLayout";

export default function HealthFamilyForm() {
  const location = useLocation();

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const defaultValues = React.useRef(generateDefaultValues(familyFormSchema));

  const [selectedMotherId, setSelectedMotherId] = React.useState<string>("");
  const [selectedFatherId, setSelectedFatherId] = React.useState<string>("");
  const [selectedResidentId, setSelectedResidentId] =
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
    return formatResidents(params);
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

  return (
    <LayoutWithBack
      title="Family Profiling"
      description="Provide your details to complete the registration process."
    >
      <div>
        <Card className="w-full h-full ">
          {currentStep === 1 && (
            <>
              <DemographicForm
                form={form}
                households={households}
                // onSubmit={() => {
                //   [];
                // }}
              />
              <div className="flex items-center justify-between px-10">
                <Separator />
              </div>
              <RespondentsInfoLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedResidentId={selectedResidentId}
                setSelectedResidentId={setSelectedResidentId}
              />
              <div className="flex items-center justify-between px-10">
                <Separator />
              </div>
              <HouseholdHeadLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedResidentId={selectedResidentId}
                setSelectedResidentId={setSelectedResidentId}
              />
              <div className="flex items-center justify-between px-10">
                <Separator />
              </div>
              <ParentsFormLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedParents={{
                  mother: selectedMotherId,
                  father: selectedFatherId,
                }}
                dependentsList={dependentsList}
                setSelectedMotherId={setSelectedMotherId}
                setSelectedFatherId={setSelectedFatherId}
                // onSubmit={() => nextStep()}
                // back={() => prevStep()}
              />
              <div className="flex items-center justify-between px-10">
                <Separator />
              </div>
              <HealthInfoLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedResidentId={selectedResidentId}
                setSelectedResidentId={setSelectedResidentId}
              />
            </>
          )}
          {currentStep === 2 && (
            <DependentsInfoLayout
              form={form}
              residents={{
                default: params.residents,
                formatted: formattedResidents,
              }}
              selectedParents={[selectedMotherId, selectedFatherId]}
              dependentsList={dependentsList}
              setDependentsList={setDependentsList}
              defaultValues={defaultValues}
              // back={() => prevStep()}
            />
          )}
          {currentStep === 3 && (
            <>
              <EnvironmentalFormLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedResidentId={selectedResidentId}
                setSelectedResidentId={setSelectedResidentId}
              />
              <div className="flex items-center justify-between px-10">
                <Separator />
              </div>
              <NoncomDiseaseFormLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedResidentId={selectedResidentId}
                setSelectedResidentId={setSelectedResidentId}
              />
              <div className="flex items-center justify-between px-10">
                <Separator />
              </div>
              <TbSurveilanceInfoLayout
                form={form}
                residents={{
                  default: params.residents,
                  formatted: formattedResidents,
                }}
                selectedResidentId={selectedResidentId}
                setSelectedResidentId={setSelectedResidentId}
              />
            </>
          )}
          {currentStep === 4 && (
            <NoncomDiseaseFormLayout
              form={form}
              residents={{
                default: params.residents,
                formatted: formattedResidents,
              }}
              selectedResidentId={selectedResidentId}
              setSelectedResidentId={setSelectedResidentId}
            />
          )}
          <div className="flex justify-end">
            <div className="flex items-center pb-10 space-x-4 mr-10">
              {currentStep === 1 && <Button onClick={nextStep}>Next</Button>}
              {currentStep === 2 && (
                <div className="gap-4">
                  <Button onClick={prevStep} variant="outline">
                    Previous
                  </Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              )}
              {currentStep === 3 && (
                <div className="gap-4">
                  <Button onClick={prevStep} variant="outline">
                    Previous
                  </Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              )}
              {currentStep === 4 && (
                <div className="gap-4">
                  <Button onClick={prevStep} variant="outline">
                    Previous
                  </Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </LayoutWithBack>
  );
}
