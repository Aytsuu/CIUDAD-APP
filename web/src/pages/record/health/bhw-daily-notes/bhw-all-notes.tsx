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


interface NoteDiv {
      no: number;
      date: string;
      description: string;
   }
   
export default function BHWAllNotes() {

   const [searchTerm, setSearchTerm] = useState("");

   const mockData: NoteDiv[] = [
      {
         no: 1,
         date: "2023-10-01",
         description: "Note content for October 1st"
      },
      {
         no: 2,
         date: "2023-10-02",
         description: "Note content for October 2nd"
      },
      {
         no: 3,
         date: "2023-10-03",
         description: "Note content for October 3rd"
      }
   ]

   // sort notes by date descending (newest first)
   const sortedNotes = [...mockData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

   return (
      <MainLayoutComponent 
         title="Daily Notes"
         description="Manage and view all daily notes"
      >
         <div className="w-full">
            <div className="flex flex-col md:flex-row gap-2 w-full">
               {/*  */}
               <div className="relative flex-1">
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
               <Link to="/bhw/form">
                  <Button variant="default">
                     <Plus size={15} /> Create
                  </Button>
               </Link>
            </div>

            <div className="bg-white mt-4 p-2">
               <div className="border rounded-md">
                  <DataTable columns={noteColumns} data={sortedNotes} />
               </div>
            </div>
         </div>
      </MainLayoutComponent>
   )
}