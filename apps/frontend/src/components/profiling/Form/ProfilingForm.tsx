import { Card } from "@/components/ui/card";
import { useState } from "react";
import PersonalInfoForm from "./PersonalInfoForm";
import ParentsForm from "./ParentsForm";
import DependentsInfo from "./DependentsInfo";
import {
  FormData,
  PersonalFormData,
  MotherFormData,
  FatherFormData,
  DependentFormData,
} from "../Schema/FormDataType";
import Progress from "../progress";

export function ProfilingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      sex: "",
      status: "",
      dateOfBirth: "",
      birthPlace: "",
      citizenship: "",
      religion: "",
      contact: "",
    },
    motherInfo: {
      MotherLName: "",
      MotherFName: "",
      MotherMName: "",
      MotherSuffix: "",
      MotherDateOfBirth: "",
      MotherStatus: "",
      MotherReligion: "",
      MotherEdAttainment: "",
    },
    fatherInfo: {
      FatherLName: "",
      FatherFName: "",
      FatherMName: "",
      FatherSuffix: "",
      FatherDateOfBirth: "",
      FatherStatus: "",
      FatherReligion: "",
      FatherEdAttainment: "",
    },
    dependentInfo: {
      dependentFName: "",
      dependentLName: "",
      dependentMName: "",
      dependentSuffix: "",
      dependentDateOfBirth: "",
      dependentSex: "",
    },
  });

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Handler for going to the previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handlePersonalInfoSubmit = (data: PersonalFormData) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: data,
    }));
    nextStep();
  };

  const handleParentInfoSubmit = (
    motherData: MotherFormData,
    fatherData: FatherFormData
  ) => {
    setFormData((prev) => ({
      ...prev,
      motherInfo: motherData,
      fatherInfo: fatherData,
    }));
    nextStep();
  };

  const handleDependentInfoSubmit = (data: DependentFormData) => {
    setFormData((prev) => ({
      ...prev,
      dependentInfo: data,
    }));

    // Handle final form submission
    const finalFormData = {
      ...formData,
      dependentInfo: data, // Fixed to use dependentInfo instead of parentsInfo
    };

    console.log("Complete form data:", finalFormData);
    // Send data to API
  };

  // Calculate progress based on current step
  const calculateProgress = () => {
    switch (currentStep) {
      case 1:
        return 33;
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center pb-10">
        <Progress progress={calculateProgress()} />
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
              onSubmit={handleParentInfoSubmit}
              initialData={{
                motherInfo: formData.motherInfo,
                fatherInfo: formData.fatherInfo,
              }}
              onBack={() => prevStep()}
            />
          )}
          {currentStep === 3 && (
            <DependentsInfo
              onSubmit={handleDependentInfoSubmit}
              initialData={formData.dependentInfo}
              onBack={() => prevStep()}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
