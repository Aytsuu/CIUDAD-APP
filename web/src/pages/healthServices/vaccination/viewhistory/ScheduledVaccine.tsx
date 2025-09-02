import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Button } from "@/components/ui/button/button";
import { CurrentVaccination } from "../../../../components/ui/current-vaccination";
import { VaccinationHistoryRecord } from "@/components/ui/vaccination-history";
import { VaccinationRecord } from "../tables/columns/types";
import { useLocation } from "react-router-dom";
import CardLayout from "@/components/ui/card/card-layout";
import { useIndivPatientVaccinationRecords, useUnvaccinatedVaccines, useFollowupVaccines } from "../queries/fetch";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePatientVaccinationDetails } from "../queries/fetch";
import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { VaccinationStatusCardsSkeleton } from "../../skeleton/vaccinationstatus-skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { FormInput } from "@/components/ui/form/form-input";
import { Form } from "@/components/ui/form/form";
import { useVaccinationMutation } from "../queries/adminsitered";


// Follow-up visit schema
const followUpSchema = z.object({
  followv_date: z.string().min(1, "Follow-up date is required"),
  followv_status: z.string().default("pending"),
  followv_description: z.string().min(1, "Description is required")
});

export default function ScheduledVaccine() {
  const location = useLocation();
  const { Vaccination, patientData } = location.state || {};
  const patientId = patientData?.pat_id;

  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patientId, patientData.personal_info.per_dob);
  const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } = useFollowupVaccines(patientId);
  const { data: vaccinationHistory = [], isLoading: isVachistLoading, error } = useIndivPatientVaccinationRecords(patientId);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patientId);
  
  const isLoading = isUnvaccinatedLoading || isFollowVaccineLoading || isVachistLoading || isCompleteVaccineLoading;
  const [currentVaccination, setCurrentVaccination] = useState<VaccinationRecord | null>(null);

  // Use the mutation hook
  const { mutate: submitVaccination, isPending: isSubmitting } = useVaccinationMutation();

  // Get the current vaccination data (either from state or found in history)
  const activeVaccination = currentVaccination || Vaccination;
  
  // Form for follow-up visit - initialize with empty values first
  const form = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      followv_date: "",
      followv_status: "pending",
      followv_description: ""
    }
  });

  // Set current vaccination from history when data loads
  useEffect(() => {
    if (vaccinationHistory.length && Vaccination?.vachist_id) {
      const foundVaccination = vaccinationHistory.find((history: VaccinationRecord) => 
        history.vachist_id === Vaccination.vachist_id
      );
      if (foundVaccination) {
        console.log("Found vaccination in history:", foundVaccination);
        setCurrentVaccination(foundVaccination);
      }
    }
  }, [vaccinationHistory, Vaccination?.vachist_id]);

  // Update form with follow-up data when vaccination data is available
  useEffect(() => {
    const vaccination = activeVaccination;
    console.log("Updating form with vaccination data:", vaccination);
    
    if (vaccination?.follow_up_visit) {
      const followUp = vaccination.follow_up_visit;
      console.log("Follow-up data found:", followUp);
      
      // Reset form with new values
      form.reset({
        followv_date: followUp.followv_date || "",
        followv_status: followUp.followv_status || "pending",
        followv_description: followUp.followv_description || ""
      });
      
      console.log("Form updated with values:", {
        followv_date: followUp.followv_date,
        followv_status: followUp.followv_status,
        followv_description: followUp.followv_description
      });
    } else {
      console.log("No follow-up visit found for vaccination");
    }
  }, [activeVaccination, form]);
  
  const previousVaccination = useMemo(() => {
    if (!vaccinationHistory.length || !Vaccination?.vacrec) return null;
    const sameVacrecVaccinations = vaccinationHistory.filter((history: VaccinationRecord) => {
      const hasPendingFollowUp = history.follow_up_visit && 
                                history.follow_up_visit.followv_status === 'pending';
      const isSameVacrec = history.vacrec === Vaccination.vacrec;
      const isDifferentVaccination = history.vachist_id !== Vaccination.vachist_id;
      const isEarlier = new Date(history.created_at) < new Date(Vaccination.created_at);
      
      return isSameVacrec && isDifferentVaccination && isEarlier && hasPendingFollowUp;
    });
    // Sort by date (most recent first) and return the first one
    const sorted = sameVacrecVaccinations.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log("Most recent previous vaccination with same vacrec:", sorted[0] || null);
    return sorted[0] || null;
  }, [vaccinationHistory, Vaccination]);

  const relevantHistory = useMemo(() => {
    if (!Vaccination?.created_at) return [];
    return vaccinationHistory.filter((history: VaccinationRecord) => 
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

  useEffect(() => {
    console.log("Prev:", previousVaccination);
    console.log("Current:", currentVaccination);
    console.log("Active vaccination:", activeVaccination);
    console.log("Form values:", form.getValues());
  }, [previousVaccination, currentVaccination, activeVaccination, form]);

  const handleSubmit = () => {
    const formData = form.getValues();
    console.log("Submitting vaccination with:", {
      vaccination: activeVaccination,
      previousVaccination,
      followUpData: activeVaccination?.follow_up_visit ? formData : undefined,
      patientId
    });
    
    submitVaccination({ 
      vaccination: activeVaccination,
      previousVaccination, // This is the key fix - passing previousVaccination
      followUpData: activeVaccination?.follow_up_visit ? formData : undefined,
      patientId 
    })
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
                    <CurrentVaccination currentVaccination={activeVaccination} />
                    
                    {activeVaccination?.follow_up_visit && (
                      <div className="mt-6 p-4 border rounded-lg">
                        <p className="text-sm  mb-4 italic text-yellow-600">
                          Note* modify the schedule if there are any changes.
                        </p>
                        <Form {...form}>
                          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                            <FormDateTimeInput 
                              control={form.control} 
                              name="followv_date" 
                              label="Follow-up Visit Date" 
                              type="date" 
                            />
                            <FormInput 
                              control={form.control} 
                              name="followv_status" 
                              label="Follow-up Status" 
                              placeholder="Status" 
                            />
                          </div>
                          <div className="mt-4">
                            <FormInput 
                              control={form.control} 
                              name="followv_description" 
                              label="Follow-up Description" 
                              placeholder="Description for follow-up visit" 
                            />
                          </div>
                        </Form>
                      </div>
                    )}

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
                      onClick={handleSubmit} 
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