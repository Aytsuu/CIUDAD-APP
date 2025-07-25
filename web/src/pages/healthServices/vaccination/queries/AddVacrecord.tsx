import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import {
  createAntigenStockTransaction,
  createVaccinationRecord,
  createVaccinationHistory,
  createVitalSigns,
  createFollowUpVisit,

} from "../restful-api/post";
import   {getVaccineStock} from "../restful-api/get";
import { deleteVaccinationRecord,
  deletePatientRecord,
  deleteVitalSigns,
  deleteFollowUpVisit,
  deleteVaccinationHistory,
} from "../restful-api/delete";

import { api2 } from "@/api/api";
import { getVaccinationHistory } from "../restful-api/get";
import { CircleCheck } from "lucide-react";
import { calculateNextVisitDate } from "@/helpers/Calculatenextvisit";
import { useNavigate } from "react-router";
import { checkVaccineStatus } from "../restful-api/fetch";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";
import { VaccinationRecord } from "../tables/columns/types";

// Mutation for Step 2 submission
export const useSubmitStep2 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      assignmentOption,
      data,
      pat_id,
      form,
      form2,
      vacStck_id,
      vac_id,
      vac_name,
      expiry_date,
      followUpData, // Optional follow-up data
      staff_id, // Optional staff_id parameter
      vaccinationHistory, // Optional vaccination history data
    }: {
      assignmentOption: "self" | "other";

      data: Record<string, any>;
      pat_id: string;
      form: { setError: any; getValues: any; reset: any };
      form2: { getValues: any; reset: any };
      vacStck_id: string;
      vac_id: string;
      vac_name: string;
      expiry_date: string;
      staff_id: string | null; // Optional staff_id parameter
      followUpData?: {
        followv_date: string;
        followv_status: string;
        followv_description?: string;
      };
      vaccinationHistory?: any; // Optional vaccination history data
    }) => {
      let patrec_id: string | null = null;
      let vacrec_id: string | null = null;
      let vital_id: string | null = null;
      let vachist_id: string | null = null;
      let followv_id: string | null = null;

      try {
        const vaccineData = await getVaccineStock(vacStck_id);
        let vac_type = vaccineData.vaccinelist.vac_type_choices;
        const doseNo = form.getValues("vachist_doseNo");
        console.log("doseNo:", doseNo);
        let form_vacrec_totaldose = parseInt(
          form.getValues("vacrec_totaldose"),
          10
        );
        console.log("Form Vacrec Total Dose:", form_vacrec_totaldose);
        console.log("Vaccine Type:", vac_type);
        let age = form.getValues("age");

        console.log("VACCCination ", vaccinationHistory);
        let old_vacrec_id =
          vaccinationHistory[0]?.vacrec_details?.vacrec_id || null;
        let vacrec_totaldose = Number(
          vaccinationHistory[0]?.vacrec_details?.vacrec_totaldose
        );
        console.log("Old Vaccination Record ID:", old_vacrec_id);

        if (assignmentOption == "other") {
          vital_id == null;
        } else {
          const vitalSigns = await createVitalSigns(data);
          vital_id = vitalSigns.vital_id;
        }

        await api2.put(
          `inventory/vaccine_stocks/${parseInt(vacStck_id, 10)}/`,
          {
            vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
            vacStck_used: vaccineData.vacStck_used + 1,
          }
        );
        await createAntigenStockTransaction(
          parseInt(vacStck_id, 10),
          staff_id ?? ""
        );

        // ======================================================//

        if (vac_type === "routine") {
          const patientRecord = await createPatientRecord(
            pat_id,
            "Vaccination Record",
            staff_id
          );
          patrec_id = patientRecord.patrec_id;

          if (!patrec_id) {
            throw new Error(
              "Patient record ID is null. Cannot create vaccination record."
            );
          }

          const vaccinationRecord = await createVaccinationRecord(
            patrec_id,
            staff_id,
            form_vacrec_totaldose
          );

          vacrec_id = vaccinationRecord.vacrec_id;
          const followUpVisit = await createFollowUpVisit(
            patrec_id,
            followUpData?.followv_date || form.getValues("followv_date"),
            followUpData?.followv_description ||
              `Follow-up visit for ${vac_name} in queue on ${form.getValues(
                "followv_date"
              )}`,
            "pending" // Added description
          );
          followv_id = followUpVisit.followv_id;

        
        } else if (vac_type === "primary") {
          if (doseNo === 1) {
            const patientRecord = await createPatientRecord(
              pat_id,
              "Vaccination Record",
              staff_id
            );
            patrec_id = patientRecord.patrec_id;

            if (!patrec_id) {
              throw new Error(
                "Patient record ID is null. Cannot create vaccination record."
              );
            }

            const vaccinationRecord = await createVaccinationRecord(
              patrec_id,
              staff_id,
              form_vacrec_totaldose
            );

            vacrec_id = vaccinationRecord.vacrec_id;

            const followUpVisit = await createFollowUpVisit(
              patrec_id,
              followUpData?.followv_date || form.getValues("followv_date"),
              followUpData?.followv_description ||
                `Follow-up visit for ${vac_name} scheduled on ${form.getValues(
                  "followv_date"
                )}`,
              "pending" // Added description
            );
            followv_id = followUpVisit.followv_id;
          } else if (doseNo < form_vacrec_totaldose) {
            const followUpVisit = await createFollowUpVisit(
              vaccinationHistory?.vacrec_details?.patrec_id ?? "",
              followUpData?.followv_date || form.getValues("followv_date"),
              followUpData?.followv_description ||
                `Follow-up visit for ${vac_name} in queue on ${form.getValues(
                  "followv_date"
                )}`,
              "pending" // Added description
            );
            followv_id = followUpVisit.followv_id;
            console.log("pisty dosenumber", doseNo);
          }
        }
        // ==================CONDITIONAL====================================//
        else if (vac_type === "conditional") {
          console.log("Conditional Logic Executed");

          if (doseNo === 1 && form_vacrec_totaldose >= 1) {
            console.log("Logic 1");
            const patientRecord = await createPatientRecord(
              pat_id,
              "Vaccination Record",
              staff_id
            );
            patrec_id = patientRecord.patrec_id;

            if (!patrec_id) {
              throw new Error(
                "Patient record ID is null. Cannot create vaccination record."
              );
            }

            const vaccinationRecord = await createVaccinationRecord(
              patrec_id,
              staff_id,
              form_vacrec_totaldose
            );

            vacrec_id = vaccinationRecord.vacrec_id;
          } else if (doseNo < form_vacrec_totaldose) {
            console.log("Logic 3");

            const followUpVisit = await createFollowUpVisit(
              vaccinationHistory.vacrec_details.patrec_id ?? "",
              followUpData?.followv_date || form.getValues("followv_date"),
              followUpData?.followv_description ||
                `Follow-up visit for ${vac_name} in queue on ${form.getValues(
                  "followv_date"
                )}`,
              "pending" // Added description
            );
            followv_id = followUpVisit.followv_id;
          }
        }

        if (assignmentOption === "other") {
          await createVaccinationHistory(
            vacrec_id ?? "",
            { ...data },
            vacStck_id,
            doseNo,
            "forwarded",
            age,
            staff_id,
            vital_id,
            followv_id
          );
        } else {
          await createVaccinationHistory(
            vacrec_id ?? "",
            { ...data },
            vacStck_id,
            doseNo,
            "in queue",
            age,
            staff_id,
            vital_id,
            followv_id
          );
        }

        queryClient.invalidateQueries({
          queryKey: ["patientVaccinationRecords", data.pat_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vaccinationRecords", data.pat_id],
        });

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
      navigate(-1);
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
