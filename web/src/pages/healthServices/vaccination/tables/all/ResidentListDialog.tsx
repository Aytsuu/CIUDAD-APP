"use client"

import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { UnvaccinatedResident } from "../columns/types"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { ColumnDef } from "@tanstack/react-table"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"

interface ResidentListPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  residents: UnvaccinatedResident[]
}

const columns: ColumnDef<UnvaccinatedResident>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => <div className="px-4">{(row.index + 1) }</div>
  },

  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="px-4">
        {row.original.lname}, {row.original.fname} {row.original.mname || ''}
      </div>
    )
  },
  {
    accessorKey: "sex",
    header: "Sex",
    cell: ({ row }) => <div className="px-4">{row.original.sex}</div>
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => <div className="px-4">{row.original.age}</div>
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
    cell: ({ row }) => <div className="px-4">{row.original.sitio}</div>
  }
]

export function ResidentListPanel({
  isOpen,
  onClose,
  title,
  residents,
}: ResidentListPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredResidents = useMemo(() => {
    if (!searchQuery.trim()) return residents
    
    const query = searchQuery.toLowerCase()
    return residents.filter(resident => {
      // Search across multiple fields
      const searchFields = [
        resident.pat_id?.toString(),
        resident.fname,
        resident.lname,
        resident.mname,
        resident.sitio,
        `${resident.fname} ${resident.lname}`,
        `${resident.lname}, ${resident.fname}`
      ].filter(Boolean).join(' ').toLowerCase()

      return searchFields.includes(query)
    })
  }, [residents, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredResidents.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredResidents.slice(start, start + pageSize)
  }, [filteredResidents, currentPage, pageSize])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="relative p-4 border-b">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search residents by name, ID or sitio..."
            className="pl-10 bg-white w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Page size selector */}
        <div className="w-full bg-white flex items-center p-4 border-b">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-[70px] h-8 flex items-center justify-center text-center"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value
                setPageSize(value >= 1 ? value : 1)
                setCurrentPage(1) // Reset to first page when page size changes
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredResidents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchQuery ? "No matching residents found" : "No residents available"}
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={paginatedData}
            />
          )}
        </div>

        {/* Pagination and row count */}
        <div className="border-t p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-normal text-gray-500">
            Showing{" "}
            {filteredResidents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredResidents.length)} of{" "}
            {filteredResidents.length} rows
          </p>
          
          <div className="flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}