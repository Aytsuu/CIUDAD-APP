import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/helpers/dateHelper";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";

import { Trash2, Eye } from "lucide-react";
import { ProtectedComponent } from "@/ProtectedComponent";

type Note = {
   no: number;
   date: string;
   name: string;
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
            <Link to={`/bhw/form/`}>
               <Button variant="outline" onClick={() => handleEdit(row.original.no)}>
                  <Eye size={16}/>
               </Button>
            </Link>
            
            <ProtectedComponent exclude={['ADMIN']}>
               <Button className=" flex gap-1 bg-red-500 text-white hover:bg-red-600" onClick={() => handleDelete(row.original.no)}>
                  <Trash2 size={20}/>
               </Button>
            </ProtectedComponent>
         </div>
      )
   }
]