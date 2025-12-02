import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { DataTable } from "@/components/ui/table/data-table"
import TableLoading from "@/components/ui/table-loading"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Input } from "@/components/ui/input"

import { calculateAge } from "@/helpers/ageCalculator"

import { useMaternalColumns } from "./columns/maternal-col"

import { useForwardedMaternal } from "../queries/fetch"


// main component
export default function ForwardedMaternal() {
   const [pageSize] = useState(10)
   const [currentPage, setCurrentPage] = useState(1)
   const [searchQuery, setSearchQuery] = useState("")
   const [debouncedSearch, setDebouncedSearch] = useState("")
   
   const { data: prenatalData, isLoading, error } = useForwardedMaternal(currentPage, pageSize, debouncedSearch)
   const columns = useMaternalColumns()
   const [transformedData, setTransformedData] = useState<any[]>([])

   // Debounce search query
   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedSearch(searchQuery)
         setCurrentPage(1) // Reset to first page when search changes
      }, 500)

      return () => {
         clearTimeout(handler)
      }
   }, [searchQuery])

   const handleSearch = (term: string) => {
      setSearchQuery(term)
   }

   useEffect(() => {
      if (prenatalData?.results) {
         const transformed = prenatalData.results.map((patient: any) => ({
            pat_id: patient.pat_id,
            lname: patient.personal_info?.per_lname || "N/A",
            fname: patient.personal_info?.per_fname || "N/A",
            mname: patient.personal_info?.per_mname || "",
            sex: patient.personal_info?.per_sex || "N/A",
            age: calculateAge(patient.personal_info?.per_dob),
            record: patient.patrec_type || "N/A",
            pat_type: patient.pat_type || "N/A",
            address: patient.address?.full_address || "N/A",
            originalData: patient
         }))
         setTransformedData(transformed)
      }
   }, [prenatalData])

   const totalCount = prenatalData?.count || 0
   const totalPages = Math.ceil(totalCount / pageSize)


   if (error) {
      return (
         <MainLayoutComponent 
            title="Forwarded Maternal Records" 
            description="View and manage forwarded maternal health records"
         >
            <div className="p-4">
               <div className="text-red-500 text-lg">Failed to load forwarded maternal records</div>
            </div>
         </MainLayoutComponent>
      )
   }

   return (
      <MainLayoutComponent 
         title="Forwarded Maternal Records" 
         description="View and manage forwarded maternal health records"
      >
         <div>
            <div className="bg-white flex w-full p-6 gap-x-2">
               <div className="relative w-1/4">
                  <Search
                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                     size={17}
                  />
                  <Input
                     placeholder="Search by name, id, or sitio..."
                     className="pl-10 w-full bg-white "
                     value={searchQuery}
                     onChange={(e) => handleSearch(e.target.value)}
                  />
               </div>
            </div>

            {isLoading ? (
               <div className="p-4">
                  <TableLoading />
               </div>
            ) : (
               <div className="bg-white border">
                  <DataTable columns={columns} data={transformedData} />
               </div>
            )}
            
            
            <div className="flex justify-end mt-4">
               <PaginationLayout 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
               />
            </div>
         </div>
      </MainLayoutComponent>
   )
}