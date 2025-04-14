import { FormDataEdit } from "@/form-schema/treasurer/budgetplan-edit-schema";
import BudgetPlanPage1Edit from "./budgetPlanPage1-edit";
import BudgetPlanPage2Edit from "./budgetPlanPage2-edit";
import BudgetPlanPage3Edit from "./budgetPlanPage3-edit";
import BudgetPlanPage4Edit from "./budgetPlanPage4-edit";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";

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

const onSubmit = async() => {

}

function EditBudgetPlanMainForm(){
    const navigate = useNavigate();
    const [formData1, setFormData1] = useState(initialFormData1)
    const [formData2, setFormData2] = useState(initialFormData2)
    const [formData3, setFormData3] = useState(initialFormData3)
    const [formData4, setFormData4] = useState(initialFormData4)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const handleNext = () => {
        setCurrentPage((prev) => {
            return prev + 1;
        });
    };
    const handlePrevious = () => {
        setCurrentPage((prev) => prev - 1);
    };

    // Form Update
    const updateFormData = (data: Partial<FormDataEdit>) => {
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


    return(
        <>
            <div>
                <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => { navigate(-1)}}> <ChevronLeft /></Button>
            </div>

            <div className='drop-shadow'>
                <div className='w-full'>
                    {currentPage === 1 && (
                        <BudgetPlanPage1Edit
                            onNext2={handleNext}
                            updateFormData={updateFormData}
                            formData={formData1}
                            />
                    )}

                    {currentPage === 2 && (
                        <BudgetPlanPage2Edit
                            onPrevious1={handlePrevious}
                            onNext3={handleNext}
                            updateFormData={updateFormData}
                            formData={formData2}
                        />
                    )}

                    {currentPage === 3 && (
                        <BudgetPlanPage3Edit
                            onPrevious2={handlePrevious}
                            onNext4={handleNext}    
                            updateFormData={updateFormData}
                            formData={formData3}
                        />
                    )}

                    {currentPage === 4 && (
                        <BudgetPlanPage4Edit
                            onPrevious3={handlePrevious}
                            onSubmit={onSubmit}
                            updateFormData={updateFormData}
                            formData={formData4}
                        />
                    )}
                </div>
            </div>
        </>
    )

}

export default EditBudgetPlanMainForm