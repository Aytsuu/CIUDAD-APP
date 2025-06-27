import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Search, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "sonner";
import { api2 } from "@/api/api";
import { calculateAge } from "@/helpers/ageCalculator";

// Medical Record interface (following your reference pattern)
export interface MedicalRecord {
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  pat_type: string;
  address: string;
  medicalrec_count: number;
  dob: string;
}

// Medical Consultation interface (additional data for pending consultations)
export interface MedicalConsultation {
  medrec_id: number;
  medrec_status: string;
  medrec_chief_complaint: string;
  medrec_age: string;
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
    patrec: number | null;
  };
  bmi_details: {
    bm_id: number;
    age: string;
    height: string;
    weight: string;
    bmi: string;
    created_at: string;
    patrec: number;
  };
}

// Combined interface for pending consultations
export interface PendingConsultationRecord extends MedicalRecord {
  consultation: MedicalConsultation;
}

export default function PendingMedicalConsultationRecords() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: PendingConsultations, isLoading } = useQuery({
    queryKey: ["PendingMedicalConsultationRecords"],
    queryFn: async () => {
      const response = await api2.get("/medical-consultation/pending-medcon-record/");
      return response.data || [];
    },
  });

  // Format data following your reference pattern
  const formatPendingConsultationData = React.useCallback((): PendingConsultationRecord[] => {
    if (!PendingConsultations) return [];

    return PendingConsultations.map((record: any) => {
      const details = record.patrec_details?.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      // Patient details (following MedicalRecord structure)
      const patientRecord: MedicalRecord = {
        pat_id: record.patrec_details?.pat_id || '',
        fname: info.per_fname || '',
        lname: info.per_lname || '',
        mname: info.per_mname || '',
        sex: info.per_sex || '',
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || '',
        householdno: details.households?.[0]?.hh_id || "N/A",
        street: address.add_street || '',
        sitio: address.sitio || '',
        barangay: address.add_barangay || '',
        city: address.add_city || '',
        province: address.add_province || '',
        pat_type: details.pat_type || '',
        address: address.full_address || `${address.add_street || ''}, ${address.add_barangay || ''}, ${address.add_city || ''}, ${address.add_province || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
        medicalrec_count: 0, // Not available in pending consultation data
      };

      // Medical consultation details
      const consultation: MedicalConsultation = {
        medrec_id: record.medrec_id,
        medrec_status: record.medrec_status,
        medrec_chief_complaint: record.medrec_chief_complaint,
        medrec_age: record.medrec_age,
        created_at: record.created_at,
        vital_signs: record.vital_signs,
        bmi_details: record.bmi_details,
      };

      return {
        ...patientRecord,
        consultation,
      };
    });
  }, [PendingConsultations]);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    return formatPendingConsultationData().filter((record: PendingConsultationRecord) => {
      const searchText = `${record.pat_id} ${record.lname} ${record.fname} ${record.consultation.medrec_chief_complaint}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatPendingConsultationData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<PendingConsultationRecord>[] = [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-500">
                {row.original.sex}, {row.original.age} years old
              </div>
              <div className="text-xs text-gray-400">
                ID: {row.original.pat_id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const vital = row.original.consultation.vital_signs;
        return (
          <div className="grid grid-cols-2 gap-1 text-sm min-w-[160px]">
            <div>BP: {vital.vital_bp_systolic}/{vital.vital_bp_diastolic}</div>
            <div>Temp: {vital.vital_temp}°C</div>
            <div>Pulse: {vital.vital_pulse}</div>
            <div>RR: {vital.vital_RR}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "bmi_details",
      header: "BMI Details",
      cell: ({ row }) => {
        const bmi = row.original.consultation.bmi_details;
        return (
          <div className="text-sm min-w-[120px]">
            <div>H: {bmi.height}cm</div>
            <div>W: {bmi.weight}kg</div>
            <div>BMI: {bmi.bmi}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "complaint",
      header: "Chief Complaint",
      cell: ({ row }) => (
        <div className="text-sm min-w-[150px]">
          {row.original.consultation.medrec_chief_complaint || "Not specified"}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate text-sm">{row.original.address}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full text-sm">{row.original.pat_type}</div>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm min-w-[100px]">
          {new Date(row.original.consultation.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Link
            to="/pending-medical-con-form"
            state={{ 
              patientData: {
                pat_id: row.original.pat_id,
                pat_type: row.original.pat_type,
                age: row.original.age,
                addressFull: row.original.address,
                address: {
                  add_street: row.original.street,
                  add_barangay: row.original.barangay,
                  add_city: row.original.city,
                  add_province: row.original.province,
                  add_external_sitio: row.original.sitio,
                },
                households: [{ hh_id: row.original.householdno }],
                personal_info: {
                  per_fname: row.original.fname,
                  per_mname: row.original.mname,
                  per_lname: row.original.lname,
                  per_dob: row.original.dob,
                  per_sex: row.original.sex,
                },
              },
              MedicalConsultation: row.original.consultation 
            }}
          >
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
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
      <div className="w-full h-full flex flex-col p-4">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-xl text-darkBlue2">
              Pending Medical Consultations
            </h1>
            <p className="text-sm text-darkGray">
              {filteredData.length} pending consultation records
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients, ID, or complaint..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={paginatedData} />
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} records
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}