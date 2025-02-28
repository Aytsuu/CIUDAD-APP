import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { Eye, Trash, ArrowUpDown } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

export const columns: ColumnDef<BudgetPlan>[] = [
    { 
        accessorKey: "budgetYear",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Budget Year
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({row}) => (
            <div className="text-center">{row.getValue("budgetYear")}</div>
        )
    },
    { 
        accessorKey: "issueDate", 
        header: "Issued On",
        cell: ({row}) => (
            <div className="text-center">{row.getValue("issueDate")}</div>
        )
    },
    { 
        accessorKey: "action", 
        header: "Action",
        cell: ({}) => (
            <div className="flex justify-center gap-2">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Eye size={16}/></div>}
                            className="flex flex-col"
                            title=""
                            description=""
                            mainContent={<div></div>} 
                        />
                    } 
                    content="View"
                />
                <TooltipLayout 
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} 
                        />
                    }  
                    content="Delete"
                />
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
        <div className="w-full h-full bg-snow">
            <div className="mx-4 mb-4 mt-10">
                <div className="flex flex-col gap-3 mb-4">
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                        <div>San Roque Budget Plan</div>
                    </h1>
                    <p className="text-xs sm:text-sm text-darkGray">
                        Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
                    </p>
                </div>
                <hr className="border-gray mb-7 sm:mb-9" /> 
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4 md:gap-0">
                    <Input placeholder="Search" className="w-full md:w-[20rem] bg-white" />
                    <Link to="/treasurer-budgetplan-form">
                        <Button className="w-full md:w-auto">+ Add New</Button>
                    </Link>
                </div>

                <div className="w-full bg-white border border-none"> 
                    <div className="flex flex-col sm:flex-row gap-2 items-center p-4">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>                              

                    <DataTable columns={columns} data={data} />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                    {/* Showing Rows Info */}
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing 1-10 of 150 rows
                    </p>

                    {/* Pagination */}
                    <div className="w-full sm:w-auto flex justify-center">
                        <PaginationLayout className="" />
                    </div>
                </div>  
            </div>
        </div>
    )
}

export default BudgetPlan;