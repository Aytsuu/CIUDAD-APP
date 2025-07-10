// src/services/childHealthAPI.ts
import {
  createFollowUpVisit,
  createBodyMeasurement,
  createPatientDisability,
} from "./patient-info";
import {
  createExclusiveBFCheck,
  createSupplementStatus,
  createChildHealthRecord,
  createChildHealthHistory,
} from "./chrecord";
import {
  createChildHealthNotes,
  createChildVitalSign,
  createNutritionalStatus,
} from "./vitalsignsAPI";
import  {processMedicineRequest} from "./medicineAPI";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";
import { api2 } from "@/api/api";
export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
}

export interface AddRecordResult {
  patrec_id: string;
  chrec_id: string;
  chhist_id: string;
  chvital_id?: string;
  followv_id?: string | null;
}

export async function addChildHealthRecord({
  submittedData,
  staff,
}: AddRecordArgs): Promise<AddRecordResult> {
  // Validate required fields
  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }
  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

  // Create patient record
  const newPatrec = await createPatientRecord(
    submittedData.pat_id,
    "Child Health Record"
    
  );
  const patrec_id = newPatrec.patrec_id;
  // Create child health record
  const newChrec = await createChildHealthRecord({
    // chr_date: submittedData.childDob,
    ufc_no: submittedData.ufcNo || "",
    family_no: submittedData.familyNo || "",
    place_of_delivery_type: submittedData.placeOfDeliveryType,
    pod_location: submittedData.placeOfDeliveryLocation || "",
    mother_occupation: submittedData.motherOccupation || "",
    type_of_feeding: submittedData.type_of_feeding,
    father_occupation: submittedData.fatherOccupation || "",
    birth_order: submittedData.birth_order,
    newborn_screening: submittedData.dateNewbornScreening || "",
    staff: staff || null,
    patrec: patrec_id,
  });
  const chrec_id = newChrec.chrec_id;

  // Create child health history
  const newChhist = await createChildHealthHistory({
    created_at: new Date().toISOString(),
    chrec: chrec_id,
    status: submittedData.status || "recorded",
    tt_status: submittedData.tt_status,
  });
  const current_chhist_id = newChhist.chhist_id;

  // Handle follow-up visit if needed
  let followv_id = null;
  if (submittedData.vitalSigns?.[0]?.followUpVisit) {
    const newFollowUp = await createFollowUpVisit({
      followv_date: submittedData.vitalSigns[0].followUpVisit,
      created_at: new Date().toISOString(),
      followv_description:
        submittedData.vitalSigns[0].follov_description ||
        "Follow Up for Child Health",
      patrec: patrec_id,
      followv_status: "pending",
      updated_at: new Date().toISOString(),
    });
    followv_id = newFollowUp.followv_id;
  }

  // Create health notes
  const newNotes = await createChildHealthNotes({
    chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    followv: followv_id,
    chhist: current_chhist_id,
    staff: staff || null,
  });
  const chnotes_id = newNotes.chnotes_id;

  // Create body measurements
  const newBMI = await createBodyMeasurement({
    age: submittedData.childAge,
    height: submittedData.vitalSigns?.[0]?.ht || null,
    weight: submittedData.vitalSigns?.[0]?.wt || null,
    created_at: new Date().toISOString(),
    patrec: patrec_id,
    staff: staff || null,
  });
  const bmi_id = newBMI.bm_id;

  // Create vital signs
  const newVitalSign = await createChildVitalSign({
    temp: submittedData.vitalSigns?.[0]?.temp || null,
    bm: bmi_id,
    chhist: current_chhist_id,
    created_at: new Date().toISOString(),
  });
  const chvital_id = newVitalSign.chvital_id;

  // Create nutritional status
  await createNutritionalStatus({
    wfa: submittedData.nutritionalStatus?.wfa || "",
    lhfa: submittedData.nutritionalStatus?.lhfa || "",
    wfl: submittedData.nutritionalStatus?.wfh || "",
    muac: submittedData.nutritionalStatus?.muac?.toString() || "",
    muac_status: submittedData.nutritionalStatus?.muac_status || "",
    created_at: new Date().toISOString(),
    chvital: chvital_id,
    edemaSeverity: submittedData.edemaSeverity || "none",
  });

  // Handle breastfeeding dates
  if (submittedData.BFdates && submittedData.BFdates.length > 0) {
    for (const date of submittedData.BFdates) {
      await createExclusiveBFCheck({
        chhist: current_chhist_id,
        ebf_date: date,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Handle disabilities
  if (submittedData.disabilityTypes && submittedData.disabilityTypes.length > 0) {
    await createPatientDisability({
      patrec: patrec_id,
      disabilities: submittedData.disabilityTypes?.map(String) || [],
    });
  }

  // Handle low birth weight
  const isLowBirthWeight =
    submittedData.vitalSigns?.[0]?.wt &&
    Number.parseFloat(String(submittedData.vitalSigns[0].wt)) < 2.5;
  if (isLowBirthWeight && (submittedData.birthwt?.seen || submittedData.birthwt?.given_iron)) {
    await createSupplementStatus({
      status_type: "birthwt",
      date_seen: submittedData.birthwt?.seen || null,
      date_given_iron: submittedData.birthwt?.given_iron || null,
      chhist: current_chhist_id,
      created_at: new Date().toISOString(),
      birthwt: Number(submittedData.vitalSigns?.[0]?.wt) ,
      date_completed : null

     
    });
  }



  // Handle anemia
  if (submittedData.is_anemic) {
    await createSupplementStatus({
      status_type: "anemic",
      date_seen: submittedData.anemic?.seen || null,
      date_given_iron: submittedData.anemic?.given_iron || null,
      chhist: current_chhist_id,
      created_at: new Date().toISOString(),
      birthwt: Number(submittedData.vitalSigns?.[0]?.wt) ,
      date_completed : null,
      updated_at: new Date().toISOString(),
    });
  }

    // // Handle medicines
    // if (submittedData.medicines && submittedData.medicines.length > 0) {
    //   await processMedicineRequest({
    //     pat_id: submittedData.pat_id,
    //     medicines: submittedData.medicines.map(med => ({
    //       minv_id: med.minv_id,
    //       medrec_qty: med.medrec_qty,
    //       reason: med.reason || ""
    //     }))
    //   },staff || null);
    // }
  
 // Handle medicines
      // Handle medicines
      if (submittedData.medicines && submittedData.medicines.length > 0) {
       await processMedicineRequest(
         {
           pat_id: submittedData.pat_id,
           medicines: submittedData.medicines.map((med) => ({
             minv_id: med.minv_id,
             medrec_qty: med.medrec_qty,
             reason: med.reason || "",
           })),
         },
         staff || null,
         current_chhist_id // assuming you have this in submittedData
       );
     }

  return {
    patrec_id,
    chrec_id,
    chhist_id: current_chhist_id,
    chvital_id,
    followv_id,
  };
}

// export const formatBirthOrder = (order: number): string => {
//   if (order === 1) return "1st";
//   if (order === 2) return "2nd";
//   if (order === 3) return "3rd";
//   return `${order}th`;
// };


// src/hooks/useChildHealthRecordMutation.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useChildHealthRecordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: addChildHealthRecord,
    onSuccess: () => {
      toast.success("Child health record created successfully!");
         
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Failed to create child health record:", error);
      toast.error(
        `Operation Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};