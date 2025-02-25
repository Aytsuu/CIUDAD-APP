import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { Eye } from 'lucide-react';
import { Trash } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Navigate } from "react-router";


export const columns: ColumnDef<BudgetPlan>[] = [
    { accessorKey: "budgetYear",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Budget Year
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("budgetYear")}</div>
    )},
    { accessorKey: "issueDate", header: "Issued On"},
    { accessorKey: "action", header: "Action",
        cell: ({}) => (
            <div className="flex justify-center gap-2">
                 <TooltipLayout
            trigger={
                <DialogLayout
                    trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Eye size={16}/></div>}
                    className="flex flex-col"
                    title=""
                    description=""
                    mainContent={
                        <div></div>
                    } 
                />
            } content="View">
            </TooltipLayout>
            <TooltipLayout 
             trigger={
                <DialogLayout
                trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                className="max-w-[50%] h-2/3 flex flex-col"
                title="Image Details"
                description="Here is the image related to the report."
                mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} 
                />
             }  content="Delete"
             ></TooltipLayout>
            </div>
        )
    }
];

type BudgetPlan = {
    budgetYear: string,
    issueDate: string,
}

export const BudgetPlanRecords: BudgetPlan[] = [
    {
        budgetYear: "Budget Plan (YYYY)",
        issueDate: "MM-DD-YYYY"
    }
]

function BudgetPlan(){
    const data = BudgetPlanRecords;


    return(
        <div className="mx-4 mb-4 mt-10">
             <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <div className="mb-[1rem] flex flex-col justify-between gap-5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <Input placeholder="Search" className="w-[20rem]"></Input>
                        <Button>+ Add New</Button>
                    </div>
                    <div>
                       <DataTable columns={columns} data={data}></DataTable>
                    </div>
                </div>
             </div>
        </div>
    )

}

export default BudgetPlan;