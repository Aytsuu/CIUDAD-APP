import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Eye } from 'lucide-react';
import { ReceiptText } from 'lucide-react';
import { Trash } from 'lucide-react';
import { useState } from "react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import PersonalClearanceForm from "./treasurer-personalClearance-form";
import ReceiptForm from "./treasurer-create-receipt-form";


const styles = {
    ViewFormLabelStyle: "font-semibold text-blue",
    ViewFormDataStyle: "font-medium text-darkGray"
}

export const columns: ColumnDef<PersonalClearance>[] = [
    { accessorKey:"fname", header: "Firstname"},
    { accessorKey: "lname", header: "Lastname"},
    { accessorKey: "purposes", header: "Purpose"},
    {  accessorKey: "reqDate",
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
        )},
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
        )},
    { accessorKey: "payStat", header: "Payment Status"},
    { accessorKey: "action", 
      header: "Action",
      cell: ({}) => (
        <div className="flex justify-center gap-1">
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
                            <Label className={styles.ViewFormLabelStyle}>Requestor:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                            <Label className={styles.ViewFormLabelStyle}>Purpose:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                            <Label className={styles.ViewFormLabelStyle}>Date Requested:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                            <Label className={styles.ViewFormLabelStyle}>Date to Claim:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className={styles.ViewFormLabelStyle}>Payment Method:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                            <Label className={styles.ViewFormLabelStyle}>Payment Status:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>

                            <Label className={styles.ViewFormLabelStyle}>Attached Receipt:</Label>
                            <Label className={styles.ViewFormDataStyle}>Lorem Ipsum</Label>
                        </div>
                    </div>
             } />
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
      )}
];

type PersonalClearance = {
    fname: string,
    lname: string,
    purposes: string[],
    reqDate: string,
    claimDate: string,
    payStat: string
}


   export const PersonalClearanceRecords: PersonalClearance[] = [
        {
            fname: "Firstname",
            lname: "Lastname",
            purposes: ["Purpose"],
            reqDate: "MM-DD-YYYY",
            claimDate: "MM-DD-YYYY",
            payStat: "Status",
        },
    ];



function PersonalClearance(){
    const data = PersonalClearanceRecords;
    const filter = [
        { id: "0", name: "All" },
        { id: "1", name: "Pending" },
        { id: "2", name: "Paid" },
    ];
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    return (
            <div className="mx-4 mb-4 mt-10">
                <div className="bg-white border border-gray-300 rounded-[5px] p-5">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-row gap-2">
                                <Input className="w-[20rem]" placeholder="Search" />
                                <SelectLayout className="" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                            </div>
                            <div>
                                <DialogLayout
                                    trigger={<Button>+ Create Request</Button>}
                                    className=""
                                    title="Create New Request"
                                    description="Create a new request for personal clearance."
                                    mainContent={
                                       <div className="w-full h-full">
                                          <PersonalClearanceForm/>
                                       </div>
                                    }
                                />
                            </div>
                        </div>
                        <DataTable columns={columns} data={data} />
                    </div>
                </div>
            </div>
        );
    
};
export default PersonalClearance;
