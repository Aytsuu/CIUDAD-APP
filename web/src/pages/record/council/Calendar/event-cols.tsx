import type { EventDetailColumn } from "@/components/ui/calendar/EventCalendar"
import { format } from "date-fns";
import { CouncilEvent } from "./councilEventTypes";
import { SummonEvent } from "./summon-types";
import { formatTime } from "@/helpers/timeFormatter";
import { formatDate } from "@/helpers/dateHelper";

export const councilEventColumns: EventDetailColumn<CouncilEvent>[] = [
  { accessorKey: "ce_title", header: "Event Title" },
  { accessorKey: "ce_place", header: "Location" },
  { 
    accessorKey: "ce_date", 
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.ce_date), "MMM d, yyyy"),
  },
  { accessorKey: "ce_time", header: "Time" },
];

export const summonColumns: EventDetailColumn<SummonEvent>[] = [
  { accessorKey: "sc_code", header: "Case No." },
  { accessorKey: "hearing_date", header: "Hearing Date", cell: ({ row }) => formatDate(new Date(row.original.hearing_date), "long") },
  { accessorKey: "hearing_time", header: "Hearing Time", cell: ({ row }) => formatTime(row.original.hearing_time) },
  { 
    accessorKey: "complainant_names", 
    header: "Complainants",
    cell: ({ row }) => row.original.complainant_names?.join(", ") || "No complainants"
  },
  { 
    accessorKey: "accused_names", 
    header: "Accused",
    cell: ({ row }) => row.original.accused_names?.join(", ") || "No accused"
  },
  { accessorKey: "incident_type", header: "Incident Type" },
  { accessorKey: "hs_level", header: "Hearing Level" }  
];