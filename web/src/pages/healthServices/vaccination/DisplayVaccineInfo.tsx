import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import {
  ChevronLeft,
  User,
  Syringe,
  Activity,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "@/api/api";
import { DataTable } from "@/components/ui/table/history-table-col"; // Make sure this path is correct
import { ColumnDef } from "@tanstack/react-table";

type VaccinationHistory = { 
  vachist_id: string;
  vachist_doseNo: number;
  vachist_status: string;
  created_at: string;
  vaccine_name: string;
  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_o2: string;
  };
  vaccine_details: {
    no_of_doses: number;
  };
  follow_up_visit: {
    followv_id: number;
    followv_date: string;
    followv_status: string;
  } | null;
  vachist_age: string;
  vacrec_id: number;
};

// Cache object outside the component
const vaccinationHistoryCache: Record<string, VaccinationHistory[]> = {};

export default function VaccinationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, Vaccination } = params || {};
  const [vaccinationHistory, setVaccinationHistory] = useState<VaccinationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  const fetchVaccinationHistory = useCallback(async () => {
    if (!patientId) return;

    // Check cache first
    if (vaccinationHistoryCache[patientId]) {
      setVaccinationHistory(vaccinationHistoryCache[patientId]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `vaccination/indiv-patient-record/${patientId}/`
      );
      const responseData = response.data;

      if (!responseData || responseData.length === 0) {
        throw new Error("No vaccination histories found");
      }

      const formattedHistories = responseData.map((history: any) => ({
        vachist_id: history.vachist_id,
        vachist_doseNo: history.vachist_doseNo,
        vachist_status: history.vachist_status,
        vachist_age: history.vachist_age,
        created_at: history.created_at,
        vaccine_name: history.vaccine_stock?.vaccinelist?.vac_name || "Unknown",
        vital_signs: {
          vital_bp_systolic: history.vital_signs?.vital_bp_systolic || "N/A",
          vital_bp_diastolic: history.vital_signs?.vital_bp_diastolic || "N/A",
          vital_temp: history.vital_signs?.vital_temp || "N/A",
          vital_RR: history.vital_signs?.vital_RR || "N/A",
          vital_o2: history.vital_signs?.vital_o2 || "N/A",
        },
        vaccine_details: {
          no_of_doses: history.vaccine_stock?.vaccinelist?.no_of_doses || 0,
        },
        follow_up_visit: history.follow_up_visit
          ? {
              followv_id: history.follow_up_visit.followv_id,
              followv_date: history.follow_up_visit.followv_date,
              followv_status: history.follow_up_visit.followv_status,
            }
          : null,
        vacrec_id: history.vacrec_details?.vacrec_id || 0,
      }));

      const sortedHistories = formattedHistories.sort(
        (a: VaccinationHistory, b: VaccinationHistory) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      vaccinationHistoryCache[patientId] = sortedHistories;
      setVaccinationHistory(sortedHistories);
    } catch (err) {
      console.error("Error fetching vaccination history:", err);
      setError("Failed to load vaccination history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVaccinationHistory();
  }, [fetchVaccinationHistory]);



  
  const currentVaccination = useMemo(() => {
    return vaccinationHistory.find(
      (history) => history.vachist_id === Vaccination?.vachist_id
    );
  }, [vaccinationHistory, Vaccination]);

  const relevantHistory = useMemo(() => {
    if (!Vaccination?.created_at) return [];
    return vaccinationHistory.filter(
      (history) => new Date(history.created_at) <= new Date(Vaccination.created_at)
    );
  }, [vaccinationHistory, Vaccination]);




  // Create data for DataTable - transform the records for table display
  const tableData = useMemo(() => {
    if (relevantHistory.length === 0) return [];
    
    // Create columns for each record
    const tableRows = [
      { attribute: "Date", type: "heading" },
      { attribute: "Vaccine Name", type: "data" },
      { attribute: "Dose", type: "data" },
      { attribute: "Status", type: "data" },
      { attribute: "Age at Vaccination", type: "data" },
      { attribute: "Blood Pressure", type: "data" },
      { attribute: "Temperature", type: "data" },
      { attribute: "Respiratory Rate", type: "data" },
      { attribute: "Oxygen Saturation", type: "data" },
    ];
    


    // For each row, add the data from each record
    return tableRows.map((row) => {
      const rowData: any = {
        attribute: row.attribute,
        type: row.type,
      };
      
      relevantHistory.forEach((record, index) => {
        const recordId = `record_${record.vachist_id}`;
        
        if (row.attribute === "Date") {
          rowData[recordId] = format(new Date(record.created_at), "MMM d, yyyy");
        } else if (row.attribute === "Vaccine Name") {
          rowData[recordId] = record.vaccine_name;
        } else if (row.attribute === "Dose") {
          rowData[recordId] = record.vachist_doseNo === record.vaccine_details.no_of_doses ? 
            `${record.vachist_doseNo} (Final)` : 
            `${record.vachist_doseNo}`;
        } else if (row.attribute === "Status") {
          rowData[recordId] = record.vachist_status;
        } else if (row.attribute === "Age at Vaccination") {
          rowData[recordId] = record.vachist_age;
        } else if (row.attribute === "Blood Pressure") {
          rowData[recordId] = `${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} mmHg`;
        } else if (row.attribute === "Temperature") {
          rowData[recordId] = `${record.vital_signs.vital_temp} °C`;
        } else if (row.attribute === "Respiratory Rate") {
          rowData[recordId] = record.vital_signs.vital_RR;
        } else if (row.attribute === "Oxygen Saturation") {
          rowData[recordId] = `${record.vital_signs.vital_o2}%`;
        }
      });
      
      return rowData;
    });
  }, [relevantHistory]);



  // Define columns for the DataTable
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: "attribute",
        header: "",
        cell: ({ row }) => {
          const rowType = row.original.type;
          return rowType === "heading" ? (
            <div className="font-medium text-gray-900">{row.getValue("attribute")}</div>
          ) : (
            <div className="font-medium text-gray-600">{row.getValue("attribute")}</div>
          );
        },
      },
    ];
    
    // Add a column for each vaccination record
    relevantHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).forEach((record) => {
      const recordId = `record_${record.vachist_id}`;
      cols.push({
        id: recordId,
        accessorKey: recordId,
        header: () => {
          return (
            <div className="font-medium">
              {format(new Date(record.created_at), "MMM d, yyyy")}
            </div>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue(recordId) as string;
          const rowData = row.original;
          
          if (rowData.attribute === "Status") {
            const statusClass = value === "completed" 
              ? "bg-green-100 text-green-800" 
              : value === "Partially Vaccinated" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-blue-100 text-blue-800";
            
            return (
              <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusClass}`}>
                {value}
              </span>
            );
          }
          
          if (rowData.attribute === "Dose" && value?.includes("(Final)")) {
            const [doseNum] = value.split(" ");
            return (
              <div>
                {doseNum}
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Final
                </span>
              </div>
            );
          }
          
          return <div>{value || "N/A"}</div>;
        },
      });
    });
    
    return cols;
  }, [relevantHistory, currentPage, recordsPerPage]);

  const { totalPages } = useMemo(() => {
    const totalPages = Math.ceil(relevantHistory.length / recordsPerPage);
    return { totalPages };
  }, [relevantHistory, recordsPerPage]);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  if (!patientData || !Vaccination) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>No vaccination data found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col p-2 sm:p-4">
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <Button
            className="text-black p-2"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg sm:text-2xl text-darkBlue2">
              Vaccination Record
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View vaccination details and patient information
            </p>
          </div>
        </div>
        <hr className="border-gray mb-4 sm:mb-6" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-lg text-gray-600">Loading vaccination data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col p-2 sm:p-4">
      <div className="flex items-center gap-4 mb-4 sm:mb-6">
        <Button
          className="text-black p-2"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg sm:text-2xl text-darkBlue2">
            Vaccination Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View vaccination details and patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6" />

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-gray-50">
            <CardTitle className="text-md flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Patient ID:</span>
                  <span>{patientData.pat_id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Name:</span>
                  <span>{`${patientData.lname}, ${patientData.fname} ${
                    patientData.mname || ""
                  }`}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Date of Birth:</span>
                  <span>
                    {patientData.dob
                      ? format(new Date(patientData.dob), "MMMM d, yyyy")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Sex:</span>
                  <span>
                    {patientData.sex
                      ? patientData.sex.charAt(0).toUpperCase() +
                        patientData.sex.slice(1)
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Patient Type:</span>
                  <span>{patientData.pat_type || "N/A"}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-medium w-24 mt-1">Address:</span>
                  <span className="text-wrap">
                    {[
                      patientData.householdno,
                      patientData.street,
                      patientData.sitio,
                      patientData.barangay,
                      patientData.city,
                      patientData.province,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentVaccination && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2 bg-blue-50">
              <CardTitle className="text-md flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Current Vaccination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Vaccine:</span>
                  <span>{currentVaccination.vaccine_name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Dose:</span>
                  <div>
                    <span>{currentVaccination.vachist_doseNo}</span>
                    {currentVaccination.vachist_doseNo ===
                      currentVaccination.vaccine_details.no_of_doses && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Final Dose
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs inline-block ${
                      currentVaccination.vachist_status === "completed"
                        ? "bg-green-100 text-green-700"
                        : currentVaccination.vachist_status ===
                          "Partially Vaccinated"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {currentVaccination.vachist_status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Date:</span>
                  <span>
                    {format(
                      new Date(currentVaccination.created_at),
                      "MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-medium w-24">Age:</span>
                  <span>{currentVaccination.vachist_age}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="font-medium text-sm mb-3">Vital Signs</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500">BP</p>
                  <p>
                    {currentVaccination.vital_signs.vital_bp_systolic}/
                    {currentVaccination.vital_signs.vital_bp_diastolic} mmHg
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500">Temp</p>
                  <p>{currentVaccination.vital_signs.vital_temp} °C</p>
                </div>
                <div className="bg-gray-50 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500">Resp Rate</p>
                  <p>{currentVaccination.vital_signs.vital_RR}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded shadow-sm">
                  <p className="text-xs text-gray-500">O₂ Sat</p>
                  <p>{currentVaccination.vital_signs.vital_o2}%</p>
                </div>
              </div>

              {currentVaccination.follow_up_visit && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-1 mb-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-sm text-blue-600">
                      Follow-up Schedule
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium w-24">Next Dose Date:</span>
                      <span>
                        {format(
                          new Date(
                            currentVaccination.follow_up_visit.followv_date
                          ),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium w-24">Status:</span>
                      <span
                        className={`${
                          currentVaccination.follow_up_visit.followv_status ===
                          "completed"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {currentVaccination.follow_up_visit.followv_status}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-gray-50">
            <CardTitle className="text-md flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Vaccination History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {error ? (
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            ) : relevantHistory.length > 0 ? (
              <>
                {/* Replace the existing table with DataTable */}
                <div className="overflow-x-auto">
                  {tableData.length > 0 && (
                    <DataTable
                      columns={columns}
                      data={tableData}
                    />
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="text-sm px-2 py-1 h-8"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Prev</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <Button
                            key={number}
                            variant={currentPage === number ? "default" : "outline"}
                            className="w-8 h-8 p-0"
                            onClick={() => paginate(number)}
                          >
                            {number}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="text-sm px-2 py-1 h-8"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  No previous vaccination history found for this patient.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}