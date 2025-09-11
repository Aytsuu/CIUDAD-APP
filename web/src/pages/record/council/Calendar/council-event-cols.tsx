import type { Hotspot } from "../../waste-scheduling/waste-hotspot/queries/hotspotFetchQueries"
import type { EventDetailColumn } from "@/components/ui/calendar/EventCalendar"
import { type WasteCollectionSchedFull } from "../../waste-scheduling/waste-collection/queries/wasteColFetchQueries"
import { formatTime } from "@/helpers/timeFormatter"
import { format } from "date-fns";
import { CouncilEvent } from "./councilEventTypes";

export const hotspotColumns: EventDetailColumn<Hotspot>[] = [
  { accessorKey: "watchman", header: "Watchman" },
  { accessorKey: "wh_date", header: "Assignment Date" },
  {
    accessorKey: "wh_start_time",
    header: "Start Time",
    cell: (props: { row: { original: Hotspot } }) => formatTime(props.row.original.wh_start_time),
  },
  {
    accessorKey: "wh_end_time",
    header: "End Time",
    cell: (props: { row: { original: Hotspot } }) => formatTime(props.row.original.wh_end_time),
  },
  { accessorKey: "sitio", header: "Sitio" },
  { accessorKey: "wh_add_info", header: "Additional Info" },
]

export const wasteColColumns: EventDetailColumn<WasteCollectionSchedFull>[] = [
  { accessorKey: "collectors_names", header: "Waste Collectors" },
  { accessorKey: "wc_date", header: "Collection Date" },
  {
    accessorKey: "wc_time",
    header: "Collection Time",
    cell: (props: { row: { original: WasteCollectionSchedFull } }) =>
      formatTime(props.row.original.wc_time),
  },
  { accessorKey: "driver_name", header: "Driver" },
  { accessorKey: "sitio_name", header: "Sitio" },
  { accessorKey: "wc_add_info", header: "Additional Info" },
];

export const councilEventColumns: EventDetailColumn<CouncilEvent>[] = [
  { accessorKey: "ce_title", header: "Event Title" },
  { accessorKey: "ce_place", header: "Location" },
  { 
    accessorKey: "ce_date", 
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.ce_date), "MMM d, yyyy"),
  },
  { accessorKey: "ce_time", header: "Time" },
  {
  accessorKey: "ce_type",
  header: "Type",
  cell: (props: { row: { original: { ce_type: string } } }) =>
    props.row.original.ce_type.charAt(0).toUpperCase() + props.row.original.ce_type.slice(1)
}
];