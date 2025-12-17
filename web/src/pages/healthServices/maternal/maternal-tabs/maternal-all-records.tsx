import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search, RefreshCw } from "lucide-react";
import WomanRoundedIcon from "@mui/icons-material/WomanRounded";
import PregnantWomanIcon from "@mui/icons-material/PregnantWoman";

import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useLoading } from "@/context/LoadingContext";
import ViewButton from "@/components/ui/view-button";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { ExportButton } from "@/components/ui/export";
import TableLoading from "@/components/ui/table-loading";

import { useMaternalRecords, useMaternalCounts } from "../queries/maternalFetchQueries";
import { FilterSitio } from "@/pages/healthServices/reports/filter-sitio";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";

import { capitalize } from "@/helpers/capitalize";
import { useDebounce } from "@/hooks/use-debounce";
import { getPatType } from "@/pages/record/health/patientsRecord/PatientsRecordMain";

interface maternalRecords {
    pat_id: string;
    age: number;

    personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob?: string;
      ageTime: string;
    };

    address?: {
      add_street?: string;
      add_barangay?: string;
      add_city?: string;
      add_province?: string;
      add_external_sitio?: string;
      add_sitio?: string;
    };

    pat_type: "Transient" | "Resident";
    patrec_type?: string;
    additional_info?: {
      latest_pregnancy?: {
        pregnancy_status?: string
      }
    }
  }

export default function MaternalAllRecords() {
  // Sitio filter state
  
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const { data: sitioData, isLoading: isSitiosLoading } = useSitioList();
  const sitios = sitioData || [];
  
  const { showLoading, hideLoading } = useLoading();
  const searchTerm = searchParams.get("search") || "";
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Keep local page state in sync with URL params
  useEffect(() => {
    const pageFromParams = parseInt(searchParams.get("page") || "1", 10);
    setPage(Number.isNaN(pageFromParams) ? 1 : pageFromParams);
  }, [searchParams]);

  // Reset to first page when filters change
  useEffect(() => {
    if(debouncedSearchTerm == "") return;
    handlePageChange(1);
  }, [debouncedSearchTerm, selectedFilter, selectedSitios, searchTerm, setSearchParams]);

  // Build the combined search query that includes selected sitios
  const combinedSearchQuery = useMemo(() => {
    let query = debouncedSearchTerm || "";
    if (selectedSitios.length > 0) {
      const sitioQuery = selectedSitios.join(",");
      query = query ? `${query},${sitioQuery}` : sitioQuery;
    }
    return query || "";
  }, [debouncedSearchTerm, selectedSitios]);

  // useMaternalRecords expects (page, pageSize, searchQuery, status)
  const { data: maternalRecordsData, isLoading, refetch } = useMaternalRecords(
    page,
    pageSize,
    combinedSearchQuery,
    selectedFilter,
  );
  const { data: maternalCountsData } = useMaternalCounts();

  const totalMaternalCount = maternalCountsData?.total_records || 0;
  const activePregnanciesCount = maternalCountsData?.active_pregnancies || 0;
  const totalPages = Math.ceil((maternalRecordsData?.count || 0) / pageSize);

  const filter = [
    { id: "all", name: "All" },
    { id: "resident", name: "Resident" },
    { id: "transient", name: "Transient" },
  ];

  
  // searching and pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      if (searchTerm) next.set("search", searchTerm); else next.delete("search");
      return next;
    });
  }

  const handleSearch = (search: string) => {
    setPage(1);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      if (search.trim()) next.set("search", search.trim()); else next.delete("search");
      return next;
    });
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setPage(1) 
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) 
  }

  // Sitio filter handlers
  const handleSitioSelection = (sitioName: string, checked: boolean) => {
    setSelectedSitios((prev) =>
      checked ? [...prev, sitioName] : prev.filter((s) => s !== sitioName)
    );
  };
  const handleSelectAllSitios = (checked: boolean) => {
    setSelectedSitios(checked ? sitios.map((s: any) => s.sitio_name) : []);
  };
  
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const transformData = useMemo((): maternalRecords[] => {
    if (!maternalRecordsData?.results) return [];

    return maternalRecordsData.results.map((record:any) => {
      const personalInfo = record.personal_info;
      const dateOfBirth = personalInfo?.per_dob || "";

      let age = 0;
      const ageTime = "yrs";

      if (dateOfBirth) {
        age = Number.isNaN(calculateAge(dateOfBirth))
          ? 0
          : calculateAge(dateOfBirth);
      }

      const address = record.address;

      return {
        pat_id: record.pat_id,
        age: age,
        personal_info: {
          per_fname: personalInfo?.per_fname || "",
          per_lname: personalInfo?.per_lname || "",
          per_mname: personalInfo?.per_mname || "",
          per_sex: personalInfo?.per_sex || "",
          ageTime: ageTime,
          per_dob: dateOfBirth || "",
        },
        address: {
          add_street: address?.add_street,
          add_barangay: address?.add_barangay,
          add_city: address?.add_city,
          add_province: address?.add_province,
          add_external_sitio: address?.add_external_sitio,
          add_sitio: address?.add_sitio || "Not Provided",
        },
        pat_type: record.pat_type || "N/A",
        additional_info: {
          latest_pregnancy: {
            pregnancy_status: record.additional_info?.latest_pregnancy?.pregnancy_status || "N/A"
          }
        }
      };
    });
  }, [maternalRecordsData]);

  // table columns
  const columns: ColumnDef<maternalRecords>[] = [
    {
      accessorKey: "pat_id",
      header: "Patient ID",
      cell: ({ row }) => (
        <div>
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md font-semibold">
            {row.original.pat_id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div
          className="flex w-full items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.personal_info;
        const age = row.original.age || 0;
        const fullName =
          `${patient.per_lname}, ${patient.per_fname} ${patient.per_mname}`.trim();

        return (
          <div className="flex w-full">
            <div className="flex flex-col">
              <div className="font-medium truncate">{capitalize(fullName)}</div>
              <div className="text-sm text-darkGray">
                {capitalize(patient.per_sex)}, {age} {patient.ageTime} old
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      size: 280,
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const addressObj = row.original.address;
        const fullAddress = addressObj
          ? [
              addressObj.add_street,
              addressObj.add_barangay,
              addressObj.add_city,
              addressObj.add_province,
            ]
              .filter(Boolean)
              .join(", ") || "Unknown"
          : "Unknown";
        return (
          <div className="flex justify-center">
            <div className="">{capitalize(fullAddress)}</div>
          </div>
        );
      },
    },

    {
      accessorKey: "sitio",
      size: 80,
      header: () => <div className="flex justify-center">Sitio</div>,
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">
            {capitalize(row.original.address?.add_sitio)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      size: 80,
      header: () => <div className="flex justify-center">Type</div>,
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className={getPatType(row.original.pat_type)}>{row.original.pat_type}</div>
        </div>
      ),
    },
    {
      accessorKey: "pregnancy_status",
      header: () => <div className="flex justify-center">Current Pregnancy Status</div>,
      cell: ({ row }) => {
        const status = row.original.additional_info?.latest_pregnancy?.pregnancy_status || "N/A";
        const normalizedStatus = status?.toLowerCase() || "";
        const displayStatus = capitalize(status) || "N/A";
        
        // Determine badge color based on status
        let badgeColor = "bg-green-500"; // Default for completed, N/A
        if (normalizedStatus === "active") {
          badgeColor = "bg-pink-500";
        } else if (normalizedStatus === "pregnancy loss") {
          badgeColor = "bg-red-500";
        }
        
        return (
          <div className="flex justify-center">
            <div className={`${badgeColor} rounded-xl min-w-24 text-white px-2 py-1 text-center`}>
              {displayStatus}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "action",
      size: 100,
      header: () => <div className="flex justify-center">Action</div>,
      cell: ({ row }) => (
        <>
          <div className="flex justify-center gap-2 ">
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] text-black px-4 rounded-lg cursor-pointer ">
                  <Link
                    to="/services/maternalindividualrecords"
                    state={{
                      params: {
                        patientData: {
                          pat_id: row.original.pat_id,
                          pat_type: row.original.pat_type,
                          age: row.original.age,
                          address: row.original.address,
                          personal_info: {
                            per_fname: row.original.personal_info.per_fname,
                            per_lname: row.original.personal_info.per_lname,
                            per_mname: row.original.personal_info.per_mname,
                            per_sex: row.original.personal_info.per_sex,
                            per_dob: row.original.personal_info.per_dob,
                            ageTime: row.original.personal_info.ageTime,
                          },
                          patrec_type: row.original.patrec_type,
                        },
                      },
                    }}
                  >
                    <ViewButton onClick={() => {}} />
                  </Link>
                </div>
              }
              content="View Record"
            />
          </div>
        </>
      ),
    },
  ];

  // export columns
  const exportColumns = [
    { key: "pat_id", header: "Patient ID" },
    { 
      key: "patient", 
      header: "Patient Name",
      format: (row: maternalRecords) => 
        `${row.personal_info.per_lname}, ${row.personal_info.per_fname} ${row.personal_info.per_mname}`.trim()
    },
    { 
      key: "age", 
      header: "Age",
      format: (row: maternalRecords) => `${row.age} ${row.personal_info.ageTime}`
    },
    { 
      key: "sex", 
      header: "Sex",
      format: (row: maternalRecords) => row.personal_info.per_sex
    },
    { 
      key: "address", 
      header: "Address",
      format: (row: maternalRecords) => {
        const addressObj = row.address;
        return addressObj
          ? [addressObj.add_street, addressObj.add_barangay, addressObj.add_city, addressObj.add_province]
              .filter(Boolean)
              .join(", ") || "Unknown"
          : "Unknown";
      }
    },
    { 
      key: "sitio", 
      header: "Sitio",
      format: (row: maternalRecords) => row.address?.add_sitio || "Not Provided"
    },
    { key: "pat_type", header: "Type" }
  ];
  
  // refetch handler
  const handleRefetching = async () => {
    try {
      setIsRefetching(true);
      await refetch();
    } catch (error) {
      console.error("Error fetching records");
    } finally {
      setIsRefetching(false);
    }
  };
  
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);


  return (
      <div className="w-full h-full flex flex-col">
        <div>
          
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <EnhancedCardLayout 
              title="Total Maternal Patients"
              description="Patients with maternal records"
              value={totalMaternalCount}
              valueDescription="Total patients"
              icon={<WomanRoundedIcon fontSize="large" className="h-5 w-5 text-muted-foreground" />}
            />

            <EnhancedCardLayout 
              title="Active Pregnancies"
              description="Patients with active pregnancies"
              value={activePregnanciesCount}
              valueDescription="Total active pregnancies"
              icon={<PregnantWomanIcon fontSize="large" className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4 gap-2">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div>
              <Button
                className="hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                variant="outline"
                onClick={handleRefetching}
                disabled={isRefetching || isLoading}
              >
                <RefreshCw
                  className={`${isRefetching ? "animate-spin" : ""}`}
                  size={20}
                />
              </Button>
            </div>
            <div className="flex w-full gap-x-2">
              <div className="relative flex-1 flex gap-2 items-center">
                <div className="flex-1 relative">
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
                <FilterSitio
                  sitios={sitios}
                  isLoading={isSitiosLoading}
                  selectedSitios={selectedSitios}
                  onSitioSelection={handleSitioSelection}
                  onSelectAll={handleSelectAllSitios}
                />
              </div>
              <div className="">
                  <SelectLayout
                    placeholder="Select filter"
                    className="w-full md:w-[200px] bg-white text-black"
                    options={filter}
                    value={selectedFilter}
                    onChange={handleFilterChange}
                  />
              </div>
              
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">New Record</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link to="/services/maternal/prenatal/form">Prenatal</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/services/maternal/postpartum/form">Postpartum</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/*  */}

        {/* Table Container */}
        <div className="h-full w-full rounded-md border">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-6"
                defaultValue={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <ExportButton
                data={transformData}
                filename={`maternal-records-${new Date().toISOString().split("T")[0]}`}
                columns={exportColumns}
              />
            </div>
          </div>
          <div className="bg-white w-full min-h-20 overflow-x-auto">
            {isLoading ? (
              < TableLoading />
            ) : (
              <DataTable columns={columns} data={transformData} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 border-t">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, maternalRecordsData?.count) || 0} of {maternalRecordsData?.count} rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              {totalPages > 0 && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
