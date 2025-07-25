import { ChevronLeft, Loader2 } from "lucide-react"; // Added Loader2
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react"; // Added useState
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Button } from "@/components/ui/button/button";
import { CurrentVaccination } from "../../../../components/ui/current-vaccination";
import { VaccinationHistoryRecord } from "@/components/ui/vaccination-history";
import { VaccinationRecord } from "../tables/columns/types";
import { useLocation } from "react-router-dom";
import CardLayout from "@/components/ui/card/card-layout";
import {
  usePatientVaccinationRecords,
  useUnvaccinatedVaccines,
  useFollowupVaccines,
} from "../queries/fetch";
import { VaccinationStatusCards } from "../tables/individual/vaccinationstatus";
import { updateVaccinationHistory } from "../restful-api/update";
import { toast } from "sonner";

export default function ScheduledVaccine() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state
  // Access the state passed through the Link
  const { Vaccination, patientData } = location.state || {};

  // Get patient ID from the state
  const patientId = patientData?.pat_id;
  console.log("Patient ID:", patientId);
  console.log("Vaccination Data:", Vaccination);
  console.log("Patient Data:", patientData);

  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } =
    useUnvaccinatedVaccines(patientId, patientData.personal_info.per_dob);

  const { data: followupVaccines = [] } = useFollowupVaccines(patientId);

  const {
    data: vaccinationHistory = [],
    isLoading,
    error,
  } = usePatientVaccinationRecords(patientId);

  const currentVaccination = useMemo(() => {
    return vaccinationHistory.find(
      (history: VaccinationRecord) =>
        history.vachist_id === Vaccination?.vachist_id
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

  const submit = async () => {
    setIsSubmitting(true); // Start loading
    try {
      await updateVaccinationHistory(Vaccination.vachist_id, "completed");
      toast.success("Vaccination marked as completed successfully.");
      navigate(-1)
    } catch (error) {
      toast.error("Failed to update vaccination status.");
    } finally {
      setIsSubmitting(false); // Stop loading regardless of outcome
    }
  };

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
        cardClassName="mb-6"
        content={
          <VaccinationStatusCards
            unvaccinatedVaccines={unvaccinatedVaccines}
            followupVaccines={followupVaccines}
          />
        }
      />
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

            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                onClick={submit}
                disabled={isSubmitting} // Disable button when loading
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
  );
}