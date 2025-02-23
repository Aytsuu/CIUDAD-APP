import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";

function IncomeandDisbursementView(){
    const filter = [
        { id: "0", name:"All"},
        { id: "1", name: "Income Supporting Documents"},
        { id: "2", name: "Disbursement Supporting Documents"}
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    // const filteredData = selectedFilter === "All" 
    // ? data 
    // : data.filter((item) => item.entryType === selectedFilter);

    return(
        <div className="mx-4 mb-4 mt-10">
             <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <div className="mb-[1rem] flex flex-col justify-between gap-2">
                    <div className="flex flex-row gap-5">
                        <Input placeholder="Search" className="w-[20rem]"></Input>
                        <div className="flex flex-row gap-3 items-center">
                            <Label>Filter:</Label>
                            <SelectLayout options={filter} value={selectedFilter} onChange={setSelectedFilter} placeholder="Filter" label="" className=""></SelectLayout>
                        </div>
                    </div>
                    <div>
                        <div className="bg-white border border-gray-300 rounded-[5px] p-5 h-[20rem] flex items-center justify-center">
                            <h2 className="flex justify-center font-semibold text-lg text-darkGray items-center">No Files Uploaded.</h2>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    )

}

export default IncomeandDisbursementView;