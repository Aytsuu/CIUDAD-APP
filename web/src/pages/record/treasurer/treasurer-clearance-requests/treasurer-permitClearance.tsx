import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { Eye } from 'lucide-react';
import { ReceiptText } from 'lucide-react';
import { Trash } from 'lucide-react';
import { Search } from 'lucide-react';
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import PermitClearanceForm from "./treasurer-permitClearance-form";
import ReceiptForm from "./treasurer-create-receipt-form";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";


const styles = {
    ViewFormLabelStyle: "font-semibold text-blue",
    ViewFormDataStyle: "font-medium text-darkGray"
}

//table header
export const columns: ColumnDef<PermitClearance>[] = [
    { accessorKey: "businessName",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Business Name
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("businessName")}</div>
        )},
    { accessorKey: "address", header: "Address"},
    { accessorKey: "grossSales", header: "Gross Sales"},
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => row.original.purposes.join(", ") // Convert array to string
      },
    { accessorKey: "requestor", header: "Requestor"},
    { accessorKey: "reqDate",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date Requested
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("reqDate")}</div>
        )
    },
    {  accessorKey: "claimDate",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date to Claim
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("claimDate")}</div>
        )
    },
    { accessorKey: "paymentStat", header: "Payment Status"},
    { accessorKey: "action", 
      header: "Action",
      cell: ({}) =>(
        <div className="flex justify-center gap-0.5">
            <TooltipLayout 
            trigger = {
                <DialogLayout
                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                className="max-w-[50%] h-2/3 flex flex-col"
                title="Request Details"
                description="Detailed overview of the request."
                mainContent={
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-3">
                        <Label className={styles.ViewFormLabelStyle}>Business Name:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Address:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Annual Gross Sales:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Supporting Document:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Purpose:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>
                    </div>

                    {/* Divider */}
                    {/* <div className="border border-gray-300"></div> */}

                    {/* Request Details */}
                    <div className="flex flex-col gap-3">
                        <Label className={styles.ViewFormLabelStyle}>Requestor:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Date Requested:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Date to Claim:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Payment Method:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Payment Status:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                        <Label className={styles.ViewFormLabelStyle}>Attached Receipt:</Label>
                        <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>
                    </div>
                </div>
                } 
                />
            } content="View">
            </TooltipLayout>
            <TooltipLayout
            trigger={
                <DialogLayout
                    trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                    className="flex flex-col"
                    title="Create Receipt"
                    description="Enter the serial number to generate a receipt."
                    mainContent={
                        <ReceiptForm/>
                    } 
                />
            } content="Create Receipt">
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
      )},
];


type PermitClearance = {
    businessName: string,
    address: string,
    grossSales: string,
    purposes: string[],
    requestor: string,
    reqDate: string,
    claimDate: string,
    paymentStat: "Paid" | "Pending"
}

export const PermitClearanceRecords: PermitClearance[] = [
    {
        businessName: "Business Name",
        address: "Address",
        grossSales: "0.00",
        purposes: ["Lorem Ipsum"], 
        requestor: "Requestor",
        reqDate: "MM-DD-YYYY",
        claimDate: "MM-DD-YYYY",
        paymentStat: "Pending"
    },

]


function PermitClearance(){
    const data = PermitClearanceRecords;
    const filter = [
        { id: "All Payment Status", name: "All Payment Status" },
        { id: "Pending", name: "Pending" },
        { id: "Paid", name: "Paid" },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name)

    const filteredData = selectedFilter === "All Payment Status" ? data 
    : data.filter((item) => item.paymentStat === selectedFilter);
    

    
    return(
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Permit Clearance Requests</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Create, manage, and process permit clearance requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row justify-between items-center">
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
                            <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                        </div>                            
                    </div>
                    <div className="w-full sm:w-auto">
                        <DialogLayout
                            trigger={<Button className="w-full sm:w-auto">+ Create Request</Button>}
                            className=""
                            title="Create New Request"
                            description="Create a new request for personal clearance."
                            mainContent={
                                <div className="w-full h-full">
                                    <PermitClearanceForm/>
                                </div>
                            }
                        />
                    </div>
                </div>

                <div className="bg-white">
                    <div className="flex flex-col sm:flex-row gap-2 items-center p-4">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
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

export default PermitClearance