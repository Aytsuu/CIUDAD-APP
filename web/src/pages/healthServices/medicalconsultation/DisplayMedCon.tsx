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
  HeartPulse,
  History,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "@/api/api";
import { DataTable } from "@/components/ui/table/history-table-col";
import { ColumnDef } from "@tanstack/react-table";

type MedicalRecord = {
  medrec_id: number;
  created_at: string;
  medrec_status: string;
  medrec_chief_complaint: string;
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
    height: number;
    weight: number;
    bmi: string;
    bmi_category: string;
    created_at: string;
  };
};

// Cache object outside the component
const medicalHistoryCache: Record<string, MedicalRecord[]> = {};

export default function MedConView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, MedicalRecord } = params || {};
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  const fetchMedicalHistory = useCallback(async () => {
    if (!patientId) return;

    // Check cache first
    if (medicalHistoryCache[patientId]) {
      setMedicalHistory(medicalHistoryCache[patientId]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `medical-consultation/view-medcon-record/${patientId}/`
      );
      const responseData = response.data;

      if (!responseData || responseData.length === 0) {
        throw new Error("No medical histories found");
      }

      const formattedHistories = responseData.map((record: any) => ({
        medrec_id: record.medrec_id,
        created_at: record.created_at,
        medrec_status: record.medrec_status,
        medrec_chief_complaint: record.medrec_chief_complaint,
        vital_signs: {
          vital_id: record.vital?.vital_id || 0,
          vital_bp_systolic: record.vital?.vital_bp_systolic || "N/A",
          vital_bp_diastolic: record.vital?.vital_bp_diastolic || "N/A",
          vital_temp: record.vital?.vital_temp || "N/A",
          vital_RR: record.vital?.vital_RR || "N/A",
          vital_o2: record.vital?.vital_o2 || "N/A",
          vital_pulse: record.vital?.vital_pulse || "N/A",
          created_at: record.vital?.created_at || "N/A"
        },
        bmi_details: {
          bm_id: record.bm?.bm_id || 0,
          height: record.bm?.height || 0,
          weight: record.bm?.weight || 0,
          bmi: record.bm?.bmi || "N/A",
          bmi_category: record.bm?.bmi_category || "N/A",
          created_at: record.bm?.created_at || "N/A"
        }
      }));

      const sortedHistories = formattedHistories.sort(
        (a: MedicalRecord, b: MedicalRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      medicalHistoryCache[patientId] = sortedHistories;
      setMedicalHistory(sortedHistories);
    } catch (err) {
      console.error("Error fetching medical history:", err);
      setError("Failed to load medical history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMedicalHistory();
  }, [fetchMedicalHistory]);

  const currentConsultation = useMemo(() => {
    return medicalHistory.find(
      (record) => record.medrec_id === MedicalRecord?.medrec_id
    );
  }, [medicalHistory, MedicalRecord]);

  const relevantHistory = useMemo(() => {
    if (!MedicalRecord?.created_at) return medicalHistory;
    return medicalHistory.filter(
      (record) => new Date(record.created_at) <= new Date(MedicalRecord.created_at)
    );
  }, [medicalHistory, MedicalRecord]);

  const tableData = useMemo(() => {
    if (relevantHistory.length === 0) return [];
    
    return [
      { attribute: "Date", type: "heading" },
      { attribute: "Chief Complaint", type: "data" },
      { attribute: "Status", type: "data" },
      { attribute: "Blood Pressure", type: "data" },
      { attribute: "Temperature", type: "data" },
      { attribute: "Pulse", type: "data" },
      { attribute: "BMI", type: "data" },
    ].map((row) => {
      const rowData: any = {
        attribute: row.attribute,
        type: row.type,
      };
      
      relevantHistory.forEach((record) => {
        const recordId = `record_${record.medrec_id}`;
        
        if (row.attribute === "Date") {
          rowData[recordId] = format(new Date(record.created_at), "MMM d, yyyy");
        } else if (row.attribute === "Chief Complaint") {
          rowData[recordId] = record.medrec_chief_complaint;
        } else if (row.attribute === "Status") {
          rowData[recordId] = record.medrec_status;
        } else if (row.attribute === "Blood Pressure") {
          rowData[recordId] = `${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} mmHg`;
        } else if (row.attribute === "Temperature") {
          rowData[recordId] = `${record.vital_signs.vital_temp} °C`;
        } else if (row.attribute === "Pulse") {
          rowData[recordId] = `${record.vital_signs.vital_pulse} bpm`;
        } else if (row.attribute === "BMI") {
          rowData[recordId] = record.bmi_details.bmi;
        }
      });
      
      return rowData;
    });
  }, [relevantHistory]);

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
    
    relevantHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
      .forEach((record) => {
        const recordId = `record_${record.medrec_id}`;
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
                : "bg-blue-100 text-blue-800";
              
              return (
                <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusClass}`}>
                  {value}
                </span>
              );
            }
            
            return <div>{value || "N/A"}</div>;
          },
        });
      });
    
    return cols;
  }, [relevantHistory, currentPage]);

  const totalPages = Math.ceil(relevantHistory.length / recordsPerPage);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  if (!patientData || !MedicalRecord) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>No medical record data found.</p>
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
              Medical Consultation Record
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View medical consultation details
            </p>
          </div>
        </div>
        <hr className="border-gray mb-4 sm:mb-6" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-lg text-gray-600">Loading medical data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col p-2 sm:p-4">
      {/* Header and Patient Details sections remain the same as before */}

      {currentConsultation && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2 bg-blue-50">
            <CardTitle className="text-md flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              Current Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">Date:</span>
                <span>
                  {format(
                    new Date(currentConsultation.created_at),
                    "MMMM d, yyyy"
                  )}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">Chief Complaint:</span>
                <span>{currentConsultation.medrec_chief_complaint}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs inline-block ${
                    currentConsultation.medrec_status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {currentConsultation.medrec_status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">Blood Pressure:</span>
                <span>
                  {currentConsultation.vital_signs.vital_bp_systolic}/
                  {currentConsultation.vital_signs.vital_bp_diastolic} mmHg
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">Temperature:</span>
                <span>{currentConsultation.vital_signs.vital_temp} °C</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">Pulse:</span>
                <span>{currentConsultation.vital_signs.vital_pulse} bpm</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">BMI:</span>
                <span>{currentConsultation.bmi_details.bmi}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium w-24">BMI Category:</span>
                <span>{currentConsultation.bmi_details.bmi_category}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-2 bg-gray-50">
          <CardTitle className="text-md flex items-center gap-2">
            <History className="h-4 w-4" />
            Consultation History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {error ? (
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : relevantHistory.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                {tableData.length > 0 && (
                  <DataTable
                    columns={columns}
                    data={tableData}
                  />
                )}
              </div>

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
                No previous consultation history found for this patient.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}