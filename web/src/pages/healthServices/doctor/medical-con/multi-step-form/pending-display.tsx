import { Button } from "@/components/ui/button/button";

import { ChevronRight, Stethoscope } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api2 } from "@/api/api";
import { ConsultationHistoryTable } from "@/pages/healthServices/medicalconsultation/medicalhistory/table-history";
import { MedicalConsultationHistory } from "@/pages/healthServices/medicalconsultation/types";
import CurrentConsultationCard from "@/pages/healthServices/medicalconsultation/medicalhistory/current-medrec";
import { ConsultationHistorySkeleton } from "@/pages/healthServices/skeleton/doc-medform-skeleton";
import { usePrenatalPatientMedHistory } from "@/pages/healthServices/maternal/queries/maternalFetchQueries";
import CardLayout from "@/components/ui/card/card-layout";
import { HeartPulse, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const {
    data: medHistoryData,
    isLoading: medHistoryLoading,
    error: medhistError,
  } = usePrenatalPatientMedHistory(patientData?.pat_id);

  const getMedicalHistoryCardsData = useCallback(() => {
    if (medHistoryLoading) {
      return [];
    }

    if (error) {
      console.error("Error fetching medical history:", error);
      return [];
    }

    const historyList = medHistoryData?.medical_history || [];

    if (!historyList?.length) {
      return [];
    }

    return historyList.map((history: any) => ({
      id: history.medhist_id || Math.random().toString(36).substring(2, 9),
      illness: history.illness_name || history.ill?.illname || "N/A",
      year: history.year ? history.year : "Not specified",
    }));
  }, [medHistoryData, medHistoryLoading, medhistError]);

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
        {/* Current Consultation Card */}
        {currentConsultation && (
          <CurrentConsultationCard
            consultation={currentConsultation}
            patientData={patientData}
          />
        )}

        <div className="flex w-full gap-4">
          {/* Medical History Section - Now using Card Layout */}
          <div className="mb-6 w-full">
            <div className=" ">
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-red-500">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-semibold text-red-500">
                      Illness/Diagnoses History
                    </span>
                  </div>
                }
                content={
                  <div className="flex flex-col gap-4">
                    {getMedicalHistoryCardsData().length > 0 ? (
                      getMedicalHistoryCardsData().map((history: any) => (
                        <div
                          key={history.id}
                          className="border rounded-lg p-4 "
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">
                              {history.illness}
                            </h3>
                            <Badge variant="outline" className="text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Diagnosed in {history.year}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        No medical history records found
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          </div>

          {/* Medical History Section - Now using Card Layout */}
          <div className="mb-6 w-full">
            <div>
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-red-500">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-semibold text-red-500">
                      Follow Up Visits
                    </span>
                  </div>
                }
                content={
                  <div className="flex flex-col gap-4">
                    {getMedicalHistoryCardsData().length > 0 ? (
                      getMedicalHistoryCardsData().map((history: any) => (
                        <div
                          key={history.id}
                          className="border rounded-lg p-4 "
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">
                              {history.illness}
                            </h3>
                            <Badge variant="outline" className="text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Diagnosed in {history.year}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        No medical history records found
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
