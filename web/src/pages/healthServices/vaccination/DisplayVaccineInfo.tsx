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
  Heart,
  Thermometer,
  Wind,
  Droplets,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api2 } from "@/api/api";
import { DataTable } from "@/components/ui/table/history-table-col";
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

const vaccinationHistoryCache: Record<string, VaccinationHistory[]> = {};

export default function VaccinationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, Vaccination } = params || {};
  const [vaccinationHistory, setVaccinationHistory] = useState<
    VaccinationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  const fetchVaccinationHistory = useCallback(async () => {
    if (!patientId) return;

    if (vaccinationHistoryCache[patientId]) {
      setVaccinationHistory(vaccinationHistoryCache[patientId]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api2.get(
        `vaccination/indiv-patient-record/${patientId}/`
      );
      const responseData = response.data;

      if (!responseData || responseData.length === 0) {
        setVaccinationHistory([]);
        return;
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
      setVaccinationHistory([]);
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
      (history) =>
        new Date(history.created_at) <= new Date(Vaccination.created_at)
    );
  }, [vaccinationHistory, Vaccination]);

  const hasHistory = useMemo(() => {
    return relevantHistory.length > 0;
  }, [relevantHistory]);

  const tableData = useMemo(() => {
    if (!hasHistory) return [];

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

    return tableRows.map((row) => {
      const rowData: any = {
        attribute: row.attribute,
        type: row.type,
      };

      relevantHistory.forEach((record) => {
        const recordId = `record_${record.vachist_id}`;

        if (row.attribute === "Date") {
          rowData[recordId] = format(
            new Date(record.created_at),
            "MMM d, yyyy"
          );
        } else if (row.attribute === "Vaccine Name") {
          rowData[recordId] = record.vaccine_name;
        } else if (row.attribute === "Dose") {
          rowData[recordId] =
            record.vachist_doseNo === 1
              ? "1st Dose"
              : record.vachist_doseNo === 2
              ? "2nd Dose"
              : record.vachist_doseNo === 3
              ? "3rd Dose"
              : `${record.vachist_doseNo}th Dose`;
        } else if (row.attribute === "Status") {
          rowData[recordId] = record.vachist_status;
        } else if (row.attribute === "Age at Vaccination") {
          rowData[recordId] = record.vachist_age;
        } else if (row.attribute === "Blood Pressure") {
          rowData[
            recordId
          ] = `${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} mmHg`;
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
  }, [relevantHistory, hasHistory]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: "attribute",
        header: "",
        cell: ({ row }) => {
          const rowType = row.original.type;
          return rowType === "heading" ? (
            <div className="font-semibold text-gray-900 text-base">
              {row.getValue("attribute")}
            </div>
          ) : (
            <div className="font-medium text-gray-700 text-base">
              {row.getValue("attribute")}
            </div>
          );
        },
      },
    ];

    relevantHistory
      .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
      .forEach((record) => {
        const recordId = `record_${record.vachist_id}`;
        const isCurrent = record.vachist_id === Vaccination?.vachist_id;

        cols.push({
          id: recordId,
          accessorKey: recordId,
          header: () => {
            return (
              <div className=" text-black font-bold px-3 py-2 rounded-lg text-sm ">
                {isCurrent ? (
                  <span className=" text-black font-bold px-3 py-2 rounded-lg text-sm ">
                    Current
                  </span>
                ) : (
                  format(new Date(record.created_at), "MMM d, yyyy")
                )}
              </div>
            );
          },
          cell: ({ row }) => {
            const value = row.getValue(recordId) as string;
            const rowData = row.original;

            if (rowData.attribute === "Status") {
              const statusClass = value === "completed";

              return (
                <span className={`  text-sm  text-gray-600 ${statusClass}`}>
                  {value}
                </span>
              );
            }

            return <div className="text-base">{value || "N/A"}</div>;
          },
        });
      });

    return cols;
  }, [relevantHistory, currentPage, recordsPerPage, Vaccination?.vachist_id]);

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
        <p className="text-xl text-gray-600">No vaccination data found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <Button
            className="text-darkGray p-2"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Vaccination Record
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View vaccination details and patient information
            </p>
          </div>
        </div>
        <hr className="border-gray mb-4 sm:mb-6" />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-xl text-gray-600">Loading vaccination data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col p-4 sm:p-6">
      <div className="flex items-center gap-4 mb-4 sm:mb-6">
        <Button
          className="text-darkGray p-2"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View vaccination details and patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6" />

      {/* Single Comprehensive Card */}
      <Card className="shadow-lg border-2 border-gray-300">
        <CardContent className="p-6 sm:p-8">
          {/* Patient Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <User className=" text-darkBlue3" size={18} />
              <h2 className="font-bold text-lg text-darkBlue3">
                Patient Information
              </h2>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="font-semibold text-lg text-gray-700 min-w-32">
                      Patient ID:
                    </span>
                    <span className="text-lg text-gray-900 font-medium">
                      {patientData.pat_id}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-lg text-gray-700 min-w-32">
                      Full Name:
                    </span>
                    <span className="text-lg text-gray-900 font-medium">
                      {`${patientData.lname}, ${patientData.fname} ${
                        patientData.mname || ""
                      }`}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-lg text-gray-700 min-w-32">
                      Date of Birth:
                    </span>
                    <span className="text-lg text-gray-900 font-medium">
                      {patientData.dob
                        ? format(new Date(patientData.dob), "MMMM d, yyyy")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-lg text-gray-700 min-w-32">
                      Gender:
                    </span>
                    <span className="text-lg text-gray-900 font-medium">
                      {patientData.sex
                        ? patientData.sex.charAt(0).toUpperCase() +
                          patientData.sex.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="font-semibold text-lg text-gray-700 min-w-32">
                      Patient Type:
                    </span>
                    <span className="text-lg text-gray-900 font-medium">
                      {patientData.pat_type || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-lg text-gray-700 min-w-32">
                      Address:
                    </span>
                    <span className="text-lg text-gray-900 font-medium">
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
            </div>
          </div>

          <Separator className="my-8" />

          {/* Current Vaccination Section */}
          {currentVaccination && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Syringe className=" text-green-700" size={18} />
                <h2 className="font-bold text-lg text-green-700">
                  Current Vaccination Details
                </h2>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="font-semibold text-lg text-gray-700 min-w-32">
                        Vaccine:
                      </span>
                      <span className="text-lg text-gray-900 font-medium">
                        {currentVaccination.vaccine_name}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-lg text-gray-700 min-w-32">
                        Dose:
                      </span>
                      <span className="text-lg text-gray-900 font-medium">
                        {currentVaccination.vachist_doseNo === 1
                          ? "1st Dose"
                          : currentVaccination.vachist_doseNo === 2
                          ? "2nd Dose"
                          : currentVaccination.vachist_doseNo === 3
                          ? "3rd Dose"
                          : `${currentVaccination.vachist_doseNo}th Dose`}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-lg text-gray-700 min-w-32">
                        Status:
                      </span>
                      <span className="text-lg text-gray-900 font-medium">

                        {currentVaccination.vachist_status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="font-semibold text-lg text-gray-700 min-w-32">
                        Date:
                      </span>
                      <span className="text-lg text-gray-900 font-medium">
                        {format(
                          new Date(currentVaccination.created_at),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-lg text-gray-700 min-w-32">
                        Age:
                      </span>
                      <span className="text-lg text-gray-900 font-medium">
                        {currentVaccination.vachist_age}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-darkGray" />
                    Vital Signs
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5 text-darkGray" />
                        <p className="text-sm font-semibold text-gray-600">
                          Blood Pressure
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {currentVaccination.vital_signs.vital_bp_systolic}/
                        {currentVaccination.vital_signs.vital_bp_diastolic}
                      </p>
                      <p className="text-sm text-gray-500">mmHg</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="h-5 w-5 text-darkGray" />
                        <p className="text-sm font-semibold text-gray-600">
                          Temperature
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {currentVaccination.vital_signs.vital_temp}
                      </p>
                      <p className="text-sm text-gray-500">°C</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="h-5 w-5 text-darkGray" />
                        <p className="text-sm font-semibold text-gray-600">
                          Respiratory Rate
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {currentVaccination.vital_signs.vital_RR}
                      </p>
                      <p className="text-sm text-gray-500">per min</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-5 w-5 text-darkGray" />
                        <p className="text-sm font-semibold text-gray-600">
                          Oxygen Saturation
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {currentVaccination.vital_signs.vital_o2}
                      </p>
                      <p className="text-sm text-gray-500">%</p>
                    </div>
                  </div>
                </div>

                {/* Follow-up Schedule */}
                {currentVaccination.follow_up_visit && (
                  <div className="bg-gray-100 p-6 rounded-xl border border-gray-300">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-6 w-6 text-darkGray" />
                      <h3 className="font-bold text-xl text-darkGray">
                        Follow-up Schedule
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <span className="font-semibold text-lg text-gray-700  px-3">
                          Next Dose Date:
                        </span>
                        <span className="text-lg text-gray-900 font-medium">
                          {format(
                            new Date(
                              currentVaccination.follow_up_visit.followv_date
                            ),
                            "MMMM d, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold text-lg text-gray-700 px-3">
                          Status:
                        </span>
                        <span className="text-lg text-gray-900 font-medium">
                          {currentVaccination.follow_up_visit.followv_status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Vaccination History Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-darkGray" />
              </div>
              <h2 className="font-bold text-lg text-darkGray">
                Vaccination History
              </h2>
            </div>

            {loading ? (
              <div className="text-center p-8 bg-gray-50 rounded-xl">
                <p className="text-xl text-gray-600">
                  Loading vaccination history...
                </p>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                <p className="text-xl text-red-600 font-medium">{error}</p>
              </div>
            ) : relevantHistory.length > 1 ? (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
                <div className="overflow-x-auto">
                  {tableData.length > 0 && (
                    <DataTable columns={columns} data={tableData} />
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-3">
                    <Button
                      variant="outline"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="text-sm px-4 py-2 h-auto font-medium"
                    >
                      <ChevronLeft className="px-2 mr-2" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <Button
                            key={number}
                            variant={
                              currentPage === number ? "default" : "outline"
                            }
                            className="w-8 h-8 text-sm font-medium"
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
                      className="text-sm px-4 py-2 h-auto font-medium"
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-300">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 font-medium">
                  No previous vaccination history found for this vaccine.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
