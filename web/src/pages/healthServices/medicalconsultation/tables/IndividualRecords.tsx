import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, ChevronLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Syringe, AlertCircle } from "lucide-react";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "../../skeleton/table-skeleton";
import { Patient } from "../../restful-api-patient/type";
import { MedicalConsultationHistory } from "../types";
import { usePatientMedicalRecords } from "../queries/fetchQueries";
import { getMedicalConsultationColumns } from "./columns/indiv_col";

export default function InvMedicalConRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);

  useEffect(() => {
    if (patientData) {
      setSelectedPatientData(patientData);
    }
  }, [patientData]);

  const { data: medicalRecords, isLoading } = usePatientMedicalRecords(
    patientData?.pat_id
  );

  const formatMedicalData = useCallback((): MedicalConsultationHistory[] => {
    if (!medicalRecords) return [];

    return medicalRecords.map((record: any) => {
      const vitalSigns = record.vital_signs || {};
      const bmiDetails = record.bmi_details || {};
      const patrecDetails = record.patrec_details || {};

      return {
        medrec_chief_complaint: record.medrec_chief_complaint || "N/A",
        medrec_id: record.medrec_id,
        created_at: record.created_at || "N/A",
        vital_signs: {
          vital_id: vitalSigns.vital_id || 0,
          vital_bp_systolic: vitalSigns.vital_bp_systolic || "N/A",
          vital_bp_diastolic: vitalSigns.vital_bp_diastolic || "N/A",
          vital_temp: vitalSigns.vital_temp || "N/A",
          vital_RR: vitalSigns.vital_RR || "N/A",
          vital_pulse: vitalSigns.vital_pulse || "N/A",
          created_at: vitalSigns.created_at || "N/A",
        },
        bmi_details: {
          bm_id: bmiDetails.bm_id || 0,
          age: bmiDetails.age || "N/A",
          height: bmiDetails.height || 0,
          weight: bmiDetails.weight || 0,
          bmi: bmiDetails.bmi || "N/A",
          bmi_category: bmiDetails.bmi_category || "N/A",
          created_at: bmiDetails.created_at || "N/A",
          pat: bmiDetails.pat || null,
        },
        find_details: record.find_details || null,
        patrec_details: {
          pat_id: patrecDetails.pat_id || 0,
          medicalrec_count: patrecDetails.medicalrec_count || 0,
          patient_details: patrecDetails.patient_details || null,
        },
        staff_details: {
          rp: {
            per: {
              per_fname: record.staff_details.rp?.per?.per_fname || "",
              per_lname: record.staff_details.rp?.per?.per_lname || "",
              per_mname: record.staff_details.rp?.per?.per_mname || "",
              per_suffix: record.staff_details.rp?.per?.per_suffix || "",
              per_dob: record.staff_details.rp?.per?.per_dob || "",
            },
          },
        },
      };
    });
  }, [medicalRecords]);

  const filteredData = React.useMemo(() => {
    return formatMedicalData().filter((record) => {
      const searchText = `${record.medrec_id} 
        ${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} 
        ${record.bmi_details.bmi} 
        ${record.created_at}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatMedicalData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = getMedicalConsultationColumns(patientData);

  if (!patientData?.pat_id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <Label className="text-base font-semibold text-yellow-500">
            No patient selected
          </Label>
        </div>
        <p className="text-sm text-gray-700">
          Please select a patient from the medical records page first.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Medical Consultation Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's medical consultation records
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        {selectedPatientData && (
          <div className="mb-4">
            <PatientInfoCard patient={selectedPatientData} />
          </div>
        )}

        <div className="w-full  lg:flex justify-between items-center mb-4 gap-6">
          {/* Total Medical Consultations */}
          <div className=" flex  gap-2 items-center p-2 ">
            <div className=" flex items-center justify-center ">
              <Syringe className="h-6 w-6 text-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 pr-2">
                Total Medical Consultations
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatMedicalData().length}
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-1 justify-between items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search records..."
                className="pl-10 w-full bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* New Consultation Button */}
            <Button className="w-full sm:w-auto">
              <Link
                to="/medical-consultation-form"
                state={{ params: { patientData, mode: "fromindivrecord" } }}
              >
                New Consultation Record
              </Link>
            </Button>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full  sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
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
              <TableSkeleton columns={columns} rowCount={3} />
            ) : (
              <DataTable columns={columns} data={paginatedData} />
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
