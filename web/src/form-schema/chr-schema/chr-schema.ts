import { date, z } from "zod"
import { temperatureSchema, weightSchema, heightSchema } from "../medicalConsultation/nonPhilhealthSchema"
import { positiveNumberSchema } from "@/helpers/PositiveNumber"
// BasicInfoSchema is now a plain ZodObject, allowing it to be merged
export const BasicInfoSchema = z.object({
  familyNo: z.string().optional(),
  pat_id: z.string().optional(),
  rp_id: z.string().optional(), // Added for record patient ID
  trans_id: z.string().optional(), // Added for transaction ID
  // Added for transaction ID
  ufcNo: z.string().optional(),
  childFname: z.string().min(1, "required"),
  childLname: z.string().min(1, "required"),
  childMname: z.string(),
  birth_order: positiveNumberSchema.refine((val) => val >= 1, {
    message: "Birth order is required",
  }), // Assuming birth order is a positive number
  childSex: z.string().min(1, "required"),
  childDob: z.string().min(1, "required"),
  childAge: z.string().min(1, "required"), // Assuming this is calculated from childDob
  placeOfDeliveryType: z.enum(["Hospital Gov't/Private", "Home", "Private Clinic", "HC"], {
    required_error: "Place of delivery is required",
  }),
  placeOfDeliveryLocation: z.string().optional(),
  motherFname: z.string().min(1, "required"),
  motherLname: z.string().min(1, "required"),
  motherMname: z.string().optional(),
  motherdob: z.string().optional(),
  motherAge: z.string().optional(),
  motherOccupation: z.string().optional(),
  fatherFname: z.string().optional(),
  fatherLname: z.string().optional(),
  fatherMname: z.string().optional(),
  fatherAge: z.string().optional(),
  fatherdob: z.string().optional(),
  fatherOccupation: z.string().optional(),
  residenceType: z.string().default("Resident"), // Default value for residence type
  address: z.string().optional(),
  landmarks: z.string().optional(),
})

export const ChildDetailsSchema = z.object({
  disabilityTypes: z.array(z.number()).optional(), // Just the array of disability IDs
  type_of_feeding: z.string().min(1, "required"),
  // hasEdema: z.boolean().optional(),
  // edemaSeverity: z.string().optional().default("N/A"),
  BFdates: z.array(z.string()).optional(), // Remove if not needed
  dateNewbornScreening: z.string().min(1, "Date of newborn screening is required").optional(),
  tt_status: z.string().min(1, "required"),
})

export const MedicineRequestSchema = z.object({
  minv_id: z.string().min(1, "Medicine ID is required"),
  medrec_qty: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string(),
})

// Supplement Schema (simplified)
export const SupplementSchema = z.object({
  medicines: z.array(MedicineRequestSchema).optional(),
  supplementSummary: z.string().optional(),
})

export const VitalSignSchema = z.object({
  date: z.string().min(1, "Date is required"),
  age: z.string().min(1, "Age is required"),
  ht: heightSchema,
  wt: weightSchema,
  temp: temperatureSchema,
  follov_description: z.string().optional(),
  notes: z.string().optional(),
  followUpVisit: z.string().optional(),
  followv_id: z.string().optional(), // Follow-up visit ID
  chvital_id: z.string().optional(), // Vital sign ID
  bm_id: z.string().optional(), // Body measurement ID
  chnotes_id: z.string().optional(), // Child health notes ID
  followv_status:z.string().optional(), // Follow-up visit status

})

export const HealthStatusSchema = z.object({
  anemic: z
    .object({
      seen: z.string().optional(),
      given_iron: z.string().optional(),
      is_anemic: z.boolean().optional().default(false),
      date_completed: z.string().optional(), // Date when anemia status was completed

    })
    .optional(),
  birthwt: z
    .object({
      seen: z.string().optional(),
      given_iron: z.string().optional(),
      date_completed: z.string().optional(), // Date when birth weight status was completed
    })
    .optional(),
})

export const NutritionalStatusSchema = z.object({
  wfa: z.enum(["N", "UW", "SUW", ""]).optional(), // Weight for Age
  lhfa: z.enum(["N", "ST", "SST", "T", "OB", ""]).optional(), // Length/Height for Age
  wfh: z.enum(["N", "W", "SW", "OW", ""]).optional(), // Weight for Height/Length
  muac: z.number().optional(), // Mid-Upper Arm Circumference (manual input)
  muac_status: z.enum(["N", "MAM", "SAM", ""]).optional(), // MUAC status
  date: z.string().optional(), // Date of nutritional status assessment
  edemaSeverity:z.string().optional()
})

// Nutritional status descriptions
export const NUTRITIONAL_STATUS_DESCRIPTIONS = {
  wfa: {
    N: "Normal",
    UW: "Underweight",
    SUW: "Severely Underweight",
  },
  lhfa: {
    N: "Normal",
    ST: "Stunted",
    SST: "Severely Stunted",
    T: "Tall",
    OB: "Obese",
  },
  wfh: {
    N: "Normal",
    W: "Wasted",
    SW: "Severely Wasted",
    OW: "Overweight",
  },
  muac: {
    N: "Normal",
    MAM: "Moderate Acute Malnutrition",
    SAM: "Severe Acute Malnutrition",
  },
}



// New vaccine schemas
export const vaccineRecordSchema = z.object({
  chvaccine_id: z.string().optional(), // Added for edit mode
  vacStck_id: z.string().optional(),
  vaccineType: z.string().optional(),
  dose: z.string().optional(),
  date: z.string().optional(),
  vac_id: z.string().optional(),
  vac_name: z.string().optional(),
  expiry_date: z.string().optional(),
})

export const existingVaccineRecordSchema = z.object({
  chvaccine_id: z.string().optional(), // Added for edit mode
  vac_id: z.string().optional(),
  vaccineType: z.string().optional(),
  dose: z.string().optional(),
  date: z.string().optional(),
  vac_name: z.string().optional(),
})

export const VaccinesSchema = z.object({
  vaccines: z.array(vaccineRecordSchema).optional(),
  existingVaccines: z.array(existingVaccineRecordSchema).optional(),
})

const CHSSupplementStatSchema = z.object({
  chssupplementstat_id: z.number().optional(), // Changed to number and optional
  chsupp_details: z.any().optional(), // Added as optional any
  birthwt: z.string().nullable().optional(), // Changed to string | null and optional
  status_type: z.string().optional(), // Remains string
  date_seen: z.string().optional(), // Remains string
  date_given_iron: z.string().optional(), // Remains string
  created_at: z.string().optional(), // Optional
  updated_at: z.string().optional(), // Optional
  chsupplement: z.number().optional(), // Changed to number and optional
  date_completed: z.string().nullable().optional(), // Optional string | null
})
// Apply superRefine to the final merged schema
export const ChildHealthFormSchema = BasicInfoSchema.merge(ChildDetailsSchema)
  .merge(SupplementSchema)
  .merge(HealthStatusSchema).merge(VaccinesSchema)
  .extend({
    vitalSigns: z.array(VitalSignSchema).optional(),
    status: z.enum(["check-up", "immunization", "recorded", ""]),
    nutritionalStatus: NutritionalStatusSchema.optional(),
    edemaSeverity: z.string().optional().default("N/A"),
    created_at: z.string().optional(),
    chhist_status: z.string().optional(), // Added for child health history status
    historicalSupplementStatuses: z.array(CHSSupplementStatSchema).optional(), // ADDED THIS LINE

  })



export type FormData = z.infer<typeof ChildHealthFormSchema>
export type BasicInfoType = z.infer<typeof BasicInfoSchema>
export type ChildDetailsType= z.infer<typeof ChildDetailsSchema>
export type VitalSignType = z.infer<typeof VitalSignSchema>
export type SupplementType = z.infer<typeof SupplementSchema>
export type HealthStatustype = z.infer<typeof HealthStatusSchema>
export type NutritionalStatusType = z.infer<typeof NutritionalStatusSchema>
export type VaccineType = z.infer<typeof VaccinesSchema> // Export the new type
export type VaccineRecord = z.infer<typeof vaccineRecordSchema> // Export the new type
export type ExistingVaccineRecord = z.infer<typeof existingVaccineRecordSchema> // Export the new type




