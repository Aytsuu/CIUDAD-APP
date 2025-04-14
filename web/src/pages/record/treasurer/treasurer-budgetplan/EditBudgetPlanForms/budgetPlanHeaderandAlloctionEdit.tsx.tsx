import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import AllocationFormEdit from "./budgetPlanAllocationForm-edit";
import HeaderFormEdit from "./budgetPlanHeaderForm-edit";
import { Button } from "@/components/ui/button/button";
import { useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {useForm} from "react-hook-form"
import { HeaderEditSchema } from "@/form-schema/treasurer/budgetplanheaderandallocationEdit-schema";
import { AllocationEditSchema } from "@/form-schema/treasurer/budgetplanheaderandallocationEdit-schema";
import { Form } from "@/components/ui/form/form";
import { Card } from "@/components/ui/card/card";
import { ArrowRight, ChevronLeft } from "lucide-react"; 
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useNavigate } from "react-router"
import EditBudgetPlanMainForm from "./budgetPlanForm-Edit";

function HeaderAndAllocationEdit(){
    const { plan_id } = useParams<{ plan_id: string }>();
    const navigate = useNavigate();

    console.log('plan_id from View:', plan_id)

    //Header and Allocation Form Schemas
    const headerForm = useForm<z.infer<typeof HeaderEditSchema>>({
        resolver: zodResolver(HeaderEditSchema),
        defaultValues: {
            balanceEdit: "",
            realtyTaxShareEdit: "",
            taxAllotmentEdit: "",
            clearanceAndCertFeesEdit: "",
            otherSpecificIncomeEdit: "",
            actualIncomeEdit: "",
            actualRPTEdit: "",
        }
    })

    const allocationForm = useForm<z.infer<typeof AllocationEditSchema>>({
        resolver: zodResolver(AllocationEditSchema),
        defaultValues: {
           personalServicesLimitEdit: "",
           miscExpenseLimitEdit: "",
           localDevLimitEdit: "",
           skFundLimitEdit: "",
           calamityFundLimitEdit: "",
        }
    })

    // Proceed Button
    const handleProceed = async () => {
        const headerValues = headerForm.getValues();
        const allocationValues = allocationForm.getValues();

        const combinedData = {
            header: headerValues,
            allocation: allocationValues,
            plan_id: plan_id
        }
        console.log("Data:", combinedData)
        navigate(`/edit-budget-plan-details/${plan_id}`)    
    };

    // Display Form
    return(
        <div className="flex flex-col overflow-hidden">
            {/* Back Button */}
            <div className='flex flex-row gap-4'>
                <ConfirmationModal
                trigger={<Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button>}
                title="Unsaved Changes"
                description="Are you sure you want to go back? All changes made will not be saved."
                actionLabel="Confirm"
                onClick={() => (
                    navigate(-1)
                )}/>
            </div>

            {/* Edit Forms */}
            <div className="flex-1 px-5 flex flex-row gap-10 overflow-y-hidden justify-center pt-5">
                <Card className="w-1/2 p-10 flex flex-col h-[575px]">
                    <MainLayoutComponent
                    title="Budget Header Form"
                    description="Edit the budget plan header information."
                    className="flex-1 overflow-auto">
                        <Form {...headerForm}>
                            <form>
                                <HeaderFormEdit form={headerForm}/>
                            </form>
                        </Form>
                    </MainLayoutComponent>
                </Card>

                <Card className="w-1/3 p-10 flex flex-col h-[575px]">
                    <MainLayoutComponent
                    title="Budget Allocation Form (%)"
                    description="Edit budget plan allocation information."
                    className="flex-1 overflow-auto">
                        <Form {...allocationForm}>
                            <form>
                                <AllocationFormEdit form={allocationForm} />
                            </form>
                        </Form>
                    </MainLayoutComponent>
                </Card>
            </div>

            <div className="fixed bottom-10 right-10">
                <Button className="gap-2 shadow-lg" onClick={handleProceed}>
                    Proceed <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default HeaderAndAllocationEdit;