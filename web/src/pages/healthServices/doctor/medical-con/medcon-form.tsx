import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card/card";
import { ChevronLeft } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api2 } from "@/api/api";
import {
  MedicalConsultationHistory,
  ConsultationHistoryTable,
  medicalConsultationCache,
} from "@/pages/healthServices/medicalconsultation/medicalhistory/table-history";
import CurrentConsultationCard from "@/pages/healthServices/medicalconsultation/medicalhistory/current-medrec";
import { ConsultationHistorySkeleton } from "@/pages/healthServices/skeleton/doc-medform-skeleton"

export default function PendingDisplayMedicalConsultation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { patientData, MedicalConsultation } = location.state || {};
  const [consultationHistory, setConsultationHistory] = useState<
    MedicalConsultationHistory[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleBackNavigation = useCallback(() => {
    localStorage.removeItem("pendingConsultation");
    localStorage.removeItem("soapFormData");
    localStorage.removeItem("soapFormMedicines");
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    if (!patientData || !MedicalConsultation) {
      const savedData = localStorage.getItem("pendingConsultation");
      if (savedData) {
        const {
          patientData: savedPatientData,
          MedicalConsultation: savedConsultation,
        } = JSON.parse(savedData);
        navigate(location.pathname, {
          state: {
            patientData: savedPatientData,
            MedicalConsultation: savedConsultation,
          },
          replace: true,
        });
      }
    } else {
      localStorage.setItem(
        "pendingConsultation",
        JSON.stringify({
          patientData,
          MedicalConsultation,
        })
      );
    }
  }, [patientData, MedicalConsultation, navigate, location.pathname]);

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
        `medical-consultation/view-medconpending-record/${patientId}/`
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
    if (patientData) {
      fetchConsultationHistory();
    }
  }, [fetchConsultationHistory, patientData]);

  const currentConsultation = useMemo(() => {
    return MedicalConsultation;
  }, [MedicalConsultation]);

  const relevantHistory = useMemo(() => {
    if (!currentConsultation?.created_at) return consultationHistory;
    return consultationHistory.filter(
      (history) =>
        new Date(history.created_at) <= new Date(currentConsultation.created_at)
    );
  }, [consultationHistory, currentConsultation]);

  const { totalPages } = useMemo(() => {
    const recordsPerPage = 3;
    const totalPages = Math.ceil(relevantHistory.length / recordsPerPage);
    return { totalPages };
  }, [relevantHistory]);

  if (!patientData || !currentConsultation) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <p className="text-base sm:text-lg md:text-xl text-gray-600">
          No medical consultation data found.
        </p>
        <Button onClick={handleBackNavigation} className="ml-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={handleBackNavigation}
          className="text-darkGray p-2 bg-white hover:bg-gray-100 rounded-md border border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

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

      <Card className="w-full p-4 sm:p-6 md:p-8">
        <CardContent className="p-0">
          {/* Current Consultation Card */}
          {currentConsultation && (
            <CurrentConsultationCard
              consultation={currentConsultation}
              patientData={patientData}
            />
          )}

          {/* Consultation History Section */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <h2 className="font-bold text-base sm:text-lg">
                Consultation History
              </h2>
            </div>

            {loading ? (
              <ConsultationHistorySkeleton />
            ) : error ? (
              <div className="text-center p-4 sm:p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-base sm:text-lg text-red-600 font-medium">
                  {error}
                </p>
              </div>
            ) : (
              <ConsultationHistoryTable
                relevantHistory={relevantHistory}
                currentConsultationId={currentConsultation?.medrec_id}
                currentPage={currentPage}
                totalPages={totalPages}
                onPaginate={setCurrentPage}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end mt-6 sm:mt-8">
            <Button
              onClick={handleBackNavigation}
              className="mr-2 w-[100px]"
              variant={"outline"}
            >
              Cancel
            </Button>
            <Link
              to="/soap-form"
              state={{
                patientData,
                MedicalConsultation: currentConsultation,
              }}
            >
              <Button 
                className={`w-[100px] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                 Next
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}