import { ColumnDef } from "@tanstack/react-table";
import { AllRecordCombined } from "./ProfilingTypes";

export const allRecordColumns: ColumnDef<AllRecordCombined>[] = [
  {
    accessorKey: 'lname',
    header: 'Last Name'
  },
  {
    accessorKey: 'fname',
    header: 'First Name'
  },
  {
    accessorKey: 'mname',
    header: 'Middle Name'
  },

]