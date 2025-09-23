// Updated useVaccinationMutation hook
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { showSuccessToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import { api2 } from "@/api/api";

interface VaccinationMutationParams {
  vaccination: any;
  previousVaccination?: any;
  followUpData?: {
    followv_date: string;
    followv_status: string;
    followv_description: string;
  };
  patientId: string;
  patrec_id: string;
}

export const useVaccinationMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ vaccination, previousVaccination, followUpData, patientId, patrec_id }: VaccinationMutationParams) => {
      console.log("Mutation called with:", {
        vaccinationId: vaccination?.vachist_id,
        previousVaccinationId: previousVaccination?.vachist_id,
        hasFollowUpData: !!followUpData,
        patientId,
        patrec_id
      });

      // Prepare the request data - DO NOT include followUpData at all if not needed
      const requestData: any = {
        vachist_id: vaccination.vachist_id,
        patientId,
        patrec_id
      };

      // ONLY include followUpData if we have a valid date
      if (followUpData?.followv_date && followUpData.followv_date.trim() !== "") {
        try {
          const formattedDate = new Date(followUpData.followv_date).toISOString().split("T")[0];
          requestData.followUpData = {
            followv_date: formattedDate,
            followv_status: followUpData.followv_status || "pending",
            followv_description: followUpData.followv_description || "No description provided"
          };
        } catch (error) {
          console.error("Error formatting date:", error);
          // If date formatting fails, don't include followUpData at all
        }
      }

      console.log("Sending request data:", requestData);

      try {
        const response = await api2.post("vaccination/vaccination-completion/", requestData);
        return response.data;
      } catch (error) {
        console.error("Error during vaccination mutation:", error);
        throw new Error("Failed to complete vaccination request.");
      }
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
      queryClient.invalidateQueries({ queryKey: ["scheduledVaccination"] });

      navigate(-1);
      showSuccessToast("Vaccination status updated successfully.");
    },
    onError: (error: Error) => {
      console.error("Error updating vaccination:", error);
      toast.error(error.message || "Failed to update vaccination status.");
    }
  });

  return mutation;
};