import { ColumnDef } from "@tanstack/react-table"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import {Eye, Image} from "lucide-react"

export type CompletedRequest = {
    garb_id: string;
    garb_location: string;
    garb_requester: string;
    garb_waste_type: string;
    garb_created_at: string;
    dec_id: string;
    dec_date: string;
}

export const CompletedColumns: ColumnDef<CompletedRequest>[]=[
        { accessorKey: "garb_requester", header:"Requester"},
        { accessorKey: "garb_location", header: "Location"},
        { accessorKey: "garb_waste_type", header: "Waste Type"},
        { accessorKey: "garb_created_at", header: "Request Date"},
        { accessorKey: "dec_date", header: "Decision Date"},
        { 
            accessorKey: "actions", 
            header: "Action", 
            cell: ({row}) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                      trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Eye size={16} /></div> }
                      content="View Assignment"
                    />
                    <TooltipLayout
                        trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Image size={16} /></div> }
                        content="View Image"
                    />
                </div>
            )
        }
    ]
