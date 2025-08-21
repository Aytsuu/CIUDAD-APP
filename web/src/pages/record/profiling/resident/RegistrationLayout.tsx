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

export default function RegistrationLayout() {
  // --------------- STATE INITIALIZATION ------------------
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);

  const [currentStep, setCurrentStep] = React.useState<number>(4);
  const [residentId, setResidentId] = React.useState<string>('');
  const [hasFamily, setHasFamily] = React.useState<boolean>(false);
  const [addresses, setAddresses] = React.useState<Record<string, any>[]>();
  const [completed, setCompleted] = React.useState<any[]>([1,2,3])

  const registrationSteps = [
    { id: 1, label: "Resident", minProgress: 20, icon: UserRoundPlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 2, label: "Account", minProgress: 40, icon: CircleUserRound, onClick: (id: number) => handleProgressSelection(id) },
    { id: 3, label: "Household", minProgress: 60, icon: HousePlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 4, label: "Family", minProgress: 80, icon: UsersRound, onClick: (id: number) => handleProgressSelection(id) },
    { id: 5, label: "Business", minProgress: 100, icon: Store, onClick: (id: number) => handleProgressSelection(id) }
  ];

  const requestSteps = [
    { id: 1, label: "Resident", minProgress: 25, icon: UserRoundPlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 2, label: "Household", minProgress: 50, icon: HousePlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 3, label: "Family", minProgress: 75, icon: UsersRound, onClick: (id: number) => handleProgressSelection(id) },
    { id: 4, label: "Business", minProgress: 100, icon: Store, onClick: (id: number) => handleProgressSelection(id) }
  ]

  // --------------- HANDLERS ------------------
  const handleProgressSelection = React.useCallback((id: number) => {
    if(!id) return;
    setCurrentStep(id)
  }, [])

  // Calculate progress based on current step
  const calculateProgress = React.useCallback(() => {
    for (const step of (params?.origin == 'create' ? registrationSteps : requestSteps)) {
      if(currentStep == step.id) {
        return step.minProgress;
      }
    }
    return 0;
  }, [currentStep]);

  const setProgress = () => {
    let stepCounter = 1;
    const newList = completed.sort((a, b) => a - b).filter((step: number) => step > currentStep)
    for(const step of newList) {
      const nextStep = currentStep + stepCounter
      console.log(nextStep !== step)
      if(nextStep !== step) {
        setCurrentStep(nextStep)
        return;
      }
      stepCounter++;
    }

    setCurrentStep((prev) => prev + stepCounter);
  }

  const create = (
    <>
      {currentStep !== 6 && (
        <ProgressWithIcon
          progress={calculateProgress()}
          steps={registrationSteps}
          completed={completed}
        />
      )}
      <div className="mt-6">
        {currentStep === 1 && (
          <ResidentCreateForm 
            params={{
              isRegistrationTab: true,
              setResidentId: (rp_id: string) => setResidentId(rp_id),
              setAddresses: (addresses: Record<string, any>[]) => setAddresses(addresses),
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => [...prev, 1]);
                setProgress()
              }
            }}
          />
        )}
        {currentStep === 2 && (
          <AccountRegistrationLayout 
            tab_params={{
              residentId: residentId,
              isRegistrationTab: true,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => [...prev, 2]);
                setProgress()
              }
            }}
          />
        )}
        {currentStep === 3 && (
          <HouseholdFormLayout 
            tab_params={{
              residentId: residentId,
              addresses: addresses,
              isRegistrationTab: true,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => [...prev, 3]);
                setProgress()
              }
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
                    next: (compeleteness: boolean) => {
                      if(compeleteness) setCompleted((prev) => [...prev, 4]);
                      setProgress()
                    },
                    setHasFamily: (value: boolean) => setHasFamily(value)
                  }}
                />
              ) : (
                <RegisterToExistingFam 
                  tab_params={{
                    residentId: residentId,
                    next: (compeleteness: boolean) => {
                      if(compeleteness) setCompleted((prev) => [...prev, 4]);
                      setProgress()
                    },
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
              type: "create",
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => [...prev, 5]);
                setProgress()
              }
            }}
          />
        )}
        {currentStep === 6 && ( // Completion page with animation
          <RegistrationCompletion 
            steps={registrationSteps}
            completed={completed}
          />
        )}
      </div>
    </>
  )

  const approve = (
    <>
      {currentStep !== 5 && (
        <ProgressWithIcon
          progress={calculateProgress()}
          steps={requestSteps}
          completed={completed}
        />
      )}
      {currentStep === 1 && (
        <ResidentRequestForm 
          params={{
            data: params?.data,
            setResidentId: (rp_id: string) => setResidentId(rp_id),
            setAddresses: (addresses: Record<string, any>[]) => setAddresses(addresses),
            nnext: (compeleteness: boolean) => {
              if(compeleteness) setCompleted((prev) => [...prev, 1]);
              setProgress()
            }
          }}
        />
      )}
      {currentStep === 2 && (
        <HouseholdFormLayout 
          tab_params={{
            residentId: residentId,
            addresses: addresses,
            isRegistrationTab: true,
            next: (compeleteness: boolean) => {
              if(compeleteness) setCompleted((prev) => [...prev, 2]);
              setProgress()
            }
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
                  next: (compeleteness: boolean) => {
                    if(compeleteness) setCompleted((prev) => [...prev, 3]);
                    setProgress()
                  },
                  setHasFamily: (value: boolean) => setHasFamily(value)
                }}
              />
            ) : (
              <RegisterToExistingFam 
                tab_params={{
                  residentId: residentId,
                  next: (compeleteness: boolean) => {
                    if(compeleteness) setCompleted((prev) => [...prev, 3]);
                    setProgress()
                  },
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
            next: (compeleteness: boolean) => {
              if(compeleteness) setCompleted((prev) => [...prev, 4]);
              setProgress()
            }
          }}
        />
      )}
      {currentStep === 5 && (
        <RegistrationCompletion 
          steps={requestSteps}
          completed={completed}
        />
      )}
    </>
  )

  // --------------- RENDER ------------------
  return (
    <LayoutWithBack
      title={params?.title}
      description={params?.description}
    >
      {params?.origin === "create" ? create : approve}
    </LayoutWithBack>
  )

}