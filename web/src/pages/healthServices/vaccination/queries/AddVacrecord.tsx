import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitVaccinationRecord = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      data,
      signature,
      vacStck_id,
      vac_id,
      vac_name,
      expiry_date,
      followUpData,
      vaccinationHistory
    }: {
      data: Record<string, any>;
      signature: string | null;
      vacStck_id: string;
      vac_id: string;
      vac_name: string;
      expiry_date: string;
      followUpData?: {
        followv_date: string;
        followv_status: string;
        followv_description?: string;
      };
      vaccinationHistory?: any;
    }) => {
      const submissionData = {
        // Vaccination form data - send only the form fields, not the entire data object
        form_data: {
          vachist_doseNo: data.vachist_doseNo,
          vacrec_totaldose: data.vacrec_totaldose,
          age: data.age,
          followv_date: data.followv_date,
          pr: data.pr,
          temp: data.temp,
          o2: data.o2,
          bpsystolic: data.bpsystolic,
          bpdiastolic: data.bpdiastolic,
          vital_RR:data.vital_RR,
          // Add pat_id if available
          pat_id: data.pat_id,
          staff_id: data.staff_id || null,
          selectedStaffId: data.selectedStaffId || null
        },
        // Additional metadata
        signature: signature,
        vacStck_id: vacStck_id,
        vac_id: vac_id,
        vac_name: vac_name,
        expiry_date: expiry_date,
        follow_up_data: followUpData
          ? {
              followv_date: followUpData.followv_date,
              followv_status: followUpData.followv_status,
              followv_description: followUpData.followv_description
            }
          : undefined,
        vaccination_history: vaccinationHistory
      };

      console.log("Submission Data:", submissionData);
      const response = await api2.post("/vaccination/submit-vaccination-records/", submissionData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["patientVaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["unvaccinatedResidents"] }); 
      queryClient.invalidateQueries({ queryKey: ["followupVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["vaccineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["unvaccinatedVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["scheduledVaccination"] });

      navigate(-1);
      showSuccessToast("Vaccination record successfully submitted");
    },
    onError: (error: Error) => {
      showErrorToast(`Failed to submit vaccination record: ${error.message}`);
    }
  });
};
