"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Plus,
  FileInput,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  UserCog,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu"
import { Link, Link as RouterLink } from "react-router"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Skeleton } from "@/components/ui/skeleton"
import CardLayout from "@/components/ui/card/card-layout"
import { Button } from "@/components/ui/button/button"

import { usePatients } from "./queries/patientsFetchQueries"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"

type Report = {
  id: string
  sitio: string
  lastName: string
  firstName: string
  mi: string
  type: string
}


interface Patients {
  pat_id: string;
  pat_type: string;

  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
  };

  address: {
    add_sitio?: string;
    
  }
}

// Define the columns for the data table
export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Patient No.
        <ArrowUpDown size={14} />
      </div>
    ),
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
    header: "Middle Name",
    cell: ({ row }) => <div className="hidden xl:block">{row.getValue("mi")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div className="hidden xl:block">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <RouterLink to={`/view-patients-record/${row.getValue("id")}`} state={{ patientId: row.getValue("id") }}>
        <Button variant="outline">View</Button>
      </RouterLink>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]

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

const transformPatientsToReports = (patients: Patients[]): Report[] => {
  return patients.map((patient) => ({
    id: patient.pat_id.toString(),
    sitio: patient.address?.add_sitio || "N/A",
    lastName: patient.personal_info?.per_lname || "",
    firstName: patient.personal_info?.per_fname || "",
    mi: patient.personal_info?.per_mname || "",
    type: patient.pat_type || "Resident", // assuming pat_type maps to resident/transient
  }));
};

export default function PatientsRecord() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredData, setFilteredData] = useState<Report[]>([])
  const [currentData, setCurrentData] = useState<Report[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [filterBy, setFilterBy] = useState("")

  const { data: patientData, isLoading } = usePatients();

  const transformedPatients = useMemo(() => {
    if(!patientData) return [];
    return transformPatientsToReports(patientData);
  }, [patientData])

  const patientDataset = transformedPatients;

  const totalPatients = patientDataset.length
  const residents = patientDataset.filter((patient) => patient.type.includes("Resident")).length
  const transients = patientDataset.filter((patient) => patient.type.includes("Transient")).length
  const residentPercentage = totalPatients > 0 ? Math.round((residents / totalPatients) * 100) : 0
  const transientPercentage = totalPatients > 0 ? Math.round((transients / totalPatients) * 100) : 0

  // Filter data based on search query
  useEffect(() => {
    if (!patientDataset.length) {
      setFilteredData([]);
      setTotalPages(0);
      return;
    }

    const filtered = patientDataset.filter((report) => {
      const searchText =
        `${report.id} ${report.sitio} ${report.lastName} ${report.firstName} ${report.mi} ${report.type}`.toLowerCase()
      return searchText.includes(searchQuery.toLowerCase())
    })

    // Apply additional filters if needed
    let filteredDataTemp = filtered
    if (filterBy === "resident") {
      filteredDataTemp = filteredDataTemp.filter((report) => report.type.includes("Resident"))
    } else if (filterBy === "transient") {
      filteredDataTemp = filteredDataTemp.filter((report) => report.type.includes("Transient"))
    }

    setFilteredData(filteredDataTemp)
    setTotalPages(Math.ceil(filteredDataTemp.length / pageSize))
    setCurrentPage(1) 
  }, [searchQuery, pageSize, filterBy, patientDataset])

  // Update data based on page and page size
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setCurrentData(filteredData.slice(startIndex, endIndex))
  }, [currentPage, pageSize, filteredData])

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  // Show empty state if no data
  if (!patientData || patientData.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">No patients found</div>
      </div>
    );
  }

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
    <LayoutWithBack
      title="Patients Records"
      description="Manage and view patients information"
    >
      <div className="w-full">
        {/* Stats Cards with simplified design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CardLayout
            title='Total Patients'
            description="All registered patients"
            content={
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{totalPatients}</span>
                  <span className="text-xs text-muted-foreground">Total records</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            headerClassName="pb-2"
            contentClassName="pt-0"
          />

          <CardLayout
            title="Residents"
            description="Permanent patients"
            content={
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{residents}</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {residentPercentage > transientPercentage ? (
                      <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />
                    )}
                    <span>{residentPercentage}% of total</span>
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <Home className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            headerClassName="pb-2"
            contentClassName="pt-0"
          />

          <CardLayout
            title="Transients"
            description="Temporary patients"
            content={
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{transients}</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {transientPercentage > residentPercentage ? (
                      <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />
                    )}
                    <span>{transientPercentage}% of total</span>
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            headerClassName="pb-2"
            contentClassName="pt-0"
          />
        </div>

        {/* The Header is hidden on small screens */}
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          <div className="flex w-full gap-x-2">
            <div className="relative flex-1 bg-white">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              <Input
                placeholder="Search..."
                className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="w-48">
              <SelectLayout
                placeholder="Filter by"
                label=""
                className="bg-white"
                options={[
                  { id: "all", name: "All" },
                  { id: "resident", name: "Resident" },
                  { id: "transient", name: "Transient" },
                ]}
                value={filterBy}
                onChange={setFilterBy}
              />
            </div>
          </div>
          <div>
            <div className="flex ml-2">
              <Link to="/create-patients-record">
                <Button className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
                  <Plus size={15} /> Create
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
    </LayoutWithBack>
  )
}