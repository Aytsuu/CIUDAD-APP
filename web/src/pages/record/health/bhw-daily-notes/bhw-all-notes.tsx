"use client"

// react
import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";

// components
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";


export default function BHWAllNotes() {

   const [searchTerm, setSearchTerm] = useState("");

   interface NoteDiv {
      date: string;
      description: string;
   }

   const mockData: NoteDiv[] = [
      {
         date: "2023-10-01",
         description: "Note content for October 1st"
      },
      {
         date: "2023-10-02",
         description: "Note content for October 2nd"
      },
      {
         date: "2023-10-03",
         description: "Note content for October 3rd"
      }
   ]

   return (
      <LayoutWithBack 
         title="BHW Daily Notes"
         description="Manage and view all BHW daily notes"
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
               <Link to="/bhw-note-form">
                  <Button variant="default">
                     <Plus size={15} /> Create
                  </Button>
               </Link>
            </div>
         </div>
      </LayoutWithBack>
   )
}