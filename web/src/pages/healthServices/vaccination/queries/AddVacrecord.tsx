// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { CircleAlert, CircleCheck } from "lucide-react";
// import { useNavigate } from "react-router";
// import { createAntigenStockTransaction, createVaccinationRecord, createVaccinationHistory, createVitalSigns, createFollowUpVisit } from "../restful-api/post";
// import { getVaccineStock } from "../restful-api/get";
// import { deleteVaccinationRecord, deletePatientRecord, deleteVitalSigns, deleteFollowUpVisit, deleteVaccinationHistory } from "../restful-api/delete";
// import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";
// import { updateVaccineStock } from "@/pages/healthInventory/inventoryStocks/REQUEST/Antigen/restful-api/VaccinePutAPI";
// import { updateInventoryTimestamp } from "@/pages/healthInventory/inventoryStocks/REQUEST/InventoryAPIQueries";

// export const useSubmitStep2 = () => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();

//   return useMutation({
//     mutationFn: async ({
//       assignmentOption,
//       data,
//       signature,
//       pat_id,
//       form,
//       form2,
//       vacStck_id,
//       vac_id,
//       vac_name,
//       expiry_date,
//       followUpData,
//       staff_id,
//       vaccinationHistory
//     }: {
//       assignmentOption: "self" | "other";
//       data: Record<string, any>;
//       signature: string | null;
//       pat_id: string;
//       form: { setError: any; getValues: any; reset: any };
//       form2: { getValues: any; reset: any };
//       vacStck_id: string;
//       vac_id: string;
//       vac_name: string;
//       expiry_date: string;
//       staff_id: string | null;
//       followUpData?: {
//         followv_date: string;
//         followv_status: string;
//         followv_description?: string;
//       };
//       vaccinationHistory?: any;
//     }) => {
//       let patrec_id: string | null = null;
//       let vacrec_id: string | null = null;
//       let vital_id: string | null = null;
//       let followv_id: string | null = null;
//       const vachist_id: string | null = null;

//       try {
//         const vaccineData = await getVaccineStock(vacStck_id);
//         const vac_type = vaccineData.vaccinelist.vac_type_choices;
//         const doseNo = form.getValues("vachist_doseNo");
//         const form_vacrec_totaldose = parseInt(form.getValues("vacrec_totaldose"), 10);
//         const age = form.getValues("age");
//         const old_vacrec_id = vaccinationHistory?.[0]?.vacrec || null;

//         await updateVaccineStock({
//           vacStck_id: parseInt(vacStck_id, 10),
//           vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1
//         });

//         await createAntigenStockTransaction(parseInt(vacStck_id, 10), staff_id ?? "");
//         await updateInventoryTimestamp(vaccineData.inv_id ?? "");
//         const status = assignmentOption === "other" ? "forwarded" : "in queue";

//         // Handle different vaccine types
//         if (vac_type === "routine") {
//           const patientRecord = await createPatientRecord({
//             pat_id,
//             patrec_type: "Vaccination Record",
//             staff: staff_id
//           });
//           patrec_id = patientRecord.patrec_id;

//           if (!patrec_id) {
//             throw new Error("Patient record ID is null. Cannot create vaccination record.");
//           }

//           vital_id = await createVitalSignsRecord(assignmentOption, form2, staff_id, patrec_id);

//           const vaccinationRecord = await createVaccinationRecord({
//             patrec_id,
//             vacrec_totaldose: form_vacrec_totaldose
//           });
//           vacrec_id = vaccinationRecord.vacrec_id;

//           followv_id = await createFollowUpVisitRecord(patrec_id, followUpData, form, vac_name);

//           await createVaccinationHistory(createVaccinationHistoryPayload(vacrec_id, data, vacStck_id, doseNo, status, age, staff_id, vital_id, followv_id, signature));
//         } else if (vac_type === "primary") {
//           if (doseNo === 1) {
//             const patientRecord = await createPatientRecord({ pat_id, patrec_type: "Vaccination Record", staff: staff_id  });
//             patrec_id = patientRecord.patrec_id;

//             if (!patrec_id) {
//               throw new Error("Patient record ID is null. Cannot create vaccination record.");
//             }

//             vital_id = await createVitalSignsRecord(assignmentOption, form2, staff_id, patrec_id);

//             const vaccinationRecord = await createVaccinationRecord({
//               patrec_id,
//               vacrec_totaldose: form_vacrec_totaldose
//             });
//             vacrec_id = vaccinationRecord.vacrec_id;

//             followv_id = await createFollowUpVisitRecord(patrec_id, followUpData, form, vac_name);

//             await createVaccinationHistory(createVaccinationHistoryPayload(vacrec_id, data, vacStck_id, doseNo, status, age, staff_id, vital_id, followv_id, signature));
//           } else if (doseNo < form_vacrec_totaldose) {
//             vital_id = await createVitalSignsRecord(assignmentOption, form2, staff_id, vaccinationHistory?.vacrec_details?.patrec_id ?? "");

//             followv_id = await createFollowUpVisitRecord(vaccinationHistory?.vacrec_details?.patrec_id ?? "", followUpData, form, vac_name);

//             await createVaccinationHistory(createVaccinationHistoryPayload(old_vacrec_id, data, vacStck_id, doseNo, status, age, staff_id, vital_id, followv_id, signature));
//           } else {
//             vital_id = await createVitalSignsRecord(assignmentOption, form2, staff_id, vaccinationHistory?.vacrec_details?.patrec_id ?? "");

//             await createVaccinationHistory(createVaccinationHistoryPayload(old_vacrec_id, data, vacStck_id, doseNo, status, age, staff_id, vital_id, null, signature));
//           }
//         } else if (vac_type === "conditional") {
//           if (doseNo === 1) {
//             const patientRecord = await createPatientRecord({
//               pat_id,
//               patrec_type: "Vaccination Record",
//               staff: staff_id
//             });
//             patrec_id = patientRecord.patrec_id;

//             if (!patrec_id) {
//               throw new Error("Patient record ID is null. Cannot create vaccination record.");
//             }

//             vital_id = await createVitalSignsRecord(assignmentOption, form2, staff_id, patrec_id);

//             const vaccinationRecord = await createVaccinationRecord({
//               patrec_id,
//               vacrec_totaldose: form_vacrec_totaldose
//             });
//             vacrec_id = vaccinationRecord.vacrec_id;

//             await createVaccinationHistory(createVaccinationHistoryPayload(vacrec_id, data, vacStck_id, doseNo, status, age, staff_id, vital_id, followv_id, signature));
//           } else {
//             vital_id = await createVitalSignsRecord(assignmentOption, form2, staff_id, vaccinationHistory?.vacrec_details?.patrec_id ?? "");

//             if (followUpData) {
//               followv_id = await createFollowUpVisitRecord(vaccinationHistory?.vacrec_details?.patrec_id ?? "", followUpData, form, vac_name);
//             }

//             await createVaccinationHistory(createVaccinationHistoryPayload(old_vacrec_id, data, vacStck_id, doseNo, status, age, staff_id, vital_id, followv_id, signature));
//           }
//         }

//         queryClient.invalidateQueries({ queryKey: ["patientVaccinationRecords", data.pat_id] });
//         queryClient.invalidateQueries({ queryKey: ["vaccinationRecords", data.pat_id] });
//         queryClient.invalidateQueries({ queryKey: ["followupVaccines", data.pat_id] });
//         queryClient.invalidateQueries({ queryKey: ["vaccineStocks"] });
//         queryClient.invalidateQueries({ queryKey: ["unvaccinatedVaccines", data.pat_id] });

//         return;
//       } catch (error) {
//         // Rollback
//         const rollbackActions = [
//           vital_id ? deleteVitalSigns(vital_id) : Promise.resolve(),
//           vachist_id ? deleteVaccinationHistory(vachist_id) : Promise.resolve(),
//           vacrec_id ? deleteVaccinationRecord(vacrec_id) : Promise.resolve(),
//           patrec_id ? deletePatientRecord(patrec_id) : Promise.resolve(),
//           followv_id ? deleteFollowUpVisit(followv_id) : Promise.resolve()
//         ];
//         await Promise.all(rollbackActions);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       navigate(-1);
//       toast.success("Successfully Recorded", {
//         icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
//         duration: 2000
//       });
//     },
//     onError: (error: Error) => {
//       toast.error(`${error.message}`, {
//         icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
//         duration: 3000
//       });
//     }
//   });
// };

// // Helper function to create common vaccination history payload
// const createVaccinationHistoryPayload = (vacrec_id: string | null, data: any, vacStck_id: string, doseNo: number, status: string, age: number, staff_id: string | null, vital_id: string | null, followv_id: string | null, signature: string | null) => ({
//   vacrec: vacrec_id ?? "",
//   assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
//   vacStck_id,
//   vachist_doseNo: doseNo,
//   vachist_status: status,
//   vachist_age: age,
//   staff: staff_id,
//   vital: vital_id,
//   followv: followv_id,
//   signature,
//   date_administered: new Date().toISOString().split("T")[0]
// });

// // Helper function to create vital signs
// const createVitalSignsRecord = async (assignmentOption: string, form2: any, staff_id: string | null, patrec_id: string) => {
//   if (assignmentOption === "other") return null;

//   const vitalSigns = await createVitalSigns({
//     vital_bp_systolic: form2.getValues("bpsystolic"),
//     vital_bp_diastolic: form2.getValues("bpdiastolic"),
//     vital_temp: form2.getValues("temp"),
//     vital_o2: form2.getValues("o2"),
//     vital_pulse: form2.getValues("pr"),
//     staff: staff_id,
//     patrec: patrec_id
//   });
//   return vitalSigns.vital_id;
// };

// // Helper function to create follow-up visit
// const createFollowUpVisitRecord = async (patrec_id: string, followUpData: any, form: any, vac_name: string) => {
//   const followUpVisit = await createFollowUpVisit(patrec_id, followUpData?.followv_date || form.getValues("followv_date"), followUpData?.followv_description || `Follow-up visit for ${vac_name} in queue on ${form.getValues("followv_date")}`, "pending");
//   return followUpVisit.followv_id;
// };


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
export const useSubmitStep2 = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      assignmentOption,
      data,
      signature,
      pat_id,
      form,
      form2,
      vacStck_id,
      vac_id,
      vac_name,
      expiry_date,
      followUpData,
      staff_id,
      vaccinationHistory
    }: {
      assignmentOption: "self" | "other";
      data: Record<string, any>;
      signature: string | null;
      pat_id: string;
      form: { setError: any; getValues: any; reset: any };
      form2: { getValues: any; reset: any };
      vacStck_id: string;
      vac_id: string;
      vac_name: string;
      expiry_date: string;
      staff_id: string | null;
      followUpData?: {
        followv_date: string;
        followv_status: string;
        followv_description?: string;
      };
      vaccinationHistory?: any;
    }) => {
      // Prepare the data for the backend API
      const submissionData = {
        assignment_option: assignmentOption,
        form_data: {
          vachist_doseNo: form.getValues("vachist_doseNo"),
          vacrec_totaldose: parseInt(form.getValues("vacrec_totaldose"), 10),
          age: form.getValues("age"),
          assignto: data.assignto,
          followv_date: form.getValues("followv_date")
        },
        form2_data: assignmentOption === "self" ? {
          bpsystolic: form2.getValues("bpsystolic"),
          bpdiastolic: form2.getValues("bpdiastolic"),
          temp: form2.getValues("temp"),
          o2: form2.getValues("o2"),
          pr: form2.getValues("pr")
        } : {},
        signature: signature,
        pat_id: pat_id,
        vacStck_id: vacStck_id,
        vac_id: vac_id,
        vac_name: vac_name,
        expiry_date: expiry_date,
        follow_up_data: followUpData ? {
          followv_date: followUpData.followv_date,
          followv_status: followUpData.followv_status,
          followv_description: followUpData.followv_description
        } : undefined,
        vaccination_history: vaccinationHistory,
        staff_id: staff_id
      };

<<<<<<< HEAD
=======
      console.log("Submission Data:", submissionData); // Debugging log
>>>>>>> frontend/feature/maternal-services
      // Make a single API call to the backend
      const response = await api2.post("/vaccination/submit-vaccination-records/", submissionData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["patientVaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["followupVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["vaccineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["unvaccinatedVaccines"] });
      navigate(-1);
    showSuccessToast("Successfully Recorded");
    },
    onError: (error: Error) => {
      showErrorToast(`${error.message}`);
    }
  });
};