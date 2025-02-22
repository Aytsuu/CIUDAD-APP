import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ReceiptText } from 'lucide-react';
import { Trash } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";


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
          <div className="flex justify-center gap-0.5">
              <TooltipLayout
              trigger={
                  <DialogLayout
                  trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                      className="max-w-[50%] h-2/3 flex flex-col"
                      title="Image Details"
                      description="Here is the image related to the report."
                      mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto"/>}
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
        <div className="mx-4 mb-4 mt-10">
            <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-row gap-2">
                        <Input className="w-[20rem]" placeholder="Search" />
                    </div>
                    <DataTable columns={columns} data={data}/>
                </div>
            </div>
        </div>
    )


}

export default ServiceCharge