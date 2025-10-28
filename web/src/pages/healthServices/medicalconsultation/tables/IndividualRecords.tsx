// InvMedicalConRecords.tsx
import React, { useState, useCallback, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Loader2, HeartPulse, Search, Users, Syringe, AlertCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { useConsultationHistory, useFamHistory } from "../queries/fetch";
import { usePrenatalPatientMedHistory } from "../../maternal/queries/maternalFetchQueries";
import { getMedicalConsultationColumns } from "./columns/indiv_col";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";
import { MedicalHistoryTab } from "./medical-history-card";
import { FamilyHistoryTab } from "./family-history-card";
import { serializePatientData } from "@/helpers/serializePatientData";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// Tab component
const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${active ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
    {children}
  </button>
);

export default function InvMedicalConRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [medHistorySearch, setMedHistorySearch] = useState("");
  const [famHistorySearch, setFamHistorySearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"medical" | "family">("medical");
  const pat_id = patientData?.pat_id || "";

  const { data: medicalRecordsResponse, isLoading: isMedicalRecordsLoading, isError: isMedicalRecordsError } = useConsultationHistory(pat_id, currentPage, pageSize, searchQuery);
  const { data: medHistoryData, isLoading: isMedHistoryLoading, error: medHistoryError, isError: isMedHistoryError } = usePrenatalPatientMedHistory(pat_id, medHistorySearch);
  const { data: famHistoryData, isLoading: isFamHistoryLoading, isError: isFamHistoryError } = useFamHistory(pat_id || "", famHistorySearch);
  const isLoading = isFamHistoryLoading || isMedicalRecordsLoading || isMedHistoryLoading;

  const medicalRecords = useMemo(() => {
    return medicalRecordsResponse?.results || medicalRecordsResponse || [];
  }, [medicalRecordsResponse]);

  // Extract and serialize patient data from consultation records for display purposes only
  const derivedPatientData: any | null = useMemo(() => {
    if (!medicalRecords || medicalRecords.length === 0) {
      return null;
    }

    const firstRecord = medicalRecords[0];
    const patientDetails = firstRecord?.patrec_details?.patient_details;
    if (!patientDetails) {
      return null;
    }

    try {
      const serialized = serializePatientData ? serializePatientData(patientDetails) : patientDetails;
      return serialized as any;
    } catch {
      return patientDetails as any;
    }
  }, [medicalRecords]);

  const totalCount = medicalRecordsResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleMedHistorySearchChange = useCallback((value: string) => {
    setMedHistorySearch(value);
  }, []);

  const clearMedHistorySearch = useCallback(() => {
    setMedHistorySearch("");
  }, []);

  const handleFamHistorySearchChange = useCallback((value: string) => {
    setFamHistorySearch(value);
  }, []);

  const clearFamHistorySearch = useCallback(() => {
    setFamHistorySearch("");
  }, []);

  // Use ORIGINAL patientData (which has app_id) for column highlighting
  const columns = useMemo(() => {
    return getMedicalConsultationColumns(patientData);
  }, [patientData?.app_id]);

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
    <LayoutWithBack title="Individual Medical Consultation Records" description="View detailed medical consultation records for the selected patient.">
      <div>
        <div className="mb-4">
          <PatientInfoCard patient={derivedPatientData} isLoading={isMedicalRecordsLoading} />
        </div>

        {/* History Section with Tabs */}
        <div className="mb-4 w-full border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex space-x-4">
                <TabButton active={activeTab === "medical"} onClick={() => setActiveTab("medical")}>
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" />
                    Medical History
                  </div>
                </TabButton>
                <TabButton active={activeTab === "family"} onClick={() => setActiveTab("family")}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Family History
                  </div>
                </TabButton>
              </div>
            </div>

            <div className="p-4">
              {activeTab === "medical" ? (
                <MedicalHistoryTab
                  pat_id={patientData.pat_id}
                  searchValue={medHistorySearch}
                  onSearchChange={handleMedHistorySearchChange}
                  onClearSearch={clearMedHistorySearch}
                  medHistoryData={medHistoryData}
                  isMedHistoryLoading={isLoading}
                  isMedHistoryError={isMedHistoryError}
                  medHistoryError={medHistoryError}
                />
              ) : (
                <FamilyHistoryTab pat_id={patientData.pat_id} searchValue={famHistorySearch} onSearchChange={handleFamHistorySearchChange} onClearSearch={clearFamHistorySearch} famHistoryData={famHistoryData} isFamHistoryLoading={isLoading} isFamHistoryError={isFamHistoryError} />
              )}
            </div>
          </div>
        </div>

        {/* Medical Consultations Section */}
        <div className="w-full lg:flex justify-between items-center px-4 gap-6 mt-4 bg-white py-4 border">
          <div className="flex gap-2 items-center p-2">
            <div className="flex items-center justify-center">
              <Syringe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">records</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{isMedicalRecordsLoading ? "..." : totalCount}</p>
          </div>

          <ProtectedComponentButton exclude={["DOCTOR"]}>
            <div className="flex flex-1 justify-between items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
                <Input placeholder="Search by date, diagnosis, assessment, or findings..." className="pl-10 bg-white w-full" value={searchQuery} onChange={handleSearchChange} />
              </div>
              <div>
                <Button className="w-full sm:w-auto" disabled={isMedicalRecordsLoading || isMedicalRecordsError}>
                  <Link
                    to="/services/medical-consultation/form"
                    state={{
                      params: {
                        mode: "fromindivrecord",
                        patientData: patientData
                      }
                    }}
                  >
                    New Consultation Record
                  </Link>
                </Button>
              </div>
            </div>
          </ProtectedComponentButton>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
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
                disabled={isMedicalRecordsLoading || isMedicalRecordsError}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto border">
            {isMedicalRecordsLoading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading medical records...</span>
              </div>
            ) : isMedicalRecordsError ? (
              <div className="p-4 flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load medical records</span>
              </div>
            ) : (
              <DataTable columns={columns} data={medicalRecords} />
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
    </LayoutWithBack>
  );
}
