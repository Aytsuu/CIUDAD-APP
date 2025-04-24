"use client"
import React from "react";

import { Card } from "@/components/ui/card/card"
import { Button } from "@/components/ui/button/button"
import { DemographicData } from "./DemographicData"
import DependentsForm from "./DependentsInfo"
import EnvironmentalForm from "./EnvironmentalForm"
import NonCommunicableDiseaseForm from "./NonCommunicableDisease"
import SurveyIdentificationForm from "./SurveyIdentificationForm"
import { Progress } from "@/components/ui/progress"
import { useForm } from "react-hook-form";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { DemographicSchema } from "@/form-schema/family-profiling-schema";
import { z } from "zod";


import type {
  DemographicFormData,
  DependentsFormData,
  EnvironmentalFormData,
  NonCommunicableDiseaseFormData,
  SurveyFormData,
  HealthSurveyData,
} from "@/form-schema/health-data-types"

export function FamilyProfileForm({ households }: { households?: any[] }) {
  
   const defaultValues = React.useRef(generateDefaultValues(DemographicSchema));

  const form = useForm<z.infer<typeof DemographicSchema>>({
    resolver: zodResolver(DemographicSchema),
    defaultValues: defaultValues.current,
  })

  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<HealthSurveyData>({
    demographic: {} as DemographicFormData,
    dependents: {} as DependentsFormData,
    environmental: {} as EnvironmentalFormData,
    nonCommunicableDisease: {} as NonCommunicableDiseaseFormData,
    surveyIdentification: {} as SurveyFormData,
  })

  const totalSteps = 5

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleStepSubmit = (stepData: Partial<HealthSurveyData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
    nextStep()
  }

  const handleFinalSubmit = (data: SurveyFormData) => {
    setFormData((prev) => ({ ...prev, surveyIdentification: data }))
    // Handle final form submission
    console.log("Complete Health Survey Data:", formData)
    // TODO: Send data to API or perform final actions
  }

  const calculateProgress = () => {
    return (currentStep / totalSteps) * 100
  }

  return (
    <div className="w-full h-full container mx-auto py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Family Profile Form</h1>
          <p className="text-sm text-muted-foreground">Please complete all sections of the Family Profile Form.</p>
        </div>
        <div className="w-full sm:w-64">
          <Progress value={calculateProgress()} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      <Card className="p-6">
        {currentStep === 1 && (
          <DemographicData
            form = {form}
            households={[]}
            onSubmit={()=>nextStep()}

          />
        )}
        {currentStep === 2 && (
          <DependentsForm
            onSubmit={(data) => handleStepSubmit({ dependents: data })}
            initialData={formData.dependents}
          />
        )}
        {currentStep === 3 && (
          <EnvironmentalForm
            onSubmit={(data) => handleStepSubmit({ environmental: data })}
            initialData={formData.environmental}
          />
        )}
        {currentStep === 4 && (
          <NonCommunicableDiseaseForm
            onSubmit={(data) => handleStepSubmit({ nonCommunicableDisease: data })}
            initialData={formData.nonCommunicableDisease}
          />
        )}
        {currentStep === 5 && (
          <SurveyIdentificationForm onSubmit={handleFinalSubmit} initialData={formData.surveyIdentification} />
        )}

        <div className="flex justify-between mt-6 ml-7 mr-7">
          {currentStep > 1 && (
            <Button onClick={prevStep} variant="outline">
              Previous
            </Button>
          )}
          {currentStep < totalSteps && (
            <Button onClick={nextStep} className="ml-auto">
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

