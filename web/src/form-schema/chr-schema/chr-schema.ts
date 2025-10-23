import { z } from "zod"
import { temperatureSchema, weightSchema, heightSchema } from "../medicalConsultation/nonPhilhealthSchema"
import { positiveNumberSchema } from "@/helpers/PositiveNumber"

export const BasicInfoSchema = z.object({
  familyNo: z.string().optional(),
  pat_id: z.string().optional(),
  rp_id: z.string().optional(),
  trans_id: z.string().optional(),
  ufcNo: z.string().optional(),
  childFname: z.string().min(1, "required"),
  childLname: z.string().min(1, "required"),
  childMname: z.string(),
  birth_order: positiveNumberSchema.refine((val) => val >= 1, {
    message: "Birth order is required",
  }),
  childSex: z.string().min(1, "required"),
  childDob: z.string().min(1, "required"),
  childAge: z.string().min(1, "required"),
  placeOfDeliveryType: z.enum(["Hospital Gov't/Private", "Home", "Private Clinic", "HC","Lying in"], {
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
  residenceType: z.string().default("Resident"),
  address: z.string().optional(),
  landmarks: z.string().optional(),
  pregnancy_id: z.string().optional(),
})

export const BFCheckSchema = z.object({
  ebf_id: z.number().optional(),
  ebf_date: z.string().min(1, "Date is required"),
  type_of_feeding: z.string().min(1, "type_of_feeding is required"),
  created_at: z.string().optional(),
  chhist: z.number().optional(),
});

export const ChildDetailsSchema = z.object({
  BFdates: z.array(z.string()).optional(),
  BFchecks: z.array(BFCheckSchema).optional(), // New field for BF checks with IDs

  dateNewbornScreening: z.string().min(1, "required").optional(),
  tt_status: z.string().min(1, "required"),
  newbornInitiatedbf: z.boolean().default(false),
  nbscreening_result: z.string().optional(),
})

export const MedicineRequestSchema = z.object({
  minv_id: z.string().min(1, "Medicine ID is required"),
  medrec_qty: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string(),
})

export const SupplementSchema = z.object({
  medicines: z.array(MedicineRequestSchema).optional(),
  supplementSummary: z.string().optional(),
})

export const VitalSignSchema = z.object({
  date: z.string().min(1, "Date is required"),
  age: z.string().min(1, "Age is required"),
  ht: heightSchema.optional(),
  wt: weightSchema.optional(),
  temp: temperatureSchema.optional(),
  follov_description: z.string().optional(),
  notes: z.string().optional(),
  followUpVisit: z.string().optional(),
  followv_id: z.string().optional(),
  chvital_id: z.string().optional(),
  bm_id: z.string().optional(),
  chnotes_id: z.string().optional(),
  followv_status: z.string().optional(),
  remarks: z.string().optional(),
  is_opt: z.boolean().optional().default(false),
})

export const HealthStatusSchema = z.object({
  anemic: z
    .object({
      seen: z.string().optional(),
      given_iron: z.string().optional(),
      is_anemic: z.boolean().optional().default(false),
      date_completed: z.string().optional(),
    })
    .optional(),
  birthwt: z
    .object({
      seen: z.string().optional(),
      given_iron: z.string().optional(),
      date_completed: z.string().optional(),
    })
    .optional(),
})

export const NutritionalStatusSchema = z.object({
  wfa: z.enum(["N", "UW", "SUW", "OW", ""]).optional(),
  lhfa: z.enum(["N", "ST", "SST", "T", ""]).optional(),
  wfh: z.enum(["N", "W", "SW", "OW", "OB", ""]).optional(),
  muac: z.number().optional(),
  muac_status: z.enum(["N", "MAM", "SAM", ""]).optional(),
  date: z.string().optional(),
  edemaSeverity: z.string().optional(),
})

export const NUTRITIONAL_STATUS_DESCRIPTIONS = {
  wfa: {
    N: "Normal",
    UW: "Underweight",
    SUW: "Severely Underweight",
    OW: "Overweight",
  },
  lhfa: {
    N: "Normal",
    ST: "Stunted",
    SST: "Severely Stunted",
    T: "Tall",
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

export const vaccineRecordSchema = z.object({
  chvaccine_id: z.string().optional(),
  vacStck_id: z.string().optional(),
  vaccineType: z.string().optional(),
  dose: z.string().optional(),
  date: z.string().optional(),
  vac_id: z.string().optional(),
  vac_name: z.string().optional(),
  expiry_date: z.string().optional(),
})

export const existingVaccineRecordSchema = z.object({
  chvaccine_id: z.string().optional(),
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
  chssupplementstat_id: z.number().optional(),
  chsupp_details: z.any().optional(),
  birthwt: z.string().nullable().optional(),
  status_type: z.string().optional(),
  date_seen: z.string().optional(),
  date_given_iron: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  chsupplement: z.number().optional(),
  date_completed: z.string().nullable().optional(),
})

export const ChildHealthFormSchema = BasicInfoSchema.merge(ChildDetailsSchema)
  .merge(SupplementSchema)
  .merge(HealthStatusSchema).merge(VaccinesSchema)
  .extend({
    vitalSigns: z.array(VitalSignSchema).optional(),
    status: z.enum(["check-up", "immunization", "recorded", ""]),
    nutritionalStatus: NutritionalStatusSchema.optional(),
    edemaSeverity: z.string().optional().default("N/A"),
    created_at: z.string().optional(),
    chhist_status: z.string().optional(),
    historicalSupplementStatuses: z.array(CHSSupplementStatSchema).optional(),
    selectedStaffId: z.string().optional(),
    passed_status: z.string().optional(),
  })

export type FormData = z.infer<typeof ChildHealthFormSchema>
export type BasicInfoType = z.infer<typeof BasicInfoSchema>
export type ChildDetailsType = z.infer<typeof ChildDetailsSchema>
export type VitalSignType = z.infer<typeof VitalSignSchema>
export type SupplementType = z.infer<typeof SupplementSchema>
export type HealthStatustype = z.infer<typeof HealthStatusSchema>
export type NutritionalStatusType = z.infer<typeof NutritionalStatusSchema>
export type VaccineType = z.infer<typeof VaccinesSchema>
export type VaccineRecord = z.infer<typeof vaccineRecordSchema>
export type ExistingVaccineRecord = z.infer<typeof existingVaccineRecordSchema>
export type BFCheck = z.infer<typeof BFCheckSchema>;
