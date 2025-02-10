import DialogLayout from "@/components/ui/dialog/dialog-layout"
import DRRReportForm from "./drr-report-form"
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

type Report = {
    id: string
    category: string
    location: string
    description: string
    incidentTime: string
    reportedBy: string
    timeReported: string
    date: string
}

export const columns: ColumnDef<Report>[] = [
    {
        accessorKey: "category",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Category
                <ArrowUpDown size={15}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="capitalize">{row.getValue("category")}</div>
        )
    },
    {
        accessorKey: "location",
        header: "Location",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "incidentTime",
        header: "Time of Incident",
    },
    {
        accessorKey: "reportedBy",
        header: "Reported By",
    },
    {
        accessorKey: "timeReported",
        header: "Time Reported",
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({row}) => (
            <DialogLayout   
                trigger={
                    <div className="w-[50px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]"> 
                        View 
                    </div>
                }
                className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col"
                title="Report Details"
                description="This report was received on 9th of July, 2025. Please respond accordingly."
                mainContent={<DRRReportForm />}
            /> 
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

export const reports: Report[] = [
    {
        id: "Lorem",
        category: "Lorem", 
        location: "Lorem",
        description: "Lorem", 
        incidentTime: "Lorem",
        reportedBy: "Lorem", 
        timeReported: "Lorem", 
        date: "Lorem"
    },
    {
        id: "Lorem",
        category: "Aorem", 
        location: "Lorem",
        description: "Lorem", 
        incidentTime: "Lorem",
        reportedBy: "Lorem", 
        timeReported: "Lorem", 
        date: "Lorem"
    },
]

export default function DRRResidentReport(){

    const data = reports;

    
    return (
        <div className="w-screen h-screen bg-snow flex justify-center items-center p-4 sm:p-0">
            <div className="w-full sm:w-[80%] h-full sm:h-2/3 bg-white border border-gray p-3 rounded-[5px]">
                <DataTable columns={columns} data={data} />
            </div>
        </div>

    )
}
