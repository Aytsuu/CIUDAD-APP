import React, { useState, useEffect } from "react";
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
import { getMedconRecordById } from "../restful-api/GetMedicalRecord";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import {
  UserRound,
  Fingerprint,
  Syringe,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { calculateAge } from "@/helpers/ageCalculator";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";

export interface MedicalRecord {
  medrec_id: number;
  created_at: string;
  vital_signs: {
    vital_id: number;
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_pulse: string;
    created_at: string;
  };
  bmi_details: {
    bm_id: number;
    age: string;
    height: number;
    weight: number;
    bmi: string;
    bmi_category: string;
    created_at: string;
    pat: number | null;
  };
  find_details: any | null;
  patrec_details: {
    pat_id: string | number;
    medicalrec_count: number;
    patient_details?: any;
  };
}

export interface Patient {
  pat_id: string;
  name: string;
  pat_type: string;
  [key: string]: any;
}

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

  const { data: medicalRecords, isLoading } = useQuery({
    queryKey: ["patientMedicalDetails", patientData?.pat_id],
    queryFn: () => getMedconRecordById(patientData?.pat_id),
    refetchOnMount: true,
    staleTime: 0,
    enabled: !!patientData?.pat_id,
  });

  const formatMedicalData = React.useCallback((): MedicalRecord[] => {
    if (!medicalRecords) return [];

    return medicalRecords.map((record: any) => {
      const vitalSigns = record.vital_signs || {};
      const bmiDetails = record.bmi_details || {};
      const patrecDetails = record.patrec_details || {};

      return {
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

  const columns: ColumnDef<MedicalRecord>[] = [
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
                  <span className="font-medium mr-1">Pulse:</span>
                  <span>{vital.vital_pulse} bpm</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">RR:</span>
                  <span>{vital.vital_RR} cpm</span>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "bmi_details",
      header: "Height and Weight",
      cell: ({ row }) => {
        const bmi = row.original.bmi_details;
        return (
          <div className="flex flex-col">
            <div className="text-sm">
              Height: {bmi.height} cm | Weight: {bmi.weight} kg
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const createdAt = new Date(row.original.created_at);
        const formattedDate = createdAt.toLocaleDateString();
        const formattedTime = createdAt.toLocaleTimeString();

        return (
          <div className="text-sm text-gray-600">
            {formattedDate}
            <div className="text-xs text-gray-400">{formattedTime}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Link
            to="/DisplayMedicalConsultation"
            state={{ params: { MedicalConsultation: row.original, patientData } }}
          >
            <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

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

        <div className="bg-white rounded-md p-5 mb-6 border border-gray-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 border rounded-md flex items-center justify-center shadow-sm">
              <Syringe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Total Medical Consultations
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatMedicalData().length}
              </p>
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
              <Link to="/IndivMedicalForm" state={{ params: { patientData } }}>
                New Consultation Record
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
    </>
  );
}
