import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";

function IncomeandDisbursementView() {
    const filter = [
        { id: "All Supporting Documents", name: "All Supporting Documents" },
        { id: "Income Supporting Documents", name: "Income Supporting Documents" },
        { id: "Disbursement Supporting Documents", name: "Disbursement Supporting Documents" }
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Income & Disbursement Monitoring</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Keep track of your income and disbursements to ensure effective budgeting and financial stability.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="mb-[1rem] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Input placeholder="Search" className="w-full sm:w-[20rem] bg-white" />
                    <div className="flex flex-row gap-3 items-center">
                        <Label>Filter:</Label>
                        <SelectLayout 
                            options={filter} 
                            value={selectedFilter} 
                            onChange={setSelectedFilter} 
                            placeholder="Filter" 
                            label="" 
                            className="bg-white w-full sm:w-[15rem]" 
                        />
                    </div>
                </div>
                <div>
                    <div className="bg-white border border-gray-300 rounded-[5px] p-5 h-[20rem] flex items-center justify-center">
                        <h2 className="flex justify-center font-semibold text-lg text-darkGray items-center">No Files Uploaded.</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IncomeandDisbursementView;