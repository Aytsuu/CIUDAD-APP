  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { toast } from "sonner";
  import { api2 } from "@/api/api";
  import {
    createChildHealthNotes,
    createFollowUpVisit,
  } from "../../forms/restful-api/createAPI";
  import { updateCHHistory } from "../../forms/restful-api/updateAPI";
  import { createPatientRecord } from "../../../restful-api-patient/createPatientRecord";
  import { getVaccineStock } from "../../../vaccination/restful-api/get";
  import { createAntigenStockTransaction } from "../../../vaccination/restful-api/post";
  import { updateFollowUpVisit } from "../../../vaccination/restful-api/update";
  import {
    deleteVaccinationHistory,
    deleteVaccinationRecord,
    deletePatientRecord,
    deleteFollowUpVisit,
  } from "@/pages/healthServices/vaccination/restful-api/delete";
  import {
    createVaccinationRecord,
    createVaccinationHistory,
  } from "../../../vaccination/restful-api/post";
  import { createimmunizationRecord } from "../restful-api/postAPI";
  import { updateVaccineStock } from "@/pages/healthInventory/inventoryStocks/REQUEST/Antigen/restful-api/VaccinePutAPI";
  import { showSuccessToast } from "@/components/ui/toast";
  import { showErrorToast } from "@/components/ui/toast";
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
      const createdRecords: any = {
        patrec_ids: [],
        vacrec_ids: [],
        vachist_ids: [],
        imt_ids: [],
      };

      const chist_id = ChildHealthRecord.chhist_id;
      const patrec_id = ChildHealthRecord.chrec_details.patrec_details.patrec_id;

      // Handle follow-up visit creation if needed
      if (data.followUpVisit?.trim() || data.follov_description?.trim()) {
        const newFollowUp = await createFollowUpVisit({
          followv_date: data.followUpVisit || null,
          followv_description: data.follov_description || "Vaccination Follow-up",
          patrec: patrec_id,
          followv_status: "pending",
        });
        createdRecords.followv_id = newFollowUp.followv_id;
      }

      // Handle notes creation if needed
      if (data.notes?.trim()) {
        await createChildHealthNotes({
          chn_notes: data.notes,
          followv: createdRecords.followv_id,
          chhist: chist_id,
          staff: staff_id,
        });
      }

      // Process new vaccines
      for (const vaccine of vaccines) {
        if (vaccine.existingFollowvId) {
          await updateFollowUpVisit({
            followv_id: vaccine.existingFollowvId,
            followv_status: "completed",
            completed_at: new Date().toISOString().split("T")[0],
          });
        }

        const vaccineData = await getVaccineStock(vaccine.vacStck_id);
        const vaccineType = vaccineData.vaccinelist.vac_type_choices;
        const currentDose = parseInt(vaccine.dose, 10);
        const totalDoses = parseInt(vaccine.totalDoses || "1", 10);

        let vacrec_id = vaccine.vacrec;
        let patientRecord = null;

        // Update vaccine stock if needed
        if (vaccine.vacStck_id) {
          await updateVaccineStock({
            vacStck_id: vaccine.vacStck_id,
            vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
          });

          await createAntigenStockTransaction(
            parseInt(vaccine.vacStck_id, 10),
            staff_id ?? ""
          );
        }

        // Create new records if needed
        if ((vaccineType !== "routine" && currentDose === 1) || !vaccine.vacrec) {
          patientRecord = await createPatientRecord(
          { pat_id:pat_id,
            patrec_type:`Vaccination Record`,
          staff: staff_id}
          );
          createdRecords.patrec_ids.push(patientRecord.patrec_id);

          const vacrec = await createVaccinationRecord({
            patrec_id: patientRecord.patrec_id,
            vacrec_totaldose: totalDoses,
          });
          createdRecords.vacrec_ids.push(vacrec.vacrec_id);
          vacrec_id = vacrec.vacrec_id;
        }

        // Handle follow-up for vaccine
        let vaccinefollowv_id = null;
        const isRoutine = vaccineType === "routine";
        const isLastDose = currentDose >= totalDoses;

        if (vaccine.nextFollowUpDate && (isRoutine || !isLastDose)) {
          const vaccinefollowv = await createFollowUpVisit({
            followv_date: vaccine.nextFollowUpDate || null,
            followv_description: `${vaccine.vac_name} Follow-up`,
            patrec: patrec_id,
            followv_status: "pending",
          });
          vaccinefollowv_id = vaccinefollowv.followv_id;
          createdRecords.followv_id = vaccinefollowv_id;
        }

        // Create vaccination history
        const vachist = await createVaccinationHistory({
          vacrec: vacrec_id,
          vacStck_id: vaccine.vacStck_id,
          vachist_doseNo: currentDose,
          vachist_age: data.age,
          vachist_status: "completed",
          vital: ChildHealthRecord.child_health_vital_signs[0]?.vital,
          staff: staff_id,
          followv: vaccinefollowv_id || null,
          date_administered:
            vaccine.date || new Date().toISOString().split("T")[0],
        });
        createdRecords.vachist_ids.push(vachist.vachist_id);

        // Create immunization record
        const childimmzres = await createimmunizationRecord({
          vachist: vachist.vachist_id,
          chhist: chist_id,
          hasExistingVaccination: false,
          created_at: new Date().toISOString(),
        });

        if (childimmzres.imt_id) {
          createdRecords.imt_ids.push(childimmzres.imt_id);
        }
      }

      // Process existing vaccines
      for (const existingVac of existingVaccines) {
        let vacrec_id = existingVac.vacrec;
        let patientRecord = null;

        if (
          (existingVac.vaccineType !== "routine" &&
            parseInt(existingVac.dose, 10) === 1) ||
          !existingVac.vacrec
        ) {
          patientRecord = await createPatientRecord(
          {  pat_id:pat_id,
            patrec_type:`Vaccination Record`,
          staff: staff_id}
          );
          createdRecords.patrec_ids.push(patientRecord.patrec_id);

          const vacrec = await createVaccinationRecord({
            patrec_id: patientRecord.patrec_id,
            vacrec_totaldose: parseInt(existingVac.totalDoses || "1", 10),
          });
          createdRecords.vacrec_ids.push(vacrec.vacrec_id);
          vacrec_id = vacrec.vacrec_id;
        }

        const vachist = await createVaccinationHistory({
          vacrec: vacrec_id,
          vac: existingVac.vac_id,
          vachist_doseNo: parseInt(existingVac.dose, 10),
          vachist_age: data.age,
          vachist_status: "completed",
          vital: ChildHealthRecord.child_health_vital_signs[0]?.vital,
          staff_id: staff_id,
          followv: null,
          date_administered:
            existingVac.date || new Date().toISOString().split("T")[0],
        });
        createdRecords.vachist_ids.push(vachist.vachist_id);

        const exisitngchildimmzres = await api2.post(
          "/child-health/immunization-history/",
          {
            vachist: vachist.vachist_id,
            chhist: chist_id,
            hasExistingVaccination: true,
            created_at: new Date().toISOString(),
          }
        );

        if (exisitngchildimmzres.data.imt_id) {
          createdRecords.imt_ids.push(exisitngchildimmzres.data.imt_id);
        }
      }
      await updateCHHistory({
        chhist_id: Number(chist_id),
        status: "recorded",
      });

      return createdRecords;
    };

    const rollbackChanges = async (createdRecords: any) => {
      try {
        // Rollback in reverse order of creation
        for (const imt_id of createdRecords.imt_ids) {
          try {
            await api2.delete(`/child-health/immunization-history/${imt_id}/`);
          } catch (err) {
            console.error(
              `Failed to delete immunization history ${imt_id}:`,
              err
            );
          }
        }

        for (const vachist_id of createdRecords.vachist_ids) {
          try {
            await deleteVaccinationHistory(vachist_id);
          } catch (err) {
            console.error(
              `Failed to delete vaccination history ${vachist_id}:`,
              err
            );
          }
        }

        for (const vacrec_id of createdRecords.vacrec_ids) {
          try {
            await deleteVaccinationRecord(vacrec_id);
          } catch (err) {
            console.error(
              `Failed to delete vaccination record ${vacrec_id}:`,
              err
            );
          }
        }

        for (const patrec_id of createdRecords.patrec_ids) {
          try {
            await deletePatientRecord(patrec_id);
          } catch (err) {
            console.error(`Failed to delete patient record ${patrec_id}:`, err);
          }
        }

        if (createdRecords.followv_id) {
          try {
            await deleteFollowUpVisit(createdRecords.followv_id);
          } catch (err) {
            console.error(
              `Failed to delete follow-up visit ${createdRecords.followv_id}:`,
              err
            );
          }
        }
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
        throw rollbackError;
      }
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
        
        queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
        queryClient.invalidateQueries({ queryKey: ["childHealthRecords", chrec_id]});

        navigate(-1);
        showSuccessToast("Immunization data saved successfully!");
      },
      onError: (error, variables, context) => {
        console.error("Error saving immunization data:", error);
        showErrorToast("Failed to save immunization data. Rolling back changes...");

        if (context) {
          rollbackChanges(context as any)
            .then(() => {
              console.log("Changes rolled back successfully.");
            })
            .catch((rollbackError) => {
              console.error("Rollback failed:", rollbackError);
            });
        }
      },
    });
  };