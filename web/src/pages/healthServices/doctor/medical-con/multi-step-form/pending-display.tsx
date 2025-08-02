import { Button } from "@/components/ui/button/button";
import { Card, CardContent } from "@/components/ui/card/card";
import { ChevronRight, Stethoscope } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api2 } from "@/api/api";
import { ConsultationHistoryTable } from "@/pages/healthServices/medicalconsultation/medicalhistory/table-history";
import { MedicalConsultationHistory } from "@/pages/healthServices/medicalconsultation/types";
import CurrentConsultationCard from "@/pages/healthServices/medicalconsultation/medicalhistory/current-medrec";
import { ConsultationHistorySkeleton } from "@/pages/healthServices/skeleton/doc-medform-skeleton";

interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  MedicalConsultation: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({
  patientData,
  MedicalConsultation,
  onNext,
}: PendingDisplayMedicalConsultationProps) {
  const [consultationHistory, setConsultationHistory] = useState<
    MedicalConsultationHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  const fetchConsultationHistory = useCallback(async () => {
    if (!patientId) return;

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
          vital_bp_systolic: history.vital_signs?.vital_bp_systolic || "",
          vital_bp_diastolic: history.vital_signs?.vital_bp_diastolic || "",
          vital_temp: history.vital_signs?.vital_temp || "",
          vital_RR: history.vital_signs?.vital_RR || "",
          vital_o2: history.vital_signs?.vital_o2 || "",
          vital_pulse: history.vital_signs?.vital_pulse || "",
        },
        bmi_details: {
          height: history.bmi_details?.height || "",
          weight: history.bmi_details?.weight || "",
        },
        staff_details: history.staff_details
          ? {
              rp: {
                per: {
                  per_fname: history.staff_details.rp?.per?.per_fname || "",
                  per_lname: history.staff_details.rp?.per?.per_lname || "",
                  per_mname: history.staff_details.rp?.per?.per_mname || "",
                  per_suffix: history.staff_details.rp?.per?.per_suffix || "",
                  per_dob: history.staff_details.rp?.per?.per_dob || "",
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
        new Date(history.created_at || "") <=
        new Date(currentConsultation.created_at || "")
    );
  }, [consultationHistory, currentConsultation]);

  const { totalPages } = useMemo(() => {
    const recordsPerPage = 3;
    const totalPages = Math.ceil(relevantHistory.length / recordsPerPage);
    return { totalPages };
  }, [relevantHistory]);

  return (
    <div className="">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">
        Page 1 of 2
      </div>

      <div>
        <CardContent className="p-0">
          {/* Current Consultation Card */}
          {currentConsultation && (
            <CurrentConsultationCard
              consultation={currentConsultation}
              patientData={patientData}
            />
          )}

          {/* Consultation History Section */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Stethoscope className="text-blue" />
              <h2 className="font-bold text-base sm:text-lg ">
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
              onClick={onNext}
              className={`w-[100px] flex items-center justify-center ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              Next
              <ChevronRight className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
