// import { useEffect, useState } from "react";
// import { ChevronLeft, ChevronRightIcon } from "lucide-react";
// import { Button } from "@/components/ui/button/button";
// import { Label } from "@/components/ui/label";
// import { formatNumber } from "@/helpers/currencynumberformatter";
// import { toast } from "sonner";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import DisplayBreakdown from "../netBreakdownDisplay";
// import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries";
// import type { BudgetPlanDetail, BudgetPlan } from "../budgetPlanInterfaces";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { BudgetPlanStep2Schema, BudgetItemsStep3Schema } from "@/form-schema/treasurer/budgetplan-schema";
// import { budgetWithLimits } from "../budgetItemDefinition";
// import z from "zod";
// import CreateBudgetPlanWithoutLimits from "./budgetWithoutLimitsForm";
// import CreateBudgetWithLimits from "./budgetWithLimitsForm";
// import { useAuth } from "@/context/AuthContext";

// type Props = {
//   headerData: any;
//   onBack: () => void;
//   onNext?: () => void;
//   onSuccess?: () => void;
//   formData: {
//     formData1: z.infer<typeof BudgetPlanStep2Schema>;
//     formData2: z.infer<typeof BudgetItemsStep3Schema>;
//   };
//   updateFormData: (
//     page: "page1" | "page2",
//     data: Partial<
//       z.infer<typeof BudgetPlanStep2Schema> &
//       z.infer<typeof BudgetItemsStep3Schema>
//     >
//   ) => void;
//   totalBudgetObli: number;
//   balUnapp: number;
//   currentStep?: "withLimits" | "withoutLimits";
// };

// const styles = {
//   labelDesign: "w-full text-left text-blue text-sm md:text-base",
//   highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
// };

// function BudgetPlanMainForm({ 
//   headerData, 
//   onBack, 
//   onNext,
//   formData, 
//   updateFormData, 
//   totalBudgetObli, 
//   balUnapp, 
//   currentStep = "withLimits" 
// }: Props) {
//   const year = new Date().getFullYear();
//   const {user} = useAuth();
//   const [totalBudgetObligations, setTotalBudgetObligations] = useState(totalBudgetObli);
//   const [balUnappropriated, setBalUnappropriated] = useState(balUnapp);
//   const [currentForm, setCurrentForm] = useState<"page1" | "page2">(currentStep === "withLimits" ? "page1" : "page2");
//   const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const { formData1, formData2 } = formData;

//   const {
//     balance = "0",
//     realtyTaxShare = "0",
//     taxAllotment = "0",
//     clearanceAndCertFees = "0",
//     otherSpecificIncome = "0",
//     actualIncome = "0",
//     actualRPT = "0"
//   } = headerData || {};

//   const availableResources =
//     (parseFloat(balance) || 0) +
//     (parseFloat(realtyTaxShare) || 0) +
//     (parseFloat(taxAllotment) || 0) +
//     (parseFloat(clearanceAndCertFees) || 0) +
//     (parseFloat(otherSpecificIncome) || 0);

//   // Initialize forms for both pages with the saved form data
//   const forms = {
//     page1: useForm<z.infer<typeof BudgetPlanStep2Schema>>({
//       resolver: zodResolver(BudgetPlanStep2Schema),
//       defaultValues: formData1,
//     }),
//     page2: useForm<z.infer<typeof BudgetItemsStep3Schema>>({
//       resolver: zodResolver(BudgetItemsStep3Schema),
//       defaultValues: formData2.items && formData2.items.length > 0
//         ? formData2
//         : { items: [] }, 
//     }),
//   };

//   // Calculate total from form values based on structure
//   const calculateFormTotal = (formValues: any, formType: "page1" | "page2"): number => {
//     if (formType === "page1") {
//       // Page1 has flat structure
//       return Object.values(formValues).reduce((acc: number, curr: any) => 
//         acc + (parseFloat(curr) || 0), 0
//       );
//     } else {
//       // Page2 has nested structure with items array - ONLY include items from the dynamic form
//       if (formValues.items && Array.isArray(formValues.items)) {
//         return formValues.items.reduce((acc: number, item: any) => 
//           acc + (parseFloat(item.dtl_proposed_budget) || 0), 0
//         );
//       }
//       return 0;
//     }
//   };

//   // Update total budget whenever form values change
//   useEffect(() => {
//     const page1Values = forms.page1.watch();
//     const page2Values = forms.page2.watch();

//     const page1Total = calculateFormTotal(page1Values, "page1");
//     const page2Total = calculateFormTotal(page2Values, "page2");
    
//     const totalBudget = page1Total + page2Total;
//     setTotalBudgetObligations(totalBudget);
    
//     const newBalance = availableResources - totalBudget;
//     setBalUnappropriated(newBalance);
//   }, [forms.page1.watch(), forms.page2.watch(), availableResources]);

//   const { mutate: createBudgetPlan } = useInsertBudgetPlan();

//   const validateCurrentForm = async () => {
//     const form = forms[currentForm];
//     const result = await form.trigger();
//     if (!result) {
//       setFormErrors({ ...formErrors, [currentForm]: true });
//       return false;
//     }
//     return true;
//   };

//   // Improved form reset logic to handle data persistence
//   useEffect(() => {
//     if (currentForm === "page1") {
//       forms.page1.reset(formData1);
//     } else {
//       // Ensure formData2 has proper structure
//       const formDataWithDefault = formData2.items && formData2.items.length > 0 
//         ? formData2 
//         : { items: [{ dtl_budget_item: "", dtl_proposed_budget: "" }] };
//       forms.page2.reset(formDataWithDefault);
//     }
//   }, [currentForm, formData1, formData2, forms.page1, forms.page2]);

//   // Update currentForm when currentStep prop changes
//   useEffect(() => {
//     setCurrentForm(currentStep === "withLimits" ? "page1" : "page2");
//   }, [currentStep]);

//   const prepareSubmissionData = () => {
//     // Always get the latest values from both forms
//     const formValue1 = forms.page1.getValues();
//     const formValue2 = forms.page2.getValues();

//     console.log("Form 1 values:", formValue1);
//     console.log("Form 2 values:", formValue2);

//     const budgetHeader: BudgetPlan = {
//       plan_year: year.toString(),
//       plan_balance: parseFloat(balance) || 0,
//       plan_tax_share: parseFloat(realtyTaxShare) || 0,
//       plan_tax_allotment: parseFloat(taxAllotment) || 0,
//       plan_cert_fees: parseFloat(clearanceAndCertFees) || 0,
//       plan_other_income: parseFloat(otherSpecificIncome) || 0,
//       plan_actual_income: parseFloat(actualIncome) || 0,
//       plan_rpt_income: parseFloat(actualRPT) || 0,
//       plan_budgetaryObligations: totalBudgetObligations,
//       plan_balUnappropriated: balUnappropriated,
//       plan_issue_date: new Date().toISOString().split('T')[0],
//       staff_id: user?.staff?.staff_id
//     };

//     const budgetDetails: BudgetPlanDetail[] = [];

//     // Process formData1 (with limits) - flat structure
//     Object.entries(formValue1).forEach(([key, value]) => {
//       const budgetItem = budgetWithLimits.find(item => item.name === key);
//       if (budgetItem && value) {
//         budgetDetails.push({
//           dtl_budget_item: budgetItem.label,
//           dtl_proposed_budget: parseFloat(value as string) || 0,
//         });
//       }
//     });

//     // Process formData2 (without limits) - ONLY include items from the dynamic form
//     if (formValue2.items && Array.isArray(formValue2.items)) {
//       formValue2.items.forEach((item) => {
//         if (item.dtl_budget_item && item.dtl_proposed_budget) {
//           budgetDetails.push({
//             dtl_budget_item: item.dtl_budget_item,
//             dtl_proposed_budget: parseFloat(item.dtl_proposed_budget) || 0,
//           });
//         }
//       });
//     }

//     console.log("Budget Header:", budgetHeader);
//     console.log("Budget Details:", budgetDetails);

//     return {
//       newBudgetHeader: budgetHeader,
//       newBudgetDetails: budgetDetails,
//     };
//   };

//   const handleNext = async () => {
//     const isValid = await validateCurrentForm();
//     if (isValid) {
//       const currentValues = forms[currentForm].getValues();
//       updateFormData(currentForm, currentValues);
//       // If we're on page1 (with limits) and onNext prop is provided, use it
//       if (currentForm === "page1" && onNext) {
//         onNext();
//       }
//     }
//   };

//   const handlePrevious = async () => {
//     const currentValues = forms[currentForm].getValues();
//     updateFormData(currentForm, currentValues);
    
//     // If we're on page2 (without limits), go back to page1 (with limits)
//     if (currentForm === "page2") {
//       setCurrentForm("page1");
//     }
//   };

//   const handleBackToHeader = async () => {
//     // Save current form data before navigating back
//     const currentValues = forms[currentForm].getValues();
//     updateFormData(currentForm, currentValues);
    
//     // Always go back to budget header regardless of current form
//     onBack();
//   };

//   const handleSubmit = async () => {
//     // Save any unsaved data from current form
//     const currentValues = forms[currentForm].getValues();
//     updateFormData(currentForm, currentValues);

//     // Validate both forms
//     const isValidPage1 = await forms.page1.trigger();
//     const isValidPage2 = await forms.page2.trigger();
    
//     setFormErrors({
//       page1: !isValidPage1,
//       page2: !isValidPage2
//     });

//     if (!isValidPage1 || !isValidPage2) {
//       toast.error("Please fix all validation errors before submitting");
//       // Go to the first page with errors
//       if (!isValidPage1) {
//         setCurrentForm("page1");
//       } else if (!isValidPage2) {
//         setCurrentForm("page2");
//       }
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const submissionData = prepareSubmissionData();
//       console.log("Final Submission Data:", submissionData);
      
//       createBudgetPlan(submissionData, {
//         onSuccess: () => {
//           setIsSubmitting(false);
//         },
//         onError: (error) => {
//           setIsSubmitting(false);
//           console.error("Submission error:", error);
//         }
//       });
//     } catch (error) {
//       console.error("Error preparing submission:", error);
//       setIsSubmitting(false);
//     }
//   };

//   // Button 1: Next button (only appears on with limits form)
//   const renderNextButton = () => {
//     if (currentForm === "page1") {
//       return (
//         <Button 
//           onClick={handleNext}
//           disabled={isSubmitting}
//           className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
//         >
//           Next
//           <ChevronRightIcon className="w-4 h-4" />
//         </Button>
//       );
//     }
//     return null;
//   };

//   // Button 2: Previous button (only appears on without limits form, beside submit)
//   const renderPreviousButton = () => {
//     if (currentForm === "page2") {
//       return (
//         <Button 
//           variant="outline"
//           onClick={handlePrevious}
//           disabled={isSubmitting}
//           className="flex items-center gap-2"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Previous
//         </Button>
//       );
//     }
//     return null;
//   };

//   // Button 3: Back to Budget Header (appears on both forms)
//   const renderBackToHeaderButton = () => {
//     return (
//       <Button 
//         variant="outline"  
//         onClick={handleBackToHeader} 
//         className="flex items-center gap-2"
//         disabled={isSubmitting}
//       >
//         <ChevronLeft className="w-4 h-4" />
//         Back to Budget Header
//       </Button>
//     );
//   };

//   // Button 4: Submit button (only appears on without limits form)
//   const renderSubmitButton = () => {
//     if (currentForm === "page2") {
//       return (
//         <Button 
//           onClick={handleSubmit}  
//           disabled={isSubmitting}
//           className="bg-green-600 hover:bg-green-700 text-white"
//         >
//           {isSubmitting ? "Submitting..." : "Submit Budget Plan"}
//         </Button>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
//       <div className="flex flex-col gap-4 mb-6">
//         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
//           <DialogLayout
//             trigger={
//               <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow cursor-pointer">
//                 <div className="flex items-center justify-between">
//                   <Label className={styles.labelDesign}>NET Available Resources:</Label>
//                   <ChevronRightIcon className="w-4 h-4 text-blue-500" />
//                 </div>
//                 <Label className="text-sm font-semibold">{formatNumber(availableResources.toString())}</Label>
//               </div>
//             }
//             title="Breakdown of NET Available Resources"
//             description="Detailed breakdown of available funds from all income sources"
//             mainContent={
//               <DisplayBreakdown
//                 balance={balance}
//                 realtyTaxShare={realtyTaxShare}
//                 taxAllotment={taxAllotment}
//                 clearanceAndCertFees={clearanceAndCertFees}
//                 otherSpecificIncome={otherSpecificIncome}
//               />
//             }
//           />

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.labelDesign}>Year:</Label>
//             <Label className="text-sm font-semibold">{year}</Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS:</Label>
//             <Label className="text-red-500 text-sm font-semibold">
//               {formatNumber(totalBudgetObligations.toString())}
//             </Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.labelDesign}>Actual RPT Income:</Label>
//             <Label className="text-sm font-semibold">{formatNumber(actualRPT)}</Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.labelDesign}>Actual Income:</Label>
//             <Label className="text-sm font-semibold">{formatNumber(actualIncome)}</Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED:</Label>
//             <Label className="text-green-500 text-sm font-semibold">
//               {formatNumber(balUnappropriated.toString())}
//             </Label>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white drop-shadow rounded-lg overflow-hidden">
//         {currentForm === "page1" && (
//           <CreateBudgetWithLimits
//             form={forms.page1}
//           />
//         )}
//         {currentForm === "page2" && (
//           <CreateBudgetPlanWithoutLimits
//             form={forms.page2}
//           />
//         )}

//         <div className="bg-white border-t border-gray-200 p-4 md:p-6">
//           <div className="flex justify-between items-center">
//             {/* Left side: Back to Budget Header button (always visible) */}
//             {renderBackToHeaderButton()}
            
//             {/* Right side: Navigation buttons */}
//             <div className="flex gap-2">
//               {/* On page1: Only Next button */}
//               {currentForm === "page1" && renderNextButton()}
              
//               {/* On page2: Previous and Submit buttons */}
//               {currentForm === "page2" && (
//                 <>
//                   {renderPreviousButton()}
//                   {renderSubmitButton()}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BudgetPlanMainForm;

import { useEffect, useState } from "react";
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
import { BudgetPlanStep2Schema, BudgetItemsStep3Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { budgetWithLimits } from "../budgetItemDefinition";
import z from "zod";
import CreateBudgetPlanWithoutLimits from "./budgetWithoutLimitsForm";
import CreateBudgetWithLimits from "./budgetWithLimitsForm";
import { useAuth } from "@/context/AuthContext";

type Props = {
  headerData: any;
  onBack: () => void;
  onNext?: () => void;
  onSuccess?: () => void;
  formData: {
    formData1: z.infer<typeof BudgetPlanStep2Schema>;
    formData2: z.infer<typeof BudgetItemsStep3Schema>;
  };
  updateFormData: (
    page: "page1" | "page2",
    data: Partial<
      z.infer<typeof BudgetPlanStep2Schema> &
      z.infer<typeof BudgetItemsStep3Schema>
    >
  ) => void;
  totalBudgetObli: number;
  balUnapp: number;
  currentStep?: "withLimits" | "withoutLimits";
};

const styles = {
  labelDesign: "w-full text-left text-primary text-sm md:text-base",
  highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
};

function BudgetPlanMainForm({ 
  headerData, 
  onBack, 
  onNext,
  formData, 
  updateFormData, 
  totalBudgetObli, 
  balUnapp, 
  currentStep = "withLimits" 
}: Props) {
  const year = new Date().getFullYear();
  const {user} = useAuth();
  const [totalBudgetObligations, setTotalBudgetObligations] = useState(totalBudgetObli);
  const [balUnappropriated, setBalUnappropriated] = useState(balUnapp);
  const [currentForm, setCurrentForm] = useState<"page1" | "page2">(currentStep === "withLimits" ? "page1" : "page2");
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
    page2: useForm<z.infer<typeof BudgetItemsStep3Schema>>({
      resolver: zodResolver(BudgetItemsStep3Schema),
      defaultValues: formData2.items && formData2.items.length > 0
        ? formData2
        : { items: [] }, // Empty array as default
    }),
  };

  // Calculate total from form values based on structure
  const calculateFormTotal = (formValues: any, formType: "page1" | "page2"): number => {
    if (formType === "page1") {
      // Page1 has flat structure
      return Object.values(formValues).reduce((acc: number, curr: any) => 
        acc + (parseFloat(curr) || 0), 0
      );
    } else {
      // Page2 has nested structure with items array - ONLY include items from the dynamic form
      if (formValues.items && Array.isArray(formValues.items)) {
        return formValues.items.reduce((acc: number, item: any) => 
          acc + (parseFloat(item.dtl_proposed_budget) || 0), 0
        );
      }
      return 0;
    }
  };

  // Update total budget whenever form values change
  useEffect(() => {
    const page1Values = forms.page1.watch();
    const page2Values = forms.page2.watch();

    const page1Total = calculateFormTotal(page1Values, "page1");
    const page2Total = calculateFormTotal(page2Values, "page2");
    
    const totalBudget = page1Total + page2Total;
    setTotalBudgetObligations(totalBudget);
    
    const newBalance = availableResources - totalBudget;
    setBalUnappropriated(newBalance);
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

  // Improved form reset logic to handle data persistence
  useEffect(() => {
    if (currentForm === "page1") {
      forms.page1.reset(formData1);
    } else {
      // Ensure formData2 has proper structure - use EMPTY array when no items exist
      const formDataWithDefault = formData2.items && formData2.items.length > 0 
        ? formData2 
        : { items: [] }; // Empty array - no default row
      forms.page2.reset(formDataWithDefault);
    }
  }, [currentForm, formData1, formData2, forms.page1, forms.page2]);

  // Update currentForm when currentStep prop changes
  useEffect(() => {
    setCurrentForm(currentStep === "withLimits" ? "page1" : "page2");
  }, [currentStep]);

  const prepareSubmissionData = () => {
    // Always get the latest values from both forms
    const formValue1 = forms.page1.getValues();
    const formValue2 = forms.page2.getValues();

    console.log("Form 1 values:", formValue1);
    console.log("Form 2 values:", formValue2);

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

    // Process formData1 (with limits) - flat structure
    Object.entries(formValue1).forEach(([key, value]) => {
      const budgetItem = budgetWithLimits.find(item => item.name === key);
      if (budgetItem && value) {
        budgetDetails.push({
          dtl_budget_item: budgetItem.label,
          dtl_proposed_budget: parseFloat(value as string) || 0,
        });
      }
    });

    // Process formData2 (without limits) - ONLY include items from the dynamic form
    if (formValue2.items && Array.isArray(formValue2.items)) {
      formValue2.items.forEach((item) => {
        if (item.dtl_budget_item && item.dtl_proposed_budget) {
          budgetDetails.push({
            dtl_budget_item: item.dtl_budget_item,
            dtl_proposed_budget: parseFloat(item.dtl_proposed_budget) || 0,
          });
        }
      });
    }

    console.log("Budget Header:", budgetHeader);
    console.log("Budget Details:", budgetDetails);

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
      // If we're on page1 (with limits) and onNext prop is provided, use it
      if (currentForm === "page1" && onNext) {
        onNext();
      }
    }
  };

  const handlePrevious = async () => {
    const currentValues = forms[currentForm].getValues();
    updateFormData(currentForm, currentValues);
    
    // If we're on page2 (without limits), go back to page1 (with limits)
    if (currentForm === "page2") {
      setCurrentForm("page1");
    }
  };

  const handleBackToHeader = async () => {
    // Save current form data before navigating back
    const currentValues = forms[currentForm].getValues();
    updateFormData(currentForm, currentValues);
    
    // Always go back to budget header regardless of current form
    onBack();
  };

  const handleSubmit = async () => {
    // Save any unsaved data from current form
    const currentValues = forms[currentForm].getValues();
    updateFormData(currentForm, currentValues);

    // Validate both forms
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

    setIsSubmitting(true);
    try {
      const submissionData = prepareSubmissionData();
      console.log("Final Submission Data:", submissionData);
      
      createBudgetPlan(submissionData, {
        onSuccess: () => {
          setIsSubmitting(false);
        },
        onError: (error) => {
          setIsSubmitting(false);
          console.error("Submission error:", error);
        }
      });
    } catch (error) {
      console.error("Error preparing submission:", error);
      setIsSubmitting(false);
    }
  };

  // Button 1: Next button (only appears on with limits form)
  const renderNextButton = () => {
    if (currentForm === "page1") {
      return (
        <Button 
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      );
    }
    return null;
  };

  // Button 2: Previous button (only appears on without limits form, beside submit)
  const renderPreviousButton = () => {
    if (currentForm === "page2") {
      return (
        <Button 
          variant="outline"
          onClick={handlePrevious}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
      );
    }
    return null;
  };

  // Button 3: Back to Budget Header (appears on both forms)
  const renderBackToHeaderButton = () => {
    return (
      <Button 
        variant="outline"  
        onClick={handleBackToHeader} 
        className="flex items-center gap-2"
        disabled={isSubmitting}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Budget Header
      </Button>
    );
  };

  // Button 4: Submit button (only appears on without limits form)
  const renderSubmitButton = () => {
    if (currentForm === "page2") {
      return (
        <Button 
          onClick={handleSubmit}  
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Budget Plan"}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <DialogLayout
            trigger={
              <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow cursor-pointer">
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
          />
        )}
        {currentForm === "page2" && (
          <CreateBudgetPlanWithoutLimits
            form={forms.page2}
          />
        )}

        <div className="bg-white border-t border-gray-200 p-4 md:p-6">
          <div className="flex justify-between items-center">
            {/* Left side: Back to Budget Header button (always visible) */}
            {renderBackToHeaderButton()}
            
            {/* Right side: Navigation buttons */}
            <div className="flex gap-2">
              {/* On page1: Only Next button */}
              {currentForm === "page1" && renderNextButton()}
              
              {/* On page2: Previous and Submit buttons */}
              {currentForm === "page2" && (
                <>
                  {renderPreviousButton()}
                  {renderSubmitButton()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetPlanMainForm;