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
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/AuthContext";

import { ProtectedComponent } from "@/ProtectedComponent";

import { noteColumns } from "./bhw-columns";
import BHWStaffList from "./bdn-staff-list";

import { useBHWStaffWithNotes } from "./queries/Fetch";

interface NoteRow {
   no: number;
   date: string;
   name: string;
   bhwdn_id: number | null;
}
   
export default function BHWAllNotes() {

   const [searchTerm, setSearchTerm] = useState("");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);

   const debouncedSearchTerm = useDebounce(searchTerm, 300);
   
   const { data: bhwNotesData, isLoading } = useBHWStaffWithNotes(page, pageSize, debouncedSearchTerm);

   const staffAuth = useAuth();
   const staffUserId = staffAuth.user?.staff?.staff_id;
   const staffPositionTitle = staffAuth.user?.staff?.pos?.pos_title; 

   // Filter according to role logic
   const allResults = bhwNotesData?.results || [];
   const filteredResults = staffPositionTitle === 'ADMIN'
      ? allResults
      : staffPositionTitle === 'BARANGAY HEALTH WORKERS'
         ? allResults.filter((r:any) => r.staff_id === staffUserId)
         : allResults;

   const displayCount = filteredResults.length; 
   const totalPages = Math.ceil((bhwNotesData?.count || 0) / pageSize);

   // searching and pagination handlers
   const handlePageChange = (newPage: number) => {
      setPage(newPage);
   }

   const handlePageSizeChange = (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
   }

    const handleSearch = (search: string) => {
       setSearchTerm(search);
       setPage(1);
    };
   
   // Flatten each staff's daily notes into separate table rows
   const tableData: NoteRow[] = [];
   filteredResults.forEach((staffEntry: any) => {
      const per = staffEntry?.rp?.per;
      const name = per ? `${per.per_lname}, ${per.per_fname}` : staffEntry.staff_id;
      const notes: any[] = staffEntry?.daily_notes || [];
      // If no notes, still show placeholder row? Skip if we only want notes.
      if (notes.length === 0) return;
      notes.forEach((note) => {
         const rawDate = note?.created_at || null;
         let date = 'N/A';
         if (rawDate) {
            try {
               const d = new Date(rawDate);
               if (!isNaN(d.getTime())) date = d.toISOString();
            } catch {}
         }
         tableData.push({
            no: tableData.length + 1,
            date,
            name,
            bhwdn_id: note?.bhwdn_id ?? null,
         });
      });
   });

   const sortedTableData = [...tableData].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return db - da;
   });

   return (
      <MainLayoutComponent 
         title="Daily Notes"
         description="Manage and view all barangay health workers daily notes"
      >
         <div className="w-full">
            <div className="shadow-sm">
               <BHWStaffList />
            </div>
            <div className="bg-white p-4 mt-4">
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
                        onChange={(e) => handleSearch(e.target.value)}
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
                     <DataTable columns={noteColumns} data={sortedTableData} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 border-t">
                     {/* Showing Rows Info */}
                     <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        {isLoading ? 'Loading...' : (
                           displayCount === 0
                           ? 'No records found'
                           : `Showing ${((page - 1) * pageSize) + 1}-${Math.min(page * pageSize, (bhwNotesData?.count || 0))} of ${bhwNotesData?.count} rows${staffPositionTitle === 'BARANGAY HEALTH WORKERS' ? ' (filtered to your own records)' : ''}`
                        )}

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