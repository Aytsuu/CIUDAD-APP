import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { calculateAge } from "@/helpers/ageCalculator";
import { FileInput } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLoading } from "@/context/LoadingContext";
import { VaccinationRecord } from "../../vaccination/tables/columns/types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function ForwardedScheduledVaccinationsTables() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter] = useState("all");

  const { data: ScheduledVaccinations, isLoading } = useQuery({
    queryKey: ["scheduledVaccination"],
    queryFn: async () => {
      const response = await api2.get("vaccination/to-be-administered/");
      return response.data || [];
    }
  });

  const formatVaccinationData = useCallback((): VaccinationRecord[] => {
    if (!ScheduledVaccinations) return [];

    return ScheduledVaccinations.map((record: any) => {
      const patientDetails = record.patient || {};
      const personalInfo = patientDetails.personal_info || {};
      const address = patientDetails.address || {};
      const vitalSigns = record.vital_signs || {};
      const vaccineStock = record.vaccine_stock || {};
      const vaccineList = vaccineStock.vaccinelist || {};
      const invDetails = vaccineStock.inv_details || {};
      const vacrecDetails = record.vacrec_details || {};

      // Construct address string
      const fullAddress = address.full_address || [address.add_street, address.add_barangay, address.add_city, address.add_province].filter(Boolean).join(", ") || "";

      return {
        ...record,
        vaccine_name: vaccineList.vac_name || "Unknown Vaccine",
        vachist_doseNo: record.vachist_doseNo || "",
        vacrec_totaldose: vacrecDetails.vacrec_totaldose || 1,
        status: record.vachist_status || "",
        patrec_id:vacrecDetails.patrec_id || "",

        batch_number: vaccineStock.batch_number || "",
        expiry_date: invDetails.expiry_date || "",
        patient: {
          pat_id: patientDetails.pat_id || "",
          
          pat_type: patientDetails.pat_type || "",
          personal_info: personalInfo,
          address: {
            add_street: address.add_street || "",
            add_barangay: address.add_barangay || "",
            add_city: address.add_city || "",
            add_province: address.add_province || "",
            add_sitio: address.add_sitio || "",
            full_address: fullAddress
          }
        },
        vital_signs: {
          vital_bp_systolic: vitalSigns.vital_bp_systolic || "N/A",
          vital_bp_diastolic: vitalSigns.vital_bp_diastolic || "N/A",
          vital_temp: vitalSigns.vital_temp || "N/A",
          vital_pulse: vitalSigns.vital_pulse || "N/A",
          vital_RR: vitalSigns.vital_RR || "N/A",
          vital_o2: vitalSigns.vital_o2 || "N/A",
          created_at: vitalSigns.created_at || ""
        },
        vaccine_stock: {
          ...vaccineStock,
          vaccinelist: vaccineList
        },
        vacrec_details: vacrecDetails
      };
    });
  }, [ScheduledVaccinations]);

  const filteredData = useMemo(() => {
    return formatVaccinationData().filter((record: VaccinationRecord) => {
      const searchText = `${record.patient?.personal_info?.per_id || ""} ${record.patient?.personal_info?.per_lname || ""} ${record.patient?.personal_info?.per_fname || ""} ${record.vaccine_name || ""}`.toLowerCase();

      const statusMatches = statusFilter === "all" || (record.vachist_status || "").toLowerCase() === statusFilter.toLowerCase();

      return searchText.includes(searchQuery.toLowerCase()) && statusMatches;
    });
  }, [searchQuery, formatVaccinationData, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: ColumnDef<VaccinationRecord>[] = [
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient?.personal_info;
        const fullName = `${patient?.per_lname || ""}, ${patient?.per_fname || ""} ${patient?.per_mname || ""}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-500">
                {patient?.per_sex || ""}, {patient?.per_dob ? calculateAge(patient.per_dob).toString() : "N/A"}
              </div>
              <div className="text-xs text-gray-400">{row.original.patient?.personal_info?.per_id || ""}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "vaccine",
      header: "Vaccine",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[150px]">
          <div className="font-medium">{row.original.vaccine_name || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-sm text-gray-500">{String(row.original.vachist_doseNo) === "1" ? "1st dose" : String(row.original.vachist_doseNo) === "2" ? "2nd dose" : String(row.original.vachist_doseNo) === "3" ? "3rd dose" : `${String(row.original.vachist_doseNo) || ""}th dose`}</div>
        </div>
      )
    },
    {
      accessorKey: "vital_signs",
      header: "Vital Signs",
      cell: ({ row }) => {
        const vital = row.original.vital_signs || {};
        return (
          <div className="grid grid-cols-2 gap-1 text-sm min-w-[200px]">
            <div>
              BP: {vital.vital_bp_systolic || "N/A"}/{vital.vital_bp_diastolic || "N/A"}
            </div>
            <div>Temp: {vital.vital_temp || "N/A"}°C</div>
            <div>Pulse: {vital.vital_pulse || "N/A"}</div>
            <div>o2: {vital.vital_o2 || "N/A"}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.patient?.address;
        return (
          <div className="flex justify-start px-2">
            <div className="w-[200px] break-words">{address?.full_address || [address?.add_street, address?.add_barangay, address?.add_city, address?.add_province].filter(Boolean).join(", ") || "No address provided"}</div>
          </div>
        );
      }
    },
    {
      accessorKey: "Sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div>{row.original.patient?.address?.add_sitio || "No address provided"}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const patient = row.original.patient?.personal_info;
        const address = row.original.patient?.address;
        return (
          <div className="flex justify-center gap-2">
            <Link
              to="/scheduled-vaccine"
              state={{
                Vaccination: row.original,
                patientData: {
                  patrec_id:row.original.patrec_id || "",
                  pat_id: row.original.patient?.pat_id || "",
                  pat_type: row.original.patient?.pat_type || "",
                  age: patient?.per_dob ? calculateAge(patient.per_dob).toString() : "N/A",
                  addressFull: address?.full_address || [address?.add_street, address?.add_barangay, address?.add_city, address?.add_province].filter(Boolean).join(", ") || "No address provided",
                  address: {
                    add_street: address?.add_street || "",
                    add_barangay: address?.add_barangay || "",
                    add_city: address?.add_city || "",
                    add_province: address?.add_province || "",
                    add_sitio: address?.add_sitio || ""
                  },
                  households: [{ hh_id: row.original.patient?.households?.[0]?.hh_id || "N/A" }],
                  personal_info: {
                    per_fname: patient?.per_fname || "",
                    per_mname: patient?.per_mname || "",
                    per_lname: patient?.per_lname || "",
                    per_dob: patient?.per_dob || "",
                    per_sex: patient?.per_sex || ""
                  }
                }
              }}
            >
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        );
      }
    }
  ];

  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <>
      <LayoutWithBack title="Scheduled Vaccinations" description="Manage and view scheduled vaccinations for patients.">
        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input placeholder="Search patients, ID, or vaccine..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
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
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <DataTable columns={columns} data={paginatedData} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </LayoutWithBack>
    </>
  );
}
