import { ColumnDef } from "@tanstack/react-table"



export type RejectedRequest = {
    garb_id: string;
    garb_location: string;
    garb_requester: string;
    garb_waste_type: string;
    garb_created_at: string;
    dec_id: string;
    dec_date: string;
    dec_reason: string;
}

export const RejectedColumns: ColumnDef<RejectedRequest>[]=[
        { accessorKey: "garb_requester", header:"Requester"},
        { accessorKey: "garb_location", header: "Location"},
        { accessorKey: "garb_waste_type", header: "Waste Type"},
        { accessorKey: "garb_created_at", header: "Request Date"},
        { accessorKey: "dec_reason", header: "Rejection Reason"},
        { accessorKey: "dec_date", header: "Decision Date"},
    ]
