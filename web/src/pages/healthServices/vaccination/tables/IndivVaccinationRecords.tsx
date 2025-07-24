import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  Search,
  ChevronLeft,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getVaccinationRecordById,
  getUnvaccinatedVaccines,
} from "../restful-api/get";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { UserRound, Syringe, MapPin } from "lucide-react";
import { calculateAge } from "@/helpers/ageCalculator";
import { api2 } from "@/api/api";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { PatientInfoCard } from "@/components/ui//patientInfoCard";
import { Label } from "@/components/ui/label";
import { useVaccinationCount } from "../queries/VacCount";
import {Patient} from "@/pages/healthServices/restful-api-patient/type"
import {VaccinationRecord,filter} from "./columns/types";  


export default function IndivVaccinationRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};

  const navigate = useNavigate();
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [recordToArchive, setRecordToArchive] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [unvaccinatedVaccines, setUnvaccinatedVaccines] = useState<
    { vac_name: string; vac_type_choices: string }[]
  >([]);
  const [filter, setfilter] = useState<filter>("all");
  const [followupVaccines, setFollowupVaccines] = useState<any[]>([]);
  const [isUnvaccinatedLoading, setIsUnvaccinatedLoading] = useState(true);
  const queryClient = useQueryClient();

  // Guard clause for missing patientData
  if (!patientData?.pat_id) {
    return <div>Error: Patient ID not provided</div>;
  }
  const [selectedPatientData, setSelectedPatientData] =
    useState<Patient | null>(null);

  useEffect(() => {
    // Get patient data from route state
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  const { data: vaccinationRecords, isLoading: isVaccinationRecordsLoading } =
    useQuery({
      queryKey: ["patientVaccinationDetails", patientData.pat_id],
      queryFn: () => getVaccinationRecordById(patientData.pat_id),
      refetchOnMount: true,
      staleTime: 0,
    });

 
   const { data: vaccinationCountData } = useVaccinationCount(patientData.pat_id);
   const vaccinationCount = vaccinationCountData?.vaccination_count;
    
    
  
  const formatVaccinationData = React.useCallback((): VaccinationRecord[] => {
    if (!vaccinationRecords) return [];
    return vaccinationRecords.map((record: any) => {
      console.log(
        "Vaccine Type Choice:",
        record?.vaccine_stock?.vaccinelist?.vac_type_choices
      );
      return {
        patrec_id: record.vacrec_details?.patrec_id,
        vachist_id: record.vachist_id,
        vachist_doseNo: record.vachist_doseNo,
        vachist_status: record.vachist_status,
        vachist_age: record.vachist_age,
        assigned_to: record.assigned_to,
        staff_id: record.staff_id,
        vital: record.vital,
        vacrec: record.vacrec,
        vacStck: record.vacStck,
        vacrec_totaldose: record.vacrec_totaldose,
        vacrec_status: record.vacrec_details?.vacrec_status,
        vaccination_count: record.vaccination_count || 0,
        created_at: record.created_at || "N/A",
        vital_signs: record.vital_signs || {
          vital_bp_systolic: "N/A",
          vital_bp_diastolic: "N/A",
          vital_temp: "N/A",
          vital_RR: "N/A",
          vital_o2: "N/A",
          created_at: "N/A",
        },
        vaccine_stock: record.vaccine_stock || null,
        vaccine_name: record.vaccine_stock?.vaccinelist?.vac_name || "Unknown",
        batch_number: record.vaccine_stock?.batch_number || "N/A",
        vaccine_details: {
          no_of_doses: record.vaccine_stock?.vaccinelist?.no_of_doses || 0,
          age_group: record.vaccine_stock?.vaccinelist?.age_group || "N/A",
          vac_type:
            record.vaccine_stock?.vaccinelist?.vac_type_choices || "N/A",
        },
        follow_up_visit: {
          followv_id: record.follow_up_visit?.followv_id,
          followv_date: record.follow_up_visit?.followv_date || "No Schedule",
          followv_status: record.follow_up_visit?.followv_status || "N/A",
        },
      };
    });
  }, [vaccinationRecords]);

  useEffect(() => {
    const fetchUnvaccinatedVaccines = async () => {
      try {
        setIsUnvaccinatedLoading(true);
        const res = await getUnvaccinatedVaccines(patientData.pat_id); 
        
        // Add proper error handling and data validation
        if (Array.isArray(res)) {
          setUnvaccinatedVaccines(
            res.map((vaccine: any) => ({
              vac_name: vaccine?.vac_name || "Unknown Vaccine",
              vac_type_choices: vaccine?.vac_type_choices || "Unknown Type"
            }))
          );
        } else {
          console.warn("Unexpected response format for unvaccinated vaccines:", res);
          setUnvaccinatedVaccines([]);
        }
      } catch (err) {
        console.error("Error fetching unvaccinated vaccines:", err);
        setUnvaccinatedVaccines([]);       
      } finally {
        setIsUnvaccinatedLoading(false);   
      }
    };
    
    if (patientData?.pat_id) {            
      fetchUnvaccinatedVaccines();
    }
  }, [patientData.pat_id]);                


  useEffect(() => {
    const fetchFollowupVaccines = async () => {
      try {
        const res = await api2.get(
          `/vaccination/patient-vaccine-followups/${patientData.pat_id}/`
        );
        setFollowupVaccines(res.data);
      } catch (error) {
        console.error("Error fetching follow-up vaccines:", error);
        setFollowupVaccines([]);
      }
    };

    if (patientData?.pat_id) {
      fetchFollowupVaccines();
    }
  }, [patientData.pat_id]);
  

  const filteredData = React.useMemo(() => {
    return formatVaccinationData().filter((record) => {
      const searchText =
        `${record.vachist_id} ${record.vaccine_name} ${record.batch_number} ${record.vachist_doseNo} ${record.vachist_status}`.toLowerCase();
      const matchesSearch = searchText.includes(searchQuery.toLowerCase());
      let matchesFilter = true;
      if (filter !== "all") {
        const status = record.vachist_status.toLowerCase();
        if (filter === "partially_vaccinated") {
          matchesFilter = status === "partially vaccinated";
        } else if (filter === "completed") {
          matchesFilter = status === "completed";
        }
      }
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, formatVaccinationData, filter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

 

  const columns: ColumnDef<VaccinationRecord>[] = [
    {
      accessorKey: "vaccine_name",
      header: "Vaccine",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[150px] px-2">
          <div className="font-medium">
            {row.original.vaccine_name}
            <div className="text-xs text-gray-500">
              Batch: {row.original.batch_number}
            </div>
            <div className="text-xs text-gray-500">
              Type: {row.original.vaccine_details.vac_type}
            </div>
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
                <div className="flex items-center"></div>
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
      accessorKey: "vachist_doseNo",
      header: "Dose",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {row.original.vachist_doseNo}
            <div className="text-xs text-gray-500 mt-1">
              Required Doses {row.original.vaccine_details.no_of_doses} dose/s
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "vachist_status",
      header: "Status",
      cell: ({ row }) => {
        const statusColors = {
          completed: "bg-green-100 text-green-800",
          "partially vaccinated": "text-red-500",
        };
        return (
          <div className="flex flex-col justify-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[
                  row.original.vachist_status as keyof typeof statusColors
                ] || "bg-gray-100 text-gray-800"
              }`}
            >
              {row.original.vachist_status}
            </span>
            <div>
              <div className="text-xs mt-1">
                {row.original.follow_up_visit.followv_status.toLowerCase() ===
                "completed" ? (
                  "Next Dose: completed"
                ) : (
                  <>
                    Next Dose:{" "}
                    {isNaN(
                      new Date(
                        row.original.follow_up_visit.followv_date
                      ).getTime()
                    ) ? (
                      "No Schedule"
                    ) : (
                      <span className="text-red-500">
                        {new Date(
                          row.original.follow_up_visit.followv_date
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const updatedAt = new Date(row.original.created_at);
        const formattedDate = updatedAt.toLocaleDateString();
        const formattedTime = updatedAt.toLocaleTimeString();
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
            to="/vaccinationView"
            state={{ params: { Vaccination: row.original, patientData } }}
          >
            <Button variant="outline" size="sm" className="h-8 w-[50px] p-0">
              View
            </Button>
          </Link>
          {row.original.follow_up_visit.followv_status.toLowerCase() ===
            "pending" && (
            <Link
              to="/updateVaccinationForm"
              state={{ params: { Vaccination: row.original, patientData } }}
            >
              <Button variant="destructive" size="sm" className="h-8 p-2">
                update
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  if (
    isVaccinationRecordsLoading ||
    isUnvaccinatedLoading
  ) {
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
              Vaccination Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patient's vaccination records
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className=" bg-white  border-gray-200 p-4 mb-4">
          {selectedPatientData ? (
            <div className="mb-4">
              <PatientInfoCard patient={selectedPatientData} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <Label className="text-base font-semibold text-yellow-500">
                  No patient selected
                </Label>
              </div>
              <p className="text-sm text-gray-700">
                Please select a patient from the medicine records page first.
              </p>
            </div>
          )}

          <div className="bg-white rounded-sm shadow-md border border-gray-300 p-6 mb-6">
            {/* Total Vaccinations */}
            <div className="bg-gray-100 rounded-xl p-5 mb-6 border border-gray-300 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 border  rounded-md flex items-center justify-center shadow-sm">
                  <Syringe className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Total Vaccinations
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vaccinationCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mb-4">
              <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-md shadow-sm">
                    <Syringe
                      className="h-5 w-5 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  Unvaccinated Vaccines
                </h2>
                {unvaccinatedVaccines.length > 0 ? (
                  <ul className="space-y-3" role="list">
                    {unvaccinatedVaccines.map((vaccine, index) => (
                      <li
                        key={index}
                        className="bg-white rounded-xl p-2 border border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        role="listitem"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0 shadow-sm"></div>
                          <span className="font-semibold text-gray-800">
                            {vaccine.vac_name}
                          </span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
                              vaccine.vac_type_choices.toLowerCase() ===
                              "routine"
                                ? "bg-gray-200 text-gray-700 border border-gray-300"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                            aria-label={`Vaccine type: ${vaccine.vac_type_choices}`}
                          >
                            {vaccine.vac_type_choices}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Syringe className="h-8 w-8 text-gray-700" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg">
                      All vaccines completed!
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      All available vaccines have been administered
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-md shadow-sm">
                    <Calendar
                      className="h-5 w-5 text-blue"
                      aria-hidden="true"
                    />
                  </div>
                  Follow-up Visit Schedules
                </h2>
                {followupVaccines.length > 0 ? (
                  <ul className="space-y-3" role="list">
                    {followupVaccines.map((vaccine, index) => (
                      <li
                        key={index}
                        className="bg-white rounded-xl p-2 shadow-sm border border-gray-300  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        role="listitem"
                      >
                        {vaccine.followup_date &&
                          !isNaN(new Date(vaccine.followup_date).getTime()) && (
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 bg-gray-400 rounded-full flex-shrink-0 shadow-sm"></div>
                              <span className="font-semibold text-gray-800">
                                {vaccine.vac_name}
                              </span>
                              {/* <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full border border-gray-300 shadow-sm">
                                ({vaccine.vac_type_choices})
                              </span> */}
                            </div>
                          )}
                        {vaccine.followup_date &&
                        !isNaN(new Date(vaccine.followup_date).getTime()) ? (
                          <div className="flex items-center gap-2 bg-gray-200 px-4  ">
                            <span className="text-sm font-semibold text-blue">
                              Follow-up:{" "}
                              {new Date(
                                vaccine.followup_date
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="text-xs text-gray-600 italic bg-gray-100 px-3 py-1 rounded-full border border-gray-200 shadow-sm"
                            aria-label="No follow-up visit scheduled"
                          >
                            No follow-up visit scheduled
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8" role="status">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Syringe className="h-8 w-8 text-gray-700" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg">
                      No follow-ups scheduled
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      No follow-up vaccines or visit data found for this
                      patient.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full flex gap-2 mr-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search records..."
                  className="pl-10 bg-white w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <SelectLayout
                  placeholder="Filter"
                  label=""
                  className="bg-white w-48"
                  options={[
                    { id: "all", name: "All" },
                    {
                      id: "partially_vaccinated",
                      name: "partially vaccinated",
                    },
                    { id: "completed", name: "completed" },
                  ]}
                  value={filter}
                  onChange={(value) => setfilter(value as filter)}
                />
              </div>
            </div>
          </div>
          <div>
            <Button className="w-full sm:w-auto">
              <Link to="/vaccinationForm" state={{ params: { patientData } }}>
                New Vaccination Record
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
