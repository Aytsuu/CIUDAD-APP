// import CreateBudgetPlanPage1 from "./budgetPlanFormPage1.tsx";
// import CreateBudgetPlanPage2 from "./budgetPlanFormPage2.tsx";
// import CreateBudgetPlanPage3 from "./budgetPlanFormPage3.tsx";
// import CreateBudgetPlanPage4 from "./budgetPlanFormPage4.tsx";
// import { Label } from "@/components/ui/label";
// import { useRef, useState } from "react";
// import { useEffect } from "react";
// import { ChevronLeft, ChevronRightIcon } from "lucide-react";
// import { Button } from "@/components/ui/button/button.tsx";
// import { formatNumber } from "@/helpers/currencynumberformatter";
// import { toast } from "sonner";
// import DisplayBreakdown from "../netBreakdownDisplay.tsx";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { getInitialFormData } from "../budgetPlanFormEditInitializer.tsx";
// import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "../budgetItemDefinition.tsx";
// import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries.tsx";
// import { useUpdateBudgetPlan } from "../queries/budgetPlanUpdateQueries.tsx";
// import { BudgetPlanDetail } from "../budgetPlanInterfaces.tsx";

// const styles = {
//     header: "font-bold text-lg text-blue w-[18rem] justify-center flex",
//     total: "font-bold text-blue",
//     mainCategory: "font-bold text-[19px]",
//     subCategory: "font-semibold text-[16px] text-sky-500",
//     budgetDetails: "flex text-left text-[15px]",
//     labelInputGroup: "flex flex-row gap-4",
//     colDesign: "flex flex-col gap-4",
//     inputField: "w-[15rem] text-right", 
//     labelDesign: "w-full text-left text-blue",
//     highlightLabel: "w-full text-left text-darkGray"
// }; 


// function BudgetPlanForm({headerData, onBack, isEdit, editId, budgetData, onSuccess}: {
//     headerData: any;
//     onBack: () => void;
//     isEdit: boolean;
//     editId?: number;
//     budgetData: any;
//     onSuccess?: () => void;
// }) {
//     const year = new Date().getFullYear()
//     const totalBudgetToast = useRef <string | number | null>(null);
//     // const navigate = useNavigate();

//     const {
//         balance = "0",
//         realtyTaxShare = "0",
//         taxAllotment = "0",
//         clearanceAndCertFees = "0",
//         otherSpecificIncome = "0",
//         actualIncome = "0",
//         actualRPT = "0",
//         personalServicesLimit = "0",
//         miscExpenseLimit = "0",
//         localDevLimit = "0",
//         skFundLimit = "0",
//         calamityFundLimit = "0",
//       } = headerData || {};

//     // const [initialized, setInitialized] = useState(false)
//     const initialForms = getInitialFormData(isEdit, budgetData);
    
//     const [formData1, setFormData1] = useState(initialForms.form1);
//     const [formData2, setFormData2] = useState(initialForms.form2);
//     const [formData3, setFormData3] = useState(initialForms.form3);
//     const [formData4, setFormData4] = useState(initialForms.form4);
//     const [totalBudgetObligations, settotalBudgetObligations] = useState(0.00);
//     const [balUnappropriated, setbalUnappropriated] = useState(0.00);
//     const [isBeyondLimit, setIsBeyondLimit] = useState(false);

//     // Calculating net available resources
//     const availableResources =
//     (parseFloat(balance) || 0) +
//     (parseFloat(realtyTaxShare) || 0) +
//     (parseFloat(taxAllotment) || 0) +
//     (parseFloat(clearanceAndCertFees) || 0) +
//     (parseFloat(otherSpecificIncome) || 0);

//     const backButtonHandler = () => {
//         onBack();
//       };
//     const [currentPage, setCurrentPage] = useState(1);

//     // auto calculation of total budgetary obligations and balance unappropriated
//     useEffect(() => {
//         const sumFormData = (formData: Record<string, any>): number => 
//             Object.values(formData)
//                 .map((value) => parseFloat(value) || 0)
//                 .reduce((acc, curr) => acc + curr, 0);

//         const totalBudget = sumFormData(formData1) + sumFormData(formData2) + 
//                             sumFormData(formData3) + sumFormData(formData4);
        
//         settotalBudgetObligations(totalBudget);
//         const newBalance = availableResources - totalBudget;
//         setbalUnappropriated(newBalance);
        
//         if (newBalance < 0) {
//             if (!totalBudgetToast.current) {
//                 setIsBeyondLimit(true);
//                 totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
//                     duration: Infinity, 
//                     style: {
//                         border: '1px solid rgb(225, 193, 193)',
//                         padding: '16px',
//                         color: '#b91c1c',
//                         background: '#fef2f2',
//                     },
//                 });
//             }
//         } else {
//             if(totalBudgetToast.current !== null){
//                 setIsBeyondLimit(false);
//                 toast.dismiss(totalBudgetToast.current);
//                 totalBudgetToast.current = null;
//             }
//         }
//     }, [formData1, formData2, formData3, formData4, availableResources]);

//     const handleNext = () => setCurrentPage(prev => prev + 1);
//     const handlePrevious = () => setCurrentPage(prev => prev - 1);

//     // Update form data based on current page
//     const updateFormData = (data: Record<string, string>) => {
//         if (currentPage === 1) setFormData1(prev => ({ ...prev, ...data }));
//         else if (currentPage === 2) setFormData2(prev => ({ ...prev, ...data }));
//         else if (currentPage === 3) setFormData3(prev => ({ ...prev, ...data }));
//         else if (currentPage === 4) setFormData4(prev => ({ ...prev, ...data }));
//     };

//     const {mutate: createBudgetPlan} = useInsertBudgetPlan(onSuccess)
//     const {mutate: updateBudgetPlan} = useUpdateBudgetPlan(onSuccess)

//     // send values on query function
//     const onSubmit = async () => {
//         // if form is not in edit mode
//         if (isEdit == false) {
//             const budgetHeader = {
//                 plan_actual_income: actualIncome,
//                 plan_rpt_income: actualRPT,
//                 plan_balance: balance,
//                 plan_tax_share: realtyTaxShare,
//                 plan_tax_allotment: taxAllotment,
//                 plan_cert_fees: clearanceAndCertFees,
//                 plan_other_income: otherSpecificIncome,
//                 plan_budgetaryObligations: totalBudgetObligations, 
//                 plan_balUnappropriated: balUnappropriated,
//                 plan_personalService_limit: personalServicesLimit,
//                 plan_miscExpense_limit: miscExpenseLimit,
//                 plan_localDev_limit: localDevLimit, 
//                 plan_skFund_limit: skFundLimit,
//                 plan_calamityFund_limit: calamityFundLimit,
//                 plan_year: new Date().getFullYear().toString(),
//                 plan_issue_date: new Date().toISOString().split('T')[0]
//             };
    
//             const budgetDetails = transformFormDataCreate();

//             createBudgetPlan({ budgetHeader, budgetDetails });
//         } else { 
    
//             // Prepare updated header data
//             const updatedBudgetHeader = {
//                 plan_id: editId,
//                 plan_actual_income: actualIncome,
//                 plan_rpt_income: actualRPT,
//                 plan_balance: balance,
//                 plan_tax_share: realtyTaxShare,
//                 plan_tax_allotment: taxAllotment,
//                 plan_cert_fees: clearanceAndCertFees,
//                 plan_other_income: otherSpecificIncome,
//                 plan_budgetaryObligations: totalBudgetObligations, 
//                 plan_balUnappropriated: balUnappropriated,
//                 plan_personalService_limit: personalServicesLimit,
//                 plan_miscExpense_limit: miscExpenseLimit,
//                 plan_localDev_limit: localDevLimit, 
//                 plan_skFund_limit: skFundLimit,
//                 plan_calamityFund_limit: calamityFundLimit,
//             };

//             const updatedBudgetDetails = transformFormDataUpdate();

//             await updateBudgetPlan({
//                 budgetHeader: updatedBudgetHeader,
//                 budgetDetails: updatedBudgetDetails
//             });
//         }
//     };

//     const transformFormDataUpdate = () => {
//         const existingDetails = budgetData || [];
//         const transformPageData = (formData: Record<string, any>, budgetItems: any[], pageIndex: number) => {
//             return budgetItems.map(({ name, label, category }) => {
//                 const existingDetail = existingDetails.find(
//                     (detail: BudgetPlanDetail) => detail.dtl_budget_item === label
//                 );
                
//                 return {
//                     dtl_id: existingDetail.dtl_id,
//                     dtl_proposed_budget: formData[name] || "0.00",
//                     dtl_budget_item: label,
//                     dtl_budget_category: category,
//                 };
//             });
//         };
    
//         return [
//             ...transformPageData(formData1, budgetItemsPage1, 0),
//             ...transformPageData(formData2, budgetItemsPage2, 1),
//             ...transformPageData(formData3, budgetItemsPage3, 2),
//             ...transformPageData(formData4, budgetItemsPage4, 3)
//         ];
//     };

//     const transformFormDataCreate = () => {
//         const existingDetails = budgetData?.budget_detail || []; 
//         const transformPageData = (formData: Record<string, any>, budgetItems: any[], pageIndex: number) => {
//             return budgetItems.map(({ name, label, category }) => {
//                 const existingDetail = existingDetails.find(
//                     (detail: BudgetPlanDetail) => detail?.dtl_budget_item === label
//                 );
                
//                 return {
//                     dtl_id: existingDetail?.dtl_id || 0, 
//                     dtl_proposed_budget: formData[name] || "0.00",
//                     dtl_budget_item: label,
//                     dtl_budget_category: category,
//                 };
//             });
//         };
    
//         return [
//             ...transformPageData(formData1, budgetItemsPage1, 0),
//             ...transformPageData(formData2, budgetItemsPage2, 1),
//             ...transformPageData(formData3, budgetItemsPage3, 2),
//             ...transformPageData(formData4, budgetItemsPage4, 3)
//         ].filter(item => item !== undefined); 
//     };

    
//     return (
//         <div className='w-full h-full bg-snow'>
//             {/* Header Title */}
//             <div className="flex flex-col gap-3 mb-3">
//                 <div className='flex flex-row gap-4'>
//                     <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => backButtonHandler()}><ChevronLeft /></Button>

//                     <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                         <div>{isEdit ? 'Edit Budget Plan' : "Create Budget Plan"}</div>
//                     </h1>
//                 </div>
//                 <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
//                     {isEdit ? "Edit the existing budget plan details." : "Develop a comprehensive budget plan to support barangay initiatives and community needs."}
//                 </p>
//             </div>
//             <hr className="border-gray mb-7 sm:mb-8" /> 

//             {/* Budgetplan Header */}
//             <div className='flex flex-col gap-5'>
//                 {/* Header */}
//                 <div className='w-full  grid grid-cols-3 gap-3'>
//                     {/* Displays the breakdown of Net available resources when clicked */}
//                         <DialogLayout
//                             trigger={ 
//                                 <div className="p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg">
//                                     <div className="flex items-center justify-between">
//                                         <Label className={styles.labelDesign}>NET Available Resources:</Label>
//                                         <ChevronRightIcon className="w-5 h-5 text-blue-500" />
//                                     </div>
//                                     <Label>{formatNumber(availableResources.toString())}</Label>
//                               </div>
                              
//                             }
//                             title="Breakdown of NET Available Resources"
//                             description="Detailed breakdown of available funds from all income sources"
//                             mainContent={
//                                 <DisplayBreakdown
//                                 balance={balance}
//                                 realtyTaxShare={realtyTaxShare}
//                                 taxAllotment={taxAllotment}
//                                 clearanceAndCertFees={clearanceAndCertFees}
//                                 otherSpecificIncome={otherSpecificIncome}
//                                 />
//                             }
//                         />
                   

//                     <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
//                         <Label className={styles.labelDesign}>Year: </Label>
//                         <Label>{year}</Label>
//                     </div>

//                     <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
//                         <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS: </Label>
//                         <Label className="text-red-500">{formatNumber(totalBudgetObligations.toString())}</Label>
//                     </div>
                    
//                     <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
//                         <Label className={styles.labelDesign}>Actual RPT Income: </Label>
//                         <Label>{formatNumber(actualRPT)}</Label>
//                     </div>

//                     <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
//                         <Label className={styles.labelDesign}>Actual Income: </Label>
//                         <Label>{formatNumber(actualIncome)}</Label>
//                     </div>

//                     <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
//                         <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED: </Label>
//                         <Label className="text-green-500">{formatNumber(balUnappropriated.toString())}</Label>
//                     </div>
//                 </div>

//                 {/* Form */}
//                 <div className='drop-shadow'>
//                     <div className='flex justify-end bg-lightBlue p-2'>
//                         <div className='flex flex-row gap-[3.5rem] justify-center items-center'>
//                             <Label className={styles.header}>Per Proposed Budget</Label>
//                             <Label className={styles.header}>Budget Limit</Label>
//                             <Label className={styles.header}>Balance</Label>
//                         </div>
//                     </div>

//                     <div className='w-full'>
//                         {currentPage === 1 && (
//                                 <CreateBudgetPlanPage1
//                                 onNext2={handleNext}
//                                 personalServicesLimit = {personalServicesLimit}
//                                 actualIncome = {actualIncome}
//                                 updateFormData={updateFormData}
//                                 formData={formData1}
//                                 isBeyondLimit = {isBeyondLimit}
//                                 />
//                         )}

//                         {currentPage === 2 && (
//                             <CreateBudgetPlanPage2
//                                 onPrevious1={handlePrevious}
//                                 onNext3={handleNext}
//                                 updateFormData={updateFormData}
//                                 formData={formData2}
//                                 isBeyondLimit = {isBeyondLimit}
//                             />
//                         )}

//                         {currentPage === 3 && (
//                             <CreateBudgetPlanPage3
//                                 onPrevious2={handlePrevious}
//                                 onNext4={handleNext}    
//                                 updateFormData={updateFormData}
//                                 formData={formData3}
//                                 actualRPT = {actualRPT}
//                                 miscExpenseLimit = {miscExpenseLimit}
//                                 isBeyondLimit = {isBeyondLimit}
//                             />
//                         )}

//                         {currentPage === 4 && (
//                             <CreateBudgetPlanPage4
//                                 onPrevious3={handlePrevious}
//                                 onSubmit={onSubmit}
//                                 updateFormData={updateFormData}
//                                 formData={formData4}
//                                 balance = {balance}
//                                 taxAllotment = {taxAllotment}
//                                 realtyTaxShare = {realtyTaxShare}
//                                 clearanceAndCertFees = {clearanceAndCertFees}
//                                 otherSpecificIncome = {otherSpecificIncome}
//                                 localDevLimit = {localDevLimit}
//                                 skFundLimit = {skFundLimit}
//                                 calamityFundLimit = {calamityFundLimit}
//                                 isBeyondLimit = {isBeyondLimit}
//                             />
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default BudgetPlanForm;
// import { useState, useRef, useEffect } from "react"
// import { ChevronLeft, ChevronRightIcon } from "lucide-react"
// import { Button } from "@/components/ui/button/button"
// import { Label } from "@/components/ui/label"
// import { formatNumber } from "@/helpers/currencynumberformatter"
// import { toast } from "sonner"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import DisplayBreakdown from "../netBreakdownDisplay"
// import { getInitialFormData } from "../budgetPlanFormEditInitializer"
// import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "../budgetItemDefinition"
// import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries"
// import { useUpdateBudgetPlan } from "../queries/budgetPlanUpdateQueries"
// import type { BudgetPlanDetail } from "../budgetPlanInterfaces"
// import CreateBudgetPlanPage1 from "./budgetPlanFormPage1"
// import CreateBudgetPlanPage2 from "./budgetPlanFormPage2"
// import CreateBudgetPlanPage3 from "./budgetPlanFormPage3"
// import CreateBudgetPlanPage4 from "./budgetPlanFormPage4"

// const styles = {
//   header:
//     "font-bold text-sm md:text-base lg:text-lg text-blue w-full md:w-[12rem] lg:w-[16rem] justify-center flex text-center",
//   total: "font-bold text-blue",
//   mainCategory: "font-bold text-lg md:text-xl",
//   subCategory: "font-semibold text-sm md:text-base text-sky-500",
//   budgetDetails: "flex text-left text-sm md:text-base",
//   labelInputGroup: "flex flex-col sm:flex-row gap-2 sm:gap-4",
//   colDesign: "flex flex-col gap-2 sm:gap-4",
//   inputField: "w-full sm:w-[12rem] md:w-[15rem] text-right",
//   labelDesign: "w-full text-left text-blue text-sm md:text-base",
//   highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
// }

// function BudgetPlanMainForm({
//   headerData,
//   onBack,
//   isEdit,
//   editId,
//   budgetData,
//   onSuccess,
//   formData,
//   updateFormData
// }: {
//   headerData: any
//   onBack: () => void
//   isEdit: boolean
//   editId?: number
//   budgetData: any
//   onSuccess?: () => void
//   formData: {
//     formData1: Record<string, any>,
//     formData2: Record<string, any>,
//     formData3: Record<string, any>,
//     formData4: Record<string, any>,
//   }
//   updateFormData: (page: string, data: Record<string, string>) => void
// }) {
//   const year = new Date().getFullYear()
//   const totalBudgetToast = useRef<string | number | null>(null)

//   // Destructure header data with defaults
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

//   const initialForms = getInitialFormData(isEdit, budgetData)

//   // Form state management
//   // const [formData1, setFormData1] = useState(initialForms.form1)
//   // const [formData2, setFormData2] = useState(initialForms.form2)
//   // const [formData3, setFormData3] = useState(initialForms.form3)
//   // const [formData4, setFormData4] = useState(initialForms.form4)
//   const [totalBudgetObligations, setTotalBudgetObligations] = useState(0.0)
//   const [balUnappropriated, setBalUnappropriated] = useState(0.0)
//   const [isBeyondLimit, setIsBeyondLimit] = useState(false)
//   const [activeTab, setActiveTab] = useState("page1")

//   // Calculate available resources
//   const availableResources =
//     (Number.parseFloat(balance) || 0) +
//     (Number.parseFloat(realtyTaxShare) || 0) +
//     (Number.parseFloat(taxAllotment) || 0) +
//     (Number.parseFloat(clearanceAndCertFees) || 0) +
//     (Number.parseFloat(otherSpecificIncome) || 0)

//   // Auto calculation of total budgetary obligations
//   useEffect(() => {
//     const sumFormData = (formData: Record<string, any>): number =>
//       Object.values(formData)
//         .map((value) => Number.parseFloat(value) || 0)
//         .reduce((acc, curr) => acc + curr, 0)

//     const totalBudget =
//       sumFormData(formData1) + sumFormData(formData2) + sumFormData(formData3) + sumFormData(formData4)

//     setTotalBudgetObligations(totalBudget)
//     const newBalance = availableResources - totalBudget
//     setBalUnappropriated(newBalance)

//     if (newBalance < 0) {
//       if (!totalBudgetToast.current) {
//         setIsBeyondLimit(true)
//         totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
//           duration: Number.POSITIVE_INFINITY,
//           style: {
//             border: "1px solid rgb(225, 193, 193)",
//             padding: "16px",
//             color: "#b91c1c",
//             background: "#fef2f2",
//           },
//         })
//       }
//     } else {
//       if (totalBudgetToast.current !== null) {
//         setIsBeyondLimit(false)
//         toast.dismiss(totalBudgetToast.current)
//         totalBudgetToast.current = null
//       }
//     }
//   }, [formData1, formData2, formData3, formData4, availableResources])

//   // Update form data based on current tab
//   const updateFormData = (data: Record<string, string>) => {
//     if (activeTab === "page1") setFormData1((prev) => ({ ...prev, ...data }))
//     else if (activeTab === "page2") setFormData2((prev) => ({ ...prev, ...data }))
//     else if (activeTab === "page3") setFormData3((prev) => ({ ...prev, ...data }))
//     else if (activeTab === "page4") setFormData4((prev) => ({ ...prev, ...data }))
//   }

//   // Mutation hooks for create/update
//   const { mutate: createBudgetPlan } = useInsertBudgetPlan(onSuccess)
//   const { mutate: updateBudgetPlan } = useUpdateBudgetPlan(onSuccess)

//   // Form submission handler
//   const onSubmit = async () => {
//     if (!isEdit) {
//       const budgetHeader = {
//         plan_actual_income: actualIncome,
//         plan_rpt_income: actualRPT,
//         plan_balance: balance,
//         plan_tax_share: realtyTaxShare,
//         plan_tax_allotment: taxAllotment,
//         plan_cert_fees: clearanceAndCertFees,
//         plan_other_income: otherSpecificIncome,
//         plan_budgetaryObligations: totalBudgetObligations,
//         plan_balUnappropriated: balUnappropriated,
//         plan_personalService_limit: personalServicesLimit,
//         plan_miscExpense_limit: miscExpenseLimit,
//         plan_localDev_limit: localDevLimit,
//         plan_skFund_limit: skFundLimit,
//         plan_calamityFund_limit: calamityFundLimit,
//         plan_year: year.toString(),
//         plan_issue_date: new Date().toISOString().split("T")[0],
//       }

//       const budgetDetails = transformFormDataCreate()
//       createBudgetPlan({ budgetHeader, budgetDetails })
//     } else {
//       const updatedBudgetHeader = {
//         plan_id: editId,
//         plan_actual_income: actualIncome,
//         plan_rpt_income: actualRPT,
//         plan_balance: balance,
//         plan_tax_share: realtyTaxShare,
//         plan_tax_allotment: taxAllotment,
//         plan_cert_fees: clearanceAndCertFees,
//         plan_other_income: otherSpecificIncome,
//         plan_budgetaryObligations: totalBudgetObligations,
//         plan_balUnappropriated: balUnappropriated,
//         plan_personalService_limit: personalServicesLimit,
//         plan_miscExpense_limit: miscExpenseLimit,
//         plan_localDev_limit: localDevLimit,
//         plan_skFund_limit: skFundLimit,
//         plan_calamityFund_limit: calamityFundLimit,
//       }

//       const updatedBudgetDetails = transformFormDataUpdate()
//       updateBudgetPlan({
//         budgetHeader: updatedBudgetHeader,
//         budgetDetails: updatedBudgetDetails,
//       })
//     }
//   }

//   // Data transformation functions
//   const transformFormDataUpdate = () => {
//     const existingDetails = budgetData || []
//     const transformPageData = (formData: Record<string, any>, budgetItems: any[], pageIndex: number) => {
//       return budgetItems.map(({ name, label, category }) => {
//         const existingDetail = existingDetails.find((detail: BudgetPlanDetail) => detail.dtl_budget_item === label)

//         return {
//           dtl_id: existingDetail?.dtl_id,
//           dtl_proposed_budget: formData[name] || "0.00",
//           dtl_budget_item: label,
//           dtl_budget_category: category,
//         }
//       })
//     }

//     return [
//       ...transformPageData(formData1, budgetItemsPage1, 0),
//       ...transformPageData(formData2, budgetItemsPage2, 1),
//       ...transformPageData(formData3, budgetItemsPage3, 2),
//       ...transformPageData(formData4, budgetItemsPage4, 3),
//     ]
//   }

//   const transformFormDataCreate = () => {
//     const existingDetails = budgetData?.budget_detail || []
//     const transformPageData = (formData: Record<string, any>, budgetItems: any[], pageIndex: number) => {
//       return budgetItems.map(({ name, label, category }) => {
//         const existingDetail = existingDetails.find((detail: BudgetPlanDetail) => detail?.dtl_budget_item === label)

//         return {
//           dtl_id: existingDetail?.dtl_id || 0,
//           dtl_proposed_budget: formData[name] || "0.00",
//           dtl_budget_item: label,
//           dtl_budget_category: category,
//         }
//       })
//     }

//     return [
//       ...transformPageData(formData1, budgetItemsPage1, 0),
//       ...transformPageData(formData2, budgetItemsPage2, 1),
//       ...transformPageData(formData3, budgetItemsPage3, 2),
//       ...transformPageData(formData4, budgetItemsPage4, 3),
//     ].filter((item) => item !== undefined)
//   }

//   // Tab navigation
//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab)
//   }

//   const tabs = [
//     { id: "page1", shortLabel: "Plan 1", description: "First budget plan form" },
//     { id: "page2", shortLabel: "Plan 2", description: "Second budget plan form" },
//     { id: "page3", shortLabel: "Plan 3", description: "Third budget plan form" },
//     { id: "page4", shortLabel: "Plan 4", description: "Fourth Budget Plan Form" },
//   ]

//   return (
//     <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
//       {/* Tab Navigation */}
//       <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
//         {/* Desktop Tab Navigation */}
//         <div className="hidden lg:block mb-8">
//           <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white">
//             {tabs.map((tab, index) => (
//               <TabsTrigger
//                 key={tab.id}
//                 value={tab.id}
//                 className="group flex flex-col items-center gap-2 py-4 px-4 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="font-medium text-sm border rounded-md px-2 py-1 group-data-[state=active]:border-primary border-2 group-data-[state=active]:text-primary">
//                     {index + 1}
//                   </span>
//                   <span className="font-medium text-sm">{tab.shortLabel}</span>
//                 </div>
//                 <span className="text-xs text-muted-foreground text-center leading-tight">{tab.description}</span>
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </div>

//         {/* Mobile Tab Navigation */}
//         <div className="lg:hidden mb-6">
//           <TabsList className="flex w-full overflow-x-auto h-auto p-1 bg-white">
//             {tabs.map((tab, index) => (
//               <TabsTrigger
//                 key={tab.id}
//                 value={tab.id}
//                 className="group flex flex-col items-center gap-1 py-3 px-3 min-w-[80px] transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
//               >
//                 <span className="font-medium text-xs border rounded px-1.5 py-0.5 group-data-[state=active]:border-primary border-2 group-data-[state=active]:text-primary">
//                   {index + 1}
//                 </span>
//                 <span className="font-medium text-xs text-center">{tab.shortLabel}</span>
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </div>
//       </Tabs>

//       {/* Budget Summary Section */}
//       <div className="flex flex-col gap-4 mb-6">
//         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
//           <DialogLayout
//             trigger={
//               <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <Label className={styles.labelDesign}>NET Available Resources:</Label>
//                   <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
//                 </div>
//                 <Label className="text-sm md:text-base font-semibold">
//                   {formatNumber(availableResources.toString())}
//                 </Label>
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
//             <Label className={styles.labelDesign}>Year: </Label>
//             <Label className="text-sm md:text-base font-semibold">{year}</Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS: </Label>
//             <Label className="text-red-500 text-sm md:text-base font-semibold">
//               {formatNumber(totalBudgetObligations.toString())}
//             </Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.labelDesign}>Actual RPT Income: </Label>
//             <Label className="text-sm md:text-base font-semibold">{formatNumber(actualRPT)}</Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.labelDesign}>Actual Income: </Label>
//             <Label className="text-sm md:text-base font-semibold">{formatNumber(actualIncome)}</Label>
//           </div>

//           <div className="p-4 bg-white flex flex-col gap-3 rounded-lg drop-shadow">
//             <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED: </Label>
//             <Label className="text-green-500 text-sm md:text-base font-semibold">
//               {formatNumber(balUnappropriated.toString())}
//             </Label>
//           </div>
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="drop-shadow rounded-lg overflow-hidden">
//         {/* Form Pages */}
//         <div className="w-full bg-white">
//           {activeTab === "page1" && (
//             <CreateBudgetPlanPage1
//               personalServicesLimit={personalServicesLimit}
//               actualIncome={actualIncome}
//               updateFormData={updateFormData}
//               formData={formData1}
//               isBeyondLimit={isBeyondLimit}
//             />
//           )}

//           {activeTab === "page2" && (
//             <CreateBudgetPlanPage2 updateFormData={updateFormData} formData={formData2} isBeyondLimit={isBeyondLimit} />
//           )}

//           {activeTab === "page3" && (
//             <CreateBudgetPlanPage3
//               updateFormData={updateFormData}
//               formData={formData3}
//               actualRPT={actualRPT}
//               miscExpenseLimit={miscExpenseLimit}
//               isBeyondLimit={isBeyondLimit}
//             />
//           )}

//           {activeTab === "page4" && (
//             <CreateBudgetPlanPage4
//               onSubmit={onSubmit}
//               updateFormData={updateFormData}
//               formData={formData4}
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
//         </div>

//         {/* Navigation and Action Buttons */}
//         <div className="bg-white border-t border-gray-200 p-4 md:p-6">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//             {/* Left side - Back to main button */}
//             <div className="order-2 sm:order-1">
//               <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-2">
//                 <ChevronLeft className="w-4 h-4" />
//                 Back to Main
//               </Button>
//             </div>

//             {/* Right side - Submit button */}
//             <div className="order-1 sm:order-2">
//               <Button
//                 type="button"
//                 onClick={onSubmit}
//                 disabled={isBeyondLimit}
//                 className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
//               >
//                 {isEdit ? "Update Budget Plan" : "Submit Budget Plan"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BudgetPlanMainForm


// Updated BudgetPlanMainForm with proper typing, initial values, and integrated page components

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
// import {
//   BudgetPlanPage1FormData,
//   BudgetPlanPage2FormData,
//   BudgetPlanPage3FormData,
//   BudgetPlanPage4FormData,
// } from "../formDataInitializer"

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
//   ) => void;
//   totalBudgetObligations: number;
//   balUnappropriated: number;
//   isBeyondLimit: boolean;
//   onSubmit: () => void;
// }

// const styles = {
//   labelDesign: "w-full text-left text-blue text-sm md:text-base",
//   highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
// }

// function BudgetPlanMainForm({ headerData, onBack, isEdit, editId, budgetData, onSuccess, formData, updateFormData }: Props) {
//   const year = new Date().getFullYear()
//   const totalBudgetToast = useRef<string | number | null>(null)
//   const [totalBudgetObligations, setTotalBudgetObligations] = useState(0.0)
//   const [balUnappropriated, setBalUnappropriated] = useState(0.0)
//   const [isBeyondLimit, setIsBeyondLimit] = useState(false)
//   const [activeTab, setActiveTab] = useState("page1")

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

//   useEffect(() => {
//     const sumFormData = (formData: Record<string, any>): number =>
//       Object.values(formData).map((value) => parseFloat(value) || 0).reduce((acc, curr) => acc + curr, 0)

//     const totalBudget =
//       sumFormData(formData1) + sumFormData(formData2) + sumFormData(formData3) + sumFormData(formData4)

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
//   }, [formData1, formData2, formData3, formData4, availableResources])

//   const { mutate: createBudgetPlan } = useInsertBudgetPlan(onSuccess)
//   const { mutate: updateBudgetPlan } = useUpdateBudgetPlan(onSuccess)

//   const onSubmit = async () => {
//     const budgetHeader = {
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
//     }

//     const transformData = (form: Record<string, any>, items: any[]) =>
//       items.map(({ name, label, category }) => {
//         const existingDetail = budgetData?.budget_detail?.find(
//           (detail: BudgetPlanDetail) => detail.dtl_budget_item === label
//         )
//         return {
//           dtl_id: existingDetail?.dtl_id || 0,
//           dtl_proposed_budget: form[name] || "0.00",
//           dtl_budget_item: label,
//           dtl_budget_category: category,
//         }
//       })

//     const budgetDetails = [
//       ...transformData(formData1, budgetItemsPage1),
//       ...transformData(formData2, budgetItemsPage2),
//       ...transformData(formData3, budgetItemsPage3),
//       ...transformData(formData4, budgetItemsPage4),
//     ]

//     if (isEdit) {
//         updateBudgetPlan({ budgetHeader, budgetDetails })
//       } else {
//         createBudgetPlan({ budgetHeader, budgetDetails })
//       }
//     }

//     const tabs = [
//       { id: "page1", shortLabel: "Plan 1", description: "First budget plan form" },
//       { id: "page2", shortLabel: "Plan 2", description: "Second budget plan form" },
//       { id: "page3", shortLabel: "Plan 3", description: "Third budget plan form" },
//       { id: "page4", shortLabel: "Plan 4", description: "Fourth budget plan form" },
//     ]

//   return (
//     <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
//      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//          {/* Desktop Tab Navigation */}
//          <div className="hidden lg:block mb-8">
//            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white">
//              {tabs.map((tab, index) => (
//               <TabsTrigger
//                 key={tab.id}
//                 value={tab.id}
//                 className="group flex flex-col items-center gap-2 py-4 px-4 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md"
//               >
//                 <div className="flex items-center gap-2">
//                   <span className="font-medium text-sm border rounded-md px-2 py-1 group-data-[state=active]:border-primary border-2 group-data-[state=active]:text-primary">
//                     {index + 1}
//                   </span>
//                   <span className="font-medium text-sm">{tab.shortLabel}</span>
//                 </div>
//                 <span className="text-xs text-muted-foreground text-center leading-tight">{tab.description}</span>
//               </TabsTrigger>
//             ))}
//           </TabsList>
//           </div>
//         </Tabs>

//         <div className="flex flex-col gap-4 mb-6">
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
//         {activeTab === "page1" && (
//           <CreateBudgetPlanPage1
//             personalServicesLimit={parseFloat(personalServicesLimit)}
//             actualIncome={parseFloat(actualIncome)}
//             updateFormData={(data) => updateFormData("page1", data)}
//             formData={formData1}
//             isBeyondLimit={isBeyondLimit}
//           />
//         )}
//         {activeTab === "page2" && (
//           <CreateBudgetPlanPage2
//             updateFormData={(data) => updateFormData("page2", data)}
//             formData={formData2}
//             isBeyondLimit={isBeyondLimit}
//           />
//         )}
//         {activeTab === "page3" && (
//           <CreateBudgetPlanPage3
//             updateFormData={(data) => updateFormData("page3", data)}
//             formData={formData3}
//             actualRPT={parseFloat(actualRPT)}
//             miscExpenseLimit={parseFloat(miscExpenseLimit)}
//             isBeyondLimit={isBeyondLimit}
//           />
//         )}
//         {activeTab === "page4" && (
//           <CreateBudgetPlanPage4
//             updateFormData={(data) => updateFormData("page4", data)}
//             formData={formData4}
//             balance={balance}
//             taxAllotment={taxAllotment}
//             realtyTaxShare={realtyTaxShare}
//             clearanceAndCertFees={clearanceAndCertFees}
//             otherSpecificIncome={otherSpecificIncome}
//             localDevLimit={localDevLimit}
//             skFundLimit={skFundLimit}
//             calamityFundLimit={calamityFundLimit}
//             isBeyondLimit={isBeyondLimit}
//             // onSubmit={onSubmit}
//           />
//         )}

//         <div className="bg-white border-t border-gray-200 p-4 md:p-6">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
//             <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-2">
//               <ChevronLeft className="w-4 h-4" />
//               Back to Main
//             </Button>

//             <Button
//               type="button"
//               onClick={onSubmit}
//               disabled={isBeyondLimit}
//               className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
//             >
//               {isEdit ? "Update Budget Plan" : "Submit Budget Plan"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BudgetPlanMainForm


import { useRef, useEffect, useState } from "react"
import { ChevronLeft, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/helpers/currencynumberformatter"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import DisplayBreakdown from "../netBreakdownDisplay"
import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "../budgetItemDefinition"
import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries"
import { useUpdateBudgetPlan } from "../queries/budgetPlanUpdateQueries"
import type { BudgetPlanDetail } from "../budgetPlanInterfaces"
import CreateBudgetPlanPage1 from "./budgetPlanFormPage1"
import CreateBudgetPlanPage2 from "./budgetPlanFormPage2"
import CreateBudgetPlanPage3 from "./budgetPlanFormPage3"
import CreateBudgetPlanPage4 from "./budgetPlanFormPage4"
import { BudgetPlanPage1FormData,  BudgetPlanPage2FormData, BudgetPlanPage3FormData, BudgetPlanPage4FormData,} from "../formDataInitializer"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CurrentExpendituresPersonalServicesSchema, CurrentExpenditureMaintandOtherExpensesSchema1, CurrentExpenditureMaintandOtherExpensesSchema2, CapitalOutlaysAndNonOfficeSchema} from "@/form-schema/treasurer/budgetplan-create-schema"
import { BudgetItem, BudgetDetail, OldBudgetDetail, NewBudgetDetail, ProcessedOldBudgetDetail } from "../budgetPlanInterfaces"

type Props = {
  headerData: any
  onBack: () => void
  isEdit: boolean
  editId?: number
  budgetData: any
  onSuccess?: () => void
  formData: {
    formData1: BudgetPlanPage1FormData
    formData2: BudgetPlanPage2FormData
    formData3: BudgetPlanPage3FormData
    formData4: BudgetPlanPage4FormData
  }
  updateFormData: (
    page: "page1" | "page2" | "page3" | "page4",
    data: Partial<
      BudgetPlanPage1FormData &
      BudgetPlanPage2FormData &
      BudgetPlanPage3FormData &
      BudgetPlanPage4FormData
    >
  ) => void
  totalBudgetObli: number
  balUnapp: number
  beyondLimit: boolean
  onSubmit: () => void
}

const styles = {
  labelDesign: "w-full text-left text-blue text-sm md:text-base",
  highlightLabel: "w-full text-left text-darkGray text-sm md:text-base font-medium",
}

function BudgetPlanMainForm({ headerData, onBack, isEdit, editId, budgetData, onSuccess, formData, updateFormData, totalBudgetObli, balUnapp, beyondLimit, onSubmit }: Props) {
  const year = new Date().getFullYear()
  const totalBudgetToast = useRef<string | number | null>(null)
  const [totalBudgetObligations, setTotalBudgetObligations] = useState(0.0)
  const [balUnappropriated, setBalUnappropriated] = useState(0.0)
  const [isBeyondLimit, setIsBeyondLimit] = useState(false)
  const [activeTab, setActiveTab] = useState("page1")
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({})

  const { formData1, formData2, formData3, formData4 } = formData

  const {
    balance = "0",
    realtyTaxShare = "0",
    taxAllotment = "0",
    clearanceAndCertFees = "0",
    otherSpecificIncome = "0",
    actualIncome = "0",
    actualRPT = "0",
    personalServicesLimit = "0",
    miscExpenseLimit = "0",
    localDevLimit = "0",
    skFundLimit = "0",
    calamityFundLimit = "0",
  } = headerData || {}

  const availableResources =
    (parseFloat(balance) || 0) +
    (parseFloat(realtyTaxShare) || 0) +
    (parseFloat(taxAllotment) || 0) +
    (parseFloat(clearanceAndCertFees) || 0) +
    (parseFloat(otherSpecificIncome) || 0)

  // Initialize forms for all pages
  const forms = {
    page1: useForm<BudgetPlanPage1FormData>({
      resolver: zodResolver(CurrentExpendituresPersonalServicesSchema),
      defaultValues: formData1,
    }),
    page2: useForm<BudgetPlanPage2FormData>({
      resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema1),
      defaultValues: formData2,
    }),
    page3: useForm<BudgetPlanPage3FormData>({
      resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema2),
      defaultValues: formData3,
    }),
    page4: useForm<BudgetPlanPage4FormData>({
      resolver: zodResolver(CapitalOutlaysAndNonOfficeSchema),
      defaultValues: formData4,
    }),
  }

  // Update total budget whenever form values change
  useEffect(() => {
    const sumFormData = (formData: Record<string, any>): number =>
      Object.values(formData).map((value) => parseFloat(value) || 0).reduce((acc, curr) => acc + curr, 0)

    const totalBudget =
      sumFormData(forms.page1.getValues()) + 
      sumFormData(forms.page2.getValues()) + 
      sumFormData(forms.page3.getValues()) + 
      sumFormData(forms.page4.getValues())

    setTotalBudgetObligations(totalBudget)
    const newBalance = availableResources - totalBudget
    setBalUnappropriated(newBalance)

    if (newBalance < 0) {
      if (!totalBudgetToast.current) {
        setIsBeyondLimit(true)
        totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
          duration: Number.POSITIVE_INFINITY,
          style: { border: "1px solid rgb(225, 193, 193)", padding: "16px", color: "#b91c1c", background: "#fef2f2" },
        })
      }
    } else {
      if (totalBudgetToast.current !== null) {
        setIsBeyondLimit(false)
        toast.dismiss(totalBudgetToast.current)
        totalBudgetToast.current = null
      }
    }
  }, [forms.page1.watch(), forms.page2.watch(), forms.page3.watch(), forms.page4.watch(), availableResources])

  // Update form data when active tab changes
  useEffect(() => {
    const currentForm = forms[activeTab as keyof typeof forms]
    updateFormData(activeTab as any, currentForm.getValues())
  }, [activeTab])

  const { mutate: createBudgetPlan } = useInsertBudgetPlan(onSuccess)
  const { mutate: updateBudgetPlan } = useUpdateBudgetPlan(onSuccess)

  const validateAllForms = async () => {
    const errors: Record<string, boolean> = {}
    let isValid = true

    // Validate each form
    for (const page of ['page1', 'page2', 'page3', 'page4'] as const) {
      const form = forms[page]
      const result = await form.trigger()
      if (!result) {
        errors[page] = true
        isValid = false
      }
    }

    setFormErrors(errors)
    return isValid
  }

  // const handleSubmit = async () => {
  // // Validate all forms first
  // const errors: Record<string, boolean> = {};
  // let isValid = true;

  // // Validate each form and collect errors
  // for (const page of ['page1', 'page2', 'page3', 'page4'] as const) {
  //   const form = forms[page];
  //   const result = await form.trigger();
  //   if (!result) {
  //     errors[page] = true;
  //     isValid = false;
  //   }
  // }

  // setFormErrors(errors);

  // if (!isValid) {
  //   toast.error("Please fix all validation errors before submitting");
  //   // Switch to the first page with errors
  //   const firstErrorPage = Object.keys(errors)[0];
  //   if (firstErrorPage) {
  //     setActiveTab(firstErrorPage);
  //   }
  //   return;
  // }

  // if (isBeyondLimit) {
  //   toast.error("Cannot submit with insufficient funds");
  //   return;
  // }

  // // Prepare budget header data
  // const budgetHeader = {
  //   plan_actual_income: actualIncome,
  //   plan_rpt_income: actualRPT,
  //   plan_balance: balance,
  //   plan_tax_share: realtyTaxShare,
  //   plan_tax_allotment: taxAllotment,
  //   plan_cert_fees: clearanceAndCertFees,
  //   plan_other_income: otherSpecificIncome,
  //   plan_budgetaryObligations: totalBudgetObligations,
  //   plan_balUnappropriated: balUnappropriated,
  //   plan_personalService_limit: personalServicesLimit,
  //   plan_miscExpense_limit: miscExpenseLimit,
  //   plan_localDev_limit: localDevLimit,
  //   plan_skFund_limit: skFundLimit,
  //   plan_calamityFund_limit: calamityFundLimit,
  //   plan_year: year.toString(),
  //   plan_issue_date: new Date().toISOString().split("T")[0],
  //   ...(isEdit && { plan_id: editId }),
  // };

  // // Improved transformData function with proper ID handling
  //   const transformData = (form: Record<string, any>, items: any[]) => {
  //     const existingDetails = isEdit && budgetData?.details ? budgetData.details : [];
      
  //     return items.map(({ name, label, category }) => {
  //       const existingDetail = existingDetails.find(
  //         (detail: BudgetPlanDetail) => detail.dtl_budget_item === label
  //       );

  //       // Base object with required fields
  //       const base = {
  //         dtl_proposed_budget: Number(form[name]) || 0.0,
  //         dtl_budget_item: String(label),
  //         dtl_budget_category: String(category),
  //       };

  //       // Only include dtl_id if we found an existing detail
  //       if (existingDetail) {
  //         return {
  //           ...base,
  //           dtl_id: existingDetail.dtl_id
  //         };
  //       }

  //       return base;
  //     });
  //   };

  //   // Transform all form data into budget details
  //   const budgetDetails = [
  //     ...transformData(forms.page1.getValues(), budgetItemsPage1),
  //     ...transformData(forms.page2.getValues(), budgetItemsPage2),
  //     ...transformData(forms.page3.getValues(), budgetItemsPage3),
  //     ...transformData(forms.page4.getValues(), budgetItemsPage4),
  //   ];

  //   // Log for debugging (remove in production)
  //   console.log('Submitting Budget Details:', {
  //     budgetHeader,
  //     budgetDetails,
  //     isEdit,
  //     editId
  //   });

  //   // Execute the appropriate mutation
  //   if (isEdit) {
  //     updateBudgetPlan({ budgetHeader, budgetDetails });
  //   } else {
  //     createBudgetPlan({ budgetHeader, budgetDetails });
  //   }
  // }; 

  const handleSubmit = async () => {
    // Validate all forms first
    const errors: Record<string, boolean> = {};
    let isValid = true;

    // Validate each form and collect errors
    for (const page of ['page1', 'page2', 'page3', 'page4'] as const) {
      const form = forms[page];
      const result = await form.trigger();
      if (!result) {
        errors[page] = true;
        isValid = false;
      }
    }

    setFormErrors(errors);

    if (!isValid) {
      toast.error("Please fix all validation errors before submitting");
      const firstErrorPage = Object.keys(errors)[0];
      if (firstErrorPage) {
        setActiveTab(firstErrorPage);
      }
      return;
    }

    if (isBeyondLimit) {
      toast.error("Cannot submit with insufficient funds");
      return;
    }

    // Prepare NEW budget header data
    const newBudgetHeader = {
      plan_actual_income: actualIncome,
      plan_rpt_income: actualRPT,
      plan_balance: balance,
      plan_tax_share: realtyTaxShare,
      plan_tax_allotment: taxAllotment,
      plan_cert_fees: clearanceAndCertFees,
      plan_other_income: otherSpecificIncome,
      plan_budgetaryObligations: totalBudgetObligations,
      plan_balUnappropriated: balUnappropriated,
      plan_personalService_limit: personalServicesLimit,
      plan_miscExpense_limit: miscExpenseLimit,
      plan_localDev_limit: localDevLimit,
      plan_skFund_limit: skFundLimit,
      plan_calamityFund_limit: calamityFundLimit,
      plan_year: year.toString(),
      plan_issue_date: new Date().toISOString().split("T")[0],
      ...(isEdit && { plan_id: editId }),
    };

    // Prepare NEW budget details (simple structure)
      const prepareNewDetails = (form: Record<string, any>, items: BudgetItem[]): BudgetDetail[] => {
        const existingDetails = isEdit && budgetData?.details ? budgetData.details : [];
        
        return items.map((item: BudgetItem) => {
          const existingDetail = existingDetails.find(
            (detail: BudgetPlanDetail) => detail.dtl_budget_item === item.label
          );

          return {
            dtl_proposed_budget: Number(form[item.name]) || 0,
            dtl_budget_item: item.label,
            dtl_budget_category: item.category,
            ...(existingDetail && { dtl_id: existingDetail.dtl_id }) // Include dtl_id if exists
          };
        });
      };

     const newBudgetDetails = [
      ...prepareNewDetails(forms.page1.getValues(), budgetItemsPage1),
      ...prepareNewDetails(forms.page2.getValues(), budgetItemsPage2),
      ...prepareNewDetails(forms.page3.getValues(), budgetItemsPage3),
      ...prepareNewDetails(forms.page4.getValues(), budgetItemsPage4),
    ];

    if (isEdit) {
      // Prepare OLD budget header data
      const oldBudgetHeader = {
        plan_id: budgetData.plan_id,
        plan_year: budgetData.plan_year,
        plan_actual_income: budgetData.plan_actual_income,
        plan_rpt_income: budgetData.plan_rpt_income,
        plan_balance: budgetData.plan_balance,
        plan_tax_share: budgetData.plan_tax_share,
        plan_tax_allotment: budgetData.plan_tax_allotment,
        plan_cert_fees: budgetData.plan_cert_fees,
        plan_other_income: budgetData.plan_other_income,
        plan_budgetaryObligations: budgetData.plan_budgetaryObligations,
        plan_balUnappropriated: budgetData.plan_balUnappropriated,
        plan_issue_date: budgetData.plan_issue_date,
        plan_personalService_limit: budgetData.plan_personalService_limit,
        plan_miscExpense_limit: budgetData.plan_miscExpense_limit,
        plan_localDev_limit: budgetData.plan_localDev_limit,
        plan_skFund_limit: budgetData.plan_skFund_limit,
        plan_calamityFund_limit: budgetData.plan_calamityFund_limit,
      };

      // Prepare OLD budget details with is_changed flag
      const oldBudgetDetails: ProcessedOldBudgetDetail[] = budgetData.details.map(
        (oldDetail: OldBudgetDetail) => {
          const matchingNewDetail = newBudgetDetails.find(
            (newDetail: NewBudgetDetail) => newDetail.dtl_budget_item === oldDetail.dtl_budget_item
          );

          return {
            proposed_budget: parseFloat(oldDetail.dtl_proposed_budget.toString()),
            budget_item: oldDetail.dtl_budget_item,
            category: oldDetail.dtl_budget_category,
            is_changed: matchingNewDetail
              ? parseFloat(oldDetail.dtl_proposed_budget.toString()) !== matchingNewDetail.dtl_proposed_budget
              : false
          };
        }
      );

      // Execute update with exactly the requested structure
        updateBudgetPlan({
          newBudgetHeader,
          oldBudgetHeader,
          newBudgetDetails, 
          oldBudgetDetails 
        });

    } else {
      createBudgetPlan({
        newBudgetHeader,
        newBudgetDetails
      });
    }
  };

  const tabs = [
    { id: "page1", shortLabel: "Plan 1", description: "Personal Services" },
    { id: "page2", shortLabel: "Plan 2", description: "Maintenance & Other Expenses" },
    { id: "page3", shortLabel: "Plan 3", description: "Programs & Activities" },
    { id: "page4", shortLabel: "Plan 4", description: "Capital Outlays & Funds" },
  ]
  

  return (
    <div className="w-full min-h-screen bg-snow p-4 md:p-6 lg:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Desktop Tab Navigation */}
        <div className="hidden lg:block mb-8">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`group flex flex-col items-center gap-2 py-4 px-4 transition-all duration-200 
                  data-[state=active]:bg-primary/10 data-[state=active]:text-primary 
                  data-[state=active]:shadow-sm rounded-md ${formErrors[tab.id] ? 'border-2 border-red-500' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm border rounded-md px-2 py-1 
                    group-data-[state=active]:border-primary border-2 
                    group-data-[state=active]:text-primary ${formErrors[tab.id] ? 'border-red-500 text-red-500' : ''}`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm">{tab.shortLabel}</span>
                </div>
                <span className="text-xs text-muted-foreground text-center leading-tight">{tab.description}</span>
                {formErrors[tab.id] && (
                  <span className="text-xs text-red-500">Validation errors</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
          {activeTab === "page1" && (
            <CreateBudgetPlanPage1
              form={forms.page1}
              updateFormData={(data) => updateFormData("page1", data)}
              personalServicesLimit={parseFloat(personalServicesLimit)}
              actualIncome={parseFloat(actualIncome)}
              isBeyondLimit={isBeyondLimit}
            />
          )}
          {activeTab === "page2" && (
            <CreateBudgetPlanPage2
              form={forms.page2}
              updateFormData={(data) => updateFormData("page2", data)}
              isBeyondLimit={isBeyondLimit}
            />
          )}
          {activeTab === "page3" && (
            <CreateBudgetPlanPage3
              form={forms.page3}
              updateFormData={(data) => updateFormData("page3", data)}
              actualRPT={parseFloat(actualRPT)}
              miscExpenseLimit={parseFloat(miscExpenseLimit)}
              isBeyondLimit={isBeyondLimit}
            />
          )}
          {activeTab === "page4" && (
            <CreateBudgetPlanPage4
              form={forms.page4}
              updateFormData={(data) => updateFormData("page4", data)}
              balance={balance}
              taxAllotment={taxAllotment}
              realtyTaxShare={realtyTaxShare}
              clearanceAndCertFees={clearanceAndCertFees}
              otherSpecificIncome={otherSpecificIncome}
              localDevLimit={localDevLimit}
              skFundLimit={skFundLimit}
              calamityFundLimit={calamityFundLimit}
              isBeyondLimit={isBeyondLimit}
            />
          )}

          <div className="bg-white border-t border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Main
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isBeyondLimit}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                {isEdit ? "Update Budget Plan" : "Submit Budget Plan"}
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

export default BudgetPlanMainForm