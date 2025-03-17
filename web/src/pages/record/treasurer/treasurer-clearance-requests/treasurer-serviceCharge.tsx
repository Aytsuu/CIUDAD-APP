import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ReceiptText } from 'lucide-react';
import { Trash } from 'lucide-react';
import { Search } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ReceiptForm from "./treasurer-create-receipt-form";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";


export const columns: ColumnDef<ServiceCharge>[] = [
    { accessorKey: "caseNo",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Case No.
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("caseNo")}</div>
        )
    },
    {accessorKey: "name", header: "Name"},
    {accessorKey: "address1", header: "Address"},
    {accessorKey: "respondent", header: "Respondent Name"},
    {accessorKey: "address2", header: "Address"},
    {accessorKey: "reason", header: "Reason"},
    {accessorKey: "reqDate",
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
            <div className="">{row.getValue("reqDate")}</div>
        )
    },
    { accessorKey: "action", 
        header: "Action",
        cell: ({}) =>(
          <div className="flex justify-center gap-1">
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


type ServiceCharge ={
    caseNo: number,
    name: string,
    address1: string,
    respondent: string,
    address2: string,
    reason: string,
    reqDate: string,
};


export const ServiceChargeRecords: ServiceCharge[]= [
    {
        caseNo: 123456,
        name: "Name",
        address1: "Address",
        respondent: "Respondent Name",
        address2: "Respondent Address",
        reason: "Reason",
        reqDate: "MM-DD-YYYY"
    }
];


function ServiceCharge(){
    const data = ServiceChargeRecords;

    return(
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Service Charge Requests</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and process service charge requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="flex flex-col gap-5">
                <div className="relative flex-1 max-w-[20rem]"> {/* Adjust max-width as needed */}
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={17}
                    />
                    <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                </div>
               
                <div className="bg-white">
                    <div className="flex flex-col sm:flex-row gap-2 items-center p-4">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>        

                    <DataTable columns={columns} data={data}></DataTable>
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

export default ServiceCharge