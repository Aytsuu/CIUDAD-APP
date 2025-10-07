"use client"

// react
import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";

// components
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";

interface NoteDiv {
      date: string;
      description: string;
   }
   
export default function BHWAllNotes() {

   const [searchTerm, setSearchTerm] = useState("");

   const dateString = (date:string) => {
      return new Date(date).toLocaleDateString('en-PH', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      })
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
               <Link to="/bhw/form">
                  <Button variant="default">
                     <Plus size={15} /> Create
                  </Button>
               </Link>
            </div>
            
            <div>
               {mockData.map((note, index) => (
                  <div key={index} className="border border-gray-300 p-4 rounded-lg mt-4">
                     <div className="font-semibold">{dateString(note.date)}</div>
                     <div className="text-gray-600">{note.description}</div>
                  </div>
               ))}
            </div>
         </div>
      </LayoutWithBack>
   )
}