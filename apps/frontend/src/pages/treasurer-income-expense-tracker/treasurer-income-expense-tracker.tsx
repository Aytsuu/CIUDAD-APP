import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown} from "lucide-react";
import { Trash } from 'lucide-react';
import { Pencil } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";

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
    { accessorKey: "receiver", header: "Receiver" },
    { accessorKey: "addNotes", header: "Additional Notes" },
    { accessorKey: "actions", 
      header: "Action", 
      cell: ({}) =>(
        <div className="flex justify-center gap-2">
            <TooltipLayout
             trigger={
                <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
                />
             }  content="Update">
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
    serialNo: number,
    date: string,
    particulars: string,
    amount: number,
    receiver: string,
    addNotes: string,
}

export const IncomeExpenseRecords: IncomeExpense[] = [
    {
        serialNo: 12345,
        date: 'MM/DD/YYYY',
        particulars: 'Particulars',
        amount: 0.00,
        receiver: 'Receiver',
        addNotes: 'Additional Notes',
    }
]

function IncomeandExpenseTracking() {
    const data = IncomeExpenseRecords;
    const entrytype = [
        { id: "0", name: "Income"},
        { id: "1", name: "Expense"}
    ];

    const filter = [
        {id: "0", name: "All"},
        {id: "1", name: "Income"},
        {id: "2", name: "Expense"   }
    ]

    const [selectedEntry, setSelectedEntry] = useState("");
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);


    return (
        <div className="mx-4 mb-4 mt-10">
            <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <div className="mb-[1rem] flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-row gap-2">
                        <Input className="w-[20rem]"placeholder="Search"></Input>
                        <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                    </div>
                    <DialogLayout
                        trigger={<Button>+ New Entry</Button>}
                        className="max-w-md"
                        title="Add New Entry"
                        description="Fill in the details for your entry."
                        mainContent={
                            <div>
                                <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Serial No.</Label>
                                <Input placeholder="e.g.(123456)"type="number" />

                                <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Type of Entry</Label>
                                <SelectLayout className="w-full" label="" placeholder="Entry Type" options={entrytype} value={selectedEntry} onChange={setSelectedEntry} />

                                <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Particulars</Label>
                                <Input placeholder="e.g.(Utilities Expense)" type="text" />

                                <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Amount</Label>
                                <Input placeholder="0.00" type="number" />

                                <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Receiver</Label>
                                <Input placeholder="e.g.(Hesus Dimagiba)" type="text" />

                                <Label className="block text-sm font-medium mt-[20px] mb-[5px]">Additional Notes</Label>
                                <textarea placeholder="Optional" className="w-full border border-gray-300 p-2 rounded-md"></textarea>

                                <div className="flex justify-end mt-[20px]">
                                <Button>Save Entry</Button>       
                                </div>                   
                            </div>
                        }
                    />
                </div>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    );
}

export default IncomeandExpenseTracking;
