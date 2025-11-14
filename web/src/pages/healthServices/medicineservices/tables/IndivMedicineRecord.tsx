// src/features/medicine/pages/IndivMedicineRecords.tsx
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, Pill, AlertCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { medicineRecordColumns } from "./columns/inv-med-col";
import { useIndividualMedicineRecords } from "../queries/fetch";
import { ProtectedComponent } from "@/ProtectedComponent";
import { serializePatientData } from "@/helpers/serializePatientData";
import TableLoading from "../../table-loading";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function IndivMedicineRecords({ patientDataProps }: { patientDataProps?: any }) {
  console.log("tesxzxt", patientDataProps);

  const location = useLocation();
  const patientData = location.state?.params?.patientData;
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pat_id = patientDataProps?.patientData?.mode === "view_history" ? patientDataProps.patientData.pat_id : patientData?.pat_id;

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Updated to use pagination parameters with search
  const { data: apiResponse, isLoading, error } = useIndividualMedicineRecords(pat_id, currentPage, pageSize, debouncedSearch);

  // Extract data from paginated response
  const medicineRecords = useMemo(() => apiResponse?.results || [], [apiResponse]);
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Derive patient data from first medicine record (similar to consultation)
  const derivedPatientData: any | null = useMemo(() => {
    if (!medicineRecords || medicineRecords.length === 0) {
      return null;
    }

    const firstRecord = medicineRecords[0];
    // Adjust the path based on your medicine record structure
    const patientDetails = firstRecord?.pat_details;
    if (!patientDetails) {
      return null;
    }

    try {
      const serialized = serializePatientData ? serializePatientData(patientDetails) : patientDetails;
      return serialized as any;
    } catch (e) {
      return patientDetails as any;
    }
  }, [medicineRecords]);


  if (!pat_id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <Label className="text-base font-semibold text-yellow-500">No records found</Label>
        </div>
      </div>
    );
  }

  // If mode is 'view_history', show only the search bar and button in a dialog
  if (patientDataProps?.patientData?.mode === "view_history") {
    return (
      <div>
        <div className="flex flex-1 justify-between items-center gap-2 pt-12 px-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search by medicine name, category..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="h-full w-full rounded- px-4 py-4">
          <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-center sm:items-center p-3 sm:p-4 gap-3 sm:gap-0 border">
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
                disabled={isLoading || !!error}
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
              <TableLoading />
            ) : error ? (
              <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>Error loading medicine records. Please try again.</span>
              </div>
            ): (
              <DataTable columns={medicineRecordColumns} data={medicineRecords} />
            )}
          </div>
          <hr />
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              {error ? "Error loading records" : `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalCount)} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} records`}
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              {!isLoading && !error && totalCount > 0 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <LayoutWithBack title="Medicine Records" description="View individual patient's medicine records">

      
     
     
          <>
            {/* Use derivedPatientData instead of selectedPatientData */}
            <div className="mb-4">
              <PatientInfoCard patient={derivedPatientData} isLoading={isLoading} />
            </div>

            <div className="w-full lg:flex justify-between items-center px-4 gap-6 bg-white py-4  border-t border-x ">
              <div className="flex gap-2 items-center p-2">
                <div className="flex items-center justify-center">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 pr-2">records</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : totalCount}</p>
              </div>

              <ProtectedComponent exclude={["DOCTOR"]}>
                <div className="flex flex-1 justify-between items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
                    <Input placeholder="Search by medicine name, category..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div>
                    <Button className="w-full sm:w-auto" disabled={isLoading || !!error}>
                      <Link
                        to="/services/medicine/form"
                        state={{
                          params: {
                            mode: "fromindivrecord",
                            patientData: derivedPatientData,
                          },
                        }}
                      >
                        New Medicine Record
                      </Link>
                    </Button>
                  </div>
                </div>
              </ProtectedComponent>
            </div>

            <div className="h-full w-full rounded-md">
              <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-center sm:items-center p-3 sm:p-4 gap-3 sm:gap-0 border">
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
                    disabled={isLoading || !!error}
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
                  <TableLoading />
                ) : error ? (
                  <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Error loading medicine records. Please try again.</span>
                  </div>
                ) : medicineRecords.length === 0 ? (
                  <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                    <span className="ml-2">{debouncedSearch ? "No records found for your search" : "No medicine records found"}</span>
                  </div>
                ) : (
                  <DataTable columns={medicineRecordColumns} data={medicineRecords} />
                )}
              </div>
              <hr />
              <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                  {error ? "Error loading records" : `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalCount)} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} records`}
                </p>
                <div className="w-full sm:w-auto flex justify-center">
                  {!isLoading && !error && totalCount > 0 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                </div>
              </div>
            </div>
          </>
    
      </LayoutWithBack>
    </>
  );
}
