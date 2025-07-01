import type { Hotspot } from "../waste-hotspot/queries/hotspotFetchQueries"
import type { EventDetailColumn } from "@/components/ui/calendar/EventCalendar"
import { type WasteCollectionSchedFull } from "../waste-colllection/queries/wasteColFetchQueries"
import { formatTime } from "@/helpers/timeFormatter"

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