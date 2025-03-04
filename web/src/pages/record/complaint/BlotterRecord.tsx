import { Button } from "@/components/ui/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import BlotterForm from "./BlotterForm";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

type Record = {
    complaintNo: string
    complainantName: string
    complainantAddress: string
    accusedName: string
    accusedAddress: string
    incidentDate: string
    dateSubmitted: string
}

const columns: ColumnDef<Record>[] = [
    {
        accessorKey: 'complaintNo',
        header: 'Complaint No.'
    },
    {
        accessorKey: 'complainantName',
        header: 'Complainant Name'
    },
    {
        accessorKey: 'complainantAddress',
        header: 'Complainant Address'
    },
    {
        accessorKey: 'accusedName',
        header: 'Accused Name'
    },
    {
        accessorKey: 'accusedAddress',
        header: 'Accused Address'
    },
    {
        accessorKey: 'incidentDate',
        header: 'Incident Date'
    },
    {
        accessorKey: 'dateSubmitted',
        header: 'Date Submitted'
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({row}) => (
            <Button variant={"outline"}>View</Button>
        )
    }
]

const records: Record[] = [
    {
        complaintNo: 'Lorem',
        complainantName: 'Lorem',
        complainantAddress: 'Lorem',
        accusedName: 'Lorem',
        accusedAddress: 'Lorem',
        incidentDate: 'Lorem',
        dateSubmitted: 'Lorem',
    }
]

export default function BlotterRecord(){
    const data = records
    return(
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col justify-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                Resident Records
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                Manage and view resident information
                </p>
            </div>

            <hr className="border-gray mb-6 sm:mb-8" />

            {/* Search and filters - Stacks on mobile */}
            <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
                <div className="flex gap-x-2">
                    <div className="relative flex-1 bg-white">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input placeholder="Search..." className="pl-10 w-72" />
                    </div>
                    <SelectLayout 
                        placeholder="Filter by"
                        label=""
                        className="bg-white"
                        options={[]}
                        value=""
                        onChange={() => {}}
                    />
                </div>
                <DialogLayout
                    trigger={
                        <Label className="flex items-center gap-1 py-2 px-4 bg-[#2563EB] text-white rounded-lg cursor-pointer hover:bg-[#2563EB]/90">
                            <Plus size={20}/> New Record
                        </Label>
                    }
                    className="max-w-[50%]"
                    title="Complaint Record"
                    description="Please fill all required fields (Type N/A if the information is not available for the specific field)"
                    mainContent={<BlotterForm/>}
                />
            </div>
            
            <div className="w-full flex flex-col">
                <div className="w-full h-auto bg-white flex p-3">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>
                
                <div className="bg-white">
                    <DataTable columns={columns} data={data} />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                {/* Showing Rows Info */}
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                Showing 1-10 of 150 rows
                </p>
    
                {/* Pagination */}
                <div className="w-full sm:w-auto flex justify-center">
                <PaginationLayout />
                </div>
            </div>
        </div>
    );
}