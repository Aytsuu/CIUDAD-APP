"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, ArrowUpDown, Search, Users, Home, UserCog, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";

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
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

import { getAgeInUnit } from "@/helpers/ageCalculator";
import { formatDate } from "@/helpers/dateHelper";

import { usePatients } from "./queries/fetch";
import { usePatientCount } from "./queries/fetch";

import PatientRecordCount from "./PatientRecordCounts";
import TableLoading from "@/components/ui/table-loading";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { FilterSitio } from "@/pages/healthServices/reports/filter-sitio";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";


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
  status: string;
  noOfRecords?: number; 
  created_at: string;
  philhealthId?: string;
};

interface Patients {
  pat_id: string;
  pat_type: string;
  pat_status: string;

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
      return 'bg-blue-600 py-1 w-20 rounded-xl font-semibold text-white text-center'
    case "transient":
      return 'border border-black/40 py-1 w-20 rounded-xl font-semibold text-black text-center'
    default:
      return "bg-gray-500 text-white";
  }
};

// Define the columns for the data table
export const columns: ColumnDef<Report>[] = [
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
        <div className="flex justify-center">
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
      <div className="flex justify-center uppercase">
        {row.getValue("sitio")}
      </div>
    ),
  },
  
  {
    accessorKey: "age",
    header: () => <div className="flex justify-center">Age</div>,
    cell: ({ row }) => {
      const ageObj = row.getValue("age") as { ageNumber: number; ageUnit: string };
      return <div className="flex justify-center">{ageObj ? `${ageObj.ageNumber} ${ageObj.ageUnit} old` : "-"}</div>;
    }
  },
  {
    accessorKey: "type",
    header: () => <div className="flex justify-center">Type</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div className={getPatType(row.getValue("type"))}>{row.getValue("type")}</div>
      </div>
    )
  },
  {
    accessorKey: "noOfRecords",
    size: 100,
    header: () => <div className="flex justify-center">No. of Records</div>,
    cell: ({ row }) => <div className="flex justify-center"><PatientRecordCount patientId={row.getValue("id")} /></div>
  },
  {
    accessorKey: "status",
    header: () => <div className="flex justify-center">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const displayStatus = status === "Transfer of Residency" ? "TOR" : status;
      return <div className="flex justify-center">{displayStatus}</div>;
    }
  },
  {
    accessorKey: "dateRegistered",
    header: () => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer">
        Date Registered
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {formatDate(row.getValue("dateRegistered"), 'short')}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div className="flex justify-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
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
      </div>
      
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
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const user = useAuth();

  // Fetch sitio data
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedFilter, selectedSitios]);

  // Build the combined search query that includes selected sitios
  const combinedSearchQuery = useMemo(() => {
    let query = debouncedSearchTerm || "";
    // Add sitio filter if any sitios are selected
    if (selectedSitios.length > 0) {
      const sitioQuery = selectedSitios.join(",");
      query = query ? `${query},${sitioQuery}` : sitioQuery;
    }
    return query || "";
  }, [debouncedSearchTerm, selectedSitios]);

  const { data: patientData, isLoading } = usePatients(
    page,
    pageSize,
    combinedSearchQuery,
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
        status: patient.pat_status,
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

  // Sitio filter handlers
  const handleSitioSelection = (sitio_name: string, checked: boolean) => {
    if (checked) {
      setSelectedSitios([...selectedSitios, sitio_name]);
    } else {
      setSelectedSitios(selectedSitios.filter((sitio) => sitio !== sitio_name));
    }
  };

  const handleSelectAllSitios = (checked: boolean) => {
    if (checked && sitios.length > 0) {
      setSelectedSitios(sitios.map((sitio: any) => sitio.sitio_name));
    } else {
      setSelectedSitios([]);
    }
  };

  // Export functionality
  const prepareExportData = () => {
    return transformedPatients.map((patient) => ({
      "Patient No": patient.id,
      "Full Name": `${patient.fullName?.lastName}, ${patient.fullName?.firstName} ${patient.fullName?.mi || ""}`.trim(),
      "Sitio": patient.sitio,
      "Age": `${patient.age.ageNumber} ${patient.age.ageUnit} old`,
      "Type": patient.type,
      "Status": patient.status === "Transfer of Residency" ? "TOR" : patient.status,
      "No. of Records": patient.noOfRecords || 0,
      "Date Registered": formatDate(patient.created_at, 'short'),
      "PhilHealth ID": patient.philhealthId || "N/A"
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `patient_records_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `patient_records_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `patient_records_${new Date().toISOString().slice(0, 10)}`, "Patient Records");
  };

  const totalPatients = patientCount?.total || 0;

  const residents = patientCount?.resident || 0;
  const transients = patientCount?.transient || 0;
  const residentPercentage = totalPatients > 0 ? Math.round((residents / totalPatients) * 100) : 0;
  const transientPercentage = totalPatients > 0 ? Math.round((transients / totalPatients) * 100) : 0;

  if(user.user == null){
    return (
      <MainLayoutComponent 
        title="Patient Records"
        description="Manage and view patients information"
      >
        <div>No user logged in</div>
      </MainLayoutComponent>
    )
  }
  console.log("User Role:", user);

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

        {/* Filters Section */}
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white mb-4 rounded-md">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search by name, address, or sitio..." 
                className="pl-10 bg-white w-full" 
                value={searchTerm} 
                onChange={(e) => handleSearch(e.target.value)} 
              />
            </div>
            <SelectLayout 
              placeholder="Patient Type" 
              label="" 
              className="bg-white w-full sm:w-48" 
              options={filter} 
              value={selectedFilter} 
              onChange={handleFilterChange} 
            />
            <FilterSitio 
              sitios={sitios} 
              isLoading={isLoadingSitios} 
              selectedSitios={selectedSitios} 
              onSitioSelection={handleSitioSelection} 
              onSelectAll={handleSelectAllSitios} 
              manualSearchValue="" 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <ExportDropdown 
                onExportCSV={handleExportCSV} 
                onExportExcel={handleExportExcel} 
                onExportPDF={handleExportPDF} 
                className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200" 
              />
            </div>
            <ProtectedComponent exclude={["DOCTOR"]}>
              <div className="w-full sm:w-auto">
                <Link to="/patientrecords/form">
                  <Button variant="default">
                    <Plus size={15} /> Create
                  </Button>
                </Link>
              </div>
            </ProtectedComponent>
          </div>
        </div>

        {/* Table Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input 
                type="number" 
                className="w-14 h-8" 
                value={pageSize} 
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                  setPage(1);
                }} 
                min="1" 
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>
          <div className="bg-white w-full overflow-x-auto border">
            {isLoading ? (
              <TableLoading />
            ) : (
              <DataTable columns={columns} data={transformedPatients} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {transformedPatients.length > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, patientData?.count || 0)} of {patientData?.count || 0} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}
