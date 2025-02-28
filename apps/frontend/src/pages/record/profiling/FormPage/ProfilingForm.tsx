import { Card } from "@/components/ui/card/card";
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
} from "../_types";
import Progress from "@/components/ui/progressWithIcon";
import { Link } from "react-router";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function ProfilingForm() {
  const navigate = useNavigate();
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
      additionalDependents: [],
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
      <div className="flex gap-2 justify-between pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
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
            Registration Form
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Provide your details to complete the registration process.
          </p>
        </div>  
      </div>
      
        {/* <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </p> */}
      </div>
      <div className="flex justify-center items-center pb-4 pt-4 bg-white mt-4 rounded-t-lg">
        <Progress progress={calculateProgress()} />
      </div>
      <div>
        <Card className="w-full border-none shadow-none rounded-b-lg rounded-t-none">
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
