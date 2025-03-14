import { Card } from "@/components/ui/card/card";
import { useState } from "react";
import PersonalInfoForm from "./PersonalInfoForm";
import ParentsFormLayout from "./ParentsFormLayout";
import DependentsInfoLayout from "./DependentsInfoLayout";
import DemographicInfo from "./DemographicInfo";

import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { BsChevronLeft } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { profilingFormSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useLocation } from "react-router";

export function ProfilingForm() {
  const location = useLocation()
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const defaultValues = generateDefaultValues(profilingFormSchema)
  const { auth, type } = location.state || {auth: '', type: ''}

  const form = useForm<z.infer<typeof profilingFormSchema>>({
    resolver: zodResolver(profilingFormSchema),
    defaultValues 
  })

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Handler for going to the previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Calculate progress based on current step
  const calculateProgress = () => {
    switch (currentStep) {
      case 1:
        return 20;
      case 2:
        return 60;
      case 3:
        return 80;
      case 4:
        return 100;
      default:
        return 0;
    }
  };

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
              Registration Form
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Provide your details to complete the registration process.
            </p>
          </div>  
        </div>
        
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}

        </p>
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
              onSubmit={()=>nextStep()}
            />
          )}
          {currentStep === 2 && (
            <PersonalInfoForm
              form={form}
              onSubmit={()=>nextStep()}
              back={()=>prevStep()}
            />
          )}
          {currentStep === 3 && (
            <ParentsFormLayout
              form={form}
              onSubmit={()=>nextStep()}
              back={()=>prevStep()}
            />
          )}
          {currentStep === 4 && (
            <DependentsInfoLayout
              form={form}
              onSubmit={()=>nextStep()}
              back={()=>prevStep()}
              auth={auth}
            />
          )}
        </Card>
      </div>
    </>
  );
}
