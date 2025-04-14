import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import AllocationFormEdit from "./budgetPlanAllocationForm-edit";
import HeaderFormEdit from "./budgetPlanHeaderForm-edit";
import { Button } from "@/components/ui/button/button";
import { useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {useForm} from "react-hook-form"
import { HeaderEditSchema } from "@/form-schema/budgetplanheaderandallocation-schema";
import { AllocationEditSchema } from "@/form-schema/budgetplanheaderandallocation-schema";
import { Form } from "@/components/ui/form/form";
import { Card } from "@/components/ui/card/card";
import { ArrowRight } from "lucide-react"; 


function HeaderAndAllocationEdit(){
    const { plan_id } = useParams<{ plan_id: string }>();

    console.log('plan_id from View:', plan_id)

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


    return(
        <>
        <div>
            
        </div>

        {/* Edit Forms */}
            <div className="w-full h-full p-5 flex flex-row gap-10 items-stretch justify-center items-center">
                <Card className="w-1/2 p-10 flex flex-col h-[600px]">
                    <MainLayoutComponent
                    title="Budget Header Form"
                    description="Edit the budget plan header information."
                    className="flex-1">
                        <Form {...headerForm}>
                            <form>
                                <HeaderFormEdit form={headerForm}/>
                            </form>
                        </Form>
                    </MainLayoutComponent>
                </Card>

                <Card className="w-1/3 p-10 flex flex-col h-[600px]">
                    <MainLayoutComponent
                    title="Budget Allocation Form"
                    description="Edit budget plan allocation information."
                    className="flex-1">
                        <Form {...allocationForm}>
                            <form>
                                <AllocationFormEdit form={allocationForm} />
                            </form>
                        </Form>
                    </MainLayoutComponent>
                </Card>
            </div>

            <div className="fixed bottom-8 right-8">
                <Button className="gap-2 shadow-lg">
                    Proceed <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </>
    )
}

export default HeaderAndAllocationEdit;
