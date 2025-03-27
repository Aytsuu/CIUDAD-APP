// import { useState } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Input } from "@/components/ui/input";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, Trash, Eye, Search } from 'lucide-react';
// import { Label } from "@/components/ui/label";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import IncomeandExpenseCreateForm from "./treasurer-income-expense-tracker-create";
// import IncomeandExpenseEditForm from "./treasurer-income-expense-tracker-edit";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";

// export const columns: ColumnDef<IncomeExpense>[] = [
//     { 
//         accessorKey: "serialNo",
//         header: ({ column }) => (
//             <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//             >
//                 Serial No.
//                 <ArrowUpDown size={14}/>
//             </div>
//         ),
//         cell: ({row}) => (
//             <div className="text-center">{row.getValue("serialNo")}</div>
//         )
//     },
//     { 
//         accessorKey: "date",
//         header: ({ column }) => (
//             <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//             >
//                 Date
//                 <ArrowUpDown size={14}/>
//             </div>
//         ),
//         cell: ({row}) => (
//             <div className="text-center">{row.getValue("date")}</div>
//         )
//     },
//     { accessorKey: "particulars", header: "Particulars" },
//     { accessorKey: "amount", header: "Amount" },
//     { accessorKey: "entryType", header: "Entry Type" },
//     { accessorKey: "receiver", header: "Receiver" },
//     { accessorKey: "addNotes", header: "Additional Notes" },
//     { 
//         accessorKey: "actions", 
//         header: "Action", 
//         cell: ({}) => (
//             <div className="flex justify-center gap-2">
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Edit Entry"
//                             description="Update income or expense details to keep records accurate."
//                             mainContent={
//                                 <div className="max-h-[80vh] overflow-y-auto flex flex-col">
//                                     <IncomeandExpenseEditForm/>
//                                 </div>
//                             }
//                         />
//                     }  
//                     content="View"
//                 />
//                 <TooltipLayout 
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} 
//                         />
//                     }  
//                     content="Delete"
//                 />
//             </div>
//         )
//     }
// ];

// type IncomeExpense = {
//     serialNo: string,
//     date: string,
//     particulars: string,
//     amount: string,
//     entryType: "Income" | "Expense",
//     receiver: string,
//     addNotes: string,
// };

// export const IncomeExpenseRecords: IncomeExpense[] = [
//     {
//         serialNo: "12345",
//         date: 'MM/DD/YYYY',
//         particulars: 'Particulars',
//         amount: "0.00",
//         entryType: "Income",
//         receiver: 'Receiver',
//         addNotes: 'Additional Notes',
//     }
// ];

// function IncomeandExpenseTracking() {
//     const data = IncomeExpenseRecords;
//     const filter = [
//         { id: "All Entry Types", name: "All Entry Types" },
//         { id: "Income", name: "Income" },
//         { id: "Expense", name: "Expense" }
//     ];
//     const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

//     const filteredData = selectedFilter === "All Entry Types" 
//         ? data 
//         : data.filter((item) => item.entryType === selectedFilter);

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col gap-3 mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                     <div>Income and Expense Tracking</div>
//                 </h1>
//                 <p className="text-xs sm:text-sm text-darkGray">
//                     Gain clear insights into your finances by tracking income and expenses in real time.
//                 </p>
//             </div>
//             <hr className="border-gray mb-7 sm:mb-9" /> 

//             <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
//                     <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//                         <div className="relative flex-1"> {/* Increased max-width */}
//                             <Search
//                                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                                 size={17}
//                             />
//                             <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
//                         </div>
//                         <div className="flex flex-row gap-2 justify-center items-center">
//                             <Label>Filter: </Label>
//                             <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
//                         </div>                            
//                     </div>
//                     <DialogLayout
//                         trigger={<Button className="w-full sm:w-auto">+ New Entry</Button>}
//                         className="max-w-md"
//                         title="Add New Entry"
//                         description="Fill in the details for your entry."
//                         mainContent={
//                             <div className="w-full h-full">
//                                 <IncomeandExpenseCreateForm/>
//                             </div>
//                         }
//                     />
//             </div>

//             <div className="bg-white mb-2">
//                 <div className="flex flex-col sm:flex-row gap-2 items-center p-4">
//                     <p className="text-xs sm:text-sm">Show</p>
//                     <Input type="number" className="w-14 h-8" defaultValue="10" />
//                     <p className="text-xs sm:text-sm">Entries</p>
//                 </div>     
//                 <DataTable columns={columns} data={filteredData} />
//             </div>

//             <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//                 <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//                     Showing 1-10 of 150 rows
//                 </p>
//                 <div className="w-full sm:w-auto flex justify-center">
//                     <PaginationLayout className="" />
//                 </div>
//             </div>  
//         </div>
//     );
// }

// export default IncomeandExpenseTracking;





import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash, Eye, Search, FileInput } from 'lucide-react';
import { Label } from "@/components/ui/label";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import IncomeandExpenseCreateForm from "./treasurer-income-expense-tracker-create";
import IncomeandExpenseEditForm from "./treasurer-income-expense-tracker-edit";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";

export const columns: ColumnDef<IncomeExpense>[] = [
    { 
        accessorKey: "serialNo",
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
            <div className="text-center">{row.getValue("serialNo")}</div>
        )
    },
    { 
        accessorKey: "date",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({row}) => (
            <div className="text-center">{row.getValue("date")}</div>
        )
    },
    { accessorKey: "particulars", header: "Particulars" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "entryType", header: "Entry Type" },
    { accessorKey: "receiver", header: "Receiver" },
    { 
        accessorKey: "receipt", 
        header: "Receipt",
        cell: ({}) => (
            <div  className="flex justify-center"> 
                <DialogLayout
                    trigger={<div className="bg-white hover:bg-[#f3f2f2] cursor-pointer text-[#1273B8] text-[12px] underline"> View Receipt</div>}
                    className="max-w-[50%] h-2/3 flex flex-col"
                    title="Receipt"
                    description="Here are the details of receipt."
                    mainContent={
                        <div className="max-h-[80vh] flex flex-col">

                        </div>
                    }
                />
            </div>
        ) 

    },
    { 
        accessorKey: "actions", 
        header: "Action", 
        cell: ({}) => (
            <div className="flex justify-center gap-2">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                            className="max-w-[45%] max-h-[530px] overflow-auto p-10 verflow-y-auto"
                            title="Edit Entry"
                            description="Update income or expense details to keep records accurate."
                            mainContent={
                                <div className="flex flex-col">
                                    <IncomeandExpenseEditForm/>
                                </div>
                            }
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

type IncomeExpense = {
    serialNo: string,
    date: string,
    particulars: string,
    amount: string,
    entryType: "Income" | "Expense",
    receiver: string,
};

export const IncomeExpenseRecords: IncomeExpense[] = [
    {
        serialNo: "12345",
        date: 'MM/DD/YYYY',
        particulars: 'Particulars',
        amount: "0.00",
        entryType: "Income",
        receiver: 'Receiver'
    }
];

function IncomeandExpenseTracking() {
    const data = IncomeExpenseRecords;
    const filter = [
        { id: "All", name: "All" },
        { id: "Income", name: "Income" },
        { id: "Expense", name: "Expense" }
    ];
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    const filteredData = selectedFilter === "All" 
        ? data 
        : data.filter((item) => item.entryType === selectedFilter);

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Income and Expense Tracking</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Gain clear insights into your finances by tracking income and expenses in real time.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1"> {/* Increased max-width */}
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                        </div>
                        <div className="flex flex-row gap-2 justify-center items-center">
                            <Label>Filter: </Label>
                            <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="Entry Type" onChange={setSelectedFilter}></SelectLayout>
                        </div>                            
                    </div>
                    <DialogLayout
                        trigger={<div className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer"><Plus size={15} strokeWidth={3}></Plus>New Entry </div>}
                        className="max-w-md max-h-[530px] overflow-auto p-10"
                        title="Add New Entry"
                        description="Fill in the details for your entry."
                        mainContent={
                            <div className="w-full h-full">
                                <IncomeandExpenseCreateForm/>
                            </div>
                        }
                    />
            </div>

            <div className="bg-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>

                    <div>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                            <FileInput />
                            Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                            <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>                    
                    </div>
                </div>

                <DataTable columns={columns} data={filteredData}></DataTable>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing 1-10 of 150 rows
                </p>
                <div className="w-full sm:w-auto flex justify-center">
                    {/* <PaginationLayout className="" /> */}
                </div>
            </div>  
        </div>
    );
}

export default IncomeandExpenseTracking;