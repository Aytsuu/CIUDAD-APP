import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CircleAlert } from 'lucide-react';
import { 
  getVaccineStock, 
  getVaccinationHistory,
  createVaccinationRecord, 
  createVaccinationHistory, 
  createVitalSigns, 
  createFollowUpVisit, 
  deleteVaccinationRecord, 
  deletePatientRecord, 
  deleteVitalSigns, 
  deleteVaccinationHistory,
  updateFollowUpVisit,
  // updateVaccinationRecord, 
  createAntigenStockTransaction
} from '../restful-api/post';
import { VaccineSchemaType, VitalSignsType } from '@/form-schema/vaccineSchema';
import { api2 } from '@/api/api';
import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router';
import {createPatientRecord }  from "@/pages/healthServices/restful-api-patient/createPatientRecord" 


// Mutation for deducting vaccine stock
export const useDeductVaccineStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vacStck_id, staff_id }: { vacStck_id: number; staff_id: string }) => {
    
      if (!vacStck_id) {
        throw new Error("Vaccine stock ID is required");
      }
      const existingItem = await getVaccineStock(vacStck_id.toString());
      if (!existingItem) {
        throw new Error("Vaccine item not found. Please check the ID.");
      }

      const currentQtyAvail = existingItem.vacStck_qty_avail;
      const existingUsedItem = existingItem.vacStck_used;

      if (currentQtyAvail < 1) {
        throw new Error("Insufficient vaccine stock available.");
      }

      const updatePayload = {
        vacStck_qty_avail: currentQtyAvail - 1,
        vacStck_used: existingUsedItem + 1,
      };

      await api2.put(`inventory/vaccine_stocks/${vacStck_id}/`, updatePayload);
      const transaction = await createAntigenStockTransaction(vacStck_id,staff_id);
      console.log("Vaccine stock updated successfully:", updatePayload);
      console.log("Antigen stock transaction created:", transaction);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccineStocks'] });
    },
    onError: (error: Error) => {
      console.error("Vaccine stock update failed:", error);
      toast(error.message);
    },
  });
};

// Mutation for Step 1 submission
export const useSubmitStep1 = () => {
  const queryClient = useQueryClient();
  const deductVaccineStock = useDeductVaccineStock();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({
      staff_id,
      data,
      assignmentOption,
      form,
    }: {
      staff_id:string
      data: VaccineSchemaType;
      assignmentOption: 'self' | 'other';
      form: { setError: any; getValues: any; reset: any };
    }) => {
      if (!data.pat_id) {
        throw new Error("Patient ID is required.");
      }

      if (!data.vaccinetype) {
        form.setError("vaccinetype", {
          type: "manual",
          message: "Please select a vaccine type",
        });
        throw new Error("Please select a vaccine type");
      }

      if (assignmentOption === "other") {
        let patrec_id: string | null = null;
        let vacrec_id: string | null = null;

        try {
          const patientRecord = await createPatientRecord(data.pat_id,"Vaccination Record",staff_id);
          patrec_id = patientRecord.patrec_id;

          if (!patrec_id) {
            throw new Error("Patient record ID is null. Cannot create vaccination record.");
          }

          const vaccinationRecord = await createVaccinationRecord(patrec_id,  staff_id,1);
          vacrec_id = vaccinationRecord.vacrec_id;

          if (vacrec_id) {
            await createVaccinationHistory(
              vacrec_id,
              { ...data},
              data.vaccinetype,
              0,
              "forwarded",
              data.age ?? "",
              staff_id
            );

          } else {
            throw new Error("Vaccination record ID is null. Cannot create vaccination history.");
          } 

          await deductVaccineStock.mutateAsync({ vacStck_id: Number(data.vaccinetype), staff_id });

          return { success: true, message: "Form assigned to others for Step 2 completion!" };
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
     toast.success("Form assigned to others for Step 2 completion!");
        queryClient.invalidateQueries({ queryKey: ['patientRecords', 'vaccinationRecords'] });
      
    },
    onError: (error: Error) => {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the fields.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

// Mutation for Step 2 submission
export const useSubmitStep2 = () => {
  const queryClient = useQueryClient();
  const deductVaccineStock = useDeductVaccineStock();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      staff_id,
      data,
      patientId,
      vaccinationData,
      form,
      form2,
      setAssignmentOption,
      calculateNextVisitDate,
    }: {
      staff_id: string;
      data: VitalSignsType;
      patientId: string;
      vaccinationData: {
        patrec_id: string;
        vacrec: string;
        vachist_id: string;
        vacStck: number;
        vaccine_details: { vac_type: string };
        follow_up_visit: { followv_id: string };
      };
      form: { setError: any; getValues: any; reset: any };
      form2: { reset: any };
      setAssignmentOption: Dispatch<SetStateAction<"self" | "other">>;
      calculateNextVisitDate: (interval: number, timeUnit: string, date: string) => Date;
    }) => {
      const vaccineType = form.getValues("vaccinetype");

      console.log("Vaccine Type:", vaccineType);
      console.log("Vacination Data:", vaccinationData);
      if (!vaccineType) {
        form.setError("vaccinetype", {
          type: "manual",
          message: "Please select a vaccine type",
        });
        throw new Error("Please select a vaccine type");
      }


      
      let patrec_id = vaccinationData.patrec_id;
      let vital_id: string | null = null;
      let vachist_id: string | null = null;
      let newfollowv_id: string | null = null;
      let newpatrec_id: string | null = null;
      let newVaccrec_id: string | null = null;
      let oldVaccrec_id = vaccinationData.vacrec;
      let oldpatrec_id = vaccinationData.patrec_id;
      let oldFollowv_id = vaccinationData.follow_up_visit.followv_id;

      try {
        const vac_type = vaccinationData.vaccine_details.vac_type;
        const vacStck = vaccineType;
        const vaccineData = await getVaccineStock(vacStck);
        const maxDoses = vaccineData.vaccinelist.no_of_doses;
        const previousDoses = await getVaccinationHistory(vaccinationData.vachist_id);
        const doseCount = previousDoses.vachist_doseNo;
        const doseNumber = doseCount + 1;

        const vitalSigns = await createVitalSigns(data);
        vital_id = vitalSigns.vital_id;

        await api2.put(`inventory/vaccine_stocks/${parseInt(vacStck, 10)}/`, {
          vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
          // vacStck_used: vaccineData.vacStck_used + 1,
        });
        await createAntigenStockTransaction(parseInt(vacStck, 10),staff_id);

        


        if (vac_type === "routine") {
          await updateFollowUpVisit(oldFollowv_id, "completed");
          const patientRec = await createPatientRecord(patientId,"Vaccination Record",staff_id);
          newpatrec_id = patientRec.patrec_id;

          if (!newpatrec_id) {
            throw new Error("Patient record ID is null. Cannot create vaccination record.");
          }

          const newVaccinationRecord = await createVaccinationRecord(newpatrec_id,staff_id, 1);
          newVaccrec_id = newVaccinationRecord.vacrec_id;

          const { interval, time_unit } = vaccineData.vaccinelist.routine_frequency || {};
          if (!interval || !time_unit) {
            throw new Error("Routine frequency data is missing.");
          }

          const nextVisitDate = calculateNextVisitDate(interval, time_unit, new Date().toISOString());
          const followUpVisit = await createFollowUpVisit(newpatrec_id, nextVisitDate.toISOString().split("T")[0],"Routine Vaccination Follow-up");
          newfollowv_id = followUpVisit.followv_id;

          const vaccinationHistory = await createVaccinationHistory(
            newVaccrec_id ?? "",
            { ...data},
            vacStck,
            1,
            "scheduled",
            form.getValues("age") ?? "",
            staff_id, 
            vital_id,
            newfollowv_id
          );
          vachist_id = vaccinationHistory.vachist_id;

          
        } else {
          if (maxDoses > doseNumber) {
            await updateFollowUpVisit(oldFollowv_id, "completed");

            // await updateVaccinationRecord(oldVaccrec_id, null, new Date().toISOString());

            const doseInterval = vaccineData.vaccinelist.intervals.find(
              (interval: { dose_number: number; interval: number; time_unit: string }) =>
                interval.dose_number === doseNumber
            );
            if (doseInterval) {
              const nextVisitDate = calculateNextVisitDate(
                doseInterval.interval,
                doseInterval.time_unit,
                new Date().toISOString()
              );

              const followUpVisit = await createFollowUpVisit(
                oldpatrec_id,
                nextVisitDate.toISOString().split("T")[0],
                `Follow-up visit for dose ${doseNumber} scheduled on ${nextVisitDate.toISOString().split("T")[0]}`
              );
              newfollowv_id = followUpVisit.followv_id;
            }

            const vaccinationHistory = await createVaccinationHistory(
              oldVaccrec_id,
              { ...data},
              vacStck,
              doseNumber,
              "partially vaccinated",
              form.getValues("age") ?? "",
              staff_id,
              vital_id,
              newfollowv_id
            );
            vachist_id = vaccinationHistory.vachist_id;
          } else {
            await updateFollowUpVisit(oldFollowv_id, "completed");
            // await updateVaccinationRecord(oldVaccrec_id, "completed", new Date().toISOString());

            const vaccinationHistory = await createVaccinationHistory(
              oldVaccrec_id,
              { ...data },
              vacStck,
              doseNumber,
              "scheduled",
              form.getValues("age") ?? "",
              staff_id,
              vital_id,
              null,
              // staff_id
            );
            vachist_id = vaccinationHistory.vachist_id;
          }
        }

        await deductVaccineStock.mutateAsync({ vacStck_id: parseInt(vacStck, 10), staff_id });

        return { success: true, message: "Vaccination record updated successfully!" };
      } catch (error) {
        // Rollback
        if (vital_id) await deleteVitalSigns(vital_id);
        if (vachist_id) await deleteVaccinationHistory(vachist_id);
        if (newVaccrec_id) await deleteVaccinationRecord(newVaccrec_id);
        if (newpatrec_id) await deletePatientRecord(newpatrec_id);
        throw error;
      }
    },
    onSuccess: () => {
      navigate(-1);

      toast.success("Vaccination record updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ['patientRecords', 'vaccinationRecords', 'vaccineStocks', 'vitalSigns', 'followUpVisits'],
      });
    },
    onError: (error: Error) => {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please check the form for errors.", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};