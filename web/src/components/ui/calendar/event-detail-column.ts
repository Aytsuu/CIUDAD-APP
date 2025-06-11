import { ColumnDef } from "@tanstack/react-table";

export type EventDetailColumn<TData> = ColumnDef<TData> & {
  accessorKey: string;
  header: string;
  cell?: (props: { row: { original: TData } }) => React.ReactNode;
};
