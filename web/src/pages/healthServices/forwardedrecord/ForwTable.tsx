import React, { useState, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Toaster } from "sonner";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { api2 } from "@/api/api";
import { Link } from "react-router-dom";
import { format } from "path";

export interface ForwardedVaccinationRecord {
  vachist_id: number;

  vaccine_stock?: {
    vacStck_id: number;
    vaccinelist?: {
      vac_id: number;
      vac_name: string;
      vac_type: string;
    };
  };
  patient_details?: {
    personal_info?: {
      per_fname: string;
      per_lname: string;
      per_mname: string;
      per_sex: string;
      per_dob: string;
    };
    address?: {
      add_street: string;
      add_barangay: string;
      add_city: string;
      add_province: string;
      sitio: string;
    };
    pat_id: string;
    pat_type: string;
  };
  vachist_doseNo: number;
  vachist_status: string;
  created_at: string;
}

interface FormattedForwardedRecord {
  id: number;
  vaccineName: string;
  patientName: string;
  patientSex: string;
  patientAge: string;
  address: string;
  sitio: string;
  doseNo: number;
  status: string;
  dateForwarded: string;
  pat_id: string;
  pat_type: string;
  dob: string; // Added dob property
  vac_type: string; // Added vac_type property
  vital_id:number,
  vacStck_id: number; // Added vacStck_id property
  patrec_id: string; // Optional property for patient record ID
  maxDoses: number; // Optional property for maximum doses 
  vacStck_qty_avail: number; // Optional property for available vaccine stock quantity
  vacrec_id: number; // Added vacrec_id property
  existing_followv_id: number | null; // Added follow-up visit ID
}

export default function ForwardedVaccinationRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch forwarded vaccination records
  const { data: forwardedRecords, isLoading } = useQuery({
    queryKey: ["forwardedVaccinationRecords"],
    queryFn: async () => {
      const response = await api2.get(
        "/vaccination/forwarded-vaccination-records/"
      );
      if (!response) {
        throw new Error("Failed to fetch forwarded vaccination records");
      }
      return response.data as ForwardedVaccinationRecord[];
    },
  });

  // Format data using useCallback
  const formatForwardedData = useCallback((): FormattedForwardedRecord[] => {
    if (!forwardedRecords) return [];

    return forwardedRecords.map((record: any) => {
      const personalInfo = record.patient?.personal_info || {};
      const addressInfo = record.patient?.address || {};
      const vaccineInfo = record.vaccine_stock?.vaccinelist || {};

      return {
        id: record.vachist_id,
        vacrec_id: record.vacrec,
        patrec_id: record.vacrec_details?.patrec_id || "", // Optional property for patient record ID
        vacStck_id:record.vacStck_id,
        vaccineName: vaccineInfo.vac_name || "Unknown Vaccine",
        maxDoses: vaccineInfo.vaccinelist?.no_of_doses || 0, // Optional property for maximum doses
        patientName: `${personalInfo.per_lname || ""}, ${
          personalInfo.per_fname || ""
        } ${personalInfo.per_mname || ""}`.trim(),
        patientSex: personalInfo.per_sex || "N/A",
        patientAge: personalInfo.per_dob
          ? calculateAge(personalInfo.per_dob)
          : "N/A",
        address: `${addressInfo.add_street || ""}, ${
          addressInfo.add_barangay || ""
        }, ${addressInfo.add_city || ""}`,
        dob: personalInfo.per_dob || "N/A",
        sitio: addressInfo.sitio || "N/A",
        doseNo: record.vachist_doseNo || 0,
        vac_type: vaccineInfo.vac_type_choices || "N/A",
        status: record.vachist_status || "unknown",
        existing_followv_id: record.followv_id || null, // Added follow-up visit ID
        dateForwarded: record.created_at || "N/A",
        pat_id: record.patient_details?.pat_id || "",
        pat_type: record.patient_details?.pat_type || "",
        vital_id: record.vital_id || 0, // Added vital_id property
        vacStck_qty_avail: vaccineInfo.vacStck_qty_avail || 0, // Added vacStck_qty_avail property
      
      };
    });
  }, [forwardedRecords]);
  console.log("Formatted Forwarded Records:", formatForwardedData());

  React.useEffect(() => {
    const formattedData = formatForwardedData();
    console.table(formattedData);
  }, [formatForwardedData]);
  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    const formattedData = formatForwardedData();
    return formattedData.filter((record) => {
      const searchText = `${record.patientName} 
        ${record.vaccineName} 
        ${record.sitio}`.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatForwardedData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<FormattedForwardedRecord>[] = [
    {
      accessorKey: "vaccineName",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vaccine Name <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          {row.original.vaccineName}
        </div>
      ),
    },
    {
      accessorKey: "patientName",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">
              {row.original.patientName}
            </div>
            <div className="text-sm text-darkGray">
              {row.original.patientSex}, {row.original.patientAge}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[250px] px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          {row.original.sitio}
        </div>
      ),
    },
    {
      accessorKey: "doseNo",
      header: "Dose No.",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          {row.original.doseNo}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.original.status === "forwarded"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.status}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "dateForwarded",
      header: "Date Forwarded",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[150px] px-2">
          {new Date(row.original.dateForwarded).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Link
              to="/forwarded-vaccination-form"
              state={{
                params: {
                  patientData: {
                    pat_id: row.original.pat_id,
                    pat_type: row.original.pat_type,
                    age: row.original.patientAge,
                    addressFull: row.original.address,
                    address: {
                      add_street: row.original.address.split(", ")[0] || "",
                      add_barangay: row.original.address.split(", ")[1] || "",
                      add_city: row.original.address.split(", ")[2] || "",
                      add_province: "", // Not available in formatted data
                      add_external_sitio: row.original.sitio,
                    },
                    households: [{ hh_id: "" }], // householdno not available
                    personal_info: {
                      per_fname:
                        row.original.patientName
                          .split(", ")[1]
                          ?.split(" ")[0] || "",
                      per_mname:
                        row.original.patientName
                          .split(", ")[1]
                          ?.split(" ")[1] || "",
                      per_lname: row.original.patientName.split(", ")[0] || "",
                      per_dob: row.original.dob, // Reverse calculation based on age
                      per_sex: row.original.patientSex,
                    },
                  },
                  vaccineName: row.original.vaccineName,
                  vaccineType: row.original.vac_type,
                  vaccineDose: row.original.doseNo,
                  vachist_id: row.original.id,
                  vacStck_id: row.original.vacStck_id, 
                  patrec_id: row.original.patrec_id, // Pass patient record ID
                  maxDoses: row.original.maxDoses, // Pass maximum doses
                  vacStck_qty_avail: row.original.vacStck_qty_avail, // Pass available vaccine stock quantity
                  vacrec_id: row.original.vacrec_id, // Pass vacrec_id
                  existing_followv_id: row.original.existing_followv_id, // Pass follow-up visit ID 
                
                },
              }}
            >
              View Details
            </Link>
          </Button>
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
      <Toaster richColors position="top-right" />
      <div className="w-full h-full flex flex-col">
        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search by name, vaccine, or sitio..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-3 justify-start items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-[70px] h-8 flex items-center justify-center text-center"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
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
