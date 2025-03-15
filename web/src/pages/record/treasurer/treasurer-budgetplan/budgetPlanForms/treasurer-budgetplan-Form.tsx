import CreateBudgetPlanPage1 from "./treasurer-budgetplan-Page1";
import CreateBudgetPlanPage2 from "./treasurer-budgetplan-Page2";
import CreateBudgetPlanPage3 from "./treasurer-budgetplan-Page3";
import CreateBudgetPlanPage4 from "./treasurer-budgetplan-Page4";
import { useLocation } from "react-router";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FormData, CreateBudgetPlanSchema } from "@/form-schema/budgetplan-create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";


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
};

const initialFormData3 = {
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
    const location = useLocation();
    const { balance, realtyTaxShare, taxAllotment, clearanceAndCertFees, otherSpecificIncome, actualIncome, actualRPT } = location.state;
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

    const calculateTotals = () => {
        const sumFormData = (formData: Record<string, any>) =>
            Object.values(formData)
                .map(value => parseFloat(value) || 0)
                .reduce((acc, curr) => acc + curr, 0);
    
        const totalBudget = sumFormData(formData1) + sumFormData(formData2) + sumFormData(formData3);
        settotalBudgetObligations(totalBudget);
        setbalUnappropriated(availableResources - totalBudget);
    };

    useEffect(() => {
        calculateTotals();
    }, [formData1, formData2, formData3]);
    
    const { handleSubmit } = useForm<FormData>({
        resolver: zodResolver(CreateBudgetPlanSchema),
    });

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
            setFormData2((prev) => ({ ...prev, ...data }));
        } else if (currentPage === 4) {
            setFormData3((prev) => ({ ...prev, ...data }));
        }
    };


    const onSubmit = () => {
        const finalFormData = {
            ...formData1,
            ...formData2,
            ...formData3,
            totalBudgetObligations,
            balUnappropriated,
            balance,
            realtyTaxShare,
            taxAllotment,
            clearanceAndCertFees,
            otherSpecificIncome,
            actualIncome,
            actualRPT,
            };
        console.log("Submitting Data:", finalFormData);
    };

    return (
        <div className='w-full h-full bg-snow'>
            <div className="flex flex-col gap-3 mb-3">
                <div className='flex flex-row gap-4'>
                    <Link to='/treasurer-budget-plan'><Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button></Link>
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                        <div>Create Budget Plan</div>
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
                    Develop a comprehensive budget plan to support barangay initiatives and community needs.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className='flex flex-col gap-5'>
                {/* Header */}
                <div className='w-full  grid grid-cols-3 gap-3'>
                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>NET Available Resources: </Label>
                        <Label>Php {parseFloat(availableResources.toString()).toFixed(2)}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>Year: </Label>
                        <Label>{new Date().getFullYear()}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.highlightLabel}>TOTAL BUDGETARY OBLIGATIONS: </Label>
                        <Label className="text-red-500">Php {totalBudgetObligations.toFixed(2)}</Label>
                    </div>
                    
                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>Actual RPT Income: </Label>
                        <Label>Php {parseFloat(actualRPT).toFixed(2)}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.labelDesign}>Actual Income: </Label>
                        <Label>Php {parseFloat(actualIncome).toFixed(2)}</Label>
                    </div>

                    <div className='p-4 bg-white flex flex-col gap-4 rounded-lg drop-shadow'>
                        <Label className={styles.highlightLabel}>BALANCE UNAPPROPRIATED: </Label>
                        <Label className="text-green-500">Php {balUnappropriated.toFixed(2)}</Label>
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
                                formData={formData2}
                            />
                        )}

                        {currentPage === 4 && (
                            <CreateBudgetPlanPage4
                                onPrevious3={handlePrevious}
                                onSubmit={handleSubmit(onSubmit)}
                                updateFormData={updateFormData}
                                formData={formData3}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateBudgetPlanForm;