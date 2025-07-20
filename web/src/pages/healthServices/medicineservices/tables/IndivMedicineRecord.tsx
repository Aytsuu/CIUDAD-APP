// src/features/medicine/pages/IndivMedicineRecords.tsx
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  Plus,
  Pill,
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
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { api2 } from "@/api/api";
import { TableSkeleton } from "../../skeleton/table-skeleton";
import { MedicineRecord } from "../types";
import { medicineRecordColumns } from "./columns/inv-med-col";

export interface Patient {
  pat_id: string;
  name: string;
  pat_type: string;
  [key: string]: any;
}

export default function IndivMedicineRecords() {
  const location = useLocation();
  const patientData = location.state?.params?.patientData;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Guard clause for missing patientData
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

  // Fetch medicine records
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
    return medicineRecords.map((record: any) => ({
      medrec_id: record.medrec_id,
      medrec_qty: record.medrec_qty,
      status: record.status,
      req_type: record.req_type,
      reason: record.reason || "No reason Provided",
      is_archived: record.is_archived,
      requested_at: record.requested_at,
      fulfilled_at: record.fulfilled_at,
      signature: record.signature,
      patrec_id: record.patrec_id,
      minv_id: record.minv_id,
      minv_details: record.minv_details || null,
    }));
  }, [medicineRecords]);

  const filteredData = React.useMemo(() => {
    const data = formatMedicineData();
    if (!searchQuery) return data;

    return data.filter((record) => {
      const searchText =
        `${record.medrec_id} ${record.minv_details?.med_detail?.med_name} ${record.minv_details?.med_detail?.catlist} ${record.status} ${record.req_type}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatMedicineData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const recordCount = formatMedicineData().length;

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4">
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
              Manage and view patient's medicine records
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

        <div className="w-full lg:flex justify-between items-center mb-4 gap-6 mt-4">
          <div className="flex gap-2 items-center p-2">
            <div className="flex items-center justify-center">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 pr-2">
                Total Medicine Records
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{recordCount}</p>
          </div>

          <div className="flex flex-1 justify-between items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search by medicine name, category..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Button className="w-full sm:w-auto">
                <Link
                  to="/medicine-request-form"
                  state={{
                    params: {
                      mode: "fromindivrecord",
                      patientData: patientData,
                    },
                  }}
                >
                  New Medicine Record
                </Link>
              </Button>
            </div>
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
            {isLoading ? (
              <TableSkeleton columns={medicineRecordColumns} rowCount={3} />
            ) : (
              <DataTable columns={medicineRecordColumns} data={paginatedData} />
            )}
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
