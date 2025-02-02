import { Card } from "@/components/ui/card";
import { useState } from "react";
import PersonalInfoForm from "./PersonalInfoForm";
import ParentsForm from "./ParentsForm";
import { FormData, PersonalFormData, ParentsFormData } from "../profiling/FormDataType";

export function ProfilingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {},
    parentsInfo: {}
  });

  const handlePersonalInfoSubmit = (data: PersonalFormData) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: data
    }));
    setCurrentStep(2);
  };

  const handleParentsInfoSubmit = (data: ParentsFormData) => {
    setFormData(prev => ({
      ...prev,
      parentsInfo: data
    }));
    
    // Handle final form submission here
    console.log('Complete form data:', {
      ...formData,
      parentsInfo: data
    });

    // Send data API
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {currentStep === 1 && (
        <PersonalInfoForm 
          onSubmit={handlePersonalInfoSubmit}
          initialData={formData.personalInfo}
        />
      )}
      {currentStep === 2 && (
        <ParentsForm
          onSubmit={handleParentsInfoSubmit}
          initialData={formData.parentsInfo}
        />
      )}
    </Card>
  );
}