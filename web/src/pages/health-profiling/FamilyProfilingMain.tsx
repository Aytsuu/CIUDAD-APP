"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Plus,
  ArrowUpIcon as ClockArrowUp,
  FileInput,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu"
import { Link } from "react-router"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { useState, useEffect } from "react"


type Report = {
  id: string
  householdNo: string
  sitio: string
  familyNo: string
  lastName: string
  firstName: string
  mi: string
  dateRegistered: string
}

// Define the columns for the data table
// Define the columns for the data table
export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resident No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "householdNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("householdNo")}</div>,
  },
  {
    accessorKey: "familyNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("familyNo")}</div>,
  },
  {
    accessorKey: "sitio",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => <div className="hidden lg:block max-w-xs truncate">{row.getValue("sitio")}</div>,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => <div className="hidden lg:block max-w-xs truncate">{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => <div className="hidden lg:block max-w-xs truncate">{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "mi",
    header: "M.I",
    cell: ({ row }) => <div className="hidden xl:block">{row.getValue("mi")}</div>,
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
    cell: ({ row }) => <div className="hidden xl:block">{row.getValue("dateRegistered")}</div>,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to={`/family-profile-view`}>
        <Button variant="outline">View</Button>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]

// Sample data
export const reports: Report[] = [
  {
    id: "001",
    householdNo: "H-001",
    sitio: "Sitio A",
    familyNo: "F-001",
    lastName: "Smith",
    firstName: "John",
    mi: "D",
    dateRegistered: "2025-01-15",
  },
  {
    id: "002",
    householdNo: "H-001",
    sitio: "Sitio A",
    familyNo: "F-001",
    
    lastName: "Smith",
    firstName: "Jane",
    mi: "L",
    dateRegistered: "2025-01-15",
  },
  {
    id: "003",
    householdNo: "H-002",
    sitio: "Sitio B",
    familyNo: "F-002",
    
    lastName: "Johnson",
    firstName: "Robert",
    mi: "K",
    dateRegistered: "2025-01-18",
  },
  {
    id: "004",
    householdNo: "H-002",
    sitio: "Sitio B",
    familyNo: "F-002",
    
    lastName: "Johnson",
    firstName: "Mary",
    mi: "J",
    dateRegistered: "2025-01-18",
  },
  {
    id: "005",
    householdNo: "H-003",
    sitio: "Sitio C",
    familyNo: "F-003",
    lastName: "Williams",
    firstName: "David",
    mi: "R",
    dateRegistered: "2025-01-20",
  },
  // Add more sample data as needed
]

// Generate additional sample data for testing pagination
const generateMoreData = (): Report[] => {
  const moreData: Report[] = []
  for (let i = 6; i <= 150; i++) {
    moreData.push({
      id: `${i.toString().padStart(3, "0")}`,
      householdNo: `H-${Math.floor((i - 1) / 2) + 3}`,
      familyNo: `F-${Math.floor((i - 1) / 2) + 3}`,
      sitio: `Sitio ${String.fromCharCode(67 + Math.floor((i - 1) / 2))}`,
      lastName: `LastName${i}`,
      firstName: `FirstName${i}`,
      mi: String.fromCharCode(65 + (i % 26)),
      dateRegistered: `2025-02-${(i % 28) + 1}`,
    })
  }
  return moreData
}

// Complete dataset combining initial and generated data
const fullDataset: Report[] = [...reports, ...generateMoreData()]

// Custom pagination component to replace PaginationLayout
const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  // Calculate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're at the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4)
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1) // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(-2) // -2 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => {
        if (page < 0) {
          // Render ellipsis
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        )
      })}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}

export default function ProfilingMain() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState<Report[]>(fullDataset)
  const [currentData, setCurrentData] = useState<Report[]>([])
  const [totalPages, setTotalPages] = useState(1)

  // Filter data based on search query
  useEffect(() => {
    const filtered = fullDataset.filter((report) => {
      const searchText =
        `${report.id} ${report.householdNo} ${report.familyNo} ${report.sitio} ${report.lastName} ${report.firstName} ${report.mi} ${report.dateRegistered}`.toLowerCase()
      return searchText.includes(searchQuery.toLowerCase())
    })
    setFilteredData(filtered)
    setTotalPages(Math.ceil(filtered.length / pageSize))
    setCurrentPage(1) // Reset to first page when search changes
  }, [searchQuery, pageSize])

  // Update data based on page and page size
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setCurrentData(filteredData.slice(startIndex, endIndex))
  }, [currentPage, pageSize, filteredData])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value)
    if (!isNaN(value) && value > 0) {
      setPageSize(value)
    } else {
      setPageSize(10) // Default to 10 if invalid input
    }
  }

  // Handle page change from the pagination component
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col justify-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Resident Records</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view resident information</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* The Header is hidden on small screens */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1 bg-white">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <SelectLayout
            placeholder="Filter by"
            label=""
            className="bg-white"
            options={[
              { id: "1", name: "" },
              { id: "2", name: "By date" },
              { id: "3", name: "By location" },
            ]}
            value=""
            onChange={() => {}}
          />
        </div>
        <div>
          <div className="flex gap-2">
            <Link to="/registration-request">
              <Button variant="outline">
                <ClockArrowUp />
                Pending
              </Button>
            </Link>

            
            <Link to="/family-profile-form">
              <Button className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
                <Plus size={15} /> Register
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full bg-white flex flex-row justify-between p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-6" value={pageSize} onChange={handlePageSizeChange} min="1" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileInput />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="bg-white w-full overflow-x-auto">
          {/* Table Placement */}
          <DataTable columns={columns} data={currentData} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
          </p>

          {/* Custom Pagination component instead of PaginationLayout */}
          <div className="w-full sm:w-auto flex justify-center">
            <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  )
}

