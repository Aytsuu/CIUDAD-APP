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
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

import { noteColumns } from "./bhw-columns";

import { ProtectedComponent } from "@/ProtectedComponent";


interface NoteDiv {
      no: number;
      date: string;
      name: string;
   }
   
export default function BHWAllNotes() {

   const [searchTerm, setSearchTerm] = useState("");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);


   const bhwNames = ['Miranda, Saachi', 'Nakpil, Jordyn', 'Fallarco, Soleil', 'Castro, Morgan', 'Gonzaga, Merope'];

   const handlePageChange = (newPage: number) => {
      setPage(newPage);
   }

   const handlePageSizeChange = (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
   }
   
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

   const totalPages = 0

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

               <div className="border rounded-md mt-5">
                  <div className="flex gap-x-2 items-center p-4">
                     <p className="text-xs sm:text-sm">Show</p>
                     <Input
                        type="number"
                        className="w-14 h-6"
                        defaultValue={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                     />
                     <p className="text-xs sm:text-sm">Entries</p>
                  </div>

                  <div className="mt-2">
                     <DataTable columns={noteColumns} data={sortedNotes} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 border-t">
                     {/* Showing Rows Info */}
                     <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing 0 of 0 rows
                     </p>
         
                     {/* Pagination */}
                     <div className="w-full sm:w-auto flex justify-center">
                        {totalPages >= 0 && (
                           <PaginationLayout
                           currentPage={page}
                           totalPages={totalPages}
                           onPageChange={handlePageChange}
                           />
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </MainLayoutComponent>
   )
}