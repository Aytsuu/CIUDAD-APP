import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Loader2, Search, Home, UserCog, Users, FileInput, ArrowUpDown } from "lucide-react";
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
import { getAnimalBitePatientDetails } from "./api/get-api";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import ViewButton from "@/components/ui/view-button";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";

// Type definition for table display
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

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterValue]);

  const fetchAnimalBiteRecords = async () => {
    setLoading(true);
    showLoading();
    setError(null);
    try {
      const allRecords = await getAnimalBitePatientDetails();
      console.log("Fetched records:", allRecords);

      const patientGroups = new Map<string, any[]>();

      allRecords.forEach((record: any) => {
        const patientId = record.patient_id;
        if (!patientGroups.has(patientId)) {
          patientGroups.set(patientId, []);
        }
        patientGroups.get(patientId)?.push(record);
      });

      const uniquePatients: UniquePatientDisplay[] = [];

      patientGroups.forEach((recordsForPatient, patientId) => {
        const latestRecord = recordsForPatient[0];

        if (latestRecord) {
          uniquePatients.push({
            id: patientId,
            fname: latestRecord.patient_fname || "N/A",
            lname: latestRecord.patient_lname || "N/A",
            gender: latestRecord.patient_sex || "N/A",
            age: latestRecord.patient_age?.toString() || "N/A",
            date: latestRecord.referral_date,
            transient: latestRecord.referral_transient,
            patientType: latestRecord.patient_type || "N/A",
            exposure: latestRecord.exposure_type,
            siteOfExposure: latestRecord.exposure_site,
            bitingAnimal: latestRecord.biting_animal,
            actions_taken: latestRecord.actions_taken || "",
            referredby: latestRecord.referredby || "",
            recordCount: recordsForPatient.length
          });
        }
      });
      setPatients(uniquePatients);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load animal bite records. Please try again.");
      toast.error("Failed to load animal bite records.");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchAnimalBiteRecords();
  }, []);

  // Calculate patient statistics
  const calculatePatientStats = useCallback((): PatientCountStats => {
    const total = patients.length;
    const residents = patients.filter((p) => p.patientType === "Resident").length;
    const transients = patients.filter((p) => p.patientType === "Transient").length;
    const residentPercentage = total > 0 ? Math.round((residents / total) * 100) : 0;
    const transientPercentage = total > 0 ? Math.round((transients / total) * 100) : 0;

    return {
      total,
      residents,
      transients,
      residentPercentage,
      transientPercentage
    };
  }, [patients]);

  const stats = calculatePatientStats();

  // Filter and paginate data
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const searchTerms = `${p.fname} ${p.lname} ${p.age} ${p.gender} ${p.date} ${p.exposure} ${p.siteOfExposure} ${p.bitingAnimal} ${p.patientType}`.toLowerCase();
      const matchesSearch = searchTerms.includes(debouncedSearchQuery.toLowerCase());
      const matchesFilter = filterValue === "all" || (filterValue === "bite" && p.exposure === "Bite") || (filterValue === "non-bite" && p.exposure === "Non-bite") || (filterValue === "transient" && p.patientType === "Transient") || (filterValue === "resident" && p.patientType === "Resident");

      return matchesSearch && matchesFilter;
    });
  }, [patients, debouncedSearchQuery, filterValue]);

  // Pagination
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPatients.slice(startIndex, startIndex + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  // Table columns with sorting and ViewButton
  const columns: ColumnDef<UniquePatientDisplay>[] = [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient <ArrowUpDown size={15} />
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
                {/* {p.recordCount > 1 && <span className="ml-2 bg-green-100 text-green-800 text-sm font-bold p-1 rounded">{p.recordCount} records</span>} */}
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
          Patient Type <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.patientType}</div>
        </div>
      )
    },
    // {
    //   accessorKey: "date",
    //   header: ({ column }) => (
    //     <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
    //       Date <ArrowUpDown size={15} />
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="flex justify-center min-w-[100px] px-2">
    //       <div className="text-center w-full">{row.original.date}</div>
    //     </div>
    //   )
    // },
    {
      accessorKey: "exposure",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Exposure Type <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.exposure}</div>
        </div>
      )
    },
    {
      accessorKey: "siteOfExposure",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Site of Exposure <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.siteOfExposure}</div>
        </div>
      )
    },
    {
      accessorKey: "bitingAnimal",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Biting Animal <ArrowUpDown size={15} />
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
      header: "Actions Taken",
      cell: ({ row }) => {
        const actions = row.original.actions_taken;
        return (
          <div className="flex justify-center min-w-[150px] px-2">
            <div className="text-center w-full">{actions && actions.length > 30 ? `${actions.substring(0, 30)}...` : actions}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "referredby",
      header: "Referred by",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.referredby}</div>
        </div>
      )
    },
    {
      accessorKey: "norecords",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          No of Records <ArrowUpDown size={15} />
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

  // Export columns
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

  const handleReferralFormClose = () => {
    setIsReferralFormOpen(false);
    fetchAnimalBiteRecords();
  };

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
              <Input placeholder="Search by patient name, exposure type, biting animal..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Records" },
                { id: "bite", name: "Bite" },
                { id: "non-bite", name: "Non-bite" },
                { id: "resident", name: "Resident" },
                { id: "transient", name: "Transient" }
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />
          </div>

          <ProtectedComponentButton exclude={["DOCTOR"]}>
            <div className="w-full sm:w-auto">
              <Button onClick={() => setIsReferralFormOpen(true)} className="w-full sm:w-auto font-medium py-2 px-4 rounded-md shadow-sm">
                New Record
              </Button>
            </div>
          </ProtectedComponentButton>
        </div>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data" className="flex items-center gap-2">
                    <FileInput className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <ExportButton data={filteredPatients} filename="animal-bite-records" columns={exportColumns} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white w-full overflow-x-auto border">
            {loading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading animal bite records...</span>
              </div>
            ) : error ? (
              <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
                <span>{error}</span>
              </div>
            ) : (
              <DataTable columns={columns} data={paginatedPatients} />
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {paginatedPatients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
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
              onAddPatient={(newPatient) => {
                console.log("New patient added:", newPatient);
                fetchAnimalBiteRecords();
              }}
            />
          }
        />
      </div>
    </MainLayoutComponent>
  );
};

export default Overall;
