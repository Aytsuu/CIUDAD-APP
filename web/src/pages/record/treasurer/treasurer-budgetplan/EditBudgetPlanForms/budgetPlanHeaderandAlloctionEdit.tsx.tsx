import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import AllocationFormEdit from "./budgetPlanAllocationForm-edit";
import HeaderFormEdit from "./budgetPlanHeaderForm-edit";
import { Button } from "@/components/ui/button/button";
import { useParams } from "react-router";
import { useLocation } from "react-router";


function HeaderAndAllocationEdit(){
    const location = useLocation();
    const { plan_id } = location.state


    return(
        <>
            <div className="w-full h-full p-5 flex flex-row gap-5">
                <MainLayoutComponent
                title="Budget Header Form"
                description="Edit the budget plan header information.">
                    <HeaderFormEdit/>
                </MainLayoutComponent>

                <MainLayoutComponent
                title="Budget Allocation Form"
                description="Edit budget plan allocation information.">
                    <AllocationFormEdit/>
                </MainLayoutComponent>
            </div>
        </>
    )
}

export default HeaderAndAllocationEdit;
