import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { toast } from "sonner";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DisplayBreakdown from "../netBreakdownDisplay";
import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries";
import type { BudgetPlanDetail, BudgetPlan } from "../budgetPlanInterfaces";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetPlanStep2Schema, BudgetPlanStep3Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { budgetWithLimits, budgetWithoutLimits } from "../budgetItemDefinition";
import z from "zod";
import CreateBudgetPlanWithoutLimits from "./budgetWithoutLimitsForm";
import CreateBudgetWithLimits from "./budgetWithLimitsForm";
import { useAuth } from "@/context/AuthContext";

type Props = {
  headerData: any;
  onBack: () => void;
  onSuccess?: () => void;
  formData: {
    formData1: z.infer<typeof BudgetPlanStep2Schema>;
    formData2: z.infer<typeof BudgetPlanStep3Schema>;
  };
  updateFormData: (
    page: "page1" | "page2",
    data: Partial<
      z.infer<typeof BudgetPlanStep2Schema> &
      z.infer<typeof BudgetPlanStep3Schema>
    >
  ) => void;
  totalBudgetObli: number;
  balUnapp: number;
  beyondLimit: boolean;
  onSubmit: () => void;
};

const styles = {
  labelDesign: "w-full text-left text-blue text-sm md:text-base",
  highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
};

function BudgetPlanMainForm({ headerData, onBack, formData, updateFormData, totalBudgetObli, balUnapp, beyondLimit }: Props) {
  const year = new Date().getFullYear();
  const {user} = useAuth();
  const totalBudgetToast = useRef<string | number | null>(null);
  const [totalBudgetObligations, setTotalBudgetObligations] = useState(totalBudgetObli);
  const [balUnappropriated, setBalUnappropriated] = useState(balUnapp);
  const [isBeyondLimit, setIsBeyondLimit] = useState(beyondLimit);
  const [currentForm, setCurrentForm] = useState<"page1" | "page2">("page1");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { formData1, formData2 } = formData;

  const {
    balance = "0",
    realtyTaxShare = "0",
    taxAllotment = "0",
    clearanceAndCertFees = "0",
    otherSpecificIncome = "0",
    actualIncome = "0",
    actualRPT = "0"
  } = headerData || {};

  const availableResources =
    (parseFloat(balance) || 0) +
    (parseFloat(realtyTaxShare) || 0) +
    (parseFloat(taxAllotment) || 0) +
    (parseFloat(clearanceAndCertFees) || 0) +
    (parseFloat(otherSpecificIncome) || 0);

  // Initialize forms for both pages with the saved form data
  const forms = {
    page1: useForm<z.infer<typeof BudgetPlanStep2Schema>>({
      resolver: zodResolver(BudgetPlanStep2Schema),
      defaultValues: formData1,
    }),
    page2: useForm<z.infer<typeof BudgetPlanStep3Schema>>({
      resolver: zodResolver(BudgetPlanStep3Schema),
      defaultValues: formData2,
    }),
  };

  // Update total budget whenever form values change
  useEffect(() => {
    const sumFormData = (formData: Record<string, any>): number =>
      Object.values(formData).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);

    const page1Values = forms.page1.watch();
    const page2Values = forms.page2.watch();

    const totalBudget = sumFormData(page1Values) + sumFormData(page2Values);
    setTotalBudgetObligations(totalBudget);
    
    const newBalance = availableResources - totalBudget;
    setBalUnappropriated(newBalance);

    if (newBalance < 0) {
      if (!totalBudgetToast.current) {
        setIsBeyondLimit(true);
        totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
          duration: Number.POSITIVE_INFINITY,
          style: { border: "1px solid rgb(225, 193, 193)", padding: "16px", color: "#b91c1c", background: "#fef2f2" },
        });
      }
    } else {
      if (totalBudgetToast.current !== null) {
        setIsBeyondLimit(false);
        toast.dismiss(totalBudgetToast.current);
        totalBudgetToast.current = null;
      }
    }
  }, [forms.page1.watch(), forms.page2.watch(), availableResources]);

  const { mutate: createBudgetPlan } = useInsertBudgetPlan();

  const validateCurrentForm = async () => {
    const form = forms[currentForm];
    const result = await form.trigger();
    if (!result) {
      setFormErrors({ ...formErrors, [currentForm]: true });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (currentForm === "page1") {
      forms.page1.reset(formData1);
    } else {
      forms.page2.reset(formData2);
    }
  }, [currentForm, formData1, formData2]);

  const prepareSubmissionData = () => {
    const formValue1 = forms.page1.getValues()
    const formValue2 = forms.page2.getValues()

    const budgetHeader: BudgetPlan = {
      plan_year: year.toString(),
      plan_balance: parseFloat(balance) || 0,
      plan_tax_share: parseFloat(realtyTaxShare) || 0,
      plan_tax_allotment: parseFloat(taxAllotment) || 0,
      plan_cert_fees: parseFloat(clearanceAndCertFees) || 0,
      plan_other_income: parseFloat(otherSpecificIncome) || 0,
      plan_actual_income: parseFloat(actualIncome) || 0,
      plan_rpt_income: parseFloat(actualRPT) || 0,
      plan_budgetaryObligations: totalBudgetObligations,
      plan_balUnappropriated: balUnappropriated,
      plan_issue_date: new Date().toISOString().split('T')[0],
      staff_id: user?.staff?.staff_id
    };

    const budgetDetails: BudgetPlanDetail[] = [];

    // Process formData1 (with limits)
    Object.entries(formValue1).forEach(([key, value]) => {
      const budgetItem = budgetWithLimits.find(item => item.name === key);
      if (budgetItem) {
        budgetDetails.push({
          dtl_budget_item: budgetItem.label,
          dtl_proposed_budget: parseFloat(value as string) || 0,
          dtl_budget_category: budgetItem.category,
        });
      }
    });

    // Process formData2 (without limits)
    Object.entries(formValue2).forEach(([key, value]) => {
      const budgetItem = budgetWithoutLimits.find(item => item.name === key);
      if (budgetItem) {
        budgetDetails.push({
          dtl_budget_item: budgetItem.label,
          dtl_proposed_budget: parseFloat(value as string) || 0,
          dtl_budget_category: budgetItem.category,
        });
      }
    });

    return {
      newBudgetHeader: budgetHeader,
      newBudgetDetails: budgetDetails,
    };
  };

  const handleNext = async () => {
    const isValid = await validateCurrentForm();
    if (isValid) {
      const currentValues = forms[currentForm].getValues();
      updateFormData(currentForm, currentValues);
      setCurrentForm("page2");
    }
  };

  const handlePrevious = async () => {
    const currentValues = forms[currentForm].getValues();
    updateFormData(currentForm, currentValues);
    setCurrentForm("page1");
  };

  const handleSubmit = async () => {
    // First save any unsaved data
    const currentValues = forms[currentForm].getValues();
    updateFormData(currentForm, currentValues);

    // Validate all forms first
    const isValidPage1 = await forms.page1.trigger();
    const isValidPage2 = await forms.page2.trigger();
    
    setFormErrors({
      page1: !isValidPage1,
      page2: !isValidPage2
    });

    if (!isValidPage1 || !isValidPage2) {
      toast.error("Please fix all validation errors before submitting");
      // Go to the first page with errors
      if (!isValidPage1) {
        setCurrentForm("page1");
      } else if (!isValidPage2) {
        setCurrentForm("page2");
      }
      return;
    }

    if (isBeyondLimit) {
      toast.error("Cannot submit with insufficient funds");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = prepareSubmissionData();
      console.log(submissionData)
      createBudgetPlan(submissionData);
    } catch (error) {
      toast.error("Failed to prepare submission data");
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <DialogLayout
            trigger={
              <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
                <div className="flex items-center justify-between">
                  <Label className={styles.labelDesign}>NET Available Resources:</Label>
                  <ChevronRightIcon className="w-4 h-4 text-blue-500" />
                </div>
                <Label className="text-sm font-semibold">{formatNumber(availableResources.toString())}</Label>
              </div>
            }
            title="Breakdown of NET Available Resources"
            description="Detailed breakdown of available funds from all income sources"
            mainContent={
              <DisplayBreakdown
                balance={balance}
                realtyTaxShare={realtyTaxShare}
                taxAllotment={taxAllotment}
                clearanceAndCertFees={clearanceAndCertFees}
                otherSpecificIncome={otherSpecificIncome}
              />
            }
          />

          <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
            <Label className={styles.labelDesign}>Year:</Label>
            <Label className="text-sm font-semibold">{year}</Label>
          </div>

          <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
            <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS:</Label>
            <Label className="text-red-500 text-sm font-semibold">
              {formatNumber(totalBudgetObligations.toString())}
            </Label>
          </div>

          <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
            <Label className={styles.labelDesign}>Actual RPT Income:</Label>
            <Label className="text-sm font-semibold">{formatNumber(actualRPT)}</Label>
          </div>

          <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
            <Label className={styles.labelDesign}>Actual Income:</Label>
            <Label className="text-sm font-semibold">{formatNumber(actualIncome)}</Label>
          </div>

          <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
            <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED:</Label>
            <Label className="text-green-500 text-sm font-semibold">
              {formatNumber(balUnappropriated.toString())}
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-white drop-shadow rounded-lg overflow-hidden">
        {currentForm === "page1" && (
          <CreateBudgetWithLimits
            form={forms.page1}
            updateFormData={(data) => updateFormData("page1", data)}
            budgetLimit={availableResources}
            onNext={handleNext}
          />
        )}
        {currentForm === "page2" && (
          <CreateBudgetPlanWithoutLimits
            form={forms.page2}
            budgetLimit={availableResources}
            onPrevious={handlePrevious}
          />
        )}

        <div className="bg-white border-t border-gray-200 p-4 md:p-6">
          <div className="flex justify-between">
            <Button 
              variant="outline"  
              onClick={onBack} 
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Header
            </Button>
            
            <Button 
              onClick={handleSubmit}  
              disabled={isBeyondLimit || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Budget Plan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetPlanMainForm;