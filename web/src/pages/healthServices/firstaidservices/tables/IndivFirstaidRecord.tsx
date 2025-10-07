import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery } from "@tanstack/react-query";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { api2 } from "@/api/api";
import { Heart } from "lucide-react";
import { FirstAidRecord } from "../types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { firstAidColumns } from "./columns/indiv-records-col";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";

export default function IndivFirstAidRecords() {
  const location = useLocation();
  const patientData = location.state?.params?.patientData;

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  if (!patientData?.pat_id) {
    return <div>Error: Patient ID not provided</div>;
  }

  const [selectedPatientData, setSelectedPatientData] = useState<any | null>(null);

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  const {
    data: firstAidRecordsResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ["patientFirstAidDetails", patientData.pat_id],
    queryFn: async () => {
      const response = await api2.get(`/firstaid/indiv-firstaid-record/${patientData.pat_id}/`);
      console.log("API Response:", response.data); // Debug log
      return response.data;
    },
    refetchOnMount: true,
    staleTime: 0
  });

  // Handle different API response formats
  const firstAidRecords = React.useMemo(() => {
    if (!firstAidRecordsResponse) {
      console.log("No response data");
      return [];
    }

    // Check if response is paginated (has results property)
    if (firstAidRecordsResponse.results && Array.isArray(firstAidRecordsResponse.results)) {
      console.log("Paginated response:", firstAidRecordsResponse.results);
      return firstAidRecordsResponse.results;
    }

    // Check if response is direct array
    if (Array.isArray(firstAidRecordsResponse)) {
      console.log("Direct array response:", firstAidRecordsResponse);
      return firstAidRecordsResponse;
    }

    // If response is an object but not paginated, return empty array
    console.log("Unexpected response format:", firstAidRecordsResponse);
    return [];
  }, [firstAidRecordsResponse]);

  const formatFirstAidData = React.useCallback((): FirstAidRecord[] => {
    if (!Array.isArray(firstAidRecords)) {
      console.log("firstAidRecords is not an array:", firstAidRecords);
      return [];
    }

    return firstAidRecords.map((record: any) => {
      return {
        farec_id: record.farec_id,
        qty: record.qty,
        created_at: record.created_at,
        signature: record.signature,
        reason: record.reason,
        finv: record.finv,
        patrec: record.patrec,
        finv_details: record.finv_details || null
      };
    });
  }, [firstAidRecords]);

  const filteredData = React.useMemo(() => {
    const formattedData = formatFirstAidData();

    if (!searchQuery.trim()) {
      return formattedData;
    }

    return formattedData.filter((record) => {
      const searchText = `${record.farec_id} ${record.finv_details?.fa_detail?.fa_name || ""} ${record.finv_details?.fa_detail?.catlist || ""} ${record.reason || ""}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatFirstAidData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Show error state if there's an error
  if (error) {
    return (
      <LayoutWithBack title="Individual First Aid Records" description="Manage and view patient's first aid records">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">Error loading first aid records</span>
          </div>
          <p className="text-red-600 text-sm mt-2">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        </div>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack title="Individual First Aid Records" description="Manage and view patient's first aid records">
      {selectedPatientData ? (
        <div className="mb-4">
          <PatientInfoCard patient={selectedPatientData} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <Label className="text-base font-semibold text-yellow-500">No patient selected</Label>
          </div>
          <p className="text-sm text-gray-700">Please select a patient from the first aid records page first.</p>
        </div>
      )}

      <div className="relative w-full flex flex-col lg:flex-row justify-between items-center space-x-4 py-4 px-4 border gap-4 lg:gap-0 bg-white">
        {/* Total Medical Consultations */}
        <div className="flex gap-2 items-center p-2">
          <div className="flex items-center justify-center">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 pr-2">Total First Aid Record</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPages}</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 justify-between items-center gap-4 w-full">
          <div className="w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
              <Input placeholder="Search by item name, category, reason..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <ProtectedComponentButton exclude={["DOCTOR"]}>
          <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Link
                to="/firstaid-request-form"
                state={{
                  params: {
                    mode: "fromindivrecord",
                    patientData
                  }
                }}
              >
                New Request
              </Link>
            </Button>
          </div>
        </ProtectedComponentButton>
      </div>

      <div className="h-full w-full bg-white">
        <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-center sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1); // Reset to first page when changing page size
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

        <div className="bg-white w-full overflow-x-auto border">
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span>Error loading data. Please try again.</span>
            </div>
          ) : (
            <DataTable columns={firstAidColumns} data={paginatedData} />
          )}
        </div>

        <hr />
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
          </p>
          <div className="w-full sm:w-auto flex justify-center">{totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}</div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
