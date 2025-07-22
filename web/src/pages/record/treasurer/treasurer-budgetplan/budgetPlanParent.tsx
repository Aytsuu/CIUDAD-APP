// import { ChevronLeft } from "lucide-react";
// import { Button } from "@/components/ui/button/button";
// import { useLocation, useNavigate } from "react-router-dom";
// import BudgetHeaderForm from "./budgetHeaderAndAllocationForms/budgetHeaderForm";
// import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
// import BudgetAllocationForm from "./budgetHeaderAndAllocationForms/budgetAllocationForm";
// import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { useState, useEffect } from "react";
// import BudgetPlanForm from "./budgetPlanForms/budgetplanMainForm";
// import { initialFormData1, initialFormData2, initialFormData3, initialFormData4 } from "./formDataInitializer";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "./budgetItemDefinition";
// import { useGetBudgetPlanFromPrev, useGetBudgetPlanDetailFromPrev } from "./queries/budgetplanFetchQueries";

// export default function BudgetPlanParent() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isEdit = false, plan_id, budgetData, shouldClone} = location.state || {};
//   const [currentStep, setCurrentStep] = useState<'header' | 'allocation' | 'main'>('header');
//   const [isInitialized, setIsInitialized] = useState(false);
//   const {data: prevPlan = [], isLoading: prevPlanLoading} = useGetBudgetPlanFromPrev();
//   const {data: prevPlanDetail = [], isLoading: prevPlanDetailLoading} = useGetBudgetPlanDetailFromPrev();

//   // Form state
//   const [formData1, setFormData1] = useState<typeof initialFormData1>(initialFormData1);
//   const [formData2, setFormData2] = useState<typeof initialFormData2>(initialFormData2);
//   const [formData3, setFormData3] = useState<typeof initialFormData3>(initialFormData3);
//   const [formData4, setFormData4] = useState<typeof initialFormData4>(initialFormData4);
//   const [totalBudgetObligations, setTotalBudgetObligations] = useState(0);
//   const [balUnappropriated, setBalUnappropriated] = useState(0);
//   const [isBeyondLimit, setIsBeyondLimit] = useState(false);

//   // Form definitions
//   const headerForm = useForm<z.infer<typeof BudgetHeaderSchema>>({
//     resolver: zodResolver(BudgetHeaderSchema),
//     defaultValues: {
//       balance: "",
//       realtyTaxShare: "",
//       taxAllotment: "",
//       clearanceAndCertFees: "",
//       otherSpecificIncome: "",
//       actualIncome: "",
//       actualRPT: "",
//     },
//   });

//   const allocationForm = useForm<z.infer<typeof BudgetAllocationSchema>>({
//     resolver: zodResolver(BudgetAllocationSchema),
//     defaultValues: {
//       personalServicesLimit: "",
//       miscExpenseLimit: "",
//       localDevLimit: "",
//       skFundLimit: "",
//       calamityFundLimit: "",
//     },
//   });

//   // Initialize form data in edit mode
//   useEffect(() => {
//     if (isEdit && budgetData && !isInitialized) {
//       // Initialize header form
//       headerForm.reset({
//         balance: budgetData.plan_balance || "",
//         realtyTaxShare: budgetData.plan_tax_share || "",
//         taxAllotment: budgetData.plan_tax_allotment || "",
//         clearanceAndCertFees: budgetData.plan_cert_fees || "",
//         otherSpecificIncome: budgetData.plan_other_income || "",
//         actualIncome: budgetData.plan_actual_income || "",
//         actualRPT: budgetData.plan_rpt_income || ""
//       });

//       // Initialize allocation form
//       allocationForm.reset({
//         personalServicesLimit: budgetData.plan_personalService_limit || "",
//         miscExpenseLimit: budgetData.plan_miscExpense_limit || "",
//         localDevLimit: budgetData.plan_localDev_limit || "",
//         skFundLimit: budgetData.plan_skFund_limit || "",
//         calamityFundLimit: budgetData.plan_calamityFund_limit || ""
//       });

//       // Initialize budget items if they exist
//       if (budgetData.details && Array.isArray(budgetData.details)) {
//        const initializeFormData = (items: any[], details: any[], initialData: any) => {
//         const formData = { ...initialData };
        
//         items.forEach(item => {
//             const detail = details.find(
//             (d: any) => d.dtl_budget_item.trim().toLowerCase() === item.label.trim().toLowerCase()
//             );
//             if (detail && item.name in formData) {
//             formData[item.name] = detail.dtl_proposed_budget?.toString() || "0.00";
//             }
//         });
        
//         return formData;
//         };

//         setFormData1(initializeFormData(budgetItemsPage1, budgetData.details, initialFormData1));
//         setFormData2(initializeFormData(budgetItemsPage2, budgetData.details, initialFormData2));
//         setFormData3(initializeFormData(budgetItemsPage3, budgetData.details, initialFormData3));
//         setFormData4(initializeFormData(budgetItemsPage4, budgetData.details, initialFormData4));
//       }

//       setIsInitialized(true);
//     }
//   }, [isEdit, budgetData, headerForm, allocationForm, isInitialized]);

 
//   // useEffect(() => {
//   //   if (!isEdit && shouldClone && budgetData && !isInitialized) {
//   //     // Initialize header form with cloned data
//   //     headerForm.reset({
//   //       balance: budgetData.plan_balance || "",
//   //       realtyTaxShare: budgetData.plan_tax_share || "",
//   //       taxAllotment: budgetData.plan_tax_allotment || "",
//   //       clearanceAndCertFees: budgetData.plan_cert_fees || "",
//   //       otherSpecificIncome: budgetData.plan_other_income || "",
//   //       actualIncome: budgetData.plan_actual_income || "",
//   //       actualRPT: budgetData.plan_rpt_income || ""
//   //     });

//   //     // Initialize allocation form with cloned data
//   //     allocationForm.reset({
//   //       personalServicesLimit: budgetData.plan_personalService_limit || "",
//   //       miscExpenseLimit: budgetData.plan_miscExpense_limit || "",
//   //       localDevLimit: budgetData.plan_localDev_limit || "",
//   //       skFundLimit: budgetData.plan_skFund_limit || "",
//   //       calamityFundLimit: budgetData.plan_calamityFund_limit || ""
//   //     });

//   //     // Initialize budget items if they exist
//   //     if (budgetData.details && Array.isArray(budgetData.details)) {
//   //       const initializeFormData = (items: any[], details: any[], initialData: any) => {
//   //         const formData = { ...initialData };
          
//   //         items.forEach(item => {
//   //           const detail = details.find(
//   //             (d: any) => d.dtl_budget_item.trim().toLowerCase() === item.label.trim().toLowerCase()
//   //           );
//   //           if (detail && item.name in formData) {
//   //             formData[item.name] = detail.dtl_proposed_budget?.toString() || "0.00";
//   //           }
//   //         });
          
//   //         return formData;
//   //       };

//   //       setFormData1(initializeFormData(budgetItemsPage1, budgetData.details, initialFormData1));
//   //       setFormData2(initializeFormData(budgetItemsPage2, budgetData.details, initialFormData2));
//   //       setFormData3(initializeFormData(budgetItemsPage3, budgetData.details, initialFormData3));
//   //       setFormData4(initializeFormData(budgetItemsPage4, budgetData.details, initialFormData4));
//   //     }

//   //     setIsInitialized(true);
//   //   }
//   // }, [isEdit, shouldClone, budgetData, headerForm, allocationForm, isInitialized]);


//     useEffect(() => {
//     if (!isEdit && shouldClone && !isInitialized) {
//       if (prevPlan && prevPlanDetail && !prevPlanLoading && !prevPlanDetailLoading) {
//         // Initialize header form with previous year's data
//         headerForm.reset({
//           balance: prevPlan.plan_balance?.toString() || "",
//           realtyTaxShare: prevPlan.plan_tax_share?.toString() || "",
//           taxAllotment: prevPlan.plan_tax_allotment?.toString() || "",
//           clearanceAndCertFees: prevPlan.plan_cert_fees?.toString() || "",
//           otherSpecificIncome: prevPlan.plan_other_income?.toString() || "",
//           actualIncome: prevPlan.plan_actual_income?.toString() || "",
//           actualRPT: prevPlan.plan_rpt_income?.toString() || ""
//         });

//         // Initialize allocation form with previous year's data
//         allocationForm.reset({
//           personalServicesLimit: prevPlan.plan_personalService_limit?.toString() || "",
//           miscExpenseLimit: prevPlan.plan_miscExpense_limit?.toString() || "",
//           localDevLimit: prevPlan.plan_localDev_limit?.toString() || "",
//           skFundLimit: prevPlan.plan_skFund_limit?.toString() || "",
//           calamityFundLimit: prevPlan.plan_calamityFund_limit?.toString() || ""
//         });

//         // Initialize budget items from previous year's details
//         const initializeFormData = (items: any[], details: BudgetPlanDetail[], initialData: any) => {
//           const formData = { ...initialData };
          
//           items.forEach(item => {
//             const detail = details.find(
//               (d) => d.dtl_budget_item.trim().toLowerCase() === item.label.trim().toLowerCase()
//             );
//             if (detail && item.name in formData) {
//               formData[item.name] = detail.dtl_proposed_budget?.toString() || "0.00";
//             }
//           });
          
//           return formData;
//         };

//         if (prevPlanDetail) {
//           setFormData1(initializeFormData(budgetItemsPage1, prevPlanDetail, initialFormData1));
//           setFormData2(initializeFormData(budgetItemsPage2, prevPlanDetail, initialFormData2));
//           setFormData3(initializeFormData(budgetItemsPage3, prevPlanDetail, initialFormData3));
//           setFormData4(initializeFormData(budgetItemsPage4, prevPlanDetail, initialFormData4));
//         }

//         setIsInitialized(true);
//       }
//     }
//   }, [
//     isEdit, 
//     shouldClone, 
//     isInitialized,
//     prevPlan,
//     prevPlanDetail,
//     prevPlanLoading,
//     prevPlanDetailLoading,
//     headerForm, 
//     allocationForm
//   ]);


//   // Calculate available resources
//   const getAvailableResources = () => {
//     const values = headerForm.getValues();
//     return (
//       (parseFloat(values.balance) || 0) +
//       (parseFloat(values.realtyTaxShare) || 0) +
//       (parseFloat(values.taxAllotment) || 0) +
//       (parseFloat(values.clearanceAndCertFees) || 0) +
//       (parseFloat(values.otherSpecificIncome) || 0)
//     );
//   };

//   // Update form data and calculate totals
//   const updateFormData = (page: "page1" | "page2" | "page3" | "page4", data: any) => {
//     switch (page) {
//       case "page1": setFormData1(prev => ({ ...prev, ...data })); break;
//       case "page2": setFormData2(prev => ({ ...prev, ...data })); break;
//       case "page3": setFormData3(prev => ({ ...prev, ...data })); break;
//       case "page4": setFormData4(prev => ({ ...prev, ...data })); break;
//     }

//     // Recalculate totals
//     const sumValues = (obj: any) => Object.values(obj).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
//     const total = sumValues(formData1) + sumValues(formData2) + sumValues(formData3) + sumValues(formData4);
    
//     setTotalBudgetObligations(total);
//     const balance = getAvailableResources() - total;
//     setBalUnappropriated(balance);
//     setIsBeyondLimit(balance < 0);
//   };

//   // Navigation handlers
//   const handleHeaderSubmit = () => setCurrentStep('allocation');
//   const handleAllocationSubmit = () => setCurrentStep('main');
//   const handleAllocationBack = () => setCurrentStep('header');
//   const handleMainBack = () => setCurrentStep('allocation');

//   // Submit handler
//   const handleSubmitAll = () => {
//     const headerValues = headerForm.getValues();
//     const allocationValues = allocationForm.getValues();

//     const budgetHeader = {
//       plan_actual_income: headerValues.actualIncome,
//       plan_rpt_income: headerValues.actualRPT,
//       plan_balance: headerValues.balance,
//       plan_tax_share: headerValues.realtyTaxShare,
//       plan_tax_allotment: headerValues.taxAllotment,
//       plan_cert_fees: headerValues.clearanceAndCertFees,
//       plan_other_income: headerValues.otherSpecificIncome,
//       plan_budgetaryObligations: totalBudgetObligations,
//       plan_balUnappropriated: balUnappropriated,
//       plan_personalService_limit: allocationValues.personalServicesLimit,
//       plan_miscExpense_limit: allocationValues.miscExpenseLimit,
//       plan_localDev_limit: allocationValues.localDevLimit,
//       plan_skFund_limit: allocationValues.skFundLimit,
//       plan_calamityFund_limit: allocationValues.calamityFundLimit,
//       plan_year: new Date().getFullYear().toString(),
//       plan_issue_date: new Date().toISOString().split('T')[0],
//       ...(isEdit && { plan_id: plan_id }),
//     };

//     const transformData = (form: any, items: any[]) => 
//       items.map(item => ({
//         dtl_id: budgetData?.details?.find((d: any) => d.dtl_budget_item === item.label)?.dtl_id || 0,
//         dtl_proposed_budget: form[item.name] || "0.00",
//         dtl_budget_item: item.label,
//         dtl_budget_category: item.category,
//       }));

//     const budgetDetails = [
//       ...transformData(formData1, budgetItemsPage1),
//       ...transformData(formData2, budgetItemsPage2),
//       ...transformData(formData3, budgetItemsPage3),
//       ...transformData(formData4, budgetItemsPage4),
//     ];

//     // if (isEdit) {
//     //   updateBudgetPlan({ budgetHeader, budgetDetails });
//     // } else {
//     //   createBudgetPlan({ budgetHeader, budgetDetails });
//     // }
//   };

//  const handleExit = () => {
//     navigate(-1)
// };


//   return (
//     <div className='w-full h-full'>
//       <div className="flex flex-col gap-3 mb-3">
//         <div className='flex flex-row gap-4'>
//           <ConfirmationModal
//             trigger={
//               <Button className="text-black p-2 self-start" variant={"outline"}>
//                 <ChevronLeft />
//               </Button>
//             }
//             title="Unsaved Changes"
//             description={
//               isEdit 
//                 ? "Are you sure you want to go back? All changes made will not be saved." 
//                 : "Are you sure you want to go back? All progress on your budget plan will be lost."
//             }
//             actionLabel="Confirm"
//             onClick={handleExit}
//           />
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//             {isEdit ? 'Edit Budget Plan' : "Create Budget Plan"}
//           </h1>
//         </div>
//         <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
//           {isEdit
//             ? "Edit the existing budget plan details."
//             : "Develop a comprehensive budget plan to support barangay initiatives and community needs."}
//         </p>
//       </div>
//       <hr className="border-gray mb-5 sm:mb-5" />

//       {currentStep === 'header' && (
//         <BudgetHeaderForm form={headerForm} onSubmit={handleHeaderSubmit} />
//       )}

//       {currentStep === 'allocation' && (
//         <BudgetAllocationForm 
//           form={allocationForm} 
//           onBack={handleAllocationBack} 
//           onSubmit={handleAllocationSubmit} 
//         />
//       )}

//       {currentStep === 'main' && (
//         <BudgetPlanForm
//           headerData={{
//             ...headerForm.getValues(),
//             ...allocationForm.getValues(),
//           }}
//           onBack={handleMainBack}
//           isEdit={isEdit}
//           editId={plan_id}
//           budgetData={budgetData}
//           formData={{ formData1, formData2, formData3, formData4 }}
//           updateFormData={updateFormData}
//           totalBudgetObli={totalBudgetObligations}
//           balUnapp={balUnappropriated}
//           beyondLimit={isBeyondLimit}
//           onSubmit={handleSubmitAll}
//         />
//       )}
//     </div>
//   );
// }

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useLocation, useNavigate } from "react-router-dom";
import BudgetHeaderForm from "./budgetHeaderAndAllocationForms/budgetHeaderForm";
import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
import BudgetAllocationForm from "./budgetHeaderAndAllocationForms/budgetAllocationForm";
import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import BudgetPlanForm from "./budgetPlanForms/budgetplanMainForm";
import { initialFormData1, initialFormData2, initialFormData3, initialFormData4 } from "./formDataInitializer";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "./budgetItemDefinition";
import { useGetBudgetPlanFromPrev, useGetBudgetPlanDetailFromPrev } from "./queries/budgetplanFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetPlanParent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEdit = false, plan_id, budgetData, shouldClone } = location.state || {};
  const [currentStep, setCurrentStep] = useState<'header' | 'allocation' | 'main'>('header');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Form state
  const [formData1, setFormData1] = useState<typeof initialFormData1>(initialFormData1);
  const [formData2, setFormData2] = useState<typeof initialFormData2>(initialFormData2);
  const [formData3, setFormData3] = useState<typeof initialFormData3>(initialFormData3);
  const [formData4, setFormData4] = useState<typeof initialFormData4>(initialFormData4);
  const [totalBudgetObligations, setTotalBudgetObligations] = useState(0);
  const [balUnappropriated, setBalUnappropriated] = useState(0);
  const [isBeyondLimit, setIsBeyondLimit] = useState(false);

  // Queries with manual fetching
  const {data: prevPlan, isLoading: prevPlanLoading, refetch: fetchPrevPlan } = useGetBudgetPlanFromPrev();
  
  const { data: prevPlanDetail, isLoading: prevPlanDetailLoading, refetch: fetchPrevPlanDetail} = useGetBudgetPlanDetailFromPrev();


  // Form definitions
  const headerForm = useForm<z.infer<typeof BudgetHeaderSchema>>({
    resolver: zodResolver(BudgetHeaderSchema),
    defaultValues: {
      balance: "",
      realtyTaxShare: "",
      taxAllotment: "",
      clearanceAndCertFees: "",
      otherSpecificIncome: "",
      actualIncome: "",
      actualRPT: "",
    },
  });

  const allocationForm = useForm<z.infer<typeof BudgetAllocationSchema>>({
    resolver: zodResolver(BudgetAllocationSchema),
    defaultValues: {
      personalServicesLimit: "",
      miscExpenseLimit: "",
      localDevLimit: "",
      skFundLimit: "",
      calamityFundLimit: "",
    },
  });

  // Trigger fetching when shouldClone is true
  useEffect(() => {
    if (!isEdit && shouldClone) {
      fetchPrevPlan();
      fetchPrevPlanDetail();
    }
  }, [isEdit, shouldClone, fetchPrevPlan, fetchPrevPlanDetail]);

  // Initialize form data in edit mode
  useEffect(() => {
    if (isEdit && budgetData && !isInitialized) {
      // Initialize header form
      headerForm.reset({
        balance: budgetData.plan_balance?.toString() || "",
        realtyTaxShare: budgetData.plan_tax_share?.toString() || "",
        taxAllotment: budgetData.plan_tax_allotment?.toString() || "",
        clearanceAndCertFees: budgetData.plan_cert_fees?.toString() || "",
        otherSpecificIncome: budgetData.plan_other_income?.toString() || "",
        actualIncome: budgetData.plan_actual_income?.toString() || "",
        actualRPT: budgetData.plan_rpt_income?.toString() || ""
      });

      // Initialize allocation form
      allocationForm.reset({
        personalServicesLimit: budgetData.plan_personalService_limit?.toString() || "",
        miscExpenseLimit: budgetData.plan_miscExpense_limit?.toString() || "",
        localDevLimit: budgetData.plan_localDev_limit?.toString() || "",
        skFundLimit: budgetData.plan_skFund_limit?.toString() || "",
        calamityFundLimit: budgetData.plan_calamityFund_limit?.toString() || ""
      });

      // Initialize budget items if they exist
      if (budgetData.details && Array.isArray(budgetData.details)) {
        const initializeFormData = (items: any[], details: any[], initialData: any) => {
          const formData = { ...initialData };
          
          items.forEach(item => {
            const detail = details.find(
              (d: any) => d.dtl_budget_item.trim().toLowerCase() === item.label.trim().toLowerCase()
            );
            if (detail && item.name in formData) {
              formData[item.name] = detail.dtl_proposed_budget?.toString() || "0.00";
            }
          });
          
          return formData;
        };

        setFormData1(initializeFormData(budgetItemsPage1, budgetData.details, initialFormData1));
        setFormData2(initializeFormData(budgetItemsPage2, budgetData.details, initialFormData2));
        setFormData3(initializeFormData(budgetItemsPage3, budgetData.details, initialFormData3));
        setFormData4(initializeFormData(budgetItemsPage4, budgetData.details, initialFormData4));
      }

      setIsInitialized(true);
    }
  }, [isEdit, budgetData, headerForm, allocationForm, isInitialized]);

  // Initialize form data when cloning from previous year
  useEffect(() => {
    if (!isEdit && shouldClone && !isInitialized && !prevPlanLoading && !prevPlanDetailLoading) {
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
        });

        // Initialize allocation form with previous year's data
        allocationForm.reset({
          personalServicesLimit: String(prevPlan.plan_personalService_limit || ""),
          miscExpenseLimit: String(prevPlan.plan_miscExpense_limit || ""),
          localDevLimit: String(prevPlan.plan_localDev_limit || ""),
          skFundLimit: String(prevPlan.plan_skFund_limit || ""),
          calamityFundLimit: String(prevPlan.plan_calamityFund_limit || "")
        });

        // Initialize budget items from previous year's details
        const initializeFormData = (items: any[], details: any[], initialData: any) => {
          const formData = { ...initialData };
          
          items.forEach(item => {
            const detail = details.find(
              (d: any) => d.dtl_budget_item.trim().toLowerCase() === item.label.trim().toLowerCase()
            );
            if (detail && item.name in formData) {
              formData[item.name] = String(detail.dtl_proposed_budget || "0.00");
            }
          });
          
          return formData;
        };

        setFormData1(initializeFormData(budgetItemsPage1, prevPlanDetail, initialFormData1));
        setFormData2(initializeFormData(budgetItemsPage2, prevPlanDetail, initialFormData2));
        setFormData3(initializeFormData(budgetItemsPage3, prevPlanDetail, initialFormData3));
        setFormData4(initializeFormData(budgetItemsPage4, prevPlanDetail, initialFormData4));

        setIsInitialized(true);
      }
    }
  }, [ isEdit, shouldClone, isInitialized, prevPlan, prevPlanDetail, prevPlanLoading, prevPlanDetailLoading, headerForm, allocationForm ]);

  // Calculate available resources
  const getAvailableResources = () => {
    const values = headerForm.getValues();
    return (
      (parseFloat(values.balance) || 0) +
      (parseFloat(values.realtyTaxShare) || 0) +
      (parseFloat(values.taxAllotment) || 0) +
      (parseFloat(values.clearanceAndCertFees) || 0) +
      (parseFloat(values.otherSpecificIncome) || 0)
    );
  };

  // Update form data and calculate totals
  const updateFormData = (page: "page1" | "page2" | "page3" | "page4", data: any) => {
    switch (page) {
      case "page1": setFormData1(prev => ({ ...prev, ...data })); break;
      case "page2": setFormData2(prev => ({ ...prev, ...data })); break;
      case "page3": setFormData3(prev => ({ ...prev, ...data })); break;
      case "page4": setFormData4(prev => ({ ...prev, ...data })); break;
    }

    // Recalculate totals
    const sumValues = (obj: any) => Object.values(obj).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);
    const total = sumValues(formData1) + sumValues(formData2) + sumValues(formData3) + sumValues(formData4);
    
    setTotalBudgetObligations(total);
    const balance = getAvailableResources() - total;
    setBalUnappropriated(balance);
    setIsBeyondLimit(balance < 0);
  };

  // Navigation handlers
  const handleHeaderSubmit = () => setCurrentStep('allocation');
  const handleAllocationSubmit = () => setCurrentStep('main');
  const handleAllocationBack = () => setCurrentStep('header');
  const handleMainBack = () => setCurrentStep('allocation');

  // Submit handler
  const handleSubmitAll = () => {
    const headerValues = headerForm.getValues();
    const allocationValues = allocationForm.getValues();

    const budgetHeader = {
      plan_actual_income: headerValues.actualIncome,
      plan_rpt_income: headerValues.actualRPT,
      plan_balance: headerValues.balance,
      plan_tax_share: headerValues.realtyTaxShare,
      plan_tax_allotment: headerValues.taxAllotment,
      plan_cert_fees: headerValues.clearanceAndCertFees,
      plan_other_income: headerValues.otherSpecificIncome,
      plan_budgetaryObligations: totalBudgetObligations,
      plan_balUnappropriated: balUnappropriated,
      plan_personalService_limit: allocationValues.personalServicesLimit,
      plan_miscExpense_limit: allocationValues.miscExpenseLimit,
      plan_localDev_limit: allocationValues.localDevLimit,
      plan_skFund_limit: allocationValues.skFundLimit,
      plan_calamityFund_limit: allocationValues.calamityFundLimit,
      plan_year: new Date().getFullYear().toString(),
      plan_issue_date: new Date().toISOString().split('T')[0],
      ...(isEdit && { plan_id: plan_id }),
    };

    const transformData = (form: any, items: any[]) => 
      items.map(item => ({
        dtl_id: budgetData?.details?.find((d: any) => d.dtl_budget_item === item.label)?.dtl_id || 0,
        dtl_proposed_budget: form[item.name] || "0.00",
        dtl_budget_item: item.label,
        dtl_budget_category: item.category,
      }));

    const budgetDetails = [
      ...transformData(formData1, budgetItemsPage1),
      ...transformData(formData2, budgetItemsPage2),
      ...transformData(formData3, budgetItemsPage3),
      ...transformData(formData4, budgetItemsPage4),
    ];
  };

  const handleExit = () => {
    navigate(-1);
  };

  if (prevPlanLoading || prevPlanDetailLoading) {
    return (
      <div className="w-full h-full p-4">
        {/* Header Section Skeleton */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-row gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-48 rounded-md" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md ml-[3.2rem]" />
        </div>
        <Skeleton className="h-px w-full mb-5" />
        
        {/* Form Content Skeleton - Adjust based on current step if needed */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          
          {/* Form Actions Skeleton */}
          <div className="flex justify-end gap-4 mt-8">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-full'>
      <div className="flex flex-col gap-3 mb-3">
        <div className='flex flex-row gap-4'>
          <ConfirmationModal
            trigger={
              <Button className="text-black p-2 self-start" variant={"outline"}>
                <ChevronLeft />
              </Button>
            }
            title="Unsaved Changes"
            description={
              isEdit 
                ? "Are you sure you want to go back? All changes made will not be saved." 
                : "Are you sure you want to go back? All progress on your budget plan will be lost."
            }
            actionLabel="Confirm"
            onClick={handleExit}
          />
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
            {isEdit ? 'Edit Budget Plan' : "Create Budget Plan"}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
          {isEdit
            ? "Edit the existing budget plan details."
            : "Develop a comprehensive budget plan to support barangay initiatives and community needs."}
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-5" />

      {currentStep === 'header' && (
        <BudgetHeaderForm form={headerForm} onSubmit={handleHeaderSubmit} />
      )}

      {currentStep === 'allocation' && (
        <BudgetAllocationForm 
          form={allocationForm} 
          onBack={handleAllocationBack} 
          onSubmit={handleAllocationSubmit} 
        />
      )}

      {currentStep === 'main' && (
        <BudgetPlanForm
          headerData={{
            ...headerForm.getValues(),
            ...allocationForm.getValues(),
          }}
          onBack={handleMainBack}
          isEdit={isEdit}
          editId={plan_id}
          budgetData={budgetData}
          formData={{ formData1, formData2, formData3, formData4 }}
          updateFormData={updateFormData}
          totalBudgetObli={totalBudgetObligations}
          balUnapp={balUnappropriated}
          beyondLimit={isBeyondLimit}
          onSubmit={handleSubmitAll}
        />
      )}
    </div>
  );
}