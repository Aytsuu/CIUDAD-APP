import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Trash, Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useWasteReport, type WasteReport } from "./queries/waste-ReportGetQueries";


interface WasteReportDetailsProps{
    rep_id: number;
    rep_image: string;
    rep_matter: string;
    rep_location: string;
    rep_add_details: string;
    rep_violator: string;
    rep_complainant: string;
    rep_contact: string;
    rep_status: string;
    rep_date: string;
    rep_date_resolved: string;
}


function WasteIllegalDumpingDetails({rep_id, rep_image, rep_matter, rep_location, rep_add_details, rep_date, rep_contact} : WasteReportDetailsProps) {

    <div className="w-full h-full">
        <div>
            <label>{rep_id}</label>
        </div>
    </div>
  
}

export default WasteIllegalDumpingDetails;
