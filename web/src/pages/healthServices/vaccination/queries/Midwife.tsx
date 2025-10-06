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
import { deleteVaccinationRecord,
  deletePatientRecord,
  deleteVitalSigns,
  deleteFollowUpVisit,
} from "../restful-api/delete";

import   {getVaccineStock} from "../restful-api/get";
import { api2 } from "@/api/api";


import { useNavigate } from "react-router";
import { CircleCheck } from "lucide-react";
import { calculateNextVisitDate } from "../../../../helpers/Calculatenextvisit";
import {checkVaccineStatus} from "../restful-api/fetch";
import {createPatientRecord} from "@/pages/healthServices/restful-api-patient/createPatientRecord"
// Mutation for Step 1 submission
export const useSubmitStep1 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({
      data,
      assignmentOption,
      // form,
      vacStck_id,
      vac_id,
      staff_id,
    }: {
      data: Record<string, any>;
      vacStck_id: any;
      vac_id: any;
      vac_name: string;
      expiry_date: string;
      assignmentOption: string;
      form: { setError: any; getValues: any; reset: any };
      staff_id: string | null;
    }) => {
    

      const response = await checkVaccineStatus(data.pat_id,parseInt(vac_id, 10));
      if (response?.exists) {throw new Error("Patient already has this vaccine in their record.");}

      if (assignmentOption === "other") {
        let patrec_id: string | null = null;
        let vacrec_id: string | null = null;
        try {
          const patientRecord = await createPatientRecord(data.pat_id, "Vaccination Record", staff_id);
          patrec_id = patientRecord.patrec_id;

          if (!patrec_id) {
            throw new Error(
              "Patient record ID is null. Cannot create vaccination record."
            );
          }

          const vaccinationRecord = await createVaccinationRecord({patrec_id:patrec_id, vacrec_totaldose:1});

          vacrec_id = vaccinationRecord.vacrec_id;
          const age = data.age;
          console.log("age", data.age);
          if (vacrec_id) {
            await createVaccinationHistory(
             { vacrec:vacrec_id,
              assigned_to:data.assignto ? parseInt(data.assignto, 10) : null,
              vacStck_id,
              vachist_doseNo:1,
             vachist_status: "forwarded",
              vachist_age:age,
              staff:staff_id,
              date_administered: new Date().toISOString().split("T")[0]
              
            }
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
      navigate(-1);
      toast.success("Form forwarded successfully", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
        duration: 3000, // Added duration for toast
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
      form,
      // form2,
      vacStck_id,
      vac_id,
      vac_name,
      // expiry_date,
      pat_id,
      staff_id
    }: {
      data: Record<string, any>;
      form: { setError: any; getValues: any; reset: any };
      form2: { reset: any; getValues: any };
      vacStck_id: string;
      vac_id: string;
      vac_name: string;
      expiry_date: string;
      pat_id: string ;
      staff_id: string | null; // Optional staff_id parameter
    }) => {
     

      let patrec_id: string | null = null;
      let vacrec_id: string | null = null;
      let vital_id: string | null = null;
      let followv_id: string | null = null;
     
      try {
        const vaccineData = await getVaccineStock(vacStck_id);
        const maxDoses = vaccineData.vaccinelist.no_of_doses;

        if (!vacStck_id) {throw new Error( "Vaccine ID is missing. Please select a valid vaccine type.");}
        
        const response = await checkVaccineStatus(pat_id,parseInt(vac_id, 10));
        if (response?.exists) {throw new Error("Patient already has this vaccine in their record.");}

        const patientRecord = await createPatientRecord(pat_id ?? "" , "Vaccination Record",staff_id);
        patrec_id = patientRecord.patrec_id;

        if (!patrec_id) { throw new Error( "Patient record ID is null. Cannot create vaccination record." ); }

        const vaccinationRecord = await createVaccinationRecord({patrec_id:patrec_id,staff:staff_id,vacrec_totaldose:maxDoses});
        vacrec_id = vaccinationRecord.vacrec_id;

        const vitalSigns = await createVitalSigns({
          vital_bp_systolic: data.bpsystolic,
          vital_bp_diastolic: data.bpdiastolic,
          vital_temp: data.temp,
          vital_o2: data.o2,
          vital_pulse: data.pr,
          staff: staff_id ?? null, // Optional staff_id
          patrec: patrec_id, // Link to patient record
        });
        vital_id = vitalSigns.vital_id;

        await api2.put(`inventory/vaccine_stocks/${parseInt(vacStck_id)}/`, {
          vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
        });

        
        await createAntigenStockTransaction(parseInt(vacStck_id), staff_id ?? "");

        const vac_type_choices = vaccineData.vaccinelist.vac_type_choices;

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
            nextVisitDate.toISOString().split("T")[0],
            `Routine vaccination for ${vac_name} scheduled on ${nextVisitDate.toISOString().split("T")[0]}` ,
            "pending"

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
              nextVisitDate.toISOString().split("T")[0],
              `Follow-up visit for ${vac_name} scheduled on ${nextVisitDate.toISOString().split("T")[0]}`,
              "pending"
            );
            followv_id = followUpVisit.followv_id;
          }
        }

        console.log("age", form.getValues("age"));
        const historyStatus =
          maxDoses === 1 ? "completed" : "partially vaccinated";
        await createVaccinationHistory(
          {vacrec:vacrec_id ?? "",
          assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
          vacStck_id,
          vachist_doseNo:1,
          vachist_status:historyStatus,
          vachist_age: form.getValues("age"),
          staff:staff_id,
          vital:vital_id,
          followv:followv_id,
          date_administered: new Date().toISOString().split("T")[0]
        }
        );

        queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
        return;
      } catch (error) {
        // Rollback
        if (vital_id) await deleteVitalSigns(vital_id);
        if (vacrec_id) await deleteVaccinationRecord(vacrec_id);
        if (patrec_id) await deletePatientRecord(patrec_id);
        if (followv_id) await deleteFollowUpVisit(followv_id);
        throw error;
      }
    },




    onSuccess: () => {

      toast.success("Added successfully", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      navigate(-1);
    },
    onError: (error: Error) => {
      toast.error(`${error.message}`, {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        duration: 3000, // Added duration for toast
      });
    },
  });
};
