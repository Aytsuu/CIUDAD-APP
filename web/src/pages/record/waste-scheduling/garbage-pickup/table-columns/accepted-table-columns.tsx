import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { ColumnDef } from "@tanstack/react-table"
import {Check, Eye, Image} from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"


export type AcceptedRequest = {
    garb_id: string;
    garb_location: string;
    garb_requester: string;
    garb_waste_type: string;
    garb_created_at: string;
    dec_id: string;
    dec_date: string;
}

export const AcceptedColumns: ColumnDef<AcceptedRequest>[]=[
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
                    <TooltipLayout
                      trigger={
                        <div>
                            {/* <DialogLayout
                                trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <CheckCircle size={16} /></div> }
                                title="Schedule & Assign for Pickup"
                                description="Set date, time, team and vehicle for garbage pickup."  
                                mainContent={
                                    <AcceptPickupRequest/>
                                }
                            /> */}
                            <ConfirmationModal
                                trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <Check size={16} /></div> }
                                title="Confirmation"
                                description="Would you like to confirm that the pickup has been done?"
                                actionLabel="Confirm"
                            />
                        </div>
                    }
                      content="Confirm"
                    />
                </div>
            )
        }
    ]
