import { DataTable } from "@/components/ui/table/data-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Label } from "@/components/ui/label";
import { Search, ChevronLeft, Trash, Pen} from "lucide-react";
import AnnualDevelopmentPlan from "./annual_development_plan_main";

type DevelopmentPlan = [
    {
        
    }
]

function AnnaualDevelopmentPlanTable(){
    return(
        <div className="bg-snow w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Annual Development Plan</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Plan, monitor, and achieve your annual development goals with structured strategies and progress tracking.
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-4" />   
        </div>
    )
}

export default AnnaualDevelopmentPlanTable
