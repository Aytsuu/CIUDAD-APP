import type { z } from "zod"
import type { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"

export const transformPostpartumFormData = (
  formData: z.infer<typeof PostPartumSchema>,
  selectedPatientId: string,
  postpartumCareData: any[],
) => {
  // Transform the form data to match the API structure
  const transformedData = {
    pat_id: selectedPatientId, 
    patrec_type: "Postpartum Care",

    // Basic postpartum record data
    ppr_lochial_discharges: getLochialDischargeName(formData.postpartumInfo?.lochialDischarges) || "Lochia Rubra",
    ppr_vit_a_date_given: formData.postpartumInfo?.vitASupplement || "",
    ppr_num_of_pads: formData.postpartumInfo?.noOfPadPerDay || 0,
    ppr_mebendazole_date_given: formData.postpartumInfo?.mebendazole || "",
    ppr_date_of_bf: formData.postpartumInfo?.dateBfInitiated || "",
    ppr_time_of_bf: formData.postpartumInfo?.timeBfInitiated || "",

    // Delivery record
    delivery_record: {
      ppdr_date_of_delivery: formData.postpartumInfo?.dateOfDelivery || "",
      ppdr_time_of_delivery: formData.postpartumInfo?.timeOfDelivery || "",
      ppdr_place_of_delivery: formData.postpartumInfo?.placeOfDelivery || "",
      ppdr_attended_by: formData.postpartumInfo?.attendedBy || "",
      ppdr_outcome: getOutcomeName(formData.postpartumInfo?.outcome) || "",
    },

    // Assessment data from the table - fix date format
    assessments: postpartumCareData.map((care) => ({
      ppa_date_of_visit: formatDateToYYYYMMDD(care.date),
      ppa_feeding: care.feeding,
      ppa_findings: care.findings,
      ppa_nurses_notes: care.nursesNotes,
    })),

    // Spouse data (if husband information is provided) - handle blank middle name
    spouse_data: formData.mothersPersonalInfo?.husbandFName
      ? {
          spouse_type: "Husband",
          spouse_lname: formData.mothersPersonalInfo?.husbandLName || "",
          spouse_fname: formData.mothersPersonalInfo?.husbandFName || "",
          spouse_mname: formData.mothersPersonalInfo?.husbandMName || "N/A",
          spouse_occupation: "N/A", // Not captured in the form
          spouse_dob: formData.mothersPersonalInfo?.husbandDob || "",
        }
      : undefined,

    // Vital signs data (using the first assessment or form data)
    vital_bp_systolic:
      postpartumCareData.length > 0
        ? postpartumCareData[0].bp.split(" / ")[0]
        : formData.postpartumTable?.bp?.systolic || "",
    vital_bp_diastolic:
      postpartumCareData.length > 0
        ? postpartumCareData[0].bp.split(" / ")[1]
        : formData.postpartumTable?.bp?.diastolic || "",

    // Follow-up visit data
    followup_date: formData.postpartumInfo?.nextVisitDate || new Date().toISOString().split("T")[0],
    followup_description: "Postpartum Follow-up Visit",
  }

  return transformedData
}

// Helper function to convert outcome ID to name
const getOutcomeName = (outcomeId: string): string => {
  const outcomeOptions = [
    { id: "0", name: "Select" },
    { id: "1", name: "Fullterm" },
    { id: "2", name: "Preterm" },
  ]

  return outcomeOptions.find((option) => option.id === outcomeId)?.name || outcomeId
}

export const validatePostpartumFormData = (
  formData: z.infer<typeof PostPartumSchema>, 
  selectedPatientId: string,
  // postpartumCareData: any[],
): string[] => {
  const errors: string[] = []

  // Validate patient selection
  if (!selectedPatientId || selectedPatientId.trim() === "") {
    errors.push("Please select a patient")
  }

  // Validate patient ID format (should not be NaN or empty)
  if (selectedPatientId === "NaN" || selectedPatientId.toLowerCase() === "nan") {
    errors.push("Invalid patient ID selected")
  }

  // Validate basic information
  if (!formData.mothersPersonalInfo?.motherFName) {
    errors.push("Mother's first name is required")
  }

  if (!formData.mothersPersonalInfo?.motherLName) {
    errors.push("Mother's last name is required")
  }

  // Validate delivery information
  if (!formData.postpartumInfo?.dateOfDelivery) {
    errors.push("Date of delivery is required")
  }

  if (!formData.postpartumInfo?.placeOfDelivery) {
    errors.push("Place of delivery is required")
  }

  // if (!formData.postpartumInfo?.attendedBy) {
  //   errors.push("Attended by field is required")
  // }

  if (!formData.postpartumInfo?.outcome || formData.postpartumInfo?.outcome === "0") {
    errors.push("Pregnancy outcome is required")
  }

  // Validate that at least one assessment has been added
  // if (postpartumCareData.length === 0) {
  //   errors.push("At least one postpartum assessment is required")
  // }

  // Validate next visit date
  // if (!formData.postpartumInfo?.nextVisitDate) {
  //   errors.push("Next visit date is required")
  // }

  // if (!formData.postpartumInfo?.dateBfInitiated) {
  //   errors.push("Date breastfeeding initiated is required")
  // }

  // if (!formData.postpartumInfo?.timeBfInitiated) {
  //   errors.push("Time breastfeeding initiated is required")
  // }

  return errors
}

// Helper function to convert lochial discharge ID to name
const getLochialDischargeName = (lochialId: string): string => {
  const lochialOptions = [
    { id: "0", name: "Select" },
    { id: "1", name: "Lochia Rubra" },
    { id: "2", name: "Lochia Serosa" },
    { id: "3", name: "Lochia Alba" },
  ]

  return lochialOptions.find((option) => option.id === lochialId)?.name || "Lochia Rubra"
}

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (dateString: string): string => {
  try {
    // Handle different date formats
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // If invalid date, return today's date
      return new Date().toISOString().split("T")[0]
    }
    return date.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error formatting date:", error)
    return new Date().toISOString().split("T")[0]
  }
}
