// DisplayMedicalConsultation.tsx
"use client";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ConsultationHistoryTable } from "./table-history";
import { MedicalConsultationHistory } from "../types";
import CurrentConsultationCard from "./current-medrec";
import { useConsultationHistory } from "../queries/fetchQueries";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function DisplayMedicalConsultation() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, MedicalConsultation } = params || {};

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // Fixed to 3 records per page

  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  // Use the React Query hook
  const { data, isLoading, error: queryError, isError } = useConsultationHistory(patientId || "", currentPage, pageSize);

  const consultationHistory = useMemo(() => {
    if (!data?.results) return [];

    return data.results
      .map((history: any) => ({
        patrec: history.patrec,
        medrec_id: history.medrec_id,
        medrec_status: history.medrec_status,
        medrec_chief_complaint: history.medrec_chief_complaint || "Not specified",
        created_at: history.created_at,
        medrec_age: history.medrec_age,
        vital_signs: {
          vital_bp_systolic: history.vital_signs?.vital_bp_systolic || "N/A",
          vital_bp_diastolic: history.vital_signs?.vital_bp_diastolic || "N/A",
          vital_temp: history.vital_signs?.vital_temp || "N/A",
          vital_RR: history.vital_signs?.vital_RR || "N/A",
          vital_o2: history.vital_signs?.vital_o2 || "N/A",
          vital_pulse: history.vital_signs?.vital_pulse || "N/A"
        },
        bmi_details: {
          height: history.bmi_details?.height || "N/A",
          weight: history.bmi_details?.weight || "N/A"
        },
        staff_details: history.staff_details
          ? {
              rp: {
                per: {
                  per_fname: history.staff_details?.rp?.per?.per_fname || "",
                  per_lname: history.staff_details?.rp?.per?.per_lname || "",
                  per_mname: history.staff_details?.rp?.per?.per_mname || ""
                }
              }
            }
          : null,
        find_details: history.find_details
          ? {
              assessment_summary: history.find_details.assessment_summary || "Not specified",
              plantreatment_summary: history.find_details.plantreatment_summary || "Not specified",
              subj_summary: history.find_details.subj_summary || "Not specified",
              obj_summary: history.find_details.obj_summary || "Not specified"
            }
          : null
      }))
      .sort((a: MedicalConsultationHistory, b: MedicalConsultationHistory) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [data]);

  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentConsultation = useMemo(() => {
    return consultationHistory.find((history: any) => history.medrec_id === MedicalConsultation?.medrec_id);
  }, [consultationHistory, MedicalConsultation]);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const PaginationControls = () => {
    if (totalCount === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-end mt-4 gap-4">
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalCount} records
        </div>
      </div>
    );
  };

  if (!patientData || !MedicalConsultation) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <p className="text-base sm:text-lg md:text-xl text-gray-600">No medical consultation data found.</p>
      </div>
    );
  }

  return (
    <LayoutWithBack title="Medical Consultation Record" description="View consultation details and patient information">
      {/* Current Consultation Card - Always visible */}

      {/* Consultation History Section */}
      <Card className="w-full mt-6 shadow-lg border-0">
        <CardContent className="p-6">{currentConsultation && <CurrentConsultationCard consultation={currentConsultation} patientData={patientData} />}</CardContent>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">Consultation History</h2>
              <p className="text-sm text-gray-600">Previous medical consultations and records</p>
            </div>
          </div>

          {/* Consultation History Table with loading state */}
          <ConsultationHistoryTable relevantHistory={consultationHistory} currentConsultationId={MedicalConsultation?.medrec_id} currentPage={currentPage} totalPages={totalPages} onPaginate={paginate} isLoading={isLoading} />

          {/* Pagination Controls */}
          {!isLoading && <PaginationControls />}

          {/* Error State */}
          {isError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <Stethoscope className="h-5 w-5" />
                <h3 className="font-semibold">Unable to load consultation history</h3>
              </div>
              <p className="text-sm text-red-600 mt-2">{queryError instanceof Error ? queryError.message : "Please try refreshing the page"}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-3 border-red-300 text-red-700 hover:bg-red-50">
                Retry Loading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </LayoutWithBack>
  );
}
