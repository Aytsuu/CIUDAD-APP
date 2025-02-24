import { Button } from "@/components/ui/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import BlotterForm from "./blotter-form";

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

        <div className="w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-[80%] h-2/3 bg-white border border-gray rounded-[5px] flex flex-col">
                <div className="w-full flex flex-row justify-end p-5">
                    <DialogLayout
                        trigger={
                            <Label className="flex items-center pt-2.5 pb-2.5 pl-4 pr-4 bg-[#2563EB] text-white rounded-lg cursor-pointer hover:bg-[#2563EB]/90">
                                <Plus size={20}/> New Record
                            </Label>
                        }
                        className="max-w-[50%] h-[90%]"
                        title="Complaint Record"
                        description="Please fill all required fields (Type N/A if the information is not available for the specific field)"
                        mainContent={<BlotterForm/>}
                    />
                </div>
                <DataTable columns={columns} data={data} />
            </div>
        </div>

    );
}