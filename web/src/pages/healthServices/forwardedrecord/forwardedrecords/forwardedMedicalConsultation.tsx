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
import { MedicalConsultationHistory } from "@/pages/healthServices/medicalconsultation/medicalhistory/table-history";
import { medicalConsultation } from "@/routers/medConsultation";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { FileInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

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
  dob: string;
}

export interface PendingConsultationRecord extends MedicalRecord {
  consultation: MedicalConsultationHistory;
}

export default function PendingimpoRecords() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: PendingConsultations, isLoading } = useQuery({
    queryKey: ["PendingimpoRecords"],
    queryFn: async () => {
      const response = await api2.get("/medical-consultation/pending-medcon-record/");
      return response.data || [];
    },
  });

  const formatPendingConsultationData = React.useCallback((): PendingConsultationRecord[] => {
    if (!PendingConsultations) return [];

    return PendingConsultations.map((record: any) => {
      const details = record.patrec_details?.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      // Construct address string
      const addressParts = [
        address.add_street,
        address.add_barangay, 
        address.add_city,
        address.add_province
      ].filter(Boolean).join(", ");
      
      const fullAddress = address.full_address || addressParts || "";

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
        address: fullAddress,
      };

      const consultation: MedicalConsultationHistory = {
        patrec: record.patrec,
        medrec_id: record.medrec_id,
        medrec_status: record.medrec_status,
        medrec_chief_complaint: record.medrec_chief_complaint,
        medrec_age: record.medrec_age,
        created_at: record.created_at,
        vital_signs: record.vital_signs,
        bmi_details: record.bmi_details,
        find_details: record.find_details || null,
      };

      return {
        ...patientRecord,
        consultation,
      };
    });
  }, [PendingConsultations]);

  const filteredData = React.useMemo(() => {
    return formatPendingConsultationData().filter((record: PendingConsultationRecord) => {
      const searchText = `${record.pat_id} ${record.lname} ${record.fname} ${record.consultation.medrec_chief_complaint}`.toLowerCase();
      
      const statusMatches = 
        statusFilter === "all" || 
        record.consultation.medrec_status.toLowerCase() === statusFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && statusMatches;
    });
  }, [searchQuery, formatPendingConsultationData, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<PendingConsultationRecord>[] = [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
                {row.original.sex}, {row.original.age} 
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
          <div className="grid grid-cols-2 gap-1 text-sm min-w-[200px]">
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
            <div>HT: {bmi.height.endsWith(".00") ? bmi.height.slice(0, -3) : bmi.height} cm</div>
            <div>WT: {bmi.weight.endsWith(".00") ? bmi.weight.slice(0, -3) : bmi.weight} kg</div>
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
        <div className="flex justify-start px-2">
             <div className="w-[250px] break-words">{row.original.address || "No address provided"}</div>
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
    // {
    //   accessorKey: "created_at",
    //   header: "Date",
    //   cell: ({ row }) => (
    //     <div className="text-sm min-w-[100px]">
    //       {new Date(row.original.consultation.created_at).toLocaleDateString()}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Link
            to="/medical-consultation-flow"
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
                  sitio: row.original.sitio,
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
      <div className="w-full h-full flex flex-col">
       <div className="flex flex-col sm:flex-row gap-4 ">
               <Button
                 className="text-black p-2 mb-2 self-start"
                 variant={"outline"}
                 onClick={() => navigate(-1)}
               >
                 <ChevronLeft />
               </Button>
               <div className="flex-col items-center mb-4">
                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                   Forwarded Medical Consultation Records
                 </h1>
                 <p className="text-xs sm:text-sm text-darkGray">
                   Manage and view Medical Consultation Records
                 </p>
               </div>
             </div>
             <hr className="border-gray mb-5 sm:mb-8" />

        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search patients, ID, or complaint..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter status"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Status" },
                { id: "pending", name: "Pending" },
                { id: "in-progress", name: "In Progress" },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            />
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
                    <FileInput className="mr-2 h-4 w-4" />
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
              {filteredData.length} rows
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