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
import { useLocation } from "react-router";
import ResidentRequestForm from "./form/ResidentRequestForm";

const registrationSteps = [
  { id: 1, label: "Resident", minProgress: 20, icon: UserRoundPlus },
  { id: 2, label: "Account", minProgress: 40, icon: CircleUserRound },
  { id: 3, label: "Household", minProgress: 60, icon: HousePlus },
  { id: 4, label: "Family", minProgress: 80, icon: UsersRound },
  { id: 5, label: "Business", minProgress: 100, icon: Store }
];

const requestSteps = [
  { id: 1, label: "Resident", minProgress: 25, icon: UserRoundPlus },
  { id: 2, label: "Household", minProgress: 50, icon: HousePlus },
  { id: 3, label: "Family", minProgress: 75, icon: UsersRound },
  { id: 4, label: "Business", minProgress: 100, icon: Store }
]

export default function RegistrationLayout() {
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [residentId, setResidentId] = React.useState<string>('');
  const [hasFamily, setHasFamily] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>();

  // Calculate progress based on current step
  const calculateProgress = React.useCallback(() => {
    for (const step of (params?.origin == 'create' ? registrationSteps : requestSteps)) {
      if(currentStep == step.id) {
        return step.minProgress;
      }
    }
    return 0;
  }, [currentStep]);

  const create = (
    <>
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
    </>
  )

  const approve = (
    <>
      {currentStep !== 5 && (
        <ProgressWithIcon
          progress={calculateProgress()}
          steps={requestSteps}
        />
      )}
      {currentStep === 1 && (
        <ResidentRequestForm 
          params={{
            data: params?.data,
            setResidentId: (rp_id: string) => setResidentId(rp_id),
            setAddresses: (addresses: Record<string, any>[]) => setAddresses(addresses),
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 2 && (
        <HouseholdFormLayout 
          tab_params={{
            residentId: residentId,
            addresses: addresses,
            isRegistrationTab: true,
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 3 && (
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
      {currentStep === 4 && (
        <BusinessFormLayout 
          tab_params={{
            residentId: residentId,
            isRegistrationTab: true,
            next: () => setCurrentStep((prev) => prev + 1)
          }}
        />
      )}
      {currentStep === 5 && (
        <RegistrationCompletion />
      )}
    </>
  )

  return (
    <LayoutWithBack
      title={params?.title}
      description={params?.description}
    >
      {params?.origin === "create" ? create : approve}
    </LayoutWithBack>
  )

}