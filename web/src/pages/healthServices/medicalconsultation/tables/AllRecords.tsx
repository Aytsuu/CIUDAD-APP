import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { useMedicalRecord } from "../queries/fetchQueries";
import { MedicalRecord } from "../types";
import { getAllMedicalRecordsColumns, exportColumns } from "./columns/all_col";
import { useLoading } from "@/context/LoadingContext";
import { ExportButton } from "@/components/ui/export";
import { useDebounce } from "@/hooks/use-debounce";

export default function AllMedicalConsRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");
  const { showLoading, hideLoading } = useLoading();

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearchQuery || undefined,
      patient_type: patientTypeFilter !== "all" ? patientTypeFilter : undefined
    }),
    [currentPage, pageSize, debouncedSearchQuery, patientTypeFilter]
  );

  // Fetch data with parameters
  const { data: apiResponse, isLoading, error } = useMedicalRecord(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, patientTypeFilter]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Handle API response structure (could be paginated or not)
  const {
    medicalRecords,
    totalCount,
    totalPages: apiTotalPages
  } = useMemo(() => {
    if (!apiResponse) {
      return { medicalRecords: [], totalCount: 0, totalPages: 1 };
    }

    // Check if response is paginated
    if (apiResponse.results) {
      // Paginated response
      return {
        medicalRecords: apiResponse.results,
        totalCount: apiResponse.count || 0,
        totalPages: Math.ceil((apiResponse.count || 0) / pageSize)
      };
    } else if (Array.isArray(apiResponse)) {
      // Direct array response (fallback)
      return {
        medicalRecords: apiResponse,
        totalCount: apiResponse.length,
        totalPages: Math.ceil(apiResponse.length / pageSize)
      };
    } else {
      // Unknown structure
      return { medicalRecords: [], totalCount: 0, totalPages: 1 };
    }
  }, [apiResponse, pageSize]);

  const formatMedicalData = React.useCallback((): MedicalRecord[] => {
    if (!medicalRecords || !Array.isArray(medicalRecords)) {
      return [];
    }

    return medicalRecords.map((record: any) => {
      const details = record.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      // Handle both resident and transient data
      const fname = info.per_fname || "";
      const lname = info.per_lname || "";
      const mname = info.per_mname || "";
      const sex = info.per_sex || "";
      const dob = info.per_dob || "";

      const addressString = [address.add_street || info.per_address || "", address.add_barangay || "", address.add_city || "", address.add_province || ""].filter((part) => part.trim().length > 0).join(", ") || "";

      return {
        rp_id: record.rp_id || null,
        pat_id: record.pat_id,
        fname,
        lname,
        mname,
        sex,
        age: calculateAge(dob).toString(),
        dob,
        householdno: details.households?.[0]?.hh_id || "",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: record.pat_type || details.pat_type || "",
        address: addressString,
        medicalrec_count: record.medicalrec_count || 0
      };
    });
  }, [medicalRecords]);

  const formattedData = formatMedicalData();
  const totalPages = apiTotalPages || Math.ceil(totalCount / pageSize);
  const columns = getAllMedicalRecordsColumns();

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medical Consultation Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view patients information</p>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input placeholder="Search by name, patient ID, household number, or sitio..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Types" },
                { id: "resident", name: "Resident" },
                { id: "transient", name: "Transient" }
              ]}
              value={patientTypeFilter}
              onChange={(value) => setPatientTypeFilter(value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Link
                to="/medical-consultation-form"
                state={{
                  params: {
                    mode: "fromallrecordtable"
                  }
                }}
              >
                New Record
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
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <ExportButton data={formattedData} filename="medical-consultation-records" columns={exportColumns} />
          </div>

          <div className="bg-white w-full overflow-x-auto">
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
              <DataTable columns={columns} data={formattedData} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {formattedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
