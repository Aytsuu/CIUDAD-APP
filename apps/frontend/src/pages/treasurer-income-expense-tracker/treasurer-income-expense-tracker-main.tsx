    import { useState } from "react";
    import { DataTable } from "@/components/ui/table/data-table";
    import { Input } from "@/components/ui/input";
    import DialogLayout from "@/components/ui/dialog/dialog-layout";
    import { SelectLayout } from "@/components/ui/select/select-layout";
    import { Button } from "@/components/ui/button";
    import { ColumnDef } from "@tanstack/react-table";
    import { ArrowUpDown} from "lucide-react";
    import { Trash } from 'lucide-react';
    import { Eye } from 'lucide-react';
    import { Label } from "@/components/ui/label";
    import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
    import IncomeandExpenseCreateForm from "./treasurer-income-expense-tracker-create";
    import IncomeandExpenseEditForm from "./treasurer-income-expense-tracker-edit";

    export const columns: ColumnDef<IncomeExpense>[] = [
        { accessorKey: "serialNo",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Serial No.
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="">{row.getValue("serialNo")}</div>
            )
        },
        { accessorKey: "date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >Date
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="">{row.getValue("date")}</div>
            ) },
        { accessorKey: "particulars", header: "Particulars" },
        { accessorKey: "amount", header: "Amount" },
        { accessorKey: "entryType", header: "Entry Type" },
        { accessorKey: "receiver", header: "Receiver" },
        { accessorKey: "addNotes", header: "Additional Notes" },
        { accessorKey: "actions", 
        header: "Action", 
        cell: ({}) =>(
            <div className="flex justify-center gap-2">
                <TooltipLayout
                trigger={
                    <DialogLayout
                                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                                className="max-w-[50%] h-2/3 flex flex-col"
                                title="Edit Entry"
                                description="Update income or expense details to keep records accurate."
                                mainContent={
                                    <div className="max-h-[80vh] overflow-y-auto flex flex-col">
                                        <IncomeandExpenseEditForm/>
                                    </div>
                                }
                    />
                }  content="View">
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

    type IncomeExpense ={
        serialNo: string,
        date: string,
        particulars: string,
        amount: string,
        entryType: "Income" | "Expense",
        receiver: string,
        addNotes: string,
    }

    export const IncomeExpenseRecords: IncomeExpense[] = [
        {
            serialNo: "12345",
            date: 'MM/DD/YYYY',
            particulars: 'Particulars',
            amount: "0.00",
            entryType: "Income",
            receiver: 'Receiver',
            addNotes: 'Additional Notes',
        }
    ]


    function IncomeandExpenseTracking() {
        
        const data = IncomeExpenseRecords;
        const filter = [
            {id: "0", name: "All Entry Types"},
            {id: "1", name: "Income"},
            {id: "2", name: "Expense"   }
        ]
        const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

        const filteredData = selectedFilter === "All Entry Types" 
        ? data 
        : data.filter((item) => item.entryType === selectedFilter);
        

        return (
            <div className="mx-4 mb-4 mt-10">
                <div className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">
                    <p>INCOME & EXPENSE TRACKER</p><br></br>
                </div> 
                <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                    <div className="mb-[1rem] flex flex-row items-center justify-between gap-2">
                        <div className="flex flex-row gap-2">
                            <Input className="w-[20rem]"placeholder="Search"></Input>
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <Label>Filter: </Label>
                                <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                            </div>                        </div>
                        <DialogLayout
                            trigger={<Button>+ New Entry</Button>}
                            className="max-w-md"
                            title="Add New Entry"
                            description="Fill in the details for your entry."
                            mainContent={
                            <div className="w-full h-full">
                                <IncomeandExpenseCreateForm/>
                            </div>
                            }
                        />
                    </div>
                    <DataTable columns={columns} data={filteredData} />
                </div>
            </div>
        );
    }

    export default IncomeandExpenseTracking;
