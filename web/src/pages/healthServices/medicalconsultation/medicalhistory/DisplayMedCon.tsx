import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { ChevronLeft, ClipboardList, Scale } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api2 } from "@/api/api";
import {
  MedicalConsultationHistory,
  ConsultationHistoryTable,
  medicalConsultationCache,
} from "./table-history";
import CurrentConsultationCard from "./current-medrec"; // Import the new component

export default function DisplayMedicalConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, MedicalConsultation } = params || {};
  const [consultationHistory, setConsultationHistory] = useState<
    MedicalConsultationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  const fetchConsultationHistory = useCallback(async () => {
    if (!patientId) return;

    if (medicalConsultationCache[patientId]) {
      setConsultationHistory(medicalConsultationCache[patientId]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api2.get(
        `medical-consultation/view-medcon-record/${patientId}/`
      );
      const responseData = response.data;

      if (!responseData || responseData.length === 0) {
        setConsultationHistory([]);
        return;
      }

      const formattedHistories = responseData.map((history: any) => ({
        patrec: history.patrec,
        medrec_id: history.medrec_id,
        medrec_status: history.medrec_status,
        medrec_chief_complaint:
          history.medrec_chief_complaint || "Not specified",
        created_at: history.created_at,
        medrec_age: history.medrec_age,
        vital_signs: {
          vital_bp_systolic: history.vital_signs?.vital_bp_systolic || "N/A",
          vital_bp_diastolic: history.vital_signs?.vital_bp_diastolic || "N/A",
          vital_temp: history.vital_signs?.vital_temp || "N/A",
          vital_RR: history.vital_signs?.vital_RR || "N/A",
          vital_o2: history.vital_signs?.vital_o2 || "N/A",
          vital_pulse: history.vital_signs?.vital_pulse || "N/A",
        },
        bmi_details: {
          height: history.bmi_details?.height || "N/A",
          weight: history.bmi_details?.weight || "N/A",
        },
        find_details: history.find_details
          ? {
              assessment_summary:
                history.find_details.assessment_summary || "Not specified",
              plantreatment_summary:
                history.find_details.plantreatment_summary || "Not specified",
              subj_summary:
                history.find_details.subj_summary || "Not specified",
              obj_summary: history.find_details.obj_summary || "Not specified",
            }
          : null,
      }));

      const sortedHistories = formattedHistories.sort(
        (a: MedicalConsultationHistory, b: MedicalConsultationHistory) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      medicalConsultationCache[patientId] = sortedHistories;
      setConsultationHistory(sortedHistories);
    } catch (err) {
      console.error("Error fetching medical consultation history:", err);
      setError("Failed to load medical consultation history");
      setConsultationHistory([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchConsultationHistory();
  }, [fetchConsultationHistory]);

  const currentConsultation = useMemo(() => {
    return consultationHistory.find(
      (history) => history.medrec_id === MedicalConsultation?.medrec_id
    );
  }, [consultationHistory, MedicalConsultation]);

  const relevantHistory = useMemo(() => {
    if (!MedicalConsultation?.created_at) return [];
    return consultationHistory.filter(
      (history) =>
        new Date(history.created_at) <= new Date(MedicalConsultation.created_at)
    );
  }, [consultationHistory, MedicalConsultation]);

  const { totalPages } = useMemo(() => {
    const recordsPerPage = 3;
    const totalPages = Math.ceil(relevantHistory.length / recordsPerPage);
    return { totalPages };
  }, [relevantHistory]);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  if (!patientData || !MedicalConsultation) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <p className="text-base sm:text-lg md:text-xl text-gray-600">
          No medical consultation data found.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button
            className="text-darkGray p-2"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
              Medical Consultation Record
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View consultation details and patient information
            </p>
          </div>
        </div>
        <hr className="border-gray mb-4 sm:mb-6" />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4 sm:p-8">
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Loading consultation data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button
          className="text-darkGray p-2"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg sm:text-xl md:text-2xl text-darkBlue2">
            Medical Consultation Record
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View consultation details and patient information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-4 sm:mb-6" />

      {/* Single Comprehensive Card */}
      <Card className="w-full p-4 sm:p-6 md:p-8">
        <CardContent>
          {/* Use the new CurrentConsultationCard component */}
          {currentConsultation && (
            <CurrentConsultationCard
              consultation={currentConsultation}
              patientData={patientData}
            />
          )}


          {/* Consultation History Section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <h2 className="font-bold text-base sm:text-lg ">
                Consultation History
              </h2>
            </div>

            {loading ? (
              <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
                <p className="text-base sm:text-lg text-gray-600">
                  Loading consultation history...
                </p>
              </div>
            ) : error ? (
              <div className="text-center p-4 sm:p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-base sm:text-lg text-red-600 font-medium">
                  {error}
                </p>
              </div>
            ) : (
              <ConsultationHistoryTable
                relevantHistory={relevantHistory}
                currentConsultationId={MedicalConsultation?.medrec_id}
                currentPage={currentPage}
                totalPages={totalPages}
                onPaginate={paginate}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
