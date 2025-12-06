import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, Home, UserCog, Users, FileInput, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLoading } from "@/context/LoadingContext";
import { ExportButton } from "@/components/ui/export";
import { useDebounce } from "@/hooks/use-debounce";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import ReferralFormModal from "./referralform";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { getUniqueAnimalbitePatients, getAnimalBiteStats } from "./api/get-api";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import ViewButton from "@/components/ui/view-button";
import { LoadingState } from "@/components/ui/health-component/loading-state";
import { ProtectedComponent } from "@/ProtectedComponent";

// NEW IMPORTS FOR SITIO
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { FilterSitio } from "@/pages/healthServices/reports/filter-sitio";
import { SelectedFiltersChips } from "@/pages/healthServices/reports/selectedFiltersChipsProps ";

// TYPES
type UniquePatientDisplay = {
  id: string;
  fname: string;
  lname: string;
  gender: string;
  age: string;
  date: string;
  transient: boolean;
  patientType: string;
  exposure: string;
  siteOfExposure: string;
  bitingAnimal: string;
  actions_taken: string;
  referredby: string;
  recordCount: number;
};

type PatientCountStats = {
  total: number;
  residents: number;
  transients: number;
  residentPercentage: number;
  transientPercentage: number;
};

const Overall: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  // State management
  const [patients, setPatients] = useState<UniquePatientDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("all");
  const [isReferralFormOpen, setIsReferralFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // SITIO STATE
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterValue, selectedSitios]);

  const fetchAnimalBiteRecords = async () => {
    setLoading(true);
    showLoading();
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      if (filterValue !== "all") {
        params.filter = filterValue;
      }

      // Pass Sitio Param
      if (selectedSitios.length > 0) {
        params.sitio = selectedSitios.join(",");
      }

      const response = await getUniqueAnimalbitePatients(params);

      if (response && response.results) {
        setPatients(response.results);
        setTotalCount(response.count || response.results.length);
      } else {
        setPatients([]);
        setTotalCount(0);
      }
    } catch (err) {
      // console.error("Fetch error:", err);
      setError("Failed to load animal bite records.");
      toast.error("Failed to load animal bite records.");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await getAnimalBiteStats();
      return stats;
    } catch (err) {
      return {
        total: 0,
        residents: 0,
        transients: 0,
        residentPercentage: 0,
        transientPercentage: 0
      };
    }
  };

  const [stats, setStats] = useState<PatientCountStats>({
    total: 0, residents: 0, transients: 0, residentPercentage: 0, transientPercentage: 0
  });

  // Fetch data
  useEffect(() => {
    fetchAnimalBiteRecords();
  }, [currentPage, pageSize, debouncedSearchQuery, filterValue, selectedSitios]);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await fetchStats();
      setStats(statsData);
    };
    loadStats();
  }, []);

  const handleReferralFormClose = () => {
    setIsReferralFormOpen(false);
    fetchAnimalBiteRecords();
    fetchStats().then(setStats);
  };

  // SITIO HANDLERS
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

  const columns: ColumnDef<UniquePatientDisplay>[] = [
    {
      accessorKey: "patient_id",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient ID 
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.id}</div>
        </div>
      )
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient 
        </div>
      ),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{`${p.lname}, ${p.fname}`.trim()}</div>
              <div className="text-sm text-darkGray">
                {p.gender}, {p.age} years old
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "patientType",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient Type 
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.patientType}</div>
        </div>
      )
    },
    {
      accessorKey: "bitingAnimal",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Biting Animal 
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.bitingAnimal}</div>
        </div>
      )
    },
    {
      accessorKey: "actions_taken",
      header: () => (
        <div className="flex w-full justify-center items-center">
          Actions Taken
        </div>
      ),
      cell: ({ row }) => {
        const actions = row.original.actions_taken;
        return (
          <div className="flex justify-center max-w-full px-2">
            <div className="text-center w-full">{actions && actions.length > 30 ? `${actions.substring(0, 30)}...` : actions}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "norecords",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          No of Records 
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[80px] px-2">
          <span className="text-center w-full">{row.original.recordCount}</span>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <ViewButton
            onClick={() => {
              // 1. Prepare data - Include address if available in 'p' (update getUniqueAnimalbitePatients serializer to return address if needed)
              const patientData = {
                pat_id: p.id,
                pat_type: p.patientType,
                age: p.age,
                personal_info: {
                  per_fname: p.fname,
                  per_lname: p.lname,
                  per_sex: p.gender
                }
              };
              navigate("/services/animalbites/records", {
                state: {
                  patientId: p.id,
                  patientData
                }
              });
            }}
          />
        );
      }
    }
  ];

  const exportColumns = [
    { key: "fname", header: "First Name" },
    { key: "lname", header: "Last Name" },
    { key: "gender", header: "Gender" },
    { key: "age", header: "Age" },
    { key: "patientType", header: "Patient Type" },
    { key: "date", header: "Date" },
    { key: "exposure", header: "Exposure Type" },
    { key: "siteOfExposure", header: "Site of Exposure" },
    { key: "bitingAnimal", header: "Biting Animal" },
    { key: "actions_taken", header: "Actions Taken" },
    { key: "referredby", header: "Referred By" }
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <MainLayoutComponent title="Animal Bite Records" description="Manage and view animal bite records">
      <div className="w-full h-full flex flex-col">
        {/* Summary Cards */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <EnhancedCardLayout
              title="Total Animal Bite Cases"
              description="All recorded animal bite cases"
              value={stats.total}
              valueDescription="Total records"
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
            <EnhancedCardLayout
              title="Resident Cases"
              description="Permanent residents with animal bites"
              value={stats.residents}
              valueDescription={`${stats.residentPercentage}% of total`}
              icon={<Home className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
            <EnhancedCardLayout
              title="Transient Cases"
              description="Temporary patients with animal bites"
              value={stats.transients}
              valueDescription={`${stats.transientPercentage}% of total`}
              icon={<UserCog className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search by patient name, exposure type, biting animal..." 
                className="pl-10 bg-white w-full" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All" },
                { id: "bite", name: "Bite" },
                { id: "non-bite", name: "Non-bite" },
                { id: "resident", name: "Resident" },
                { id: "transient", name: "Transient" }
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />

            {/* SITIO FILTER */}
            <FilterSitio 
              sitios={sitios} 
              isLoading={isLoadingSitios} 
              selectedSitios={selectedSitios} 
              onSitioSelection={handleSitioSelection} 
              onSelectAll={handleSelectAllSitios} 
              manualSearchValue="" 
            />
          </div>

          <ProtectedComponent exclude={["DOCTOR"]}>
            <div className="w-full sm:w-auto">
              <Button onClick={() => setIsReferralFormOpen(true)} className="w-full sm:w-auto font-medium py-2 px-4 rounded-md shadow-sm">
                New Record
              </Button>
            </div>
          </ProtectedComponent>
        </div>

        {/* SITIO CHIPS */}
        {selectedSitios.length > 0 && (
          <SelectedFiltersChips 
            items={selectedSitios} 
            onRemove={(sitio: any) => handleSitioSelection(sitio, false)} 
            onClearAll={() => setSelectedSitios([])} 
            label="Filtered by sitios" 
            chipColor="bg-blue-100" 
            textColor="text-blue-800" 
          />
        )}

        <div className="h-full w-full rounded-md">
          {/* Table Controls */}
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
                  setCurrentPage(1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <div>
              {/* FIXED: Removed wrapping DropdownMenu, used ExportButton directly */}
              <ExportButton 
                data={patients} 
                filename="animal-bite-records" 
                columns={exportColumns} 
              />
            </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white w-full overflow-x-auto border">
            {loading ? (
              <LoadingState/>
            ) : error ? (
              <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
                <span>{error}</span>
              </div>
            ) : (
              <DataTable columns={columns} data={patients} />
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {patients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => setCurrentPage(page)} 
              />
            </div>
          </div>
        </div>

        {/* Referral Form Modal */}
        <DialogLayout
          isOpen={isReferralFormOpen}
          onOpenChange={handleReferralFormClose}
          className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
          title=""
          description=""
          mainContent={
            <ReferralFormModal
              onClose={handleReferralFormClose}
              onAddPatient={() => {
                fetchAnimalBiteRecords();
                fetchStats().then(setStats);
              }}
            />
          }
        />
      </div>
    </MainLayoutComponent>
  );
};

export default Overall;