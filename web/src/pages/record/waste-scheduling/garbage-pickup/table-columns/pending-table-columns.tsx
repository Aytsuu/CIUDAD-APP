import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { ColumnDef } from "@tanstack/react-table"
import AcceptPickupRequest from "../accept-request-form"
import RejectPickupForm from "../reject-request-form"
import {CheckCircle, XCircle, Image} from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import type { GarbageRequest } from "../queries/GarbageRequestFetchQueries"


export const PendingColumns: ColumnDef<GarbageRequest>[]=[
        { accessorKey: "garb_requester", header:"Requester"},
        { accessorKey: "garb_location", header: "Location"},
        { accessorKey: "garb_waste_type", header: "Waste Type"},
        { accessorKey: "garb_pref_date", header: "Preferred Date"},
        { accessorKey: "garb_pref_time", header: "Preferred Time"},
        { accessorKey: "garb_created_at", header: "Request Date"},
        { accessorKey: "garb_additional_notes", header: "Additional Notes"},
        { 
            accessorKey: "actions", 
            header: "Action", 
            cell: ({row}) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                      trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Image size={16} /></div> }
                      content="View Image"
                    />
                    <TooltipLayout
                      trigger={
                        <div>
                            <DialogLayout
                                trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <CheckCircle size={16} /></div> }
                                title="Schedule & Assign for Pickup"
                                description="Set date, time, team and vehicle for garbage pickup."  
                                mainContent={
                                    <AcceptPickupRequest/>
                                }
                            />
                        </div>
                    }
                      content="Accept"
                    />
                    <TooltipLayout
                      trigger={
                        <div>
                           <DialogLayout
                                title="Confirm Rejection"
                                trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center" > <XCircle size={16} /></div>}
                                description="Reject the selected garbage pickup request. A reason is required before confirming this action."
                                mainContent={
                                    <RejectPickupForm/>
                                }
                            />
                        </div>
                    }
                      content="Reject"
                    />
                </div>
            )
        }
    ]
