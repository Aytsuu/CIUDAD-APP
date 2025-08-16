import {  Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Button } from "@/components/ui/button/button";
import { CurrentVaccination } from "../../../../components/ui/current-vaccination";
import { VaccinationHistoryRecord } from "@/components/ui/vaccination-history";
import { VaccinationRecord } from "../tables/columns/types";
import { useLocation } from "react-router-dom";
import CardLayout from "@/components/ui/card/card-layout";
import {
  useIndivPatientVaccinationRecords,
  useUnvaccinatedVaccines,
  useFollowupVaccines,
} from "../queries/fetch";
import { updateVaccinationHistory } from "../restful-api/update";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { updateFollowUpVisit } from "../restful-api/update";
import { usePatientVaccinationDetails } from "../queries/fetch";
import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { VaccinationStatusCardsSkeleton } from "../../skeleton/vaccinationstatus-skeleton";

export default function ScheduledVaccine() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { Vaccination, patientData } = location.state || {};
  const queryClient = useQueryClient();
  const patientId = patientData?.pat_id;
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patientId, patientData.personal_info.per_dob);
  const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } = useFollowupVaccines(patientId);
  const { data: vaccinationHistory = [],  isLoading: isVachistLoading,  error,} = useIndivPatientVaccinationRecords(patientId);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } =usePatientVaccinationDetails(patientId);
  const isLoading =
    isUnvaccinatedLoading ||
    isFollowVaccineLoading ||
    isVachistLoading ||
    isCompleteVaccineLoading;

  const [currentVaccination, setCurrentVaccination] = useState<VaccinationRecord | null>(null);

  useEffect(() => {
    if (vaccinationHistory.length && Vaccination?.vachist_id) {
      const foundVaccination = vaccinationHistory.find(
        (history: VaccinationRecord) =>
          history.vachist_id === Vaccination.vachist_id
      );
      setCurrentVaccination(foundVaccination || null);
    }
  }, [vaccinationHistory, Vaccination?.vachist_id]);

  const previousVaccination = useMemo(() => {
    if (!vaccinationHistory.length || !Vaccination?.created_at) return null;

    // For routine vaccinations, just get the most recent vaccination
    if (Vaccination.vaccination_type?.toLowerCase() === "routine") {
      const sortedHistory = [...vaccinationHistory].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // Return the most recent one that's not the current vaccination
      return (
        sortedHistory.find(
          (history) => history.vachist_id !== Vaccination.vachist_id
        ) || null
      );
    }
    // Original logic for non-routine vaccinations
    const sortedHistory = [...vaccinationHistory].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const currentIndex = sortedHistory.findIndex(
      (history) => history.vachist_id === Vaccination.vachist_id
    );

    return currentIndex > 0 ? sortedHistory[currentIndex - 1] : null;
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

  const submit = async () => {
    setIsSubmitting(true);
    try {
      if (previousVaccination?.follow_up_visit) {
        await updateFollowUpVisit({
          followv_id: String(previousVaccination.follow_up_visit.followv_id),
          followv_status: "completed",
          completed_at: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
        });
      }
      await updateVaccinationHistory({
        vachist_id: Vaccination.vachist_id,
        vachist_status: "completed",
      });
      queryClient.invalidateQueries({
        queryKey: ["patientVaccinationRecords", patientId],
      });
      queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });

      toast.success("Vaccination marked as completed successfully.");
      navigate(-1);
    } catch (error) {
      toast.error("Failed to update vaccination status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LayoutWithBack
        title={`Vaccination History for ${patientData.personal_info.per_fname} ${patientData.personal_info.per_lname}`}
        description="View the vaccination history and administer patient."
      >
        <div className="mb-4">
          <PatientInfoCard patient={patientData} />
        </div>

        {isLoading ? (
          <div>
            <VaccinationStatusCardsSkeleton />
          </div>
        ) : (
          <>
            <CardLayout
              cardClassName="mb-6"
              content={
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full">
                    <VaccinationStatusCards
                      unvaccinatedVaccines={unvaccinatedVaccines}
                      vaccinations={vaccinations}
                    />
                  </div>

                  <div className="w-full">
                    <FollowUpsCard followupVaccines={followupVaccines} />
                  </div>
                </div>
              }
            />

            <CardLayout
              content={
                <>
                  <div>
                    <CurrentVaccination
                      currentVaccination={currentVaccination || Vaccination}
                    />
                    <VaccinationHistoryRecord
                      relevantHistory={relevantHistory}
                      currentVaccinationId={Vaccination?.vachist_id}
                      loading={isLoading}
                      error={error?.message}
                    />
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      onClick={submit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Done Administered"
                      )}
                    </Button>
                  </div>
                </>
              }
            />
          </>
        )}
      </LayoutWithBack>
    </>
  );
}