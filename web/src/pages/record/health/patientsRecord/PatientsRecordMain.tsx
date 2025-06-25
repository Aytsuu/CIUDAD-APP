"use client"

import { useState } from "react"
import {
  Plus,
  FileInput,
  ArrowUpDown,
  Search,
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
import PaginationLayout from "@/components/ui/pagination/pagination-layout"

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
    sitio?: string;
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
    cell: ({ row }) => (
        <div className="flex w-full justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md text-center font-semibold">
            {row.original.id}
          </div>
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


export default function PatientsRecord() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: patientData, isLoading } = usePatients();

  const transformedPatients = (patients: Patients[]): Report[] => {
  if (!patients || patients.length === 0) {
    return [];
  }
  return patients.map((patient) => ({
    id: patient.pat_id.toString(),
    sitio: patient.address?.sitio || "N/A",
    lastName: patient.personal_info?.per_lname || "",
    firstName: patient.personal_info?.per_fname || "",
    mi: patient.personal_info?.per_mname || "N/A  ",
    type: patient.pat_type || "Resident", 
  }));
};

  const patientDataset = transformedPatients(patientData);

  const filter = [
    { id: "All", name: "All" },
    { id: "Resident", name: "Resident" },
    { id: "Transient", name: "Transient" },
  ]
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name)

  const filteredData = patientDataset.filter((item) => {
    const matchesSearchTerm = searchQuery === "" || `${item.id} ${item.sitio} ${item.lastName} ${item.firstName} ${item.mi} ${item.type}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === "All" || item.type.includes(selectedFilter);

    return matchesSearchTerm && matchesFilter;
  })

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const patientPagination = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPatients = patientDataset.length
  const residents = patientDataset.filter((patient) => patient.type.includes("Resident")).length
  const transients = patientDataset.filter((patient) => patient.type.includes("Transient")).length
  const residentPercentage = totalPatients > 0 ? Math.round((residents / totalPatients) * 100) : 0
  const transientPercentage = totalPatients > 0 ? Math.round((transients / totalPatients) * 100) : 0

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
        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          <div className="flex w-full gap-x-2">
            <div className="relative flex-1 bg-white">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              <Input
                placeholder="Search..."
                className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <SelectLayout
                placeholder="Filter by"
                label=""
                className="w-full md:w-[200px] bg-white"
                options={filter}
                value={selectedFilter}
                onChange={setSelectedFilter}
              />
            </div>
            
          </div>
          <div>
            <div className="flex gap-2">
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
              <Input type="number" className="w-14 h-6" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} min="1" />
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
            <DataTable columns={columns} data={filteredData} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
            </p>

            {/* Custom Pagination component instead of PaginationLayout */}
            <div className="w-full sm:w-auto flex justify-center">
              {patientPagination.length > 0 && (
                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  )

}