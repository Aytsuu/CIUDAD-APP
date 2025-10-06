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
import { getVaccineStock } from "../restful-api/get";
import {
  deleteVaccinationRecord,
  deletePatientRecord,
  deleteVitalSigns,
  deleteFollowUpVisit,
  deleteVaccinationHistory,
} from "../restful-api/delete";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";
import { updateVaccineStock } from "@/pages/healthInventory/inventoryStocks/REQUEST/Antigen/restful-api/VaccinePutAPI";
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
      // form2,
      vacStck_id,
      // vac_id,
      vac_name,
      // expiry_date, 
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
      const vachist_id: string | null = null;
      let followv_id: string | null = null;

      try {
        const vaccineData = await getVaccineStock(vacStck_id);
        const vac_type = vaccineData.vaccinelist.vac_type_choices;
        const doseNo = form.getValues("vachist_doseNo");
        console.log("doseNo:", doseNo);
        const form_vacrec_totaldose = parseInt(
          form.getValues("vacrec_totaldose"),
          10
        );
        console.log("Form Vacrec Total Dose:", form_vacrec_totaldose);
        console.log("Vaccine Type:", vac_type);
        const age = form.getValues("age");

        console.log("VACCCination ", vaccinationHistory);
        const old_vacrec_id = vaccinationHistory[0]?.vacrec || null;
        // const vacrec_totaldose = Number(
        //   vaccinationHistory[0]?.vacrec_details?.vacrec_totaldose
        // );
        console.log("Old Vaccination Record ID:", old_vacrec_id);

        if (assignmentOption == "other") {
          vital_id == null;
        } else {
          const vitalSigns = await createVitalSigns(
            
            {
              vital_bp_systolic: form.getValues("bpsystolic"),
              vital_bp_diastolic: form.getValues("bpdiastolic"),
              vital_temp: form.getValues("temp"),
              vital_o2: form.getValues("o2"),
              vital_pulse: form.getValues("pr"),
              staff: staff_id , 
              patrec: patrec_id, 
            });
          vital_id = vitalSigns.vital_id;
        }

        await updateVaccineStock({
          vacStck_id: parseInt(vacStck_id, 10),
          vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
        });

        await createAntigenStockTransaction(
          parseInt(vacStck_id, 10),
          staff_id ?? ""
        );

        let status = "in queue"; // Default status

        if (assignmentOption === "other") {
          status = "forwarded"; // Set status to 'forwarded' if assignmentOption is 'other'
        }

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

          const vaccinationRecord = await createVaccinationRecord({
            patrec_id,
            vacrec_totaldose: form_vacrec_totaldose,
          });

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

          await createVaccinationHistory({
            vacrec: vacrec_id ?? "",
            assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
            vacStck_id,
            vachist_doseNo: doseNo,
            vachist_status: status, // Use the determined status
            vachist_age: age,
            staff: staff_id,
            vital: vital_id,
            followv: followv_id,
            date_administered: new Date().toISOString().split("T")[0],
          });
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

            const vaccinationRecord = await createVaccinationRecord({
              patrec_id: patrec_id,
              vacrec_totaldose: form_vacrec_totaldose,
            });

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

            await createVaccinationHistory({
              vacrec: vacrec_id ?? "",
              assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo: doseNo,
              vachist_status: status, // Use the determined status
              vachist_age: age,
              staff: staff_id,
              vital: vital_id,
              followv: followv_id,
              date_administered: new Date().toISOString().split("T")[0],
            });
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

            await createVaccinationHistory({
              vacrec: old_vacrec_id ?? "",
              assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo: doseNo,
              vachist_status: status, // Use the determined status
              vachist_age: age,
              nstaff: staff_id,
              vital: vital_id,
              followv: followv_id,
              date_administered: new Date().toISOString().split("T")[0],
            });
          } else {
            await createVaccinationHistory({
              vacrec: old_vacrec_id ?? "",
              assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo: doseNo,
              vachist_status: status, // Use the determined status
              vachist_age: age,
              staff: staff_id,
              vital: vital_id,
              followv: null,
              date_administered: new Date().toISOString().split("T")[0],
            });
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

            const vaccinationRecord = await createVaccinationRecord({
              patrec_id: patrec_id,
              vacrec_totaldose: form_vacrec_totaldose,
            });

            vacrec_id = vaccinationRecord.vacrec_id;

            await createVaccinationHistory({
              vacrec: vacrec_id ?? "",
              assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo: doseNo,
              vachist_status: status, // Use the determined status
              vachist_age: age,
              staff: staff_id,
              vital: vital_id,
              followv: followv_id,
              date_administered: new Date().toISOString().split("T")[0],
            });
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

            await createVaccinationHistory({
              vacrec: old_vacrec_id ?? "",
              assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo: doseNo,
              vachist_status: status, // Use the determined status
              vachist_age: age,
              staff: staff_id,
              vital: vital_id,
              followv: followv_id,
              date_administered: new Date().toISOString().split("T")[0],
            });
          } else {
            await createVaccinationHistory({
              vacrec: old_vacrec_id ?? "",
              assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo: doseNo,
              vachist_status: status, // Use the determined status
              vachist_age: age,
              staff: staff_id,
              vital: vital_id,
              followv: followv_id,
              date_administered: new Date().toISOString().split("T")[0],
            });
          }
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
