import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/helpers/dateHelper";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";

import { Trash2, SquarePen, Eye } from "lucide-react";

type Note = {
   no: number;
   date: string;
   name: string;
   description: string;
}

const handleEdit = (no: number) => {
   console.log("Edit note with no:", no);
}
const handleDelete = (no: number) => {
   console.log("Delete note with no:", no);
}


export const noteColumns: ColumnDef<Note>[] = [
   {
      accessorKey: "date",
      header: "Date",
      // pass 'long' to formatDate to render a human-friendly string (e.g., October 1, 2023)
      cell: ({ row }) => <div>{formatDate(row.original.date, 'long')}</div>
   },
   {
      accessorKey: "name",
      header: "BHW Name",
      cell: ({ row }) => <div>{row.original.name}</div> 
   },
   {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div>{row.original.description}</div> 
   },
   {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
         <div className="flex justify-center gap-2">
            <Link to={`/bhw/form/`}>
               <Button variant="outline" onClick={() => handleEdit(row.original.no)}>
                  <Eye size={16}/>
               </Button>
            </Link>

            <Link to={`/bhw/form/`}>
               <Button variant="outline" onClick={() => handleEdit(row.original.no)}>
                  <SquarePen size={16}/>
               </Button>
            </Link>
            
            <Button className=" flex gap-1 bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(row.original.no)}>
               <Trash2 size={20}/>
            </Button>
         </div>
      )
   }
]