// import { ColumnDef } from "@tanstack/react-table";

// This extends ColumnDef and ensures `accessorKey` is always present as a string.
// export type EventDetailColumn<TData> = ColumnDef<TData> & {
//   accessorKey: string;
// };
// src/components/ui/calendar/event-detail-column.ts
import { ColumnDef } from "@tanstack/react-table";

export type EventDetailColumn<TData> = ColumnDef<TData> & {
  accessorKey: string;
  header: string;
  cell?: (props: { row: { original: TData } }) => React.ReactNode;
};
