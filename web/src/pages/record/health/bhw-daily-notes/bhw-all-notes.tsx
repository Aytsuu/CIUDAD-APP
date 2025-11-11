"use client"

// react
import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";

// components
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";

import { noteColumns } from "./bhw-columns";

import { ProtectedComponent } from "@/ProtectedComponent";


interface NoteDiv {
      no: number;
      date: string;
      name: string;
   }
   
export default function BHWAllNotes() {

   const [searchTerm, setSearchTerm] = useState("");

   const bhwNames = ['Miranda, Saachi', 'Nakpil, Jordyn', 'Fallarco, Soleil', 'Castro, Morgan', 'Gonzaga, Merope'];
   
   const mockData: NoteDiv[] = [
      {
         no: 1,
         date: "2023-10-01",
         name: bhwNames[0],
      },
      {
         no: 2,
         date: "2023-10-02",
         name: bhwNames[1],
      },
      {
         no: 3,
         date: "2023-10-03",
         name: bhwNames[2],
      },
      {
         no: 4,
         date: "2023-10-03",
         name: bhwNames[3],
      },
      {
         no: 5,
         date: "2023-10-03",
         name: bhwNames[4],
      }
   ]

   // sort notes by date descending (newest first)
   const sortedNotes = [...mockData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

   return (
      <MainLayoutComponent 
         title="Daily Notes"
         description="Manage and view all barangay health workers daily notes"
      >
         <div className="w-full">
            <div className="bg-white p-4">
               <div className="flex flex-col md:flex-row gap-2 w-full justify-between">
                  {/*  */}
                  <div className="relative flex w-1/4">
                     <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={17}
                     />
                     <Input
                        placeholder="Search..."
                        className="pl-10 w-full bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <ProtectedComponent exclude={['ADMIN']}>
                  <Link to="/bhw/form">
                     <Button variant="default">
                        <Plus size={15} /> Create
                     </Button>
                  </Link>
                  </ProtectedComponent>
               </div>

               <div className="border rounded-md mt-4">
                  <DataTable columns={noteColumns} data={sortedNotes} />
               </div>
            </div>
         </div>
      </MainLayoutComponent>
   )
}