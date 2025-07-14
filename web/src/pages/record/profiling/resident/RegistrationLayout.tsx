import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import ProgressWithIcon from "@/components/ui/progressWithIcon";
import { CircleUserRound, HousePlus, Store, UserRoundPlus, UsersRound } from "lucide-react";
import React from "react";
import ResidentCreateForm from "./form/ResidentCreateForm";
import AccountRegistrationLayout from "../../account/AccountRegisterLayout";
import BusinessFormLayout from "../business/BusinessFormLayout";
import HouseholdFormLayout from "../household/HouseholdFormLayout";
import SoloFormLayout from "../family/living-solo/SoloFormLayout";
import { RegisterToExistingFam } from "../family/RegisterToExistingFam";
import RegistrationCompletion from "./RegistrationCompletion";

const registrationSteps = [
  { label: "Resident", minProgress: 20, icon: UserRoundPlus },
  { label: "Account", minProgress: 40, icon: CircleUserRound },
  { label: "Household", minProgress: 60, icon: HousePlus },
  { label: "Family", minProgress: 80, icon: UsersRound },
  { label: "Business", minProgress: 100, icon: Store }
];

export default function RegistrationLayout() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [residentId, setResidentId] = React.useState<string>('');
  const [hasFamily, setHasFamily] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>();

  // Calculate progress based on current step
  const calculateProgress = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        return 20;
      case 2:
        return 40;
      case 3:
        return 60;
      case 4:
        return 80;
      case 5:
        return 100;
      case 6:
        return 101;
      default:
        return 0;
    }
  }, [currentStep]);

  return (
    <LayoutWithBack
      title="Resident Registration"
      description="Provide the necessary details, and complete the registration."
    >
      {currentStep !== 6 && (
        <ProgressWithIcon
          progress={calculateProgress()}
          steps={registrationSteps}
        />
      )}

      {currentStep === 1 && (
        <ResidentCreateForm 
          params={{
            isRegistrationTab: true,
            setResidentId: (rp_id: string) => setResidentId(rp_id),
            setAddresses: (addresses: Record<string, any>[]) => setAddresses(addresses),
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 2 && (
        <AccountRegistrationLayout 
          tab_params={{
            residentId: residentId,
            isRegistrationTab: true,
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 3 && (
        <HouseholdFormLayout 
          tab_params={{
            residentId: residentId,
            addresses: addresses,
            isRegistrationTab: true,
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 4 && (
        <div className="flex justify-center">
            {!hasFamily ? (
              <SoloFormLayout 
                tab_params={{
                  residentId: residentId,
                  isRegistrationTab: true,
                  next: () => setCurrentStep((prev) => prev + 1),
                  setHasFamily: (value: boolean) => setHasFamily(value)
                }}
              />
            ) : (
              <RegisterToExistingFam 
                tab_params={{
                  residentId: residentId,
                  next: () => setCurrentStep((prev) => prev + 1),
                  setHasFamily: (value: boolean) => setHasFamily(value)
                }}
              />
            )}
        </div>
      )}
      {currentStep === 5 && (
        <BusinessFormLayout 
          tab_params={{
            residentId: residentId,
            isRegistrationTab: true,
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 6 && ( // Completion page with animation
        <RegistrationCompletion />
      )}
    </LayoutWithBack>
  )
}