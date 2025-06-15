import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import {
  getVaccineStock,
  deleteVaccinationHistory,
  createAntigenStockTransaction,
  createPatientRecord,
  createVaccinationRecord,
  createVaccinationHistory,
  createVitalSigns,
  createFollowUpVisit,
  deleteVaccinationRecord,
  deletePatientRecord,
  deleteVitalSigns,
  deleteFollowUpVisit,
} from "../restful-api/PostAPI";
import { api } from "@/api/api";
import { getVaccinationHistory } from "../restful-api/GetVaccination";
import { CircleCheck } from "lucide-react";
import { calculateNextVisitDate } from "@/pages/healthServices/vaccination/Calculatenextvisit";
import { useNavigate } from "react-router";
// 
// Mutation for deducting vaccine stock
// export const useDeductVaccineStock = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (vacStck_id: number) => {
//       // Fetch specific vaccine stock instead of entire inventory
//       const existingItem = await getVaccineStock(vacStck_id.toString());

//       if (!existingItem) {
//         throw new Error("Vaccine item not found. Please check the ID.");
//       }

//       const currentQtyAvail = existingItem.vacStck_qty_avail;
//       const existingUsedItem = existingItem.vacStck_used;

//       if (currentQtyAvail < 1) {
//         throw new Error("Insufficient vaccine stock available.");
//       }

//       const updatePayload = {
//         vacStck_qty_avail: currentQtyAvail - 1,
//         vacStck_used: existingUsedItem + 1,
//       };

//       await api.put(`inventory/vaccine_stocks/${vacStck_id}/`, updatePayload);
//       await createAntigenStockTransaction(vacStck_id);

//       return true;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['vaccineStocks'] });
//     },
//     onError: (error: Error) => {
//       console.error("Vaccine stock update failed:", error);
//       toast.error(error.message);
//     },
//   });
// };

// Mutation for Step 1 submission
export const useSubmitStep1 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      data,
      assignmentOption,
      form,
    }: {
      data: Record<string, any>;
      assignmentOption: "self" | "other";
      form: { reset: any };
    }) => {
      if (!data.pat_id) {
        throw new Error("Patient ID is required.");
      }

      if (assignmentOption === "other") {
        let patrec_id: string | null = null;
        let vacrec_id: string | null = null;

        try {
          const checkVaccinationHistory = await getVaccinationHistory();
          const existingVAccinationHistory = checkVaccinationHistory.find(
            (record: { vacStck: { vac_id: string } }) =>
              record.vacStck.vac_id === data.vaccinetype
          );
          if (existingVAccinationHistory) {
            form.reset();
            throw new Error("Vaccination already exists in the record.");
          }

          const patientRecord = await createPatientRecord(data.pat_id);
          patrec_id = patientRecord.patrec_id;

          if (!patrec_id) {
            throw new Error(
              "Patient record ID is null. Cannot create vaccination record."
            );
          }

          const vaccinationRecord = await createVaccinationRecord(
            patrec_id,
            // "forwarded",
            0
          );
          vacrec_id = vaccinationRecord.vacrec_id;

          if (vacrec_id) {
            await createVaccinationHistory(
              vacrec_id,
              data,
              data.vaccinetype,
              0,
              "forwarded"
            );
          } else {
            throw new Error(
              "Vaccination record ID is null. Cannot create vaccination history."
            );
          }

          queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
          return;
        } catch (error) {
          // Rollback
          if (vacrec_id) await deleteVaccinationRecord(vacrec_id);
          if (patrec_id) await deletePatientRecord(patrec_id);
          throw error;
        }
      }
    },
    onSuccess: () => {
      navigate(-1)
      toast.success("Form forwarded successfully", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error(`${error.message}`, {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        duration: 3000, // Added duration for toast
      });
    },
  });
};

// Mutation for Step 2 submission
export const useSubmitStep2 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      data,
      patientId,
      form,
      form2,
    }: {
      data: Record<string, any>;
      patientId: string;
      form: { setError: any; getValues: any; reset: any };
      form2: { getValues: any; reset: any };
    }) => {
      const vaccineType = form.getValues("vaccinetype");

      if (!vaccineType) {
        form.setError("vaccinetype", {
          type: "manual",
          message: "Please select a vaccine type",
        });
        throw new Error("Please select a vaccine type");
      }

      let patrec_id: string | null = null;
      let vacrec_id: string | null = null;
      let vital_id: string | null = null;
      let vachist_id: string | null = null;
      let followv_id: string | null = null;

      try {
        const vacStck = vaccineType;
        const vaccineData = await getVaccineStock(vacStck);
        const maxDoses = vaccineData.vaccinelist.no_of_doses;

        const response = await api.get(
          `/vaccination/check-vaccine/${patientId}/${parseInt(vaccineType)}`
        );

        if (response.data.exists) {
          form.reset();
          form2.reset();
          throw new Error("Patient already has this vaccine in their record.");
        }

        const patientRecord = await createPatientRecord(patientId);
        patrec_id = patientRecord.patrec_id;

        // const status = maxDoses === 1 ? "completed" : "partially vaccinated";
        if (!patrec_id) {
          throw new Error(
            "Patient record ID is null. Cannot create vaccination record."
          );
        }

        const vaccinationRecord = await createVaccinationRecord(
          patrec_id,
          // status.toLowerCase() as "completed" | "partially vaccinated",
          maxDoses
        );
        vacrec_id = vaccinationRecord.vacrec_id;

        const vitalSigns = await createVitalSigns(data);
        vital_id = vitalSigns.vital_id;

        await api.put(`inventory/vaccine_stocks/${parseInt(vacStck, 10)}/`, {
          vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
          vacStck_used: vaccineData.vacStck_used + 1,
        });
        await createAntigenStockTransaction(parseInt(vacStck, 10));

        let vac_type_choices = vaccineData.vaccinelist.vac_type_choices;

        if (vac_type_choices === "routine") {
          const { interval, time_unit } =
            vaccineData.vaccinelist.routine_frequency;
          const nextVisitDate = calculateNextVisitDate(
            interval,
            time_unit,
            new Date().toISOString()
          );
          const followUpVisit = await createFollowUpVisit(
            patrec_id,
            nextVisitDate.toISOString().split("T")[0]
          );
          followv_id = followUpVisit.followv_id;
        } else if (vaccineData.vaccinelist.no_of_doses >= 2) {
          const dose2Interval = vaccineData.vaccinelist.intervals.find(
            (interval: {
              dose_number: number;
              interval: number;
              time_unit: string;
            }) => interval.dose_number === 2
          );

          if (dose2Interval) {
            const nextVisitDate = calculateNextVisitDate(
              dose2Interval.interval,
              dose2Interval.time_unit,
              new Date().toISOString()
            );
            const followUpVisit = await createFollowUpVisit(
              patrec_id,
              nextVisitDate.toISOString().split("T")[0]
            );
            followv_id = followUpVisit.followv_id;
          }
        }

        const historyStatus =
          maxDoses === 1 ? "completed" : "partially Vaccinated";
        const vaccinationHistory = await createVaccinationHistory(
          vacrec_id ?? "",
          { ...data, age: form.getValues("age") },
          vacStck,
          1,
          historyStatus,
          vital_id,
          followv_id
        );
        vachist_id = vaccinationHistory.vachist_id;
        queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
        queryClient.invalidateQueries({ queryKey: ["invVaccinationRecord"] });
        return;
      } catch (error) {
        // Rollback
        if (vital_id) await deleteVitalSigns(vital_id);
        if (vachist_id) await deleteVaccinationHistory(vachist_id);
        if (vacrec_id) await deleteVaccinationRecord(vacrec_id);
        if (patrec_id) await deletePatientRecord(patrec_id);
        if (followv_id) await deleteFollowUpVisit(followv_id);
        throw error;
      }
    },
    onSuccess: () => {
      navigate(-1)

      toast.success("Successfully  Recorded", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error(`${error.message}`, {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        duration: 3000, // Added duration for toast
      });
    },
  });
};
