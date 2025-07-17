import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  Plus,
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
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { api2 } from "@/api/api";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useFirstAidCount } from "../queries/FirstAidCountQueries";
import { Heart } from "lucide-react";

export interface FirstAidRecord {
  farec_id: number;
  qty: string;
  created_at: string;
  is_archived: boolean;
  reason: string | null;
  finv: number;
  patrec: number;
  finv_details: {
    finv_id: number;
    inv_detail: {
      inv_id: number;
      expiry_date: string;
      inv_type: string;
      created_at: string;
      is_Archived: boolean;
      updated_at: string;
    };
    fa_detail: {
      fa_id: string;
      catlist: string;
      fa_name: string;
      created_at: string;
      updated_at: string;
      cat: number;
    };
    inv_id: number;
    fa_id: string;
    finv_qty: number;
    finv_qty_unit: string;
    finv_pcs: number;
    finv_used: number;
    finv_qty_avail: number;
  };
}

export interface Patient {
  pat_id: string;
  name: string;
  pat_type: string;
  [key: string]: any;
}

export default function IndivFirstAidRecords() {
  const location = useLocation();
  const patientData = location.state?.params?.patientData;

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  if (!patientData?.pat_id) {
    return <div>Error: Patient ID not provided</div>;
  }
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  const { data: firstAidCountData } = useFirstAidCount(patientData.pat_id);
  const firstAidCount = firstAidCountData?.firstaidrecord_count;

  const {
    data: firstAidRecords,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["patientFirstAidDetails"],
    queryFn: async () => {
      const response = await api2.get(
        `/firstaid/indiv-firstaid-record/${patientData.pat_id}/`
      );
      return response.data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatFirstAidData = React.useCallback((): FirstAidRecord[] => {
    if (!firstAidRecords) return [];
    return firstAidRecords.map((record: any) => {
      return {
        farec_id: record.farec_id,
        qty: record.qty,
        created_at: record.created_at,
        is_archived: record.is_archived,
        reason: record.reason,
        finv: record.finv,
        patrec: record.patrec,
        finv_details: record.finv_details || null,
      };
    });
  }, [firstAidRecords]);

  const filteredData = React.useMemo(() => {
    return formatFirstAidData().filter((record) => {
      const searchText =
        `${record.farec_id} ${record.finv_details?.fa_detail?.fa_name} ${record.finv_details?.fa_detail?.catlist} ${record.reason}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatFirstAidData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<FirstAidRecord>[] = [
    {
      accessorKey: "dates",
      header: "Date ",
      cell: ({ row }) => {
        const usedAt = new Date(row.original.created_at);
        return (
          <div className="flex flex-col text-sm">
            <div>{usedAt.toLocaleDateString()}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "firstaid_item",
      header: "First Aid Item",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[200px] px-2">
          <div className="font-medium">
            {row.original.finv_details?.fa_detail?.fa_name || "Unknown"}
            <div className="text-xs text-gray-500">
              Category: {row.original.finv_details?.fa_detail?.catlist || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "qty",
      header: "Qty used",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[200px] px-2">
          <div className="text-sm">{row.original.qty}</div>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <div>{row.original.reason || "No reason provided"}</div>
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
        <div className="flex flex-col sm:flex-row gap-4 ">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Individual First Aid Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's first aid records
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
              Please select a patient from the first aid records page first.
            </p>
          </div>
        )}

        <div className="relative w-full flex flex-col lg:flex-row justify-between items-center space-x-4 mb-4 gap-4 lg:gap-0">
          {/* Total Medical Consultations */}
          <div className="flex gap-2 items-center p-2">
            <div className="flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 pr-2">
                Total Medical Consultations
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {firstAidCount !== undefined ? firstAidCount : "0"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 justify-between items-center gap-4 w-full">
            <div className="w-full flex gap-2">
              <div className="relative flex-1 ">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search by item name, category, reason..."
                  className="pl-10 bg-white w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Link
                to="/firstaid-request-form"
                state={{
                  params: {
                    mode: "fromindivrecord",
                    patientData,
                  },
                }}
              >
                New Request
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
    </>
  );
}
