import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Trash, Search, ChevronLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getVaccinationRecordById } from "./restful-api/GetVaccination";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { UserRound, Fingerprint, Syringe, MapPin } from "lucide-react";

export interface VaccinationRecord {
  vachist_id: number;
  vachist_doseNo: string;
  vachist_status: string;
  vachist_age: number;
  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_o2: string;
    created_at: string;
  };
  vaccine_name: string;
  batch_number: string;
  updated_at: string;
}

export default function IndivVaccinationRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};
  const navigate = useNavigate();
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [recordToArchive, setRecordToArchive] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: vaccinationRecords, isLoading } = useQuery({
    queryKey: ["patientVaccinationDetails", patientData.pat_id],
    queryFn: () => getVaccinationRecordById(patientData.pat_id),
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatVaccinationData = React.useCallback((): VaccinationRecord[] => {
    if (!vaccinationRecords) return [];

    return vaccinationRecords.flatMap(
      (record: { vaccination_histories: VaccinationHistory[] }) =>
        record.vaccination_histories.map((history: VaccinationHistory) => ({
          vachist_id: history.vachist_id,
          vachist_doseNo: history.vachist_doseNo,
          vachist_status: history.vachist_status,
          vachist_age: history.vachist_age,
          vital_signs: history.vital_signs || {
            vital_bp_systolic: "N/A",
            vital_bp_diastolic: "N/A",
            vital_temp: "N/A",
            vital_RR: "N/A",
            vital_o2: "N/A",
            created_at: "N/A",
          },
          vaccine_name:
            history.vaccine_stock?.vaccinelist?.vac_name || "Unknown",
          batch_number: history.vaccine_stock?.batch_number || "N/A",
          updated_at: history.updated_at,
        }))
    );

    interface VaccinationHistory {
      vachist_id: number;
      vachist_doseNo: string;
      vachist_status: string;
      vachist_age: number;
      vital_signs?: VitalSigns;
      vaccine_stock?: VaccineStock;
      updated_at: string;
    }

    interface VitalSigns {
      vital_bp_systolic: string;
      vital_bp_diastolic: string;
      vital_temp: string;
      vital_RR: string;
      vital_o2: string;
      created_at: string;
    }

    interface VaccineStock {
      batch_number: string;
      vaccinelist?: VaccineList;
    }

    interface VaccineList {
      vac_name: string;
    }
  }, [vaccinationRecords]);

  const filteredData = React.useMemo(() => {
    return formatVaccinationData().filter((record) => {
      const searchText = `${record.vachist_id} 
        ${record.vaccine_name} 
        ${record.batch_number} 
        ${record.vachist_doseNo} 
        ${record.vachist_status}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatVaccinationData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const confirmArchiveRecord = async () => {
    if (recordToArchive !== null) {
      try {
        // await archiveVaccinationRecord(recordToArchive);
        toast.success("Record archived successfully!");
        queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
      } catch (error) {
        toast.error("Failed to archive the record.");
      } finally {
        setIsArchiveConfirmationOpen(false);
        setRecordToArchive(null);
      }
    }
  };

  const columns: ColumnDef<VaccinationRecord>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.index + 1}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "vaccine_name",
      header: "Vaccine",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[150px] px-2">
          <div className="font-medium">
            {row.original.vaccine_name}
            <div className="text-xs text-gray-500">
              Batch: {row.original.batch_number}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const vital = row.original.vital_signs;
        return (
          <div className="flex justify-center items-center gap-2 min-w-[150px] px-2 py-1 bg-gray-50 rounded-md shadow-sm">
            <div className="flex flex-col justify-start text-sm min-w-[180px]">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center">
                  <span className="font-medium mr-1">BP:</span>
                  <span>
                    {vital.vital_bp_systolic}/{vital.vital_bp_diastolic} mmHg
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">Temp:</span>
                  <span>{vital.vital_temp}°C</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">RR:</span>
                  <span>{vital.vital_RR}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">O2:</span>
                  <span>{vital.vital_o2}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "vachist_doseNo",
      header: "Dose",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {row.original.vachist_doseNo}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "vachist_status",
      header: "Status",
      cell: ({ row }) => {
        const statusColors = {
          completed: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          cancelled: "bg-red-100 text-red-800",
        };
        return (
          <div className="flex justify-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[
                  row.original.vachist_status.toLowerCase() as keyof typeof statusColors
                ] || "bg-gray-100 text-gray-800"
              }`}
            >
              {row.original.vachist_status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {new Date(row.original.updated_at).toLocaleDateString()}
          <div className="text-xs text-gray-400">
            {new Date(row.original.updated_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            }
            content="View Details"
          />
          <TooltipLayout
            trigger={
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setRecordToArchive(row.original.vachist_id);
                  setIsArchiveConfirmationOpen(true);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            }
            content="Archive Record"
          />
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
      <Toaster position="top-right" />
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
              Vaccination Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's vaccination records
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-darkBlue2 mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Fingerprint className="h-4 w-4" />
                Patient ID
              </p>
              <p className="font-medium">{patientData.pat_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <UserRound className="h-4 w-4" />
                Full Name
              </p>
              <p className="font-medium">{`${patientData.lname}, ${
                patientData.fname
              } ${patientData.mname || ""}`}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Syringe className="h-4 w-4" />
                Total Vaccinations
              </p>
              <p className="font-medium">
                {formatVaccinationData().length} records
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Address
              </p>
              <p className="font-medium">{patientData.address}</p>
            </div>
          </div>
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex gap-x-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search records..."
                  className="pl-10 w-72 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Button className="w-full sm:w-auto">
              <Link to="/vaccinationForm" state={{ params: { patientData } }}>
                New Vaccination Record
              </Link>
            </Button>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
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
        title="Archive Vaccination Record"
        description="Are you sure you want to archive this record? It will be preserved in the system but removed from active records."
      />
    </>
  );
}
