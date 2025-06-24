import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  Search,
  ChevronLeft,
  Plus,
  UserRound,
  Pill,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PatientInfoCard } from "@/components/ui//patientInfoCard";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { api2 } from "@/api/api";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useMedicineCount } from "../queries/MedCountQueries";

type filter = "all" | "requested" | "recorded" | "archived";

export interface MedicineRecord {
  medrec_id: number;
  medrec_qty: string;
  status: string;
  req_type: string;
  reason: string | null;
  is_archived: boolean;
  requested_at: string;
  fulfilled_at: string | null;
  signature: string | null;
  patrec_id: number;
  minv_id: number;
  minv_details: {
    minv_id: number;
    inv_detail: {
      inv_id: number;
      expiry_date: string;
      inv_type: string;
      created_at: string;
      is_Archived: boolean;
      updated_at: string;
    };
    med_detail: {
      med_id: string;
      catlist: string;
      med_name: string;
      med_type: string;
      created_at: string;
      updated_at: string;
      cat: number;
    };
    inv_id: number;
    med_id: string;
    minv_dsg: number;
    minv_dsg_unit: string;
    minv_form: string;
    minv_qty: number;
    minv_qty_unit: string;
    minv_pcs: number;
    minv_distributed: number;
    minv_qty_avail: number;
  };
}

export interface Patient {
  pat_id: number;
  name: string;
  pat_type: string;
  [key: string]: any;
}

export default function IndivMedicineRecords() {
  const location = useLocation();
  const patientData = location.state?.params?.patientData;

  const navigate = useNavigate();
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [recordToArchive, setRecordToArchive] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<filter>("all");

  // Guard clause for missing patientData
  if (!patientData?.pat_id) {
    return <div>Error: Patient ID not provided</div>;
  }
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);

  useEffect(() => {
    // Get patient data from route state
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  // const { data: medicineCountData } = useQuery({
  //   queryKey: ["medicineRecordCount", patientData.pat_id],
  //   queryFn: async () => {
  //     const response = await api2.get(
  //       `/medicine/medrec-count/${patientData.pat_id}/`
  //     );
  //     return response.data;
  //   },
  //   refetchOnMount: true,
  //   staleTime: 0,
  // });

  // const medicineCount = medicineCountData?.medicinerecord_count;

  // Fetch medicine records
  const { data: medicineCountData } = useMedicineCount(patientData.pat_id);
  const medicineCount = medicineCountData?.medicinerecord_count;
  
  
  const {
    data: medicineRecords,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["patientMedicineDetails", patientData.pat_id],
    queryFn: async () => {
      const response = await api2.get(
        `/medicine/indiv-medicine-record/${patientData.pat_id}/`
      );
      return response.data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatMedicineData = React.useCallback((): MedicineRecord[] => {
    if (!medicineRecords) return [];
    return medicineRecords.map((record: any) => {
      return {
        medrec_id: record.medrec_id,
        medrec_qty: record.medrec_qty,
        status: record.status,
        req_type: record.req_type,
        reason: record.reason,
        is_archived: record.is_archived,
        requested_at: record.requested_at,
        fulfilled_at: record.fulfilled_at,
        signature: record.signature,
        patrec_id: record.patrec_id,
        minv_id: record.minv_id,
        minv_details: record.minv_details || null,
      };
    });
  }, [medicineRecords]);

  const filteredData = React.useMemo(() => {
    return formatMedicineData().filter((record) => {
      const searchText =
        `${record.medrec_id} ${record.minv_details?.med_detail?.med_name} ${record.minv_details?.med_detail?.catlist} ${record.status} ${record.req_type}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      let matchesFilter = true;

      if (filter === "archived") {
        matchesFilter = record.is_archived;
      } else if (filter !== "all") {
        const status = record.status.toLowerCase();
        matchesFilter = status === filter.toLowerCase() && !record.is_archived;
      } else {
        matchesFilter = !record.is_archived;
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, formatMedicineData, filter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const confirmArchiveRecord = async () => {
    if (recordToArchive !== null) {
      try {
        await api2.patch(`/medicine-records/${recordToArchive}/archive/`);
        toast.success("Medicine record archived successfully!");
        refetch();
      } catch (error) {
        toast.error("Failed to archive the record.");
      } finally {
        setIsArchiveConfirmationOpen(false);
        setRecordToArchive(null);
      }
    }
  };

  const columns: ColumnDef<MedicineRecord>[] = [
    {
      accessorKey: "medicine",
      header: "Medicine",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[200px] px-2">
          <div className="font-medium">
            {row.original.minv_details?.med_detail?.med_name || "Unknown"}
            <div className="text-xs text-gray-500">
              Category:{" "}
              {row.original.minv_details?.med_detail?.catlist || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              Type: {row.original.minv_details?.med_detail?.med_type || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[200px] px-2">
          <div className="flex flex-col">
            <div className="text-sm">
              <span className="font-medium">Dosage: </span>
              {row.original.minv_details?.minv_dsg}{" "}
              {row.original.minv_details?.minv_dsg_unit}
            </div>
            <div className="text-sm">
              <span className="font-medium">Form: </span>
              {row.original.minv_details?.minv_form}
            </div>
            <div className="text-sm">
              <span className="font-medium">Quantity: </span>
              {row.original.medrec_qty}{" "}
              {row.original.minv_details?.minv_qty_unit}
            </div>
          </div>
        </div>
      ),
    },

    {
      accessorKey: "request_info",
      header: "Request Info",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <div>
            <span className="font-medium">Type: </span>
            {row.original.req_type}
          </div>
          {row.original.reason && (
            <div>
              <span className="font-medium">Reason: </span>
              {row.original.reason}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }) => {
        const requestedAt = new Date(row.original.requested_at);
        const fulfilledAt = row.original.fulfilled_at
          ? new Date(row.original.fulfilled_at)
          : null;

        return (
          <div className="flex flex-col text-sm">
            <div>
              <span className="font-medium">Requested: </span>
              {requestedAt.toLocaleDateString()}
              <span className="text-gray-500 ml-1">
                {requestedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {fulfilledAt && (
              <div>
                <span className="font-medium">Fulfilled: </span>
                {fulfilledAt.toLocaleDateString()}
                <span className="text-gray-500 ml-1">
                  {fulfilledAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          {!row.original.is_archived ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setRecordToArchive(row.original.medrec_id);
                setIsArchiveConfirmationOpen(true);
              }}
            >
              Archive
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-8" disabled>
              Archived
            </Button>
          )}
        </div>
      ),
    },
  ];

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
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Individual Medicine Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's vaccination records
            </p>
          </div>
        </div> 
        <hr className="border-gray mb-5 sm:mb-8" />

        {selectedPatientData ? (
          <div className="mb-4">
            <PatientInfoCard patient={selectedPatientData} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <Label className="text-base font-semibold text-yellow-500">
                No patient selected
              </Label>
            </div>
            <p className="text-sm text-gray-700">
              Please select a patient from the medicine records page first.
            </p>
          </div>
        )}

        {/* Total Me */}
        <div className="bg-white rounded-md p-5 mb-6 border border-gray-300 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 border  rounded-md flex items-center justify-center shadow-sm">
              <Pill className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Total Medicine Records
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {medicineCount !== undefined ? medicineCount : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full flex gap-2 mr-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search by medicine name, category, status..."
                  className="pl-10 bg-white w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <SelectLayout
                  placeholder="Filter by status"
                  label=""
                  className="bg-white w-48"
                  options={[
                    { id: "all", name: "All Records" },
                    { id: "requested", name: "Requested" },
                    { id: "recorded", name: "Recorded" },
                    { id: "archived", name: "Archived" },
                  ]}
                  value={filter}
                  onChange={(value) => setFilter(value as filter)}
                />
              </div>
            </div>
          </div>
          <div>
            <Button className="w-full sm:w-auto">
              <Link
                to="/IndivPatNewMedRecForm"
                state={{ params: { patientData } }}
              >
                New Medicine Record
              </Link>
            </Button>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-center sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
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
            <DataTable columns={columns} data={paginatedData} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing{" "}
              {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} records
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmArchiveRecord}
        title="Archive Medicine Record"
        description="Are you sure you want to archive this record? It will be preserved in the system but removed from active records."
      />
    </>
  );
}
