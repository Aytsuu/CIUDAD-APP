import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVaccinationHistory } from "../restful-api/update";
import { updateFollowUpVisit } from "../restful-api/update";
import { toast } from "sonner";
import { showSuccessToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";

interface VaccinationMutationParams {
  vaccination: any;
  previousVaccination?: any;
  followUpData?: {
    followv_date: string;
    followv_status: string;
    followv_description: string;
  };
  patientId: string;
}

export const useVaccinationMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ 
      vaccination, 
      previousVaccination, 
      followUpData,
      patientId
    }: VaccinationMutationParams) => {
      console.log("Mutation called with:", {
        vaccinationId: vaccination?.vachist_id,
        previousVaccinationId: previousVaccination?.vachist_id,
        hasFollowUpData: !!followUpData,
        patientId
      });

      // Check if previous vaccination has a follow-up visit
      if (previousVaccination?.follow_up_visit) {
        console.log("Updating previous follow-up visit with ID:", previousVaccination.follow_up_visit.followv_id);
        await updateFollowUpVisit({
          followv_id: String(previousVaccination.follow_up_visit.followv_id),
          followv_status: "completed",
          completed_at: new Date().toISOString().split("T")[0]
        });
        console.log("Previous follow-up visit updated successfully");
      }

      // Update current vaccination's follow-up if it exists
      if (vaccination?.follow_up_visit && followUpData) {
        console.log("Updating current vaccination follow-up with data:", followUpData);
        
        await updateFollowUpVisit({
          followv_id: String(vaccination.follow_up_visit.followv_id),
          followv_date: followUpData.followv_date,
          followv_status: followUpData.followv_status,
          followv_description: followUpData.followv_description
        });
        console.log("Current vaccination follow-up updated successfully");
      }

      // Update vaccination history status
      console.log("Updating vaccination history status to completed");
      await updateVaccinationHistory({
        vachist_id: vaccination.vachist_id,
        vachist_status: "completed"
      });

      return { success: true,patientId};
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      const { patientId } = result;
      console.log("Invalidating queries for patient:", patientId);
  
      queryClient.invalidateQueries({ queryKey: ["patientVaccinationRecords", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["followupVaccines", patientId] });
      queryClient.invalidateQueries({ queryKey: ["vaccineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["unvaccinatedVaccines"] });
      navigate(-1)

      showSuccessToast("Vaccination status updated successfully.");
    },
    onError: (error: Error) => {
      console.error("Error updating vaccination:", error);
      toast.error("Failed to update vaccination status.");
    }
  });

  return mutation;
};