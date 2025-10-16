import { z } from "zod";



const positiveNumberWith2Decimals = z.preprocess(
  (val) => (val !== '' ? Number(val) : undefined),
  z
    .number()
    .min(2, { message: "Value must be at least 2." })
    .max(999, { message: "Value must not exceed 999." })
    .refine((val) => {
      return /^\d{1,3}(\.\d{1,2})?$/.test(val.toString());
    }, {
      message: "Value must be a number with up to 2 decimal places and a maximum of 3 digits.",
    })
);

// Temperature-specific validation
export const temperatureSchema = positiveNumberWith2Decimals
  .refine((temp) => temp >= 25, {
    message: "Temperature too low (critical hypothermia)",
  })
  .refine((temp) => temp <= 43, {
    message: "Temperature too high (hyperthermia risk)",
  })
  .refine((temp) => temp < 36.5 || temp > 37.5, {
    message: "Temperature outside normal range (36.5°C-37.5°C)",
  });
export const heightSchema = z.preprocess(
  (val) => (val !== '' ? Number(val) : undefined),
  z.number()
    .min(45, { message: "Below minimum human height" })
    .max(300, { message: "Exceeds medical maximum" })
    .refine((h) => h <= 250 || h >= 200, {
      message: "Abnormal height - verify measurement"
    })
    .refine((h) => h <= 200 || h >= 150, {
      message: "Outside common adult range"
    })
);


export const weightSchema = z.preprocess(
  (val) => (val !== '' ? Number(val) : undefined),
  z.number()
    .min(0.5, { message: "Weight must be at least 0.5 kg" })
    .max(300, { message: "Weight exceeds medical limits (300 kg max)" })
    .refine((val) => /^\d{1,3}(\.\d{1,2})?$/.test(val.toString()), {
      message: "Max 3 digits and 2 decimals"
    })
    // Additional medical checks
    .refine((w) => w <= 200 || w >= 30, {
      message: "Extremely high weight - verify measurement"
    })
    .refine((w) => w <= 150 || w >= 2, {
      message: "Outside common weight range"
    })
);


const heartRateSchema = z.preprocess(
  (val) => (val !== '' ? Number(val) : undefined),
  z.number()
    .int({ message: "Must be a whole number" })
    .min(20, { message: "Critical bradycardia (<20 bpm)" })
    .max(250, { message: "Extreme tachycardia (>250 bpm)" })
    // Age-agnostic safe range
    .refine((hr) => hr >= 40 || hr <= 180, {
      message: "Abnormal for any age - verify measurement"
    })
    // Common clinical thresholds
    .refine((hr) => hr >= 60 || hr <= 100, {
      message: "Outside normal adult range (60-100 bpm)"
    })
);


const respiratoryRateSchema = z.preprocess(
  (val) => (val !== '' ? Number(val) : undefined),
  z.number()
    .int({ message: "Must be a whole number" })
    .min(6, { message: "Agonal breathing (<6) - emergency!" })
    .max(60, { message: "Extreme tachypnea (>60)" })
    // Age-agnostic safe range
    .refine((rr) => rr >= 12 || rr <= 30, {
      message: "Abnormal for any age - verify measurement"
    })
    // Adult-specific guidance
    .refine((rr) => rr >= 12 || rr <= 20, {
      message: "Outside normal adult range (12-20)"
    })
);



export const nonPhilHealthSchema = z.object({
  staff: z.string().nullable().optional(),
  pat_id: z.string().min(1, "Patient ID is required").default(""),
  bhw_assignment: z.string().min(1, "BHW Assignment is Required").default(""),
  vital_pulse: heartRateSchema,
  vital_bp_systolic: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number()
      .min(40, { message: "Systolic cannot be <40 mmHg (non-viable)" })
      .max(300, { message: "Systolic cannot be >300 mmHg" })
      .refine(val => val % 1 === 0, "Must be whole number")
  ),
  vital_bp_diastolic: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number()
      .min(20, { message: "Diastolic cannot be <20 mmHg" })
      .max(200, { message: "Diastolic cannot be >200 mmHg" })
      .refine(val => val % 1 === 0, "Must be whole number")
  ),
  
  vital_RR: respiratoryRateSchema,
  vital_o2: z.string().optional(),
  height: heightSchema,
  weight: weightSchema,
  vital_temp: temperatureSchema,
    medrec_chief_complaint: z.string().min(1, "Chief complaint is required"),
  obs_id: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().optional().default("")),
  selectedDoctorStaffId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().optional().default("")),
  is_phrecord: z.boolean().optional().default(false),
  phil_pin:z.string().optional(),
  iswith_atc: z.boolean().optional().default(false),
  dependent_or_member: z.string().optional().default(""),
  civil_status: z.string().optional().default(""),
  obs_lmp: z.string().optional().default(""),
  tts_id: z.string().optional().default(""),
  tts_status: z.string().optional().default(""),
  tts_date_given: z.string().optional().default(""),
  obs_ch_born_alive: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_living_ch: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_abortions: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_still_birth: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_lg_babies: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().optional().default("")),
  obs_lg_babies_str:  z.boolean().optional().default(false),
  obs_gravida: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_para: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_fullterm:  z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),
  obs_preterm: z.preprocess((val) => (val !== '' ? Number(val) : undefined), z.number().optional()),


  ogtt_result: z.string().optional().default(""),
  contraceptive_used: z.string().optional().default(""),
  smk_sticks_per_day: z.string().optional().default(""),
  smk_years: z.string().optional().default(""),
  is_passive_smoker: z.boolean().optional().default(false),
  alcohol_bottles_per_day: z.string().optional().default(""),
  famselectedIllnesses: z.array(z.number()).optional(),
  myselectedIllnesses: z.array(z.number()).optional(),
  app_id: z.string().optional().default(""),

 
 

});

export type nonPhilHealthType = z.infer<typeof nonPhilHealthSchema>;