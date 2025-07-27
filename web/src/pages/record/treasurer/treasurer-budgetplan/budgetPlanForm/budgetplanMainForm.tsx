// import { useRef, useEffect, useState } from "react"
// import { ChevronLeft, ChevronRightIcon } from "lucide-react"
// import { Button } from "@/components/ui/button/button"
// import { Label } from "@/components/ui/label"
// import { formatNumber } from "@/helpers/currencynumberformatter"
// import { toast } from "sonner"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import DisplayBreakdown from "../netBreakdownDisplay"
// import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "../budgetItemDefinition"
// import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries"
// import { useUpdateBudgetPlan } from "../queries/budgetPlanUpdateQueries"
// import type { BudgetPlanDetail } from "../budgetPlanInterfaces"
// import CreateBudgetPlanPage1 from "./budgetPlanFormPage1"
// import CreateBudgetPlanPage2 from "./budgetPlanFormPage2"
// import CreateBudgetPlanPage3 from "./budgetPlanFormPage3"
// import CreateBudgetPlanPage4 from "./budgetPlanFormPage4"
// import { BudgetPlanPage1FormData,  BudgetPlanPage2FormData, BudgetPlanPage3FormData, BudgetPlanPage4FormData,} from "../formDataInitializer"
// import { useForm, UseFormReturn } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { CurrentExpendituresPersonalServicesSchema, CurrentExpenditureMaintandOtherExpensesSchema1, CurrentExpenditureMaintandOtherExpensesSchema2, CapitalOutlaysAndNonOfficeSchema} from "@/form-schema/treasurer/budgetplan-create-schema"
// import { BudgetItem, BudgetDetail, OldBudgetDetail, NewBudgetDetail, ProcessedOldBudgetDetail } from "../budgetPlanInterfaces"
// import CreateBudgetWithLimits from "../budgetPlanForm/budgetWithLimitsForm"
// import CreateBudgetPlanWithoutLimits from "../budgetPlanForm/budgetWithoutLimitsForm"

// type Props = {
//   headerData: any
//   onBack: () => void
//   isEdit: boolean
//   editId?: number
//   budgetData: any
//   onSuccess?: () => void
//   formData: {
//     formData1: BudgetPlanPage1FormData
//     formData2: BudgetPlanPage2FormData
//     formData3: BudgetPlanPage3FormData
//     formData4: BudgetPlanPage4FormData
//   }
//   updateFormData: (
//     page: "page1" | "page2" | "page3" | "page4",
//     data: Partial<
//       BudgetPlanPage1FormData &
//       BudgetPlanPage2FormData &
//       BudgetPlanPage3FormData &
//       BudgetPlanPage4FormData
//     >
//   ) => void
//   totalBudgetObli: number
//   balUnapp: number
//   beyondLimit: boolean
//   onSubmit: () => void
// }

// const styles = {
//   labelDesign: "w-full text-left text-blue text-sm md:text-base",
//   highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
// }

// function BudgetPlanMainForm({ headerData, onBack, isEdit, editId, budgetData, onSuccess, formData, updateFormData, totalBudgetObli, balUnapp, beyondLimit, onSubmit }: Props) {
//   const year = new Date().getFullYear()
//   const totalBudgetToast = useRef<string | number | null>(null)
//   const [totalBudgetObligations, setTotalBudgetObligations] = useState(0.0)
//   const [balUnappropriated, setBalUnappropriated] = useState(0.0)
//   const [isBeyondLimit, setIsBeyondLimit] = useState(false)
//   const [activeTab, setActiveTab] = useState("page1")
//   const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})

//   const { formData1, formData2, formData3, formData4 } = formData

//   const {
//     balance = "0",
//     realtyTaxShare = "0",
//     taxAllotment = "0",
//     clearanceAndCertFees = "0",
//     otherSpecificIncome = "0",
//     actualIncome = "0",
//     actualRPT = "0",
//     personalServicesLimit = "0",
//     miscExpenseLimit = "0",
//     localDevLimit = "0",
//     skFundLimit = "0",
//     calamityFundLimit = "0",
//   } = headerData || {}

//   const availableResources =
//     (parseFloat(balance) || 0) +
//     (parseFloat(realtyTaxShare) || 0) +
//     (parseFloat(taxAllotment) || 0) +
//     (parseFloat(clearanceAndCertFees) || 0) +
//     (parseFloat(otherSpecificIncome) || 0)

//   // Initialize forms for all pages
//   const forms = {
//     page1: useForm<BudgetPlanPage1FormData>({
//       resolver: zodResolver(CurrentExpendituresPersonalServicesSchema),
//       defaultValues: formData1,
//     }),
//     page2: useForm<BudgetPlanPage2FormData>({
//       resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema1),
//       defaultValues: formData2,
//     }),
//     page3: useForm<BudgetPlanPage3FormData>({
//       resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema2),
//       defaultValues: formData3,
//     }),
//     page4: useForm<BudgetPlanPage4FormData>({
//       resolver: zodResolver(CapitalOutlaysAndNonOfficeSchema),
//       defaultValues: formData4,
//     }),
//   }

//   // Update total budget whenever form values change
//   useEffect(() => {
//     const sumFormData = (formData: Record<string, any>): number =>
//       Object.values(formData).map((value) => parseFloat(value) || 0).reduce((acc, curr) => acc + curr, 0)

//     const totalBudget =
//       sumFormData(forms.page1.getValues()) + 
//       sumFormData(forms.page2.getValues()) + 
//       sumFormData(forms.page3.getValues()) + 
//       sumFormData(forms.page4.getValues())

//     setTotalBudgetObligations(totalBudget)
//     const newBalance = availableResources - totalBudget
//     setBalUnappropriated(newBalance)

//     if (newBalance < 0) {
//       if (!totalBudgetToast.current) {
//         setIsBeyondLimit(true)
//         totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
//           duration: Number.POSITIVE_INFINITY,
//           style: { border: "1px solid rgb(225, 193, 193)", padding: "16px", color: "#b91c1c", background: "#fef2f2" },
//         })
//       }
//     } else {
//       if (totalBudgetToast.current !== null) {
//         setIsBeyondLimit(false)
//         toast.dismiss(totalBudgetToast.current)
//         totalBudgetToast.current = null
//       }
//     }
//   }, [forms.page1.watch(), forms.page2.watch(), forms.page3.watch(), forms.page4.watch(), availableResources])

//   // Update form data when active tab changes
//   useEffect(() => {
//     const currentForm = forms[activeTab as keyof typeof forms]
//     updateFormData(activeTab as any, currentForm.getValues())
//   }, [activeTab])

//   const { mutate: createBudgetPlan } = useInsertBudgetPlan(onSuccess)
//   const { mutate: updateBudgetPlan } = useUpdateBudgetPlan(onSuccess)

//   const validateAllForms = async () => {
//     const errors: Record<string, boolean> = {}
//     let isValid = true

//     // Validate each form
//     for (const page of ['page1', 'page2', 'page3', 'page4'] as const) {
//       const form = forms[page]
//       const result = await form.trigger()
//       if (!result) {
//         errors[page] = true
//         isValid = false
//       }
//     }

//     setFormErrors(errors)
//     return isValid
//   }

//   const handleSubmit = async () => {
//     // Validate all forms first
//     const errors: Record<string, boolean> = {};
//     let isValid = true;

//     // Validate each form and collect errors
//     for (const page of ['page1', 'page2', 'page3', 'page4'] as const) {
//       const form = forms[page];
//       const result = await form.trigger();
//       if (!result) {
//         errors[page] = true;
//         isValid = false;
//       }
//     }

//     setFormErrors(errors);

//     if (!isValid) {
//       toast.error("Please fix all validation errors before submitting");
//       const firstErrorPage = Object.keys(errors)[0];
//       if (firstErrorPage) {
//         setActiveTab(firstErrorPage);
//       }
//       return;
//     }

//     if (isBeyondLimit) {
//       toast.error("Cannot submit with insufficient funds");
//       return;
//     }

//     // Prepare NEW budget header data
//     const newBudgetHeader = {
//       plan_actual_income: actualIncome,
//       plan_rpt_income: actualRPT,
//       plan_balance: balance,
//       plan_tax_share: realtyTaxShare,
//       plan_tax_allotment: taxAllotment,
//       plan_cert_fees: clearanceAndCertFees,
//       plan_other_income: otherSpecificIncome,
//       plan_budgetaryObligations: totalBudgetObligations,
//       plan_balUnappropriated: balUnappropriated,
//       plan_personalService_limit: personalServicesLimit,
//       plan_miscExpense_limit: miscExpenseLimit,
//       plan_localDev_limit: localDevLimit,
//       plan_skFund_limit: skFundLimit,
//       plan_calamityFund_limit: calamityFundLimit,
//       plan_year: year.toString(),
//       plan_issue_date: new Date().toISOString().split("T")[0],
//       ...(isEdit && { plan_id: editId }),
//     };

//     // Prepare NEW budget details (simple structure)
//       const prepareNewDetails = (form: Record<string, any>, items: BudgetItem[]): BudgetDetail[] => {
//         const existingDetails = isEdit && budgetData?.details ? budgetData.details : [];
        
//         return items.map((item: BudgetItem) => {
//           const existingDetail = existingDetails.find(
//             (detail: BudgetPlanDetail) => detail.dtl_budget_item === item.label
//           );

//           return {
//             dtl_proposed_budget: Number(form[item.name]) || 0,
//             dtl_budget_item: item.label,
//             dtl_budget_category: item.category,
//             ...(existingDetail && { dtl_id: existingDetail.dtl_id }) // Include dtl_id if exists
//           };
//         });
//       };

//      const newBudgetDetails = [
//       ...prepareNewDetails(forms.page1.getValues(), budgetItemsPage1),
//       ...prepareNewDetails(forms.page2.getValues(), budgetItemsPage2),
//       ...prepareNewDetails(forms.page3.getValues(), budgetItemsPage3),
//       ...prepareNewDetails(forms.page4.getValues(), budgetItemsPage4),
//     ];

//     if (isEdit) {
//       // Prepare OLD budget header data
//       const oldBudgetHeader = {
//         plan_id: budgetData.plan_id,
//         plan_year: budgetData.plan_year,
//         plan_actual_income: budgetData.plan_actual_income,
//         plan_rpt_income: budgetData.plan_rpt_income,
//         plan_balance: budgetData.plan_balance,
//         plan_tax_share: budgetData.plan_tax_share,
//         plan_tax_allotment: budgetData.plan_tax_allotment,
//         plan_cert_fees: budgetData.plan_cert_fees,
//         plan_other_income: budgetData.plan_other_income,
//         plan_budgetaryObligations: budgetData.plan_budgetaryObligations,
//         plan_balUnappropriated: budgetData.plan_balUnappropriated,
//         plan_issue_date: budgetData.plan_issue_date,
//         plan_personalService_limit: budgetData.plan_personalService_limit,
//         plan_miscExpense_limit: budgetData.plan_miscExpense_limit,
//         plan_localDev_limit: budgetData.plan_localDev_limit,
//         plan_skFund_limit: budgetData.plan_skFund_limit,
//         plan_calamityFund_limit: budgetData.plan_calamityFund_limit,
//       };

//       // Prepare OLD budget details with is_changed flag
//       const oldBudgetDetails: ProcessedOldBudgetDetail[] = budgetData.details.map(
//         (oldDetail: OldBudgetDetail) => {
//           const matchingNewDetail = newBudgetDetails.find(
//             (newDetail: NewBudgetDetail) => newDetail.dtl_budget_item === oldDetail.dtl_budget_item
//           );

//           return {
//             proposed_budget: parseFloat(oldDetail.dtl_proposed_budget.toString()),
//             budget_item: oldDetail.dtl_budget_item,
//             category: oldDetail.dtl_budget_category,
//             is_changed: matchingNewDetail
//               ? parseFloat(oldDetail.dtl_proposed_budget.toString()) !== matchingNewDetail.dtl_proposed_budget
//               : false
//           };
//         }
//       );

//       // Execute update with exactly the requested structure
//         updateBudgetPlan({
//           newBudgetHeader,
//           oldBudgetHeader,
//           newBudgetDetails, 
//           oldBudgetDetails 
//         });

//     } else {
//       createBudgetPlan({
//         newBudgetHeader,
//         newBudgetDetails
//       });
//     }
//   };

//   const tabs = [
//     { id: "page1", shortLabel: "Plan 1", description: "Personal Services" },
//     { id: "page2", shortLabel: "Plan 2", description: "Maintenance & Other Expenses" },
//     { id: "page3", shortLabel: "Plan 3", description: "Programs & Activities" },
//     { id: "page4", shortLabel: "Plan 4", description: "Capital Outlays & Funds" },
//   ]
  

//   return (
//     <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         {/* Desktop Tab Navigation */}
//         <div className="hidden lg:block mb-8">
//           <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white">
//             {tabs.map((tab, index) => (
//               <TabsTrigger
//                 key={tab.id}
//                 value={tab.id}
//                 className={`group flex flex-col items-center gap-2 py-4 px-4 transition-all duration-200 
//                   data-[state=active]:bg-primary/10 data-[state=active]:text-primary 
//                   data-[state=active]:shadow-sm rounded-md ${formErrors[tab.id] ? 'border-2 border-red-500' : ''}`}
//               >
//                 <div className="flex items-center gap-2">
//                   <span className={`font-medium text-sm border rounded-md px-2 py-1 
//                     group-data-[state=active]:border-primary border-2 
//                     group-data-[state=active]:text-primary ${formErrors[tab.id] ? 'border-red-500 text-red-500' : ''}`}>
//                     {index + 1}
//                   </span>
//                   <span className="font-medium text-sm">{tab.shortLabel}</span>
//                 </div>
//                 <span className="text-xs text-muted-foreground text-center leading-tight">{tab.description}</span>
//                 {formErrors[tab.id] && (
//                   <span className="text-xs text-red-500">Validation errors</span>
//                 )}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </div>

//         <div className="flex flex-col gap-4 mb-6">
//           <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
//             <DialogLayout
//               trigger={
//                 <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//                   <div className="flex items-center justify-between">
//                     <Label className={styles.labelDesign}>NET Available Resources:</Label>
//                     <ChevronRightIcon className="w-4 h-4 text-blue-500" />
//                   </div>
//                   <Label className="text-sm font-semibold">{formatNumber(availableResources.toString())}</Label>
//                 </div>
//               }
//               title="Breakdown of NET Available Resources"
//               description="Detailed breakdown of available funds from all income sources"
//               mainContent={
//                 <DisplayBreakdown
//                   balance={balance}
//                   realtyTaxShare={realtyTaxShare}
//                   taxAllotment={taxAllotment}
//                   clearanceAndCertFees={clearanceAndCertFees}
//                   otherSpecificIncome={otherSpecificIncome}
//                 />
//               }
//             />

//             <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//               <Label className={styles.labelDesign}>Year:</Label>
//               <Label className="text-sm font-semibold">{year}</Label>
//             </div>

//             <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//               <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS:</Label>
//               <Label className="text-red-500 text-sm font-semibold">
//                 {formatNumber(totalBudgetObligations.toString())}
//               </Label>
//             </div>

//             <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//               <Label className={styles.labelDesign}>Actual RPT Income:</Label>
//               <Label className="text-sm font-semibold">{formatNumber(actualRPT)}</Label>
//             </div>

//             <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//               <Label className={styles.labelDesign}>Actual Income:</Label>
//               <Label className="text-sm font-semibold">{formatNumber(actualIncome)}</Label>
//             </div>

//             <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//               <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED:</Label>
//               <Label className="text-green-500 text-sm font-semibold">
//                 {formatNumber(balUnappropriated.toString())}
//               </Label>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white drop-shadow rounded-lg overflow-hidden">
//           {activeTab === "page1" && (
//             <CreateBudgetPlanPage1
//               form={forms.page1}
//               updateFormData={(data) => updateFormData("page1", data)}
//               personalServicesLimit={parseFloat(personalServicesLimit)}
//               actualIncome={parseFloat(actualIncome)}
//               isBeyondLimit={isBeyondLimit}
//             />
//           )}
//           {activeTab === "page2" && (
//             <CreateBudgetPlanPage2
//               form={forms.page2}
//               updateFormData={(data) => updateFormData("page2", data)}
//               isBeyondLimit={isBeyondLimit}
//             />
//           )}
//           {activeTab === "page3" && (
//             <CreateBudgetPlanPage3
//               form={forms.page3}
//               updateFormData={(data) => updateFormData("page3", data)}
//               actualRPT={parseFloat(actualRPT)}
//               miscExpenseLimit={parseFloat(miscExpenseLimit)}
//               isBeyondLimit={isBeyondLimit}
//             />
//           )}
//           {activeTab === "page4" && (
//             <CreateBudgetPlanPage4
//               form={forms.page4}
//               updateFormData={(data) => updateFormData("page4", data)}
//               balance={balance}
//               taxAllotment={taxAllotment}
//               realtyTaxShare={realtyTaxShare}
//               clearanceAndCertFees={clearanceAndCertFees}
//               otherSpecificIncome={otherSpecificIncome}
//               localDevLimit={localDevLimit}
//               skFundLimit={skFundLimit}
//               calamityFundLimit={calamityFundLimit}
//               isBeyondLimit={isBeyondLimit}
//             />
//           )}

//           <div className="bg-white border-t border-gray-200 p-4 md:p-6">
//             <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//               <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-2">
//                 <ChevronLeft className="w-4 h-4" />
//                 Back to Main
//               </Button>

//               <Button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={isBeyondLimit}
//                 className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
//               >
//                 {isEdit ? "Update Budget Plan" : "Submit Budget Plan"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </Tabs>
//     </div>
//   )
// }

// export default BudgetPlanMainForm

// import { useRef, useEffect, useState } from "react";
// import { ChevronLeft, ChevronRightIcon } from "lucide-react";
// import { Button } from "@/components/ui/button/button";
// import { Label } from "@/components/ui/label";
// import { formatNumber } from "@/helpers/currencynumberformatter";
// import { toast } from "sonner";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import DisplayBreakdown from "../netBreakdownDisplay";
// import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries";
// import type { BudgetPlanDetail } from "../budgetPlanInterfaces";
// import { useForm, UseFormReturn } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { BudgetPlanStep2Schema, BudgetPlanStep3Schema } from "@/form-schema/treasurer/budgetplan-schema";
// import { BudgetItem, BudgetDetail } from "../budgetPlanInterfaces";
// import CreateBudgetWithLimits from "./budgetWithLimitsForm";
// import CreateBudgetPlanWithoutLimits from "./budgetWithoutLimitsForm";
// import { budgetWithLimits, budgetWithoutLimits } from "../budgetItemDefinition";
// import z from "zod";

// type Props = {
//   headerData: any;
//   onBack: () => void;
//   onSuccess?: () => void;
//   formData: {
//     formData1: z.infer<typeof BudgetPlanStep2Schema>;
//     formData2: z.infer<typeof BudgetPlanStep3Schema>;
//   };
//   updateFormData: (
//     page: "page1" | "page2",
//     data: Partial<
//       z.infer<typeof BudgetPlanStep2Schema> &
//       z.infer<typeof BudgetPlanStep3Schema>
//     >
//   ) => void;
//   totalBudgetObli: number;
//   balUnapp: number;
//   beyondLimit: boolean;
//   onSubmit: () => void;
// };

// const styles = {
//   labelDesign: "w-full text-left text-blue text-sm md:text-base",
//   highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
// };

// function BudgetPlanMainForm({ headerData, onBack, onSuccess, formData, updateFormData, onSubmit }: Props) {
//   const year = new Date().getFullYear();
//   const totalBudgetToast = useRef<string | number | null>(null);
//   const [totalBudgetObligations, setTotalBudgetObligations] = useState(0.0);
//   const [balUnappropriated, setBalUnappropriated] = useState(0.0);
//   const [isBeyondLimit, setIsBeyondLimit] = useState(false);
//   const [currentForm, setCurrentForm] = useState<"page1" | "page2">("page1");
//   const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

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
//     page2: useForm<z.infer<typeof BudgetPlanStep3Schema>>({
//       resolver: zodResolver(BudgetPlanStep3Schema),
//       defaultValues: formData2,
//     }),
//   };

//   // Update total budget whenever form values change
//   useEffect(() => {
//     const sumFormData = (formData: Record<string, any>): number =>
//       Object.values(formData).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);

//     const page1Values = forms.page1.watch();
//     const page2Values = forms.page2.watch();

//     const totalBudget = sumFormData(page1Values) + sumFormData(page2Values);
//     setTotalBudgetObligations(totalBudget);
    
//     const newBalance = availableResources - totalBudget;
//     setBalUnappropriated(newBalance);

//     if (newBalance < 0) {
//       if (!totalBudgetToast.current) {
//         setIsBeyondLimit(true);
//         totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
//           duration: Number.POSITIVE_INFINITY,
//           style: { border: "1px solid rgb(225, 193, 193)", padding: "16px", color: "#b91c1c", background: "#fef2f2" },
//         });
//       }
//     } else {
//       if (totalBudgetToast.current !== null) {
//         setIsBeyondLimit(false);
//         toast.dismiss(totalBudgetToast.current);
//         totalBudgetToast.current = null;
//       }
//     }
//   }, [forms.page1.watch(), forms.page2.watch(), availableResources]);

//   const { mutate: createBudgetPlan } = useInsertBudgetPlan(onSuccess);

//   const validateCurrentForm = async () => {
//     const form = forms[currentForm];
//     const result = await form.trigger();
//     if (!result) {
//       setFormErrors({ ...formErrors, [currentForm]: true });
//       return false;
//     }
//     return true;
//   };

//   useEffect(() => {
//     if (currentForm === "page1") {
//       forms.page1.reset(formData1);
//     } else {
//       forms.page2.reset(formData2);
//     }
//   }, [currentForm, formData1, formData2]);

//   const handleNext = async () => {
//     const isValid = await validateCurrentForm();
//     if (isValid) {
//       const currentValues = forms[currentForm].getValues();
//       updateFormData(currentForm, currentValues);
//       setCurrentForm("page2");
//     }
//   };

//   const handlePrevious = async () => {
//     const currentValues = forms[currentForm].getValues();
//     updateFormData(currentForm, currentValues);
//     setCurrentForm("page1");
//   };

//   const handleSubmit = async () => {
//     // First save any unsaved data
//     const currentValues = forms[currentForm].getValues();
//     updateFormData(currentForm, currentValues);

//     // Validate all forms first
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

//     if (isBeyondLimit) {
//       toast.error("Cannot submit with insufficient funds");
//       return;
//     }

//     onSubmit();
//   };
  
//   return (
//     <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
//       <div className="flex flex-col gap-4 mb-6">
//         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
//           <DialogLayout
//             trigger={
//               <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
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
//             updateFormData={(data) => updateFormData("page1", data)}
//             budgetLimit={availableResources}
//             onNext={handleNext}
//           />
//         )}
//         {currentForm === "page2" && (
//           <CreateBudgetPlanWithoutLimits
//             form={forms.page2}
//             updateFormData={(data) => updateFormData("page2", data)}
//             budgetLimit={availableResources}
//             onPrevious={handlePrevious}
//           />
//         )}

//         <div className="bg-white border-t border-gray-200 p-4 md:p-6">
//           <div className="flex justify-between">
//             <Button variant="outline"  onClick={onBack} className="flex items-center gap-2" >
//               <ChevronLeft className="w-4 h-4" />
//               Back to Header
//             </Button>
            
//             <Button  onClick={handleSubmit}  disabled={isBeyondLimit}  className="bg-green-600 hover:bg-green-700 text-white" >
//               Submit Budget Plan
//             </Button>
         
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BudgetPlanMainForm;


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
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetPlanStep2Schema, BudgetPlanStep3Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { budgetWithLimits, budgetWithoutLimits } from "../budgetItemDefinition";
import z from "zod";
import CreateBudgetPlanWithoutLimits from "./budgetWithoutLimitsForm";
import CreateBudgetWithLimits from "./budgetWithLimitsForm";

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
            updateFormData={(data) => updateFormData("page2", data)}
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