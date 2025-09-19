import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api2 } from "@/api/api";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";

type ImmunizationMutationParams = {
  data: any;
  vaccines: any[];
  existingVaccines: any[];
  ChildHealthRecord: any;
  staff_id: string | null;
  pat_id: string;
};

export const useImmunizationMutations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const saveImmunizationData = async ({
    data,
    vaccines,
    existingVaccines,
    ChildHealthRecord,
    staff_id,
    pat_id,
  }: ImmunizationMutationParams): Promise<any> => {
    
    // Prepare the payload for the Django API
    const payload = {
      data: {
        notes: data.notes || '',
        followUpVisit: data.followUpVisit || '',
        follov_description: data.follov_description || ''
      },
      vaccines: vaccines.map(vaccine => ({
        vacStck_id: vaccine.vacStck_id,
        dose: vaccine.dose,
        totalDoses: vaccine.totalDoses,
        vac_name: vaccine.vac_name,
        date: vaccine.date,
        nextFollowUpDate: vaccine.nextFollowUpDate,
        existingFollowvId: vaccine.existingFollowvId,
        vacrec: vaccine.vacrec
      })),
      existingVaccines: existingVaccines.map(vaccine => ({
        vac_id: vaccine.vac_id,
        dose: vaccine.dose,
        totalDoses: vaccine.totalDoses,
        vaccineType: vaccine.vaccineType,
        date: vaccine.date,
        vacrec: vaccine.vacrec
      })),
      ChildHealthRecord,
      staff_id,
      pat_id
    };
    console.log(payload)

    // Make API call to Django backend
    const response = await api2.post('child-health/immunization-save/', payload);
    return response.data;
  };

  return useMutation({
    mutationFn: async (params: ImmunizationMutationParams) => {
      const { data, vaccines, existingVaccines } = params;

      const hasVaccines = vaccines.length > 0;
      const hasExistingVaccines = existingVaccines.length > 0;
      const hasNotes = data.notes?.trim();
      const hasFollowUp = data.followUpVisit?.trim();

      if (!hasVaccines && !hasExistingVaccines && !hasNotes && !hasFollowUp) {
        toast.info("No changes have been made");
        return;
      }

      return await saveImmunizationData(params);
    },
    onSuccess: (data, variables) => {
      if (!data) return; // No changes case

      const chrec_id = variables.ChildHealthRecord.chrec;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords", chrec_id] });
      
      navigate(-1);
      showSuccessToast("Immunization data saved successfully!");
    },
    onError: (error: any) => {
      console.error("Error saving immunization data:", error);
      
      // Extract error message from response
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          "Failed to save immunization data";
      
      showErrorToast(errorMessage);
    },
  });
};