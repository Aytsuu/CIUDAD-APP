"use client";

import { useState, useMemo } from "react";
import { Plus, FileInput, ArrowUpDown, Search, Users, Home, UserCog, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import CardLayout from "@/components/ui/card/card-layout";
import { Button } from "@/components/ui/button/button";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useDebounce } from "@/hooks/use-debounce";
import { ProtectedComponent } from "@/ProtectedComponent";
import ViewButton from "@/components/ui/view-button";

import { getAgeInUnit } from "@/helpers/ageCalculator";
import { formatDate } from "@/helpers/dateHelper";

import { usePatients } from "./queries/fetch";
import { usePatientCount } from "./queries/fetch";

import PatientRecordCount from "./PatientRecordCounts";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";


type Report = {
  id: string;
  sitio: string;
  fullName?: {
    lastName: string;
    firstName: string;
    mi: string;
  }
  age: {
    ageNumber: number;
    ageUnit: string;
  };
  type: string;
  noOfRecords?: number; 
  created_at: string;
  philhealthId?: string;
};

interface Patients {
  pat_id: string;
  pat_type: string;

  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
    per_dob: string;
    philhealth_id?: string;
  };

  address: {
    add_sitio?: string;
  };

  additional_info?: {
    per_add_philhealth_id?: string
  }

  created_at: string;
}

export const getPatType = (type: string) => {
  switch (type.toLowerCase()) {
    case "resident":
      return 'bg-blue-600 py-1 w-20 rounded-xl font-semibold text-white'
    case "transient":
      return 'border border-black/40 py-1 w-20 rounded-xl font-semibold text-black'
    default:
      return "bg-gray-500 text-white";
  }
};

// Define the columns for the data table
const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <div className="flex items-center gap-2">
          <span>Patient No.</span>
          <ArrowUpDown size={14} />
        </div>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md text-center font-semibold">{row.original.id}</div>
      </div>
    )
  },
  {
    accessorKey: "fullName",
    size: 250,
    header: () => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer">
        <div className="flex items-center gap-2">
          <span>Name</span>
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const fullNameObj = row.getValue("fullName") as { lastName: string; firstName: string; mi: string } | undefined;
      return (
        <div className="hidden lg:block max-w-xs truncate">
          {`${(fullNameObj?.lastName)}, ${(fullNameObj?.firstName)} ${fullNameObj?.mi}`}
        </div>
      )
    },
  },
  {
    accessorKey: "sitio",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Sitio
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate uppercase">
        {row.getValue("sitio")}
      </div>
    ),
  },
  
  {
    accessorKey: "age",
    header:"Age",
    cell: ({ row }) => {
      const ageObj = row.getValue("age") as { ageNumber: number; ageUnit: string };
      return <div className="hidden xl:flex justify-center">{ageObj ? `${ageObj.ageNumber} ${ageObj.ageUnit} old` : "-"}</div>;
    }
  },
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => (
      <div className="flex  items-center justify-center">
        <div className={getPatType(row.getValue("type"))}>{row.getValue("type")}</div>
      </div>
    )
  },
  {
    accessorKey: "noOfRecords",
    header: () => <div className="flex justify-center">No. of Records</div>,
    cell: ({ row }) => <div className="flex justify-center"><PatientRecordCount patientId={row.getValue("id")} /></div>
  },
  {
    accessorKey: "dateRegistered",
    header: () => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer">
        Date Registered
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {formatDate(row.getValue("dateRegistered"), 'short')}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="flex justify-center">Action</div>,
    cell: ({ row }) => (
      <Link
        to="/patientrecords/view"
        state={
          { patientId: row.getValue("id"), 
            patientData: {
              id: row.original.id,
              sitio: row.original.sitio,
              fullName: row.original.fullName,
              type: row.original.type,
              noOfRecords: row.original.noOfRecords,
              philhealthId: row.original.philhealthId 
            }
          }}
      >
        <ViewButton onClick={() => {}} />
      </Link>
    ),
    enableSorting: false,
    enableHiding: false
  }
];

function getBestAgeUnit(dob: string): { value: number; unit: string } {
  const years = getAgeInUnit(dob, "years");
  if (years > 0) return { value: years, unit: years === 1 ? "yr" : "yrs" };

  const months = getAgeInUnit(dob, "months");
  if (months > 0) return { value: months, unit: months === 1 ? "mo" : "mos" };

  const weeks = getAgeInUnit(dob, "weeks");
  if (weeks > 0) return { value: weeks, unit: weeks === 1 ? "wk" : "wks" };

  const days = getAgeInUnit(dob, "days");
  return { value: days, unit: days === 1 ? "day" : "days" };
}

// main component
export default function PatientsRecord() {

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: patientData, isLoading } = usePatients(
    page,
    pageSize,
    debouncedSearchTerm,
    selectedFilter
  );
  const { data: patientCount } = usePatientCount();

  const totalPages = Math.ceil((patientData?.count || 0) / pageSize);

  // filter options
  const filter = [
    { id: "all", name: "All" },
    { id: "Resident", name: "Resident" },
    { id: "Transient", name: "Transient" }
  ];

  // searching and pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const transformPatientsToReports = (patients: Patients[]): Report[] => {
    return patients.map((patient) => {
      const { value: ageInfo, unit: ageUnit } = getBestAgeUnit(patient.personal_info?.per_dob || "");
      const registeredDate = formatDate(new Date(patient.created_at)) || "";

      let philhealthId = "N/A";
      if (patient.personal_info && patient.personal_info.philhealth_id) {
        philhealthId = patient.personal_info.philhealth_id;
      } else if (patient.additional_info && patient.additional_info.per_add_philhealth_id) {
        philhealthId = patient.additional_info.per_add_philhealth_id;
      }
      return {
        id: patient.pat_id.toString(),
        sitio: patient.address?.add_sitio || "",
        fullName: {
          lastName: patient.personal_info?.per_lname || "",
          firstName: patient.personal_info?.per_fname || "",
          mi: patient.personal_info?.per_mname || "",
        },
        age: { ageNumber: ageInfo, ageUnit: ageUnit},
        type: patient.pat_type || "Resident",
        created_at: registeredDate,
        dateRegistered: patient.created_at || registeredDate,
        philhealthId: philhealthId,
      };
    });
  };

  const transformedPatients = useMemo(() => {
    if (!patientData?.results) return [];
    return transformPatientsToReports(patientData.results);
  }, [patientData]);


  const totalPatients = patientCount?.total || 0;

  const residents = patientCount?.resident || 0;
  const transients = patientCount?.transient || 0;
  const residentPercentage = totalPatients > 0 ? Math.round((residents / totalPatients) * 100) : 0;
  const transientPercentage = totalPatients > 0 ? Math.round((transients / totalPatients) * 100) : 0;

  return (
    <MainLayoutComponent
      title="Patient Records"
      description="Manage and view patients information"
    >
      <div className="w-full">
        {/* Stats Cards with simplified design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CardLayout
            title="Total Patients"
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
                    {residentPercentage > transientPercentage ? <ArrowUp className="h-3 w-3 mr-1 text-green-500" /> : <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />}
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
                    {transientPercentage > residentPercentage ? <ArrowUp className="h-3 w-3 mr-1 text-green-500" /> : <ArrowDown className="h-3 w-3 mr-1 text-amber-500" />}
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
              <Input placeholder="Search..." className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <div className="w-48">
              <SelectLayout placeholder="Filter by" label="" className="bg-white" options={filter} value={selectedFilter} onChange={handleFilterChange} />
            </div>
          </div>
            
            <ProtectedComponent exclude={["DOCTOR"]}>
            <div>
              <div className="flex ml-2">
                <Link to="/patientrecords/form">
                  <Button className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
                    <Plus size={15} /> Create
                  </Button>
                </Link>
              </div>
            </div>
            </ProtectedComponent>
          
        </div>

        {/* Table Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full bg-white flex flex-row justify-between p-3">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input type="number" className="w-14 h-6" value={pageSize} onChange={(e) => handlePageSizeChange(Number(e.target.value))} />
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
          <div className="bg-white w-full min-h-20 overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin" /> Loading...
              </div>
            ) : (
              <DataTable columns={columns} data={transformedPatients} />
            )}
          </div>
          <div className="bg-white border flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, patientData?.count) || 0} of {patientData?.count} rows
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              {totalPages > 0 && (
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
    </MainLayoutComponent>
  );
}
