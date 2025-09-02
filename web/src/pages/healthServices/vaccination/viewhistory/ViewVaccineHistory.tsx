import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {  useMemo } from "react";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Button } from "@/components/ui/button/button";
import { CurrentVaccination } from "../../../../components/ui/current-vaccination";
import {VaccinationHistoryRecord} from "@/components/ui/vaccination-history";
import { VaccinationRecord } from "../tables/columns/types";
import { useLocation } from "react-router-dom";
import CardLayout from "@/components/ui/card/card-layout";
import { useIndivPatientVaccinationRecords } from "../queries/fetch";
// import { useQueryClient } from "@tanstack/react-query";

export default function VaccinationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData, Vaccination } = params || {};
  const patientId = useMemo(() => patientData?.pat_id, [patientData]);

  // Use the query hook
  const { 
    data: vaccinationHistory = [], 
    isLoading, 
    error 
  } = useIndivPatientVaccinationRecords(patientId);

  const currentVaccination = useMemo(() => {
    return vaccinationHistory.find(
      (history: VaccinationRecord) => history.vachist_id === Vaccination?.vachist_id
    );
  }, [vaccinationHistory, Vaccination]);

  const relevantHistory = useMemo(() => {
    if (!Vaccination?.created_at) return [];
    return vaccinationHistory.filter(
      (history: VaccinationRecord) =>
      new Date(history.created_at) <= new Date(Vaccination.created_at)
    );
  }, [vaccinationHistory, Vaccination]);

  if (!patientData || !Vaccination) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xl text-gray-600">No vaccination data found.</p>
      </div>
    );
  }

  return (
    <>
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

      {/* Patient Information Card */}
      <div className="mb-4">
        <PatientInfoCard patient={patientData} />
      </div>
      <CardLayout
        content={
          <>
            <div>
              {/* Current Vaccination */}
              {currentVaccination && (
                <CurrentVaccination currentVaccination={currentVaccination} />
              )}

              {/* Vaccination History */}
              <VaccinationHistoryRecord
                relevantHistory={relevantHistory}
                currentVaccinationId={Vaccination?.vachist_id}
                loading={isLoading}
                error={error?.message}
              />
            </div>
          </>
        }
      />
    </>
  );
}