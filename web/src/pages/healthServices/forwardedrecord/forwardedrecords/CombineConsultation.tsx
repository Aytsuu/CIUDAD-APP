import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search, ChevronLeft } from "lucide-react";
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

// Common Patient Interface
export interface PatientRecord {
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  dob: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  pat_type: string;
  address: string;
}

// Child Health Checkup Interfaces
export interface ChildHealthCheckupRecord {
  chhist_id: string;
  chrec_id: string;
  chrec_details: {
    ufc_no: string;
    family_no: string;
    mother_occupation: string;
    father_occupation: string;
    type_of_feeding: string;
    newborn_screening: string;
    place_of_delivery_type: string;
    birth_order: number;
    pod_location: string;
    created_at: string;
  };
  pat_details?: {
    pat_id: string;
  };
  created_at: string;
  tt_status: string;
  status: string;
  patrec: string;
  child_health_vital_signs?: Array<{ chvital_id?: string }>;
}

// Medical Consultation Interfaces
export interface MedicalConsultationHistory {
  patrec: string;
  medrec_id: string;
  medrec_status: string;
  medrec_chief_complaint: string;
  medrec_age: string;
  created_at: string;
  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_pulse: string;
    vital_RR: string;
  };
  bmi_details: {
    height: string;
    weight: string;
  };
  find_details: any;
}

export type CombinedRecord = {
  recordType: "child-health" | "medical-consultation";
  patient: PatientRecord;
} & (
  | {
      recordType: "child-health";
      checkup: ChildHealthCheckupRecord;
    }
  | {
      recordType: "medical-consultation";
      consultation: MedicalConsultationHistory;
    }
);

export default function CombinedHealthRecordsTable() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");

  // Fetch both types of records
  const { data: childHealthData, isLoading: childHealthLoading } = useQuery({
    queryKey: ["ChildHealthCheckupHistory"],
    queryFn: async () => {
      const response = await api2.get("/child-health/history/checkup/");
      return response.data || [];
    },
  });

  const { data: medConsultData, isLoading: medConsultLoading } = useQuery({
    queryKey: ["PendingimpoRecords"],
    queryFn: async () => {
      const response = await api2.get(
        "/medical-consultation/pending-medcon-record/"
      );
      return response.data || [];
    },
  });

  const formatRecordsData = React.useCallback((): CombinedRecord[] => {
    const childRecords = childHealthData || [];
    const medRecords = medConsultData || [];

    const formattedChildRecords = childRecords.map((record: any) => {
      const details = record.chrec_details.patrec_details?.pat_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      const addressParts = [
        address.add_sitio ? `Sitio ${address.add_sitio}` : "",
        address.add_street,
        address.add_barangay,
        address.add_city,
        address.add_province,
      ]
        .filter(Boolean)
        .join(", ");

      const fullAddress = address.full_address || addressParts || "";

      const patientRecord: PatientRecord = {
        pat_id: details.pat_id || "",
        fname: info.per_fname || "",
        lname: info.per_lname || "",
        mname: info.per_mname || "",
        sex: info.per_sex || "",
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || "",
        householdno: details.households?.[0]?.hh_id || "N/A",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: details.pat_type || "",
        address: fullAddress,
      };

      const checkupRecord: ChildHealthCheckupRecord = {
        chhist_id: record.chhist_id,
        chrec_details: {
          ufc_no: record.chrec_details.ufc_no || "N/A",
          family_no: record.chrec_details.family_no || "N/A",
          mother_occupation:
            record.chrec_details.mother_occupation || "Not specified",
          father_occupation:
            record.chrec_details.father_occupation || "Not specified",
          type_of_feeding:
            record.chrec_details.type_of_feeding || "Not specified",
          newborn_screening:
            record.chrec_details.newborn_screening || "Not done",
          place_of_delivery_type:
            record.chrec_details.place_of_delivery_type || "Not specified",
          birth_order: record.chrec_details.birth_order || 0,
          pod_location: record.chrec_details.pod_location || "Not specified",
          created_at: record.chrec_details.created_at || "",
        },
        chrec_id: record.chrec || "",
        created_at: record.created_at || "",
        tt_status: record.tt_status || "Not vaccinated",
        status: record.status || "check-up",
        patrec: record.chrec_details?.patrec || "",
        child_health_vital_signs: [
          {
            chvital_id: record.child_health_vital_signs?.[0]?.chvital_id || "",
          },
        ],
        pat_details: {
          pat_id:
            record.chrec_details?.patrec_details?.pat_details?.pat_id || "",
        },
      };

      return {
        recordType: "child-health",
        patient: patientRecord,
        checkup: checkupRecord,
      };
    });

    const formattedMedRecords = medRecords.map((record: any) => {
      const details = record.patrec_details?.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

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
        pat_id: record.patrec_details?.pat_id || "",
        fname: info.per_fname || "",
        lname: info.per_lname || "",
        mname: info.per_mname || "",
        sex: info.per_sex || "",
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || "",
        householdno: details.households?.[0]?.hh_id || "N/A",
        street: address.add_street || "",
        sitio: address.sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: details.pat_type || "",
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
        recordType: "medical-consultation",
        patient: patientRecord,
        consultation,
      };
    });

    return [...formattedChildRecords, ...formattedMedRecords];
  }, [childHealthData, medConsultData]);

  const filteredData = React.useMemo(() => {
    return formatRecordsData().filter((record) => {
      const searchText = `${record.patient.pat_id} ${record.patient.lname} ${
        record.patient.fname
      } ${
        record.recordType === "child-health"
          ? record.checkup.tt_status
          : record.consultation.medrec_chief_complaint
      }`.toLowerCase();

      const typeMatches =
        recordTypeFilter === "all" || record.recordType === recordTypeFilter;

      return searchText.includes(searchQuery.toLowerCase()) && typeMatches;
    });
  }, [searchQuery, formatRecordsData, recordTypeFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<CombinedRecord>[] = [
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
        const patient = row.original.patient;
        const fullName =
          `${patient.lname}, ${patient.fname} ${patient.mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-gray-500">
                {patient.sex}, {patient.age}
              </div>
              <div className="text-xs text-gray-500">ID: {patient.pat_id}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "recordType",
      header: "Record Type",
      cell: ({ row }) => (
        <div className="text-sm min-w-[120px] capitalize">
          {row.original.recordType.replace("-", " ")}
        </div>
      ),
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        if (row.original.recordType === "child-health") {
          // Get the full record data from childHealthData
          const fullRecord = childHealthData?.find(
            (record: any) =>
              row.original.recordType === "child-health" &&
              record.chhist_id === row.original.checkup.chhist_id
          );

          const vitalSigns = fullRecord?.child_health_vital_signs?.[0];
          const nutritionStatus = fullRecord?.nutrition_statuses?.[0];

          return (
            <div className="grid grid-cols-1 gap-1 text-sm min-w-[180px]">
              <div>
                Birth Order: {row.original.checkup.chrec_details.birth_order}
              </div>
              <div>
                Feeding:{" "}
                {row.original.checkup.chrec_details.type_of_feeding.replace(
                  "_",
                  " "
                )}
              </div>
              {vitalSigns && <div>Temp: {vitalSigns.temp}°C</div>}
              {nutritionStatus && (
                <div>Nutrition: {nutritionStatus.wfa} (WFA)</div>
              )}
            </div>
          );
        } else {
          const vital = row.original.consultation.vital_signs;
          return (
            <div className="grid grid-cols-2 gap-1 text-sm min-w-[200px]">
              <div>
                BP: {vital.vital_bp_systolic}/{vital.vital_bp_diastolic} mmHg
              </div>
              <div>Temp: {vital.vital_temp}°C</div>
              <div>Pulse: {vital.vital_pulse} bpm</div>
              <div>RR: {vital.vital_RR} cpm</div>
            </div>
          );
        }
      },
    },
    {
      accessorKey: "HT and WT",
      header: "Height and Weight",
      cell: ({ row }) => {
        if (row.original.recordType === "child-health") {
          // Get height and weight from child health vital signs if available
          const vitalSigns = childHealthData?.find(
            (record: any) =>
              row.original.recordType === "child-health" &&
              record.chhist_id === row.original.checkup.chhist_id
          )?.child_health_vital_signs?.[0]?.bm_details;

          return (
            <div className="text-sm min-w-[180px]">
              {vitalSigns && (
                <>
                  <div>
                    HT:{" "}
                    {vitalSigns.height.endsWith(".00")
                      ? vitalSigns.height.slice(0, -3)
                      : vitalSigns.height}{" "}
                    cm
                  </div>
                  <div>
                    WT:{" "}
                    {vitalSigns.weight.endsWith(".00")
                      ? vitalSigns.weight.slice(0, -3)
                      : vitalSigns.weight}{" "}
                    kg
                  </div>
                </>
              )}
            </div>
          );
        } else {
          const bmi = row.original.consultation.bmi_details;
          return (
            <div className="text-sm min-w-[150px]">
              <div>
                HT:{" "}
                {bmi.height.endsWith(".00")
                  ? bmi.height.slice(0, -3)
                  : bmi.height}{" "}
                cm
              </div>
              <div>
                WT:{" "}
                {bmi.weight.endsWith(".00")
                  ? bmi.weight.slice(0, -3)
                  : bmi.weight}{" "}
                kg
              </div>
            </div>
          );
        }
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-[250px] break-words">
            {row.original.patient.address || "No address provided"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Link
            to={
              row.original.recordType === "child-health"
                ? `/child-medical-consultation`
                : "/medical-consultation-flow"
            }
            state={{
              patientData: {
                pat_id: row.original.patient.pat_id,
                pat_type: row.original.patient.pat_type,
                age: row.original.patient.age,
                addressFull: row.original.patient.address,
                address: {
                  add_street: row.original.patient.street,
                  add_barangay: row.original.patient.barangay,
                  add_city: row.original.patient.city,
                  add_province: row.original.patient.province,
                  sitio: row.original.patient.sitio,
                },
                households: [{ hh_id: row.original.patient.householdno }],
                personal_info: {
                  per_fname: row.original.patient.fname,
                  per_mname: row.original.patient.mname,
                  per_lname: row.original.patient.lname,
                  per_dob: row.original.patient.dob,
                  per_sex: row.original.patient.sex,
                },
              },
              ...(row.original.recordType === "child-health"
                ? { checkupData: row.original.checkup }
                : { MedicalConsultation: row.original.consultation }),
            }}
          >
            <Button variant="outline" size="sm">
              View{" "}
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const isLoading = childHealthLoading || medConsultLoading;

  

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
              Combined Health Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View and manage all health records in one place
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
                placeholder="Search patients, ID, or details..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter record type"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Types" },
                { id: "child-health", name: "Child Health" },
                { id: "medical-consultation", name: "Medical Consultation" },
              ]}
              value={recordTypeFilter}
              onChange={(value) => setRecordTypeFilter(value)}
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
          {isLoading ? (
            <div className="bg-white rounded-md border border-gray-200">
              {/* Skeleton for table header */}
              <div className="w-full h-16 bg-gray-50 flex items-center p-4">
                {columns.map((_, i) => (
                  <Skeleton key={`header-${i}`} className="h-6 flex-1 mx-2" />
                ))}
              </div>
              {/* Skeleton for table rows */}
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, rowIndex) => (
                  <div 
                    key={`row-${rowIndex}`} 
                    className="flex items-center justify-between space-x-4"
                  >
                    {columns.map((_, colIndex) => (
                      <Skeleton 
                        key={`cell-${rowIndex}-${colIndex}`} 
                        className="h-12 flex-1 mx-2" 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DataTable columns={columns} data={paginatedData} />
          )}
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
      <Toaster />
    </>
  );
}
