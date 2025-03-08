import { DataTable } from "@/components/ui/table/data-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ReceiptText, Trash, ArrowUpDown, Search, FileInput  } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import BarangayServiceForm from "./treasurer-barangayService-form";
import ReceiptForm from "./treasurer-create-receipt-form";
import { Label } from "@/components/ui/label";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem} from "@/components/ui/dropdown/dropdown-menu";

export const columns: ColumnDef<BarangayService>[] = [
    { accessorKey: "fname", header: "Firstname" },
    { accessorKey: "lname", header: "Lastname" },
    { accessorKey: "paymentMethod", header: "Payment Method" },
    { accessorKey: "paymentStat", header: "Payment Status" },
    { 
        accessorKey: "reqDate",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date Requested
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({row}) => (
            <div className="text-center">{row.getValue("reqDate")}</div>
        )
    },
    { 
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => row.original.purposes.join(", ") // Convert array to string
    },
    { accessorKey: "receipt", header: "Receipt" },
    { 
        accessorKey: "action", 
        header: "Action",
        cell: ({}) => (
            <div className="flex justify-center gap-0.5">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                            className="flex flex-col"
                            title="Create Receipt"
                            description="Enter the serial number to generate a receipt."
                            mainContent={<ReceiptForm/>} 
                        />
                    } 
                    content="Create Receipt"
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

type BarangayService = {
    fname: string,
    lname: string,
    paymentMethod: string,
    paymentStat: "Paid" | "Pending",
    reqDate: string,
    purposes: string[],
    receipt: string,
};

export const BarangayServiceRecords: BarangayService[] = [
    {
        fname: "Firstname",
        lname: "Lastname",
        paymentMethod: "Method of Payment",
        paymentStat: "Paid",
        reqDate: "MM-DD-YYYY",
        purposes: ["Purpose"],
        receipt: "Receipt"
    }
];

function BarangayService() {
    const data = BarangayServiceRecords;
    const filter = [
        { id: "All", name: "All" },
        { id: "Pending", name: "Pending" },
        { id: "Paid", name: "Paid" },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    const filteredData = selectedFilter === "All" ? data 
    : data.filter((item) => item.paymentStat === selectedFilter);

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Barangay Service Requests</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                Create, manage, and process barangay service requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
                            <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="Payment Status" onChange={setSelectedFilter}></SelectLayout>
                        </div>                            
                    </div>

                    <div className="w-full sm:w-auto">
                        <DialogLayout
                            trigger={<Button className="w-full sm:w-auto">+ Create Request</Button>}
                            className=""
                            title="Create New Request"
                            description="Create new request for barangay service."
                            mainContent={
                                <div className="w-full h-full">
                                    <BarangayServiceForm/>
                                </div>
                            }
                        />
                    </div>
                </div>

                <div className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
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

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing 1-10 of 150 rows
                    </p>

                    <div className="w-full sm:w-auto flex justify-center">
                        <PaginationLayout className="" />
                    </div>
                </div>  
            </div>
        </div>
    )
}

export default BarangayService;