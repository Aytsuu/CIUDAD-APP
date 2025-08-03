"use client";
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
  MapPin,
  Calendar,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { api } from "@/api/api";

// Define types
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
  };
};

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

  useEffect(() => {
    const fetchVaccinationHistory = async () => {
      try {
        if (!Vaccination?.vacrec) return;

        setLoading(true);
        setError(null);

        const response = await api.get(
          `vaccination/vaccination-record/${Vaccination.vacrec}`
        );
        const responseData = response.data;

        if (!responseData?.vaccination_histories) {
          throw new Error("No vaccination histories found");
        }

        const formattedHistories = responseData.vaccination_histories.map(
          (history: any) => ({
            vachist_id: history.vachist_id,
            vachist_doseNo: history.vachist_doseNo,
            vachist_status: history.vachist_status,
            created_at: history.created_at,
            vaccine_name:
              history.vaccine_stock?.vaccinelist?.vac_name || "Unknown",
            vital_signs: {
              vital_bp_systolic:
                history.vital_signs?.vital_bp_systolic || "N/A",
              vital_bp_diastolic:
                history.vital_signs?.vital_bp_diastolic || "N/A",
              vital_temp: history.vital_signs?.vital_temp || "N/A",
              vital_RR: history.vital_signs?.vital_RR || "N/A",
              vital_o2: history.vital_signs?.vital_o2 || "N/A",
            },
            vaccine_details: {
              no_of_doses: history.vaccine_stock?.vaccinelist?.no_of_doses || 0,
            },
            follow_up_visit: {
              followv_id: history.follow_up_visit?.followv_id,
              followv_date: history.follow_up_visit?.followv_date || "No next Schedule",
              followv_status: history.follow_up_visit?.followv_status
            } 
          })
        );

        setVaccinationHistory(formattedHistories);
      } catch (err) {
        console.error("Error fetching vaccination history:", err);
        setError("Failed to load vaccination history");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinationHistory();
  }, [Vaccination?.vacrec]);

  if (!patientData || !Vaccination) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>No vaccination data found.</p>
      </div>
    );
  }

  // Dynamic filtering function
  const filterHistoryByDose = (history: VaccinationHistory) => {
    const currentDose = Vaccination.vachist_doseNo;
    const totalDoses = Vaccination.vaccine_details.no_of_doses;

    // Always show dose 1
    if (history.vachist_doseNo === 1) return true;

    // Show if:
    // - It's the current dose or lower
    // - We're at the final dose (show all)
    // - It's one dose before current (for context)
    return (
      history.vachist_doseNo <= currentDose ||
      currentDose === totalDoses ||
      history.vachist_doseNo === currentDose - 1
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View vaccination details and patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />
      {/* Patient Information */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-green-600">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="font-medium">{patientData.pat_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {`${patientData.lname}, ${patientData.fname} ${
                  patientData.mname || ""
                }`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {patientData.dob
                  ? format(new Date(patientData.dob), "MMMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
          

            <div>
              <p className="text-sm text-gray-500">Sex</p>
              <p className="font-medium">
                {patientData.sex
                  ? patientData.sex.charAt(0).toUpperCase() +
                    patientData.sex.slice(1)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient Type</p>
              <p className="font-medium">{patientData.pat_type || "N/A"}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-green-600">
              <MapPin className="h-5 w-5" />
              Patient Address
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Household No.</p>
                <p className="font-medium">
                  {patientData.householdno || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Street</p>
                <p className="font-medium">{patientData.street || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sitio</p>
                <p className="font-medium">{patientData.sitio || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Barangay</p>
                <p className="font-medium">{patientData.barangay || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{patientData.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Province</p>
                <p className="font-medium">{patientData.province || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Vaccination History Section */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-600">
            <Syringe className="h-5 w-5" />
            Vaccination History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <p>Loading vaccination history...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center py-4 text-red-500">
              <p>{error}</p>
            </div>
          ) : vaccinationHistory.length === 0 ? (
            <div className="flex justify-center py-4">
              <p>No vaccination history found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vaccinationHistory
                .filter(filterHistoryByDose)
                .sort((a, b) => a.vachist_doseNo - b.vachist_doseNo)
                .map((history) => (
                  <Card
                    key={history.vachist_id}
                    className={`shadow-sm ${
                      history.vachist_doseNo === Vaccination.vachist_doseNo
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Vaccine</p>
                          <p className="font-medium">{history.vaccine_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dose Number</p>
                          <p className="font-medium">
                            {history.vachist_doseNo}
                            {history.vachist_doseNo ===
                              Vaccination.vachist_doseNo && (
                              <span className="ml-1 text-xs text-blue-500">
                                (Current)
                              </span>
                            )}
                            {history.vachist_doseNo ===
                              Vaccination.vaccine_details.no_of_doses &&
                              history.vachist_status === "completed" && (
                                <span className="ml-1 text-xs text-green-500">
                                  (Final)
                                </span>
                              )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p
                            className={`font-medium inline-flex px-2 py-1 rounded-full text-sm ${
                              history.vachist_status === "completed"
                                ? "bg-green-100 text-green-800"
                                : history.vachist_status ===
                                  "Partially Vaccinated"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {history.vachist_status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {format(
                              new Date(history.created_at),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {history.vital_signs && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-500 mb-2">
                            Vital Signs
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <p className="text-xs text-gray-500">BP</p>
                              <p className="text-sm">
                                {history.vital_signs.vital_bp_systolic}/
                                {history.vital_signs.vital_bp_diastolic} mmHg
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Temp</p>
                              <p className="text-sm">
                                {history.vital_signs.vital_temp} °C
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">RR</p>
                              <p className="text-sm">
                                {history.vital_signs.vital_RR}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">O2 Sat</p>
                              <p className="text-sm">
                                {history.vital_signs.vital_o2}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Follow-up Visit Section - Moved inside the mapping function */}
                      {history.follow_up_visit && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Calendar className="h-4 w-4" />
                            <p className="text-sm font-medium">Next Dose Schedule</p>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm">
                              <span className="text-gray-500">Date: </span>
                              <span className="font-medium text-blue-600">
                                {history.follow_up_visit.followv_date} 
                              </span>
                            </p>
                            {history.follow_up_visit.followv_status && (
                              <p className="text-sm">
                                <span className="text-gray-500">Status: </span>
                                <span className={`font-medium ${
                                  history.follow_up_visit.followv_status === "completed" 
                                    ? "text-green-600" 
                                    : "text-yellow-600"
                                }`}>
                                  {history.follow_up_visit.followv_status}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>


      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button onClick={() => window.print()}>Print Record</Button>
      </div>
    </div>
  );
}