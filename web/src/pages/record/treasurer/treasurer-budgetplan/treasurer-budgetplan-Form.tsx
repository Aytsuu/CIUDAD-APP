import CreateBudgetPlanPage1 from "./CreateBudgetPlanForms/budgetPlanPage1-create.tsx.tsx";
import CreateBudgetPlanPage2 from "./CreateBudgetPlanForms/budgetPlanPage2-create.tsx.tsx";
import CreateBudgetPlanPage3 from "./CreateBudgetPlanForms/budgetPlanPage3-create.tsx.tsx";
import CreateBudgetPlanPage4 from "./CreateBudgetPlanForms/budgetPlanPage4-create.tsx.tsx";
import { useLocation } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FormData, CreateBudgetPlanSchema } from "@/form-schema/budgetplan-create-schema";
import { useEffect } from "react";
import { ChevronLeft, CircleCheck, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { budget_plan, budget_plan_details } from "./restful-API/budgetPlanPostAPI.tsx";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import DisplayBreakdown from "./display_breakdown.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

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

const initialFormData1 = {
    honorariaOfficials: "",
    cashOfficials: "",
    midBonusOfficials: "",
    endBonusOfficials: "",
    honorariaTanods: "",
    honorariaLupon: "",
    honorariaBarangay: "",
    prodEnhancement: "",
    leaveCredits: "",
};

const initialFormData2 = {
    travelingExpenses: "",
    trainingExpenses: "",
    officeExpenses: "",
    accountableExpenses: "",
    medExpenses: "",
    waterExpenses: "",
    electricityExpenses: "",
    telephoneExpenses: "",
    memDues: "",
    officeMaintenance: "",
    vehicleMaintenance: "",
};

const initialFormData3 = {
    fidelityBond: "",
    insuranceExpense: "",
    gadProg: "",
    seniorProg: "",
    juvJustice: "",
    badacProg: "",
    nutritionProg: "",
    aidsProg: "",
    assemblyExpenses: "",
    disasterProg: "",
    miscExpense: "",
}

const initialFormData4 = {
    capitalOutlays: "",
    cleanAndGreen: "",
    streetLighting: "",
    rehabMultPurpose: "",
    skFund: "",
    qrfFund: "",
    disasterTraining: "",
    disasterSupplies: "",
};

function CreateBudgetPlanForm() {
    const year = new Date().getFullYear()
    const location = useLocation();
    const { balance, realtyTaxShare, taxAllotment, clearanceAndCertFees, otherSpecificIncome, 
            actualIncome, actualRPT, personalServicesLimit, miscExpenseLimit, 
            localDevLimit, skFundLimit, calamityFundLimit } = location.state;
    const availableResources =
    (parseFloat(balance) || 0) +
    (parseFloat(realtyTaxShare) || 0) +
    (parseFloat(taxAllotment) || 0) +
    (parseFloat(clearanceAndCertFees) || 0) +
    (parseFloat(otherSpecificIncome) || 0);

    const [totalBudgetObligations, settotalBudgetObligations] = useState(0.00);
    const [balUnappropriated, setbalUnappropriated] = useState(0.00);

    const [currentPage, setCurrentPage] = useState(1);
    const [formData1, setFormData1] = useState(initialFormData1);
    const [formData2, setFormData2] = useState(initialFormData2);
    const [formData3, setFormData3] = useState(initialFormData3);
    const [formData4, setFormData4] = useState(initialFormData4);

    useEffect(() => {
        const sumFormData = (formData: Record<string, any>) =>
            Object.values(formData)
                .map((value) => parseFloat(value) || 0)
                .reduce((acc, curr) => acc + curr, 0);

        const totalBudget = sumFormData(formData1) + sumFormData(formData2) + sumFormData(formData3) + sumFormData(formData4);
        settotalBudgetObligations(totalBudget);
        setbalUnappropriated(availableResources - totalBudget);
    }, [formData1, formData2, formData3, formData4, availableResources]);
    
    const handleNext = () => {
        setCurrentPage((prev) => {
            return prev + 1;
        });
    };
    const handlePrevious = () => {
        setCurrentPage((prev) => prev - 1);
    };

    const updateFormData = (data: Partial<FormData>) => {
        if (currentPage === 1) {
            setFormData1((prev) => ({ ...prev, ...data }));
        } else if (currentPage === 2) {
            setFormData2((prev) => ({ ...prev, ...data }));
        } else if (currentPage === 3) {
            setFormData3((prev) => ({ ...prev, ...data }));
        } else if (currentPage === 4) {
            setFormData4((prev) => ({ ...prev, ...data }));
        }
    };


    // Data insertion
    const onSubmit = async () => {
        const toastId = toast.loading('Submitting budget plan...', {
            duration: Infinity  // Keep open until we manually close it
        });

        // Defining budget items for each page
        const budgetItemsPage1 = [
            { name: "honorariaOfficials", label: "Honoraria for Officials", category: "Personal Service" },
            { name: "cashOfficials", label: "Cash Gift for Officials", category: "Personal Service" },
            { name: "midBonusOfficials", label: "Mid-Year Bonus for Officials", category: "Personal Service" },
            { name: "endBonusOfficials", label: "Year-End Bonus for Officials", category: "Personal Service" },
            { name: "honorariaTanods", label: "Honoraria for Tanods", category: "Personal Service" },
            { name: "honorariaLupon", label: "Honoraria for Lupon Members", category: "Personal Service" },
            { name: "honorariaBarangay", label: "Honoraria for Barangay Workers", category: "Personal Service" },
            { name: "prodEnhancement", label: "Productivity Enhancement Incentive", category: "Personal Service" },
            { name: "leaveCredits", label: "Commutation of Leave Credits", category: "Personal Service" },
        ];
    
        const budgetItemsPage2 = [
            { name: "travelingExpenses", label: "Traveling Expense", category: "Other Expense" },
            { name: "trainingExpenses", label: "Training Expenses", category: "Other Expense" },
            { name: "officeExpenses", label: "Office Supplies Expenses", category: "Other Expense" },
            { name: "accountableExpenses", label: "Accountable Forms Expenses", category: "Other Expense" },
            { name: "medExpenses", label: "Drugs and Medicine Expense", category: "Other Expense" },
            { name: "waterExpenses", label: "Water Expenses", category: "Other Expense" },
            { name: "electricityExpenses", label: "Electricity Expenses", category: "Other Expense" },
            { name: "telephoneExpenses", label: "Telephone Expenses", category: "Other Expense" },
            { name: "memDues", label: "Membership Dues/ Contribution to Organization", category: "Other Expense" },
            { name: "officeMaintenance", label: "Repair and Maintenance of Office Equipment", category: "Other Expense" },
            { name: "vehicleMaintenance", label: "Repair and Maintenance of Motor Vehicle", category: "Other Expense" },
        ];
    
        const budgetItemsPage3 = [
            { name: "fidelityBond", label: "Fidelity Bond Premiums", category: "Other Expense" },
            { name: "insuranceExpense", label: "Insurance Expenses", category: "Other Expense"  },
            { name: "gadProg", label: "GAD Program", category: "Other Expense"},
            { name: "seniorProg", label: "Senior Citizen/ PWD Program", category: "Other Expense" },
            { name: "juvJustice", label: "BCPC (Juvenile Justice System)", category: "Other Expense" },
            { name: "badacProg", label: "BADAC Program", category: "Other Expense" },
            { name: "nutritionProg", label: "Nutrition Program", category: "Other Expense" },
            { name: "aidsProg", label: "Combating AIDS Program", category: "Other Expense" },
            { name: "assemblyExpenses", label: "Barangay Assembly Expenses", category: "Other Expense" },
            { name: "disasterProg", label: "Disaster Response Program", category: "Other Expense" },
            { name: "miscExpense", label: "Extraordinary & Miscellaneous Expense", category: "Other Expense" },
        ];
    
        const budgetItemsPage4 = [
            { name: "capitalOutlays", label: "Total Capital Outlays", category: "Capital Outlays" },
            { name: "cleanAndGreen", label: "Clean & Green Environmental", category: "Non-Office" },
            { name: "streetLighting", label: "Street Lighting Project", category: "Non-Office" },
            { name: "rehabMultPurpose", label: "Rehabilitation of Multi-Purpose", category: "Non-Office" },
            { name: "skFund", label: "Subsidy to Sangguniang Kabataan (SK) Fund", category: "Sangguniang Kabataan" },
            { name: "qrfFund", label: "Quick Response Fund (QRF)", category: "LDRRM Fund" },
            { name: "disasterTraining", label: "Disaster Training", category: "LDRRM Fund" },
            { name: "disasterSupplies", label: "Disaster Supplies", category: "LDRRM Fund" },
        ];
    
        // Transform data from each page into the desired format
        const transformData = (formData: Record<string, any>, budgetItems: { name: string; label: string; category: string }[]) => {
            return budgetItems.map(({ name, label, category }) => ({
                dtl_budget_item: label,
                dtl_proposed_budget: formData[name] || "0.00",
                dtl_budget_category: category,
            }));
        };
    
        const page1Data = transformData(formData1, budgetItemsPage1);
        const page2Data = transformData(formData2, budgetItemsPage2);
        const page3Data = transformData(formData3, budgetItemsPage3);
        const page4Data = transformData(formData4, budgetItemsPage4);
    
        // Combine data from all pages into a single array
        const combinedData = [...page1Data, ...page2Data, ...page3Data, ...page4Data];
    
        console.log("Combined Data:", combinedData);
    
        try{
            const budgetHeader = {
                actualIncome,
                actualRPT,
                balance,
                realtyTaxShare,
                taxAllotment,
                clearanceAndCertFees,
                otherSpecificIncome,
                totalBudgetObligations, 
                balUnappropriated,
                personalServicesLimit,
                miscExpenseLimit,
                localDevLimit, 
                skFundLimit,
                calamityFundLimit
            };
    
            const planId = await budget_plan(budgetHeader);
            console.log("Budget Header Uploaded!")

            const res = await budget_plan_details(combinedData, planId);
            console.log("Budget plan and expenditures submitted successfully!");

            if (res && planId) {
                toast.success('Budget plan created successfully', {
                    id: toastId, 
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });

                window.location.href = '/treasurer-budget-plan';
            }

        } catch (error){
            toast.error('Failed to create budget plan', {
                id: toastId, 
                duration: 2000
            });
            console.error("Error submitting budget plan", error);
        }
    };
    
    return (
        <div className='w-full h-full bg-snow'>
            {/* Header Title */}
            <div className="flex flex-col gap-3 mb-3">
                <div className='flex flex-row gap-4'>
                    {/* Confirmation message when users aborts budget plan creation by clicking the back button */}
                    <ConfirmationModal
                    trigger={<Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button>}
                    title="Unsaved Changes"
                    description="Are you sure you want to go back? All progress on your budget plan will be lost."
                    actionLabel="Confirm"
                    onClick={() => (
                        window.location.href = '/treasurer-budget-plan'
                    )}/>
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                        <div>Create Budget Plan</div>
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
                    Develop a comprehensive budget plan to support barangay initiatives and community needs.
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
                                updateFormData={updateFormData}
                                formData={formData1}
                                />
                        )}

                        {currentPage === 2 && (
                            <CreateBudgetPlanPage2
                                onPrevious1={handlePrevious}
                                onNext3={handleNext}
                                updateFormData={updateFormData}
                                formData={formData2}
                            />
                        )}

                        {currentPage === 3 && (
                            <CreateBudgetPlanPage3
                                onPrevious2={handlePrevious}
                                onNext4={handleNext}    
                                updateFormData={updateFormData}
                                formData={formData3}
                            />
                        )}

                        {currentPage === 4 && (
                            <CreateBudgetPlanPage4
                                onPrevious3={handlePrevious}
                                onSubmit={onSubmit}
                                updateFormData={updateFormData}
                                formData={formData4}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateBudgetPlanForm;