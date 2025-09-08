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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CompleteResidentProfilingSchema } from "@/form-schema/profiling-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useAddAllProfile } from "../queries/profilingAddQueries";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";
import { useDeleteRequest } from "../queries/profilingDeleteQueries";
import { useUpdateAccount } from "../queries/profilingUpdateQueries";
import { capitalizeAllFields } from "@/helpers/capitalize";

export default function RegistrationLayout() {
  // --------------- STATE INITIALIZATION ------------------
  const { user } = useAuth();
  const { safeNavigate } = useSafeNavigate()
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const { mutateAsync: addAllProfile } = useAddAllProfile();
  const { mutateAsync: deleteRequest } = useDeleteRequest();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [hasFamily, setHasFamily] = React.useState<boolean>(false);
  const [completed, setCompleted] = React.useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const registrationForm = useForm<z.infer<typeof CompleteResidentProfilingSchema>>({
    resolver: zodResolver(CompleteResidentProfilingSchema),
    defaultValues: generateDefaultValues(CompleteResidentProfilingSchema)
  })

  const registrationSteps = [
    { id: 1, label: "Account", minProgress: 20, icon: CircleUserRound, onClick: (id: number) => handleProgressSelection(id) },
    { id: 2, label: "Resident", minProgress: 40, icon: UserRoundPlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 3, label: "House", minProgress: 60, icon: HousePlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 4, label: "Family", minProgress: 80, icon: UsersRound, onClick: (id: number) => handleProgressSelection(id) },
    { id: 5, label: "Business", minProgress: 100, icon: Store, onClick: (id: number) => handleProgressSelection(id) }
  ];

  const requestSteps = [
    { id: 1, label: "Resident", minProgress: 25, icon: UserRoundPlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 2, label: "House", minProgress: 50, icon: HousePlus, onClick: (id: number) => handleProgressSelection(id) },
    { id: 3, label: "Family", minProgress: 75, icon: UsersRound, onClick: (id: number) => handleProgressSelection(id) },
    { id: 4, label: "Business", minProgress: 100, icon: Store, onClick: (id: number) => handleProgressSelection(id) }
  ]

  // --------------- HANDLERS ------------------
  const handleProgressSelection = React.useCallback((id: number) => { 
    if(id > currentStep && ![...completed].includes(id)) return;
    if(!id) return;
    setCurrentStep(id)
  }, [currentStep, completed])

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
    const newList = ([...completed]).sort((a, b) => a - b).filter((step: number) => step > currentStep)
    for(const step of newList) {
      const nextStep = currentStep + stepCounter
      if(nextStep !== step) {
        console.log(nextStep)
        setCurrentStep(nextStep)
        return;
      }
      stepCounter++;
    }
    
    setCurrentStep((prev) => prev + stepCounter);
  }

  // Check for empty states
  const isEmpty = (obj: Record<string, any>) =>
    Object.values(obj).every(val => val === "" || val.length == 0);

  const handleCreate = async (
    noAccount:  boolean,
    noHouse: boolean,
    notLivingSolo: boolean,
    noFamily: boolean,
    noBusiness: boolean,
    personal: Record<string, any>,
    accountSchema: Record<string, any>,
    houseSchema: Record<string, any>,
    livingSoloSchema: Record<string, any>,
    familySchema: Record<string, any>,
    business: Record<string, any>,
    files: Record<string, any>[]
  ) => {
    try {
      // Insertion Query
      await addAllProfile({
        personal: personal,
        ...(!noAccount && {account: accountSchema}),
        ...(!noHouse && {houses: houseSchema.list}),
        ...(!notLivingSolo && {livingSolo: livingSoloSchema}),
        ...(!noFamily && {family: familySchema}),
        ...(!noBusiness && {business: {...business, files: files}}),
        staff: user?.staff?.staff_id
      })
      
      // Success feedback
      showSuccessToast("Successfully added all profile.")
      registrationForm.reset();
      safeNavigate.back();

    } catch (err) {
      showErrorToast("Failed to register all profile. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
    
  }

  const handleApprove = async (
    noHouse: boolean,
    notLivingSolo: boolean,
    noFamily: boolean,
    noBusiness: boolean,
    personalSchema: Record<string, any>,
    houseSchema: Record<string, any>,
    livingSoloSchema: Record<string, any>,
    familySchema: Record<string, any>,
    business: Record<string, any>,
    files: Record<string, any>[]
  ) => {
    try {
      const resident = await addAllProfile({
        personal: personalSchema,
        ...(!noHouse && {houses: houseSchema.list}),
        ...(!notLivingSolo && {livingSolo: livingSoloSchema}),
        ...(!noFamily && {family: familySchema}),
        ...(!noBusiness && {business: {...business, files: files}}),
        staff: user?.staff?.staff_id
      })

      await updateAccount({
        accNo: params.data.acc,
        data: { rp: resident.rp_id },
      }, {
          onSuccess: () => {
            deleteRequest(params.data.req_id);
          },
        }
      );

      showSuccessToast("Registration has been approved. New record added.")
      registrationForm.reset();
      safeNavigate.back();

    } catch (err) {
      showErrorToast("Failed to process registration approval. Please try again.")
    } finally {
      setIsSubmitting(false)
    } 
  }

  const handleSubmit = async (type: string) => {
    setIsSubmitting(true);
    const values = registrationForm.getValues()
    const { 
      personalSchema,
      accountSchema,
      houseSchema,
      livingSoloSchema,
      familySchema,
      businessSchema
    } = values;

    // Exclude incomplete profile
    const noAccount   = ![...completed].includes(1);
    const notLivingSolo = isEmpty(livingSoloSchema);
    const noFamily    = isEmpty(familySchema);
    const noHouse     = ![...completed].includes(3);
    const noBusiness  = ![...completed].includes(5);

    const {per_id, ...personal} = personalSchema
    const {files, ...business} = businessSchema
    
    const newFiles = files?.map((media: any) => ({
      name: media.name,
      type: media.type,
      file: media.file
    }))

    switch(type) {
      case "create":
        handleCreate(
          noAccount,
          noHouse,
          notLivingSolo,
          noFamily,
          noBusiness,
          capitalizeAllFields(personal),
          accountSchema,
          houseSchema,
          livingSoloSchema,
          familySchema,
          capitalizeAllFields(business),
          newFiles
        )
        break;
      case "approve":
        handleApprove(
          noHouse,
          notLivingSolo,
          noFamily,
          noBusiness,
          personalSchema,
          houseSchema,
          livingSoloSchema,
          familySchema,
          business,
          newFiles
        )
        break;
    }
  }


  const create = (
    <>
      {currentStep !== 6 && (
        <ProgressWithIcon
          progress={calculateProgress()}
          steps={registrationSteps}
          completed={[...completed]}
        />
      )}
      <div className="mt-6">
        {currentStep === 1 && (
          <AccountRegistrationLayout 
            tab_params={{
              isRegistrationTab: true,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 1]));
                else setCompleted((prev) => new Set([...prev].filter((id) => id !== 1)))
                setProgress()
              },
              form: registrationForm
            }}
          />
        )}
        {currentStep === 2 && (
          <ResidentCreateForm 
            params={{
              isRegistrationTab: true,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 2]));
                setProgress()
              },  
              form: registrationForm
            }}
          />
        )}
        {currentStep === 3 && (
          <HouseholdFormLayout 
            tab_params={{
              isRegistrationTab: true,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 3]));
                else setCompleted((prev) => new Set([...prev].filter((id) => id !== 3)))
                setProgress()
              },
              form: registrationForm
            }}
          />
        )}
        {currentStep === 4 && (
          <div className="flex justify-center">
              {!hasFamily ? (
                <SoloFormLayout 
                  tab_params={{
                    isRegistrationTab: true,
                    next: (compeleteness: boolean) => {
                      if(compeleteness) setCompleted((prev) => new Set([...prev, 4]));
                      setProgress()
                    },
                    setHasFamily: (value: boolean) => {
                      registrationForm.resetField("livingSoloSchema")
                      setHasFamily(value)
                    },
                    form: registrationForm
                  }}
                />
              ) : (
                <RegisterToExistingFam 
                  tab_params={{
                    next: (compeleteness: boolean) => {
                      if(compeleteness) setCompleted((prev) => new Set([...prev, 4]));
                      setProgress()
                    },
                    setHasFamily: (value: boolean) => {
                      registrationForm.resetField("familySchema")
                      setHasFamily(value)
                    },
                    form: registrationForm
                  }}
                />
              )}
          </div>
        )}
        {currentStep === 5 && (
          <BusinessFormLayout 
            tab_params={{
              isRegistrationTab: true,
              type: "create",
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 5]));
                else setCompleted((prev) => new Set([...prev].filter((id) => id !== 5)))
                setProgress()
              },
              form: registrationForm  
            }}
          />
        )}
        {currentStep === 6 && ( // Completion page with animation
          <RegistrationCompletion 
            params={{
              steps: registrationSteps,
              completed: [...completed],
              register: () => handleSubmit("create"),
              isSubmitting: isSubmitting
            }}
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
          completed={[...completed]}
        />
      )}
      <div className="mt-6">
        {currentStep === 1 && (
          <ResidentRequestForm 
            params={{
              data: params?.data,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 1]));
                setProgress()
              },
              form: registrationForm,
            }}
          />
        )}
        {currentStep === 2 && (
          <HouseholdFormLayout 
            tab_params={{
              isRegistrationTab: true,
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 2]));
                else setCompleted((prev) => new Set([...prev].filter((id) => id !== 2)))
                setProgress()
              },
              form: registrationForm
            }}
          />
        )}
        {currentStep === 3 && (
          <div className="flex justify-center">
              {!hasFamily ? (
                <SoloFormLayout 
                  tab_params={{
                    isRegistrationTab: true,
                    next: (compeleteness: boolean) => {
                      if(compeleteness) setCompleted((prev) => new Set([...prev, 3]));
                      setProgress()
                    },
                    setHasFamily: (value: boolean) => {
                      registrationForm.resetField("livingSoloSchema")
                      setHasFamily(value)
                    },
                    form: registrationForm
                  }}
                />
              ) : (
                <RegisterToExistingFam 
                  tab_params={{
                    next: (compeleteness: boolean) => {
                      if(compeleteness) setCompleted((prev) => new Set([...prev, 3]));
                      setProgress()
                    },
                    setHasFamily: (value: boolean) => {
                      registrationForm.resetField("familySchema")
                      setHasFamily(value)
                    },
                    form: registrationForm
                  }}
                />
              )}
          </div>
        )}
        {currentStep === 4 && (
          <BusinessFormLayout 
            tab_params={{
              isRegistrationTab: true,
              type: "create",
              next: (compeleteness: boolean) => {
                if(compeleteness) setCompleted((prev) => new Set([...prev, 4]));
                else setCompleted((prev) => new Set([...prev].filter((id) => id !== 4)))
                setProgress()
              },
              form: registrationForm  
            }}
          />
        )}
      </div>
      {currentStep === 5 && (
        <RegistrationCompletion 
          params={{
            steps: requestSteps,
            completed: [...completed],
            form: registrationForm,
            register: () => handleSubmit("approve"),
            isSubmitting: isSubmitting
          }}
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