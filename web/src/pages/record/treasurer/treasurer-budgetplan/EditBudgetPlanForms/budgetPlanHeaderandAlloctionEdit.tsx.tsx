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
import { useNavigate, useLocation } from "react-router"

type BudgetPlan = {
    plan_id: number;
    plan_year: string;
    plan_actual_income: number;
    plan_rpt_income: number;
    plan_balance: number;
    plan_tax_share: number;
    plan_tax_allotment: number;
    plan_cert_fees: number;
    plan_other_income: number;
    plan_budgetaryObligations: number;
    plan_balUnappropriated: number;
    plan_issue_date: string;
    plan_personalService_limit: number;
    plan_miscExpense_limit: number;
    plan_localDev_limit: number;
    plan_skFund_limit: number;
    plan_calamityFund_limit: number;
    budget_detail: BudgetPlanDetail[];
};

type BudgetPlanDetail = {
    dtl_id: number;
    dtl_budget_item: string;
    dtl_proposed_budget: number;
    dtl_budget_category: string;
    plan: number;
};

    function HeaderAndAllocationEdit(){
        const { plan_id } = useParams<{ plan_id: string }>();
        const {state} = useLocation();
        const navigate = useNavigate();

        const budgetData = state?.budgetData as BudgetPlan | undefined;

        //Header and Allocation Form Schemas
        const headerForm = useForm<z.infer<typeof HeaderEditSchema>>({
            resolver: zodResolver(HeaderEditSchema),
            defaultValues: {
                balanceEdit: budgetData?.plan_balance.toString() || "",
                realtyTaxShareEdit: budgetData?.plan_tax_share.toString() || "",
                taxAllotmentEdit: budgetData?.plan_tax_allotment.toString() || "",
                clearanceAndCertFeesEdit: budgetData?.plan_cert_fees.toString() || "",
                otherSpecificIncomeEdit: budgetData?.plan_other_income.toString() || "",
                actualIncomeEdit: budgetData?.plan_actual_income.toString() || "",
                actualRPTEdit: budgetData?.plan_rpt_income.toString() || "",
            }
        });
    
        const allocationForm = useForm<z.infer<typeof AllocationEditSchema>>({
            resolver: zodResolver(AllocationEditSchema),
            defaultValues: {
                personalServicesLimitEdit: budgetData?.plan_personalService_limit.toString() || "",
                miscExpenseLimitEdit: budgetData?.plan_miscExpense_limit.toString() || "",
                localDevLimitEdit: budgetData?.plan_localDev_limit.toString() || "",
                skFundLimitEdit: budgetData?.plan_skFund_limit.toString() || "",
                calamityFundLimitEdit: budgetData?.plan_calamityFund_limit.toString() || "",
            }
        });
    

        // Proceed Button
        const handleProceed = async () => {
            const headerValues = headerForm.getValues();
            const allocationValues = allocationForm.getValues();

            const combinedData = {
                originalData: budgetData,
                header: headerValues,
                allocation: allocationValues,
                id: plan_id,
                isEdit: true,
            }
            console.log("Data:", combinedData)
            navigate('/treasurer-budgetplan-form', {state: combinedData})    
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
                        navigate(`/treasurer-budgetplan-view/${plan_id}`)
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