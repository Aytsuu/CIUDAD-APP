import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ChevronLeft, Stethoscope } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api2 } from "@/api/api";
import { ConsultationHistoryTable } from "./table-history";
import { MedicalConsultationHistory } from "../types";
import CurrentConsultationCard from "./current-medrec";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/context/LoadingContext";

export default function DisplayMedicalConsultation() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, MedicalConsultation } = params || {};
  const [consultationHistory, setConsultationHistory] = useState<
    MedicalConsultationHistory[]
  >([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  const fetchConsultationHistory = useCallback(async () => {
    if (!patientId) return;

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
        staff_details: history.staff_details
          ? {
              rp: {
                per: {
                  per_fname: history.staff_details?.rp?.per?.per_fname || "",
                  per_lname: history.staff_details?.rp?.per?.per_lname || "",
                  per_mname: history.staff_details?.rp?.per?.per_mname || "",
                },
              },
            }
          : null,

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
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );

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
        new Date(history.created_at ?? 0) <=
        new Date(MedicalConsultation.created_at ?? 0)
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

  return (
    <div>
      {/* Always visible header section */}
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

      {isLoading ? (
        <Card className="w-full p-4 sm:p-6 md:p-8">
          <CardContent>
            {/* Current Consultation Skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Consultation History Skeleton */}
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>

              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-md" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="w-full p-4 sm:p-6 md:p-8">
          <CardContent>
            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-lg border border-red-200">
              <p className="text-base sm:text-lg text-red-600 font-medium">
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full p-4 sm:p-6 md:p-8">
          <CardContent>
            {currentConsultation && (
              <CurrentConsultationCard
                consultation={currentConsultation}
                patientData={patientData}
              />
            )}

            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Stethoscope className="text-blue" />
                <h2 className="font-bold text-base sm:text-lg">
                  Consultation History
                </h2>
              </div>

              <ConsultationHistoryTable
                relevantHistory={relevantHistory}
                currentConsultationId={MedicalConsultation?.medrec_id}
                currentPage={currentPage}
                totalPages={totalPages}
                onPaginate={paginate}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
