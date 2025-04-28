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
import { getMedconRecordById } from "../restful-api/GetMedicalRecord";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { UserRound, Fingerprint, Syringe, MapPin } from "lucide-react";
import { calculateAge } from "@/helpers/ageCalculator"; // Adjust the import path as necessary


// Updated Medical Records Type
export interface MedicalRecord {
  medrec_id: number;
  created_at: string;
  
  vital_signs: {
    vital_id: number;
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_o2: string;
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
    pat_id: number;
    medicalrec_count: number;
  };
}

// Updated React Component
export default function InvMedicalConRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  let currentAge = calculateAge(patientData.dob).toString();

  const { data: medicalRecords, isLoading } = useQuery({
    queryKey: ["patientMedicalDetails", patientData.pat_id],
    queryFn: () => getMedconRecordById(patientData.pat_id),
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatMedicalData = React.useCallback((): MedicalRecord[] => {
    if (!medicalRecords) return [];

    return medicalRecords.map((record: any) => {
      return {
        medrec_id: record.medrec_id,
        created_at: record.created_at || "N/A",
        
        vital_signs: record.vital_signs || {
          vital_id: 0,
          vital_bp_systolic: "N/A",
          vital_bp_diastolic: "N/A",
          vital_temp: "N/A",
          vital_RR: "N/A",
          vital_o2: "N/A",
          vital_pulse: "N/A",
          created_at: "N/A"
        },
        
        bmi_details: record.bmi_details || {
          bm_id: 0,
          age: "N/A",
          height: 0,
          weight: 0,
          bmi: "N/A",
          bmi_category: "N/A",
          created_at: "N/A",
          pat: null
        },
        
        find_details: record.find_details || null,
        
        patrec_details: record.patrec_details || {
          pat_id: 0,
          medicalrec_count: 0
        }
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
      accessorKey: "medrec_id",
      header: "Record ID",
      cell: ({ row }) => (
        <div className="font-medium">#{row.original.medrec_id}</div>
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
                  <span className="font-medium mr-1">Pulse:</span>
                  <span>{vital.vital_pulse} bpm</span>
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
      accessorKey: "bmi_details",
      header: "BMI Details",
      cell: ({ row }) => {
        const bmi = row.original.bmi_details;
        return (
          <div className="flex flex-col">
            <div className="font-medium">BMI: {bmi.bmi}</div>
            <div className="text-sm">Category: {bmi.bmi_category}</div>
            <div className="text-sm">
              Height: {bmi.height} ft | Weight: {bmi.weight} kg
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
            to="/viewMedConRecord"
            state={{ params: { MedicalRecord: row.original, patientData } }}
          >
            <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
              View
            </Button>
          </Link>
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
              Medical Consultation Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's medical consultation records
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
                <UserRound className="h-4 w-4" />
                Full Name
              </p>
              <p className="font-medium">{`${patientData.lname}, ${
                patientData.fname
              } ${patientData.mname || ""}`}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <UserRound className="h-4 w-4" />
                BirthDate and Age
              </p>
              <p className="font-medium">{`${patientData.dob}, 
              `} {currentAge} </p>
            </div>
           
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Address
              </p>
              <p className="font-medium">{patientData.address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Syringe className="h-4 w-4" />
                Total Consultations
              </p>
              <p className="font-medium">
                {formatMedicalData().length} records
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
              <Link to="/medicalConsultationForm" state={{ params: { patientData } }}>
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