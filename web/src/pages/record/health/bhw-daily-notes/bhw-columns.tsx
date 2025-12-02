import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/helpers/dateHelper";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";

import { Eye } from "lucide-react";

type Note = {
   no: number;
   date: string;
   name: string;
   bhwdn_id: number | null;
}


export const noteColumns: ColumnDef<Note>[] = [
   {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div>{formatDate(row.original.date, 'long')}</div>
   },
   {
      accessorKey: "name",
      header: "Barangay Health Worker",
      cell: ({ row }) => (
         <div className="flex items-center justify-center">
            <div className="w-60 bg-blue-600 rounded-md text-white p-2">{row.original.name}</div>
         </div> 
      )
   },
   {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
         <div className="flex justify-center gap-2">
            <Link to={`/bhw/view/${row.original.bhwdn_id}`}>
               <Button variant="outline" title="View details">
                  <Eye size={16}/>
               </Button>
            </Link>
         </div>
      )
   }
]