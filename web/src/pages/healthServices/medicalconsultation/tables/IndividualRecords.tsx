// InvMedicalConRecords.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Loader2, ChevronLeft, HeartPulse, Calendar } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Syringe, AlertCircle } from "lucide-react";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { Patient } from "../../restful-api-patient/type";
import { useConsultationHistory } from "../queries/fetchQueries";
import { usePrenatalPatientMedHistory } from "../../maternal/queries/maternalFetchQueries";
import CardLayout from "@/components/ui/card/card-layout";
import { Badge } from "@/components/ui/badge";
import { getMedicalConsultationColumns } from "./columns/indiv_col";

export default function InvMedicalConRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};
  const mode = params.mode || "";

  const navigate = useNavigate();
  const [searchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientData) {
      setSelectedPatientData(patientData);
    }
  }, [patientData]);

  // Use the consultation history hook with pagination
  const { data: medicalRecordsResponse, isLoading: isMedicalRecordsLoading, isError: isMedicalRecordsError } = useConsultationHistory(patientData?.pat_id, currentPage, pageSize);
  const { data: medHistoryData, isLoading: isMedHistoryLoading, error: medHistoryError, isError: isMedHistoryError } = usePrenatalPatientMedHistory(patientData?.pat_id);



  const medicalRecords = useMemo(() => {
    console.log("Medical Records Response:", medicalRecordsResponse);

    return medicalRecordsResponse?.results || medicalRecordsResponse || [];
  }, [medicalRecordsResponse]);

  const totalCount = medicalRecordsResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;


  const getMedicalHistoryCardsData = useCallback(() => {
    if (isMedHistoryLoading) {
      return [];
    }

    if (isMedHistoryError) {
      console.error("Error fetching medical history:", medHistoryError);
      return [
        {
          id: "error-card",
          illness: "Error loading data",
          ill_date: "Please try again",
          isError: true
        }
      ];
    }

    if (!medHistoryData || typeof medHistoryData !== "object") {
      return [];
    }

    const historyList = Array.isArray(medHistoryData.medical_history) ? medHistoryData.medical_history : [];

    return historyList.map((history: any) => ({
      id: history.medhist_id || Math.random().toString(36).substring(2, 9),
      illness: history.illness_name || history.ill?.illname || "N/A",
      ill_date: history.ill_date ? String(history.ill_date) : "Not specified",
      isError: false
    }));
  }, [medHistoryData, isMedHistoryLoading, isMedHistoryError, medHistoryError]);

  // Client-side filtering for search
  const filteredData = useMemo(() => {
    const formattedData = medicalRecords;
    if (!searchQuery) return formattedData;

    return formattedData.filter((record: any) => {
      const searchText = `${record.medrec_id} 
        ${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} 
        ${record.bmi_details.bmi} 
        ${record.created_at}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, medicalRecords]);

  // Updated columns call - pass all medical records
  const columns = useMemo(() => {
    return getMedicalConsultationColumns(patientData);
  }, [medicalRecords, patientData]);

  if (!patientData?.pat_id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <Label className="text-base font-semibold text-yellow-500">No patient selected</Label>
        </div>
        <p className="text-sm text-gray-700">Please select a patient from the medical records page first.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medical Consultation Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view patient's medical consultation records</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {selectedPatientData && (
        <div className="mb-4">
          <PatientInfoCard patient={selectedPatientData} />
        </div>
      )}


      <div className="flex w-full flex-col md:flex-row gap-4">
        {/* Medical History Section */}
        <div className="mb-6 w-full md:w-1/2">
          <div className="bg-white  rounded-lg overflow-hidden">
            {isMedHistoryLoading ? (
              <div className="p-4 text-center">Loading medical history...</div>
            ) : isMedHistoryError ? (
              <div className="p-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to load medical history</span>
                </div>
                {process.env.NODE_ENV === "development" && <p className="text-xs text-gray-500 mt-2">Error: {medHistoryError.message}</p>}
              </div>
            ) : (
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-red-500">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-semibold text-red-500">Medical History</span>
                  </div>
                }
                content={
                  <div className="flex flex-col gap-4">
                    {getMedicalHistoryCardsData().length > 0 ? (
                      getMedicalHistoryCardsData().map((history: any) => (
                        <div key={history.id} className={`border rounded-lg p-4 ${history.isError ? "bg-red-50 border-red-200" : ""}`}>
                          <div className="flex justify-between items-start">
                            <h3 className={`font-medium ${history.isError ? "text-red-600" : "text-gray-900"}`}>{history.illness}</h3>
                            {!history.isError && (
                              <Badge variant="outline" className="text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                Diagnosed in {history.ill_date}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-4">No medical history records found</div>
                    )}
                  </div>
                }
              />
            )}
          </div>
        </div>
      </div>
      {/* Medical Consultations Section */}
      <div className="w-full lg:flex justify-between items-center mb-4 gap-6">
        <div className="flex gap-2 items-center p-2">
          <Syringe className="h-6 w-6 text-blue" />
          <p className="text-sm font-medium text-gray-800 pr-2">Total Medical Consultations</p>
          <p className="text-2xl font-bold text-gray-900">{isMedicalRecordsLoading ? "..." : totalCount}</p>
        </div>

        {mode !== "doctor" && (
          <Button className="w-full sm:w-auto" disabled={isMedicalRecordsLoading || isMedicalRecordsError}>
            <Link to="/services/medical-consultation/form" state={{ params: { patientData, mode: "fromindivrecord" } }}>
              New Consultation Record
            </Link>
          </Button>
        )}
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
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
              disabled={isMedicalRecordsLoading || isMedicalRecordsError}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Export data" disabled={isMedicalRecordsLoading || isMedicalRecordsError || filteredData.length === 0}>
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
          {isMedicalRecordsLoading ? (
            <>
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading medicine records...</span>
              </div>
            </>
          ) : isMedicalRecordsError ? (
            <div className="p-4 flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load medical records</span>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            {isMedicalRecordsLoading ? "Loading records..." : isMedicalRecordsError ? "Error loading records" : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} records`}
          </p>

          <div className="w-full sm:w-auto flex justify-center">{!isMedicalRecordsLoading && !isMedicalRecordsError && totalCount > 0 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}</div>
        </div>
      </div>
    </div>
  );
}
