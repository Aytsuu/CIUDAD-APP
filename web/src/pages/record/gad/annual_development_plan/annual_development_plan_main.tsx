import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Search, ChevronLeft } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";

function AnnualDevelopmentPlan(){

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

            <div className="flex flex-col md:flex-row justify-between items-center gap-4"> 
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1 max-w-[20rem]">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
                        </div>
                        {/* <div className="flex flex-row gap-2 justify-center items-center"> */}
                            {/* <Label>Filter: </Label>
                            <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="Payment Status" onChange={setSelectedFilter}></SelectLayout> */}
                        {/* </div>                             */}
                  </div>
                <div className="">
                     <Link to=" "><Button>+ Create New</Button></Link>
                </div>
            </div>

            <div className="mt-5">
                <div className="bg-white border border-gray-300 rounded-[5px] p-5 h-[20rem] flex items-center justify-center">
                    <h2 className="flex justify-center font-semibold text-lg text-darkGray items-center">No Files Uploaded.</h2>
                </div>
            </div>
        </div>
    )

}

export default AnnualDevelopmentPlan