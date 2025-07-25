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
import { SelectLayout } from "@/components/ui/select/select-layout";
import { FileInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

export interface PatientRecord {
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

export interface VaccinationRecord {
  vachist_id: number;
  vaccine_name: string;
  dose_number: number;
  total_doses: number;
  status: string;
  batch_number: string;
  expiry_date: string;
  created_at: string;
  patient: PatientRecord;
  vacrec: number;
  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_pulse: string;
    vital_RR: string;
    vital_o2: string;
  };
}

export default function ScheduledVaccinations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: ScheduledVaccinations, isLoading } = useQuery({
    queryKey: ["scheduledVaccination"],
    queryFn: async () => {
      const response = await api2.get("vaccination/to-be-administered/");
      return response.data || [];
    },
  });

  const formatVaccinationData = React.useCallback((): VaccinationRecord[] => {
    if (!ScheduledVaccinations) return [];

    return ScheduledVaccinations.map((record: any) => {
      const patientDetails = record.patient || {};
      const personalInfo = patientDetails.personal_info || {};
      const address = patientDetails.address || {};

      // Construct address string
      const addressParts = [
        address.add_street,
        address.add_barangay,
        address.add_city,
        address.add_province,
      ]
        .filter(Boolean)
        .join(", ");

      const fullAddress = address.full_address || addressParts || "";

      const patientRecord: PatientRecord = {
        pat_id: patientDetails.pat_id || "",
        fname: personalInfo.per_fname || "",
        lname: personalInfo.per_lname || "",
        mname: personalInfo.per_mname || "",
        sex: personalInfo.per_sex || "",
        age: calculateAge(personalInfo.per_dob).toString(),
        dob: personalInfo.per_dob || "",
        householdno: patientDetails.households?.[0]?.hh_id || "N/A",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: patientDetails.pat_type || "",
        address: fullAddress,
      };

      return {
        vachist_id: record.vachist_id,
        vacrec: record.vacrec,
        vaccine_name:
          record.vaccine_stock?.vaccinelist?.vac_name || "Unknown Vaccine",
        dose_number: record.vachist_doseNo,
        total_doses: record.vacrec_details?.vacrec_totaldose || 1,
        status: record.vachist_status,
        batch_number: record.vaccine_stock?.batch_number || "N/A",
        expiry_date: record.vaccine_stock?.inv_details?.expiry_date || "N/A",
        created_at: record.created_at,
        patient: patientRecord,
        vital_signs: {
          vital_bp_systolic: record.vital_signs?.vital_bp_systolic || "N/A",
          vital_bp_diastolic: record.vital_signs?.vital_bp_diastolic || "N/A",
          vital_temp: record.vital_signs?.vital_temp || "N/A",
          vital_pulse: record.vital_signs?.vital_pulse || "N/A",
          vital_RR: record.vital_signs?.vital_RR || "N/A",
          vital_o2: record.vital_signs?.vital_o2 || "N/A",
        },
      };
    });
  }, [ScheduledVaccinations]);

  const filteredData = React.useMemo(() => {
    return formatVaccinationData().filter((record: VaccinationRecord) => {
      const searchText =
        `${record.patient.pat_id} ${record.patient.lname} ${record.patient.fname} ${record.vaccine_name}`.toLowerCase();

      const statusMatches =
        statusFilter === "all" ||
        record.status.toLowerCase() === statusFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && statusMatches;
    });
  }, [searchQuery, formatVaccinationData, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<VaccinationRecord>[] = [
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
        const fullName =
          `${row.original.patient.lname}, ${row.original.patient.fname} ${row.original.patient.mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-500">
                {row.original.patient.sex}, {row.original.patient.age}
              </div>
              <div className="text-xs text-gray-400">
                {row.original.patient.pat_id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "vaccine",
      header: "Vaccine",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[150px]">
          <div className="font-medium">{row.original.vaccine_name}</div>
         
        </div>
      ),
    },

    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <div className="flex flex-col ">
          <div className="text-sm text-gray-500">
            {row.original.dose_number === 1
              ? "1st dose"
              : row.original.dose_number === 2
              ? "2nd dose"
              : row.original.dose_number === 3
              ? "3rd dose"
              : `${row.original.dose_number}th dose`}{" "}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const vital = row.original.vital_signs;
        return (
          <div className="grid grid-cols-2 gap-1 text-sm min-w-[200px]">
            <div>
              BP: {vital.vital_bp_systolic}/{vital.vital_bp_diastolic}
            </div>
            <div>Temp: {vital.vital_temp}°C</div>
            <div>Pulse: {vital.vital_pulse}</div>
            <div>o2: {vital.vital_o2}</div>
          </div>
        );
      },
    },

    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-[200px] break-words">
            {row.original.patient.address || "No address provided"}
          </div>
        </div>
      ),
    },

    {
      accessorKey: "Sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div>{row.original.patient.sitio || "No address provided"}</div>
        </div>
      ),
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
        <Link
  to="/scheduled-vaccine"
  state={{
    Vaccination: row.original,
    patientData: {
      pat_id: row.original.patient.pat_id,
      pat_type: row.original.patient.pat_type,
      age: row.original.patient.age,
      addressFull: row.original.patient.address || "No address provided",
      address: {
        add_street: row.original.patient.street,
        add_barangay: row.original.patient.barangay,
        add_city: row.original.patient.city,
        add_province: row.original.patient.province,
        add_sitio: row.original.patient.sitio,
      },
      households: [{ hh_id: row.original.patient.householdno }],
      personal_info: {
        per_fname: row.original.patient.fname,
        per_mname: row.original.patient.mname,
        per_lname: row.original.patient.lname,
        per_dob: row.original.patient.dob,
        per_sex: row.original.patient.sex,
      }
    }
  }}
>
  <Button variant="outline" size="sm">
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
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Scheduled Vaccinations
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view scheduled vaccinations
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
                placeholder="Search patients, ID, or vaccine..."
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
                { id: "scheduled", name: "Scheduled" },
                { id: "completed", name: "Completed" },
                { id: "cancelled", name: "Cancelled" },
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
      <Toaster richColors />
    </>
  );
}
