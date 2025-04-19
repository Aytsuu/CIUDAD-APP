    import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
    import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
    import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
    import { Button } from "@/components/ui/button/button";
    import { useParams } from "react-router";
    import { zodResolver } from "@hookform/resolvers/zod";
    import z from "zod";
    import {useForm} from "react-hook-form"
    import BudgetHeaderForm from "./budgetHeaderForm";
    import BudgetAllocationForm from "./budgetAllocationForm";
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

function HeaderAndAllocationForm(){
    const { plan_id } = useParams<{ plan_id?: string }>();
    const {state} = useLocation();
    const isEdit = state?.isEdit ?? false;
    const navigate = useNavigate();

    const budgetData = isEdit ? (state?.budgetData as BudgetPlan) : undefined;

    //Header and Allocation Form Schemas
    const headerForm = useForm<z.infer<typeof BudgetHeaderSchema>>({
        resolver: zodResolver(BudgetHeaderSchema),
        defaultValues: {
            balance: budgetData?.plan_balance.toString() || "",
            realtyTaxShare: budgetData?.plan_tax_share.toString() || "",
            taxAllotment: budgetData?.plan_tax_allotment.toString() || "",
            clearanceAndCertFees: budgetData?.plan_cert_fees.toString() || "",
            otherSpecificIncome: budgetData?.plan_other_income.toString() || "",
            actualIncome: budgetData?.plan_actual_income.toString() || "",
            actualRPT: budgetData?.plan_rpt_income.toString() || "",
        }
    });

    const allocationForm = useForm<z.infer<typeof BudgetAllocationSchema>>({
        resolver: zodResolver(BudgetAllocationSchema),
        defaultValues: {
            personalServicesLimit: budgetData?.plan_personalService_limit.toString() || "",
            miscExpenseLimit: budgetData?.plan_miscExpense_limit.toString() || "",
            localDevLimit: budgetData?.plan_localDev_limit.toString() || "",
            skFundLimit: budgetData?.plan_skFund_limit.toString() || "",
            calamityFundLimit: budgetData?.plan_calamityFund_limit.toString() || "",
        }
    });


    // Proceed Button
    const handleProceed = async () => {

        const isHeaderValid = await headerForm.trigger();
        const isAllocationValid = await allocationForm.trigger();
      
        if (!isHeaderValid || !isAllocationValid) {

          const firstHeaderError = Object.keys(headerForm.formState.errors)[0];
          const firstAllocationError = Object.keys(allocationForm.formState.errors)[0];
          
          if (firstHeaderError) {
            document.getElementsByName(firstHeaderError)[0]?.focus();
          } else if (firstAllocationError) {
            document.getElementsByName(firstAllocationError)[0]?.focus();
          }
          
          return; 
        }

        const headerValues = headerForm.getValues();
        const allocationValues = allocationForm.getValues();
      
        const combinedData = {
              balance: headerValues.balance,
              realtyTaxShare: headerValues.realtyTaxShare,
              taxAllotment: headerValues.taxAllotment,
              clearanceAndCertFees: headerValues.clearanceAndCertFees,
              otherSpecificIncome: headerValues.otherSpecificIncome,
              actualIncome: headerValues.actualIncome,
              actualRPT: headerValues.actualRPT,
              personalServicesLimit: allocationValues.personalServicesLimit,
              miscExpenseLimit: allocationValues.miscExpenseLimit,
              localDevLimit: allocationValues.localDevLimit,
              skFundLimit: allocationValues.skFundLimit,
              calamityFundLimit: allocationValues.calamityFundLimit,
              isEdit: isEdit,
            ...(plan_id && { id: plan_id }),
            ...(budgetData && { originalData: budgetData })
        };
        

        console.log(combinedData)
        
        navigate('/treasurer-budgetplan-form', {state: combinedData});
    };

    const formText = {
        mainTitle: isEdit ? 'Edit Budget Header & Allocation' : 'Create Budget Header & Allocation',
        mainDescription: isEdit 
            ? 'Modify the budget header information and allocation percentages.' 
            : 'Set up the initial budget header information and allocation percentages.',
            
        headerForm: {
            title: 'Budget Header',
            description: isEdit 
                ? 'Update the budget plan header information' 
                : 'Enter the budget plan header information'
        },
        
        allocationForm: {
            title: 'Budget Allocation (%)',
            description: isEdit
                ? 'Adjust budget allocation percentages'
                : 'Set initial budget allocation percentages'
        },
    };

    // Display Form
    return (
        <div className="flex flex-col overflow-hidden">
            <div className='flex flex-row gap-4'>
                {isEdit ? (
                    <div className='flex flex-row gap-4'>
                        <ConfirmationModal
                            trigger={<Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button>}
                            title="Unsaved Changes"
                            description="Are you sure you want to go back? All changes made will not be saved."
                            actionLabel="Confirm"
                            onClick={() => navigate(`/treasurer-budgetplan-view/${plan_id}`)}
                        />
                    </div>
                ) : (
                    <div>
                        <ConfirmationModal
                            trigger={<Button className="text-black p-2 self-start" variant={"outline"}> <ChevronLeft /></Button>}
                            title="Unsaved Changes"
                            description="Are you sure you want to go back? All progress on your budget plan will be lost."
                            actionLabel="Confirm"
                            onClick={() => navigate('/treasurer-budget-plan')}
                        />
                    </div>
                )}
                {/* Form Main title */}
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>{formText.mainTitle}</div>
                </h1>
            </div>
            
            {/* Form Main Description */}
            <p className="text-xs sm:text-sm text-darkGray ml-[3.2rem]">
                {formText.mainDescription}
            </p>

            {/* Forms */}
            <div className="flex-1 px-5 flex flex-col lg:flex-row gap-6 justify-center pt-5">
            {/* Header Form Card */}
            <Card className="w-full lg:w-[60%] p-6 flex flex-col min-h-[500px] max-h-[690px]">
                <MainLayoutComponent
                title={formText.headerForm.title}
                description={formText.headerForm.description}
                className="flex-1 overflow-y-auto"  
                >
                <Form {...headerForm}>
                    <form>
                    <BudgetHeaderForm form={headerForm}/>
                    </form>
                </Form>
                </MainLayoutComponent>
            </Card>

            {/* Allocation Form Card */}
            <Card className="w-full lg:w-[40%] p-6 flex flex-col min-h-[500px] max-h-[690px] mt-6 lg:mt-0">
                <MainLayoutComponent
                title={formText.allocationForm.title}
                description={formText.allocationForm.description}
                className="flex-1 overflow-y-auto" 
                >
                <Form {...allocationForm}>
                    <form>
                    <BudgetAllocationForm form={allocationForm} />
                    </form>
                </Form>
                </MainLayoutComponent>
            </Card>
            </div>

            <div className="flex justify-end mt-5">
                <Button className="gap-2 shadow-lg" onClick={handleProceed}>
                    Proceed <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
export default HeaderAndAllocationForm;