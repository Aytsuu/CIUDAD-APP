import CreateBudgetPlanPage1 from "./budgetPlanFormPage1.tsx";
import CreateBudgetPlanPage2 from "./budgetPlanFormPage2.tsx";
import CreateBudgetPlanPage3 from "./budgetPlanFormPage3.tsx";
import CreateBudgetPlanPage4 from "./budgetPlanFormPage4.tsx";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { ChevronLeft, CircleCheck, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button/button.tsx";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { toast } from "sonner";
import DisplayBreakdown from "../netBreakdownDisplay.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { getInitialFormData } from "../budgetPlanFormEditInitializer.tsx";
import { budgetItemsPage1, budgetItemsPage2, budgetItemsPage3, budgetItemsPage4 } from "../budgetItemDefinition.tsx";
import { useInsertBudgetPlan } from "../queries/budgetPlanInsertQueries.tsx";
import { useUpdateBudgetPlan } from "../queries/budgetPlanUpdateQueries.tsx";
import { BudgetPlanDetail } from "../budgetPlanInterfaces.tsx";

const styles = {
    header: "font-bold text-lg text-blue w-[18rem] justify-center flex",
    total: "font-bold text-blue",
    mainCategory: "font-bold text-[19px]",
    subCategory: "font-semibold text-[16px] text-sky-500",
    budgetDetails: "flex text-left text-[15px]",
    labelInputGroup: "flex flex-row gap-4",
    colDesign: "flex flex-col gap-4",
    inputField: "w-[15rem] text-right", 
    labelDesign: "w-full text-left text-blue",
    highlightLabel: "w-full text-left text-darkGray"
}; 


function BudgetPlanForm({headerData, onBack, isEdit, editId, budgetData, onSuccess}: {
    headerData: any;
    onBack: () => void;
    isEdit: boolean;
    editId?: number;
    budgetData: any;
    onSuccess?: () => void;
}) {
    const year = new Date().getFullYear()
    const totalBudgetToast = useRef <string | number | null>(null);
    // const navigate = useNavigate();

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
      } = headerData || {};

    // const [initialized, setInitialized] = useState(false)
    const initialForms = getInitialFormData(isEdit, budgetData);
    
    const [formData1, setFormData1] = useState(initialForms.form1);
    const [formData2, setFormData2] = useState(initialForms.form2);
    const [formData3, setFormData3] = useState(initialForms.form3);
    const [formData4, setFormData4] = useState(initialForms.form4);
    const [totalBudgetObligations, settotalBudgetObligations] = useState(0.00);
    const [balUnappropriated, setbalUnappropriated] = useState(0.00);
    const [isBeyondLimit, setIsBeyondLimit] = useState(false);

    // Calculating net available resources
    const availableResources =
    (parseFloat(balance) || 0) +
    (parseFloat(realtyTaxShare) || 0) +
    (parseFloat(taxAllotment) || 0) +
    (parseFloat(clearanceAndCertFees) || 0) +
    (parseFloat(otherSpecificIncome) || 0);

    const backButtonHandler = () => {
        onBack();
      };
    const [currentPage, setCurrentPage] = useState(1);

    // auto calculation of total budgetary obligations and balance unappropriated
    useEffect(() => {
        const sumFormData = (formData: Record<string, any>): number => 
            Object.values(formData)
                .map((value) => parseFloat(value) || 0)
                .reduce((acc, curr) => acc + curr, 0);

        const totalBudget = sumFormData(formData1) + sumFormData(formData2) + 
                            sumFormData(formData3) + sumFormData(formData4);
        
        settotalBudgetObligations(totalBudget);
        const newBalance = availableResources - totalBudget;
        setbalUnappropriated(newBalance);
        
        if (newBalance < 0) {
            if (!totalBudgetToast.current) {
                setIsBeyondLimit(true);
                totalBudgetToast.current = toast.error("Insufficient funds! Budget obligations exceed available resources.", {
                    duration: Infinity, 
                    style: {
                        border: '1px solid rgb(225, 193, 193)',
                        padding: '16px',
                        color: '#b91c1c',
                        background: '#fef2f2',
                    },
                });
            }
        } else {
            if(totalBudgetToast.current !== null){
                setIsBeyondLimit(false);
                toast.dismiss(totalBudgetToast.current);
                totalBudgetToast.current = null;
            }
        }
    }, [formData1, formData2, formData3, formData4, availableResources]);

    const handleNext = () => setCurrentPage(prev => prev + 1);
    const handlePrevious = () => setCurrentPage(prev => prev - 1);

    // Update form data based on current page
    const updateFormData = (data: Record<string, string>) => {
        if (currentPage === 1) setFormData1(prev => ({ ...prev, ...data }));
        else if (currentPage === 2) setFormData2(prev => ({ ...prev, ...data }));
        else if (currentPage === 3) setFormData3(prev => ({ ...prev, ...data }));
        else if (currentPage === 4) setFormData4(prev => ({ ...prev, ...data }));
    };

    const {mutate: createBudgetPlan} = useInsertBudgetPlan(onSuccess)
    const {mutate: updateBudgetPlan} = useUpdateBudgetPlan(onSuccess)

    // send values on query function
    const onSubmit = async () => {
        // if form is not in edit mode
        if (isEdit == false) {
            const budgetHeader = {
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
                plan_year: new Date().getFullYear().toString(),
                plan_issue_date: new Date().toISOString().split('T')[0]
            };
    
            const budgetDetails = transformFormDataCreate();

            createBudgetPlan({ budgetHeader, budgetDetails });
        } else { 
    
            // Prepare updated header data
            const updatedBudgetHeader = {
                plan_id: editId,
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
            };

            const updatedBudgetDetails = transformFormDataUpdate();

            await updateBudgetPlan({
                budgetHeader: updatedBudgetHeader,
                budgetDetails: updatedBudgetDetails
            });
        }
    };

    const transformFormDataUpdate = () => {
        const existingDetails = budgetData || [];
        const transformPageData = (formData: Record<string, any>, budgetItems: any[], pageIndex: number) => {
            return budgetItems.map(({ name, label, category }) => {
                const existingDetail = existingDetails.find(
                    (detail: BudgetPlanDetail) => detail.dtl_budget_item === label
                );
                
                return {
                    dtl_id: existingDetail.dtl_id,
                    dtl_proposed_budget: formData[name] || "0.00",
                    dtl_budget_item: label,
                    dtl_budget_category: category,
                };
            });
        };
    
        return [
            ...transformPageData(formData1, budgetItemsPage1, 0),
            ...transformPageData(formData2, budgetItemsPage2, 1),
            ...transformPageData(formData3, budgetItemsPage3, 2),
            ...transformPageData(formData4, budgetItemsPage4, 3)
        ];
    };

    const transformFormDataCreate = () => {
        const existingDetails = budgetData?.budget_detail || []; 
        const transformPageData = (formData: Record<string, any>, budgetItems: any[], pageIndex: number) => {
            return budgetItems.map(({ name, label, category }) => {
                const existingDetail = existingDetails.find(
                    (detail: BudgetPlanDetail) => detail?.dtl_budget_item === label
                );
                
                return {
                    dtl_id: existingDetail?.dtl_id || 0, 
                    dtl_proposed_budget: formData[name] || "0.00",
                    dtl_budget_item: label,
                    dtl_budget_category: category,
                };
            });
        };
    
        return [
            ...transformPageData(formData1, budgetItemsPage1, 0),
            ...transformPageData(formData2, budgetItemsPage2, 1),
            ...transformPageData(formData3, budgetItemsPage3, 2),
            ...transformPageData(formData4, budgetItemsPage4, 3)
        ].filter(item => item !== undefined); 
    };

    
    return (
        <div className='w-full h-full bg-snow'>
            {/* Header Title */}
            <div className="flex flex-col gap-3 mb-3">
                <div className='flex flex-row gap-4'>
                    <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => backButtonHandler()}><ChevronLeft /></Button>

                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                        <div>{isEdit ? 'Edit Budget Plan' : "Create Budget Plan"}</div>
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
                    {isEdit ? "Edit the existing budget plan details." : "Develop a comprehensive budget plan to support barangay initiatives and community needs."}
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            {/* Budgetplan Header */}
            <div className='flex flex-col gap-5'>
                {/* Header */}
                <div className='w-full  grid grid-cols-3 gap-3'>
                    {/* Displays the breakdown of Net available resources when clicked */}
                        <DialogLayout
                            trigger={ 
                                <div className="p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <Label className={styles.labelDesign}>NET Available Resources:</Label>
                                        <ChevronRightIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <Label>{formatNumber(availableResources.toString())}</Label>
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
                   

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>Year: </Label>
                        <Label>{year}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS: </Label>
                        <Label className="text-red-500">{formatNumber(totalBudgetObligations.toString())}</Label>
                    </div>
                    
                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>Actual RPT Income: </Label>
                        <Label>{formatNumber(actualRPT)}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>Actual Income: </Label>
                        <Label>{formatNumber(actualIncome)}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED: </Label>
                        <Label className="text-green-500">{formatNumber(balUnappropriated.toString())}</Label>
                    </div>
                </div>

                {/* Form */}
                <div className='drop-shadow'>
                    <div className='flex justify-end bg-lightBlue p-2'>
                        <div className='flex flex-row gap-[3.5rem] justify-center items-center'>
                            <Label className={styles.header}>Per Proposed Budget</Label>
                            <Label className={styles.header}>Budget Limit</Label>
                            <Label className={styles.header}>Balance</Label>
                        </div>
                    </div>

                    <div className='w-full'>
                        {currentPage === 1 && (
                                <CreateBudgetPlanPage1
                                onNext2={handleNext}
                                personalServicesLimit = {personalServicesLimit}
                                actualIncome = {actualIncome}
                                updateFormData={updateFormData}
                                formData={formData1}
                                isBeyondLimit = {isBeyondLimit}
                                />
                        )}

                        {currentPage === 2 && (
                            <CreateBudgetPlanPage2
                                onPrevious1={handlePrevious}
                                onNext3={handleNext}
                                updateFormData={updateFormData}
                                formData={formData2}
                                isBeyondLimit = {isBeyondLimit}
                            />
                        )}

                        {currentPage === 3 && (
                            <CreateBudgetPlanPage3
                                onPrevious2={handlePrevious}
                                onNext4={handleNext}    
                                updateFormData={updateFormData}
                                formData={formData3}
                                actualRPT = {actualRPT}
                                miscExpenseLimit = {miscExpenseLimit}
                                isBeyondLimit = {isBeyondLimit}
                            />
                        )}

                        {currentPage === 4 && (
                            <CreateBudgetPlanPage4
                                onPrevious3={handlePrevious}
                                onSubmit={onSubmit}
                                updateFormData={updateFormData}
                                formData={formData4}
                                balance = {balance}
                                taxAllotment = {taxAllotment}
                                realtyTaxShare = {realtyTaxShare}
                                clearanceAndCertFees = {clearanceAndCertFees}
                                otherSpecificIncome = {otherSpecificIncome}
                                localDevLimit = {localDevLimit}
                                skFundLimit = {skFundLimit}
                                calamityFundLimit = {calamityFundLimit}
                                isBeyondLimit = {isBeyondLimit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BudgetPlanForm;