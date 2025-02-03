import { Card } from "@/components/ui/card";
import { useState } from "react";
import PersonalInfoForm from "./PersonalInfoForm";
import ParentsForm from "./ParentsForm";
import {
  FormData,
  PersonalFormData,
  ParentsFormData,
} from "../profiling/FormDataType";
import Progress from "./progress";

export function ProfilingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {},
    parentsInfo: {},
  });

  const handlePersonalInfoSubmit = (data: PersonalFormData) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: data,
    }));
    setCurrentStep(2);
  };

  const handleParentsInfoSubmit = (data: ParentsFormData) => {
    setFormData((prev) => ({
      ...prev,
      parentsInfo: data,
    }));

    // Handle final form submission here
    console.log("Complete form data:", {
      ...formData,
      parentsInfo: data,
    });

    // Send data API
  };

  return (
    <div>
      <div className="flex justify-center items-center pb-10">
        <Progress progress={50} />
      </div>
      <div>
        <Card className="w-full border-none shadow-none">
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
      </div>
    </div>
  );
}
