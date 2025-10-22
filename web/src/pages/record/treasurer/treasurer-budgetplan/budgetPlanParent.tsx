import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button/button"
import { useLocation, useNavigate } from "react-router-dom"
import BudgetHeaderForm from "./budgetPlanForm/budgetHeaderForm"
import { BudgetPlanStep1Schema, BudgetItemsStep3Schema, BudgetPlanStep2Schema } from "@/form-schema/treasurer/budgetplan-schema"
import type z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { budgetWithLimits } from "./budgetItemDefinition"
import { useGetBudgetPlanFromPrev, useGetBudgetPlanDetailFromPrev } from "./queries/budgetplanFetchQueries"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from 'lucide-react'
import BudgetPlanMainForm from "./budgetPlanForm/budgetplanMainForm"
import { initialFormData1 } from './formDataInitializer'

const StepIndicator = ({ currentStep }: { currentStep: "header" | "withLimits" | "withoutLimits" }) => {
  const steps = [
    { key: "header", number: 1, title: "Budget Header", description: "Budget Plan Sources" },
    { key: "withLimits", number: 2, title: "Fixed Budget Items", description: "Predefined Categories"},
    { key: "withoutLimits", number: 3, title: "Custom Budget Items", description: "Additional Expenses" },
  ]

  const getStepStatus = (stepKey: string) => {
    const stepOrder = ["header", "withLimits", "withoutLimits"]
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepKey)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  const getProgressPercentage = () => {
    const stepOrder = ["header", "withLimits", "withoutLimits"]
    const currentIndex = stepOrder.indexOf(currentStep)
    return ((currentIndex) / (stepOrder.length - 1)) * 100
  }

  return (
    <div className="mb-6 px-4">
      <div className="relative max-w-4xl mx-auto">
        {/* Progress Line Background */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full" />
        
        {/* Animated Progress Line */}
        <div
          className="absolute top-8 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{
            width: `${getProgressPercentage()}%`,
          }}
        />

        {/* Steps Container */}
        <div className="relative flex items-start justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key)
            const isLast = index === steps.length - 1

            return (
              <div key={step.key} className="flex flex-col items-center relative group">
                {/* Step Circle */}
                <div
                  className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 ease-out transform hover:scale-105
                    ${
                      status === "completed"
                        ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 border-2 border-green-400"
                        : status === "current"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-400 ring-4 ring-blue-100"
                          : "bg-white text-gray-400 border-2 border-gray-300 shadow-md hover:border-gray-400"
                    }
                  `}
                >
                  {status === "completed" ? (
                    <Check className="w-6 h-6 animate-in zoom-in duration-300" />
                  ) : (
                    <span className="text-base font-bold">{step.number}</span>
                  )}
                  
                  {/* Pulse animation for current step */}
                  {status === "current" && (
                    <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                  )}
                </div>

                {/* Step Content */}
                <div className={`mt-4 text-center transition-all duration-300 ${isLast ? 'max-w-[160px]' : 'max-w-[140px]'}`}>
                  <div
                    className={`
                      text-sm font-semibold leading-tight mb-1 transition-colors duration-300
                      ${
                        status === "current"
                          ? "text-blue-600"
                          : status === "completed"
                            ? "text-green-600"
                            : "text-gray-500 group-hover:text-gray-700"
                      }
                    `}
                  >
                    {step.title}
                  </div>
                  
                  {/* Step Description */}
                  <div
                    className={`
                      text-xs leading-tight transition-colors duration-300
                      ${
                        status === "current"
                          ? "text-blue-500"
                          : status === "completed"
                            ? "text-green-500"
                            : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                  >
                    {step.description}
                  </div>
                </div>

                {/* Step Status Badge */}
                {status === "current" && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Text */}
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">
            Step {steps.findIndex(s => s.key === currentStep) + 1} of {steps.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(getProgressPercentage())}% Complete
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BudgetPlanParent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { budgetData, shouldClone } = location.state || {}
  const [currentStep, setCurrentStep] = useState<"header" | "withLimits" | "withoutLimits">("header")
  const [isInitialized, setIsInitialized] = useState(false)

  // Use imported initialFormData1 function
  const [formData1, setFormData1] = useState<z.infer<typeof BudgetPlanStep2Schema>>(initialFormData1())
  const [formData2, setFormData2] = useState<z.infer<typeof BudgetItemsStep3Schema>>({ items: [] })
  const [totalBudgetObligations, setTotalBudgetObligations] = useState(0)
  const [balUnappropriated, setBalUnappropriated] = useState(0)

  // Queries
  const { data: prevPlan, isLoading: prevPlanLoading, refetch: fetchPrevPlan } = useGetBudgetPlanFromPrev()
  const { data: prevPlanDetail, isLoading: prevPlanDetailLoading, refetch: fetchPrevPlanDetail } = useGetBudgetPlanDetailFromPrev()

  // Form definitions
  const headerForm = useForm<z.infer<typeof BudgetPlanStep1Schema>>({
    resolver: zodResolver(BudgetPlanStep1Schema),
    defaultValues: {
      balance: "",
      realtyTaxShare: "",
      taxAllotment: "",
      clearanceAndCertFees: "",
      otherSpecificIncome: "",
      actualIncome: "",
      actualRPT: "",
    },
  })

  // Initialize form data when cloning from previous year
  const initializeFormData = (items: any[], details: any[]): z.infer<typeof BudgetPlanStep2Schema> => {
    const formData = initialFormData1() // Start with clean schema structure
    
    items.forEach((item) => {
      const detail = details.find(
        (d: any) => d.dtl_budget_item?.trim().toLowerCase() === item.label?.trim().toLowerCase(),
      )
      if (detail && item.name in formData) {
        formData[item.name as keyof z.infer<typeof BudgetPlanStep2Schema>] = detail.dtl_proposed_budget?.toString() || "0.00"
      }
    })
    return formData
  }

  // Initialize formData2 with custom items
  const initializeFormData2 = (details: any[]) => {
    const customItems = details.filter((detail: any) => {
      const isInFixedItems = budgetWithLimits.some(
        item => item.label?.trim().toLowerCase() === detail.dtl_budget_item?.trim().toLowerCase()
      )
      return !isInFixedItems
    }).map((detail: any) => ({
      dtl_budget_item: detail.dtl_budget_item || "",
      dtl_proposed_budget: detail.dtl_proposed_budget?.toString() || "0.00"
    }))

    return { items: customItems.length > 0 ? customItems : [] }
  }

  // Trigger fetching when shouldClone is true
  useEffect(() => {
    if (shouldClone) {
      fetchPrevPlan()
      fetchPrevPlanDetail()
    }
  }, [shouldClone, fetchPrevPlan, fetchPrevPlanDetail])

  // Initialize form data from budgetData if provided
  useEffect(() => {
    if (budgetData && !isInitialized) {
      // Initialize header form
      headerForm.reset({
        balance: budgetData.plan_balance?.toString() || "",
        realtyTaxShare: budgetData.plan_tax_share?.toString() || "",
        taxAllotment: budgetData.plan_tax_allotment?.toString() || "",
        clearanceAndCertFees: budgetData.plan_cert_fees?.toString() || "",
        otherSpecificIncome: budgetData.plan_other_income?.toString() || "",
        actualIncome: budgetData.plan_actual_income?.toString() || "",
        actualRPT: budgetData.plan_rpt_income?.toString() || ""
      })

      // Initialize budget items using imported function
      if (budgetData.details && Array.isArray(budgetData.details)) {
        setFormData1(initializeFormData(budgetWithLimits, budgetData.details))
        setFormData2(initializeFormData2(budgetData.details))
      }

      setIsInitialized(true)
    }
  }, [budgetData, headerForm, isInitialized])

  // Initialize form data when cloning from previous year
  useEffect(() => {
    if (shouldClone && !isInitialized && !prevPlanLoading && !prevPlanDetailLoading) {
      if (prevPlan && prevPlanDetail) {
        // Initialize header form with previous year's data
        headerForm.reset({
          balance: String(prevPlan.plan_balance || ""),
          realtyTaxShare: String(prevPlan.plan_tax_share || ""),
          taxAllotment: String(prevPlan.plan_tax_allotment || ""),
          clearanceAndCertFees: String(prevPlan.plan_cert_fees || ""),
          otherSpecificIncome: String(prevPlan.plan_other_income || ""),
          actualIncome: String(prevPlan.plan_actual_income || ""),
          actualRPT: String(prevPlan.plan_rpt_income || "")
        })

        // Use imported function for initialization
        setFormData1(initializeFormData(budgetWithLimits, prevPlanDetail))
        setFormData2(initializeFormData2(prevPlanDetail))

        setIsInitialized(true)
      }
    }
  }, [shouldClone, isInitialized, prevPlan, prevPlanDetail, prevPlanLoading, prevPlanDetailLoading, headerForm])

  // Calculate available resources
  const getAvailableResources = () => {
    const values = headerForm.getValues()
    return (
      (Number(values.balance) || 0) +
      (Number(values.realtyTaxShare) || 0) +
      (Number(values.taxAllotment) || 0) +
      (Number(values.clearanceAndCertFees) || 0) +
      (Number(values.otherSpecificIncome) || 0)
    )
  }

  // Calculate total from form values
  const calculateTotalFromFormData = () => {
    // Calculate formData1 total
    const form1Total = Object.values(formData1).reduce((sum: number, val: any) => 
      sum + (Number(val) || 0), 0
    )
    
    // Calculate formData2 total
    const form2Total = formData2.items && Array.isArray(formData2.items) 
      ? formData2.items.reduce((sum: number, item: any) => 
          sum + (Number(item.dtl_proposed_budget) || 0), 0
        )
      : 0

    return form1Total + form2Total
  }

  // Update form data and calculate totals
  const updateFormData = (page: "page1" | "page2", data: any) => {
    if (page === "page1") {
      setFormData1((prev) => ({ ...prev, ...data }))
    } else if (page === "page2") {
      setFormData2((prev) => ({ ...prev, ...data }))
    }

    // Recalculate totals after state update
    setTimeout(() => {
      const total = calculateTotalFromFormData()
      const balance = getAvailableResources() - total
      
      setTotalBudgetObligations(total)
      setBalUnappropriated(balance)
    }, 0)
  }

  // Navigation handlers
  const handleHeaderSubmit = () => setCurrentStep("withLimits")
  const handleWithLimitsNext = () => setCurrentStep("withoutLimits")
  const handleExit = () => navigate(-1)

  if (prevPlanLoading || prevPlanDetailLoading) {
    return (
      <div className="w-full h-full p-4">
        {/* Loading skeleton */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-48 rounded-md" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md ml-[3.2rem]" />
        </div>
        <Skeleton className="h-px w-full mb-5" />

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="mt-2 text-center max-w-[120px]">
                    <Skeleton className="h-4 w-24 rounded-md mb-1" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                </div>
                {i < 2 && <Skeleton className="flex-1 h-0.5 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-row gap-4">
          <ConfirmationModal
            trigger={(
              <Button className="text-black p-2 self-start" variant={"outline"}>
                <ChevronLeft />
              </Button>
            )}
            title="Unsaved Changes"
            description="Are you sure you want to go back? All progress on your budget plan will be lost."
            actionLabel="Confirm"
            onClick={handleExit}
          />
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
            Create Budget Plan
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
          Develop a comprehensive budget plan to support barangay initiatives and community needs.
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-5" />

      <StepIndicator currentStep={currentStep} />

      {currentStep === "header" && (
        <div className="pb-5">
          <BudgetHeaderForm 
            form={headerForm} 
            onSubmit={handleHeaderSubmit}
          />
        </div>
      )}

     {currentStep === "withLimits" && (
        <BudgetPlanMainForm
          headerData={headerForm.getValues()}
          onBack={() => setCurrentStep("header")}
          onNext={handleWithLimitsNext}
          formData={{ formData1, formData2 }}
          updateFormData={updateFormData}
          totalBudgetObli={totalBudgetObligations}
          balUnapp={balUnappropriated}
          currentStep="withLimits"
        />
      )}

      {currentStep === "withoutLimits" && (
        <BudgetPlanMainForm
          headerData={headerForm.getValues()}
          onBack={() => setCurrentStep("withLimits")}
          formData={{ formData1, formData2 }}
          updateFormData={updateFormData}
          totalBudgetObli={totalBudgetObligations}
          balUnapp={balUnappropriated}
          currentStep="withoutLimits"
        />
      )}
    </div>
  )
}