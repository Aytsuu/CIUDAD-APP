import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";

export const MedicineListSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required").default(""),
  cat_id: z.string().min(1, "Category is required"),
  med_type:z.string().min(1, "Medicine type is required").default(""),
  med_dsg: positiveNumberSchema.pipe(z.number().min(1, "Dosage must be at least 1")),
    med_dsg_unit: z.string().min(1, "Dosage unit is required"),
    med_form: z.string().min(1, "Form is required"),


});

export const CommodityListSchema = z.object({
  com_name: z.string().min(1, "Enter Commodity Name").default(""),
  user_type: z.string().min(1, "User type is required"),
  gender_type: z.string().min(1,"Gender is required")

});


// export const VaccineListSchema = z.object({
//   vaccineName: z.string().min(1, "Vaccine name is required").default(""),
//   intervals: z.array(z.number()).optional(), // Array of intervals
//   timeUnits: z.array(z.string()).optional(), // Array of time units
//   noOfDoses: z.number().default(0),
//   ageGroup: z.string().min(1, "Age group is required").default(""),
//   specifyAge: z.string().default(""),
//   administeredOnce: z.boolean().default(false), // New field for the checkbox
// })
// .refine(
//   (data) => {
//     if (data.administeredOnce) {
//       // If administeredOnce is true, noOfDoses must be 1
//       return data.noOfDoses === 1;
//     }
//     return true;
//   },
//   {
//     message: "Number of doses must be 1 if administered only once",
//     path: ["noOfDoses"],
//   }
// )
// .refine(
//   (data) => {
//     if (!data.administeredOnce) {
//       // If administeredOnce is false, intervals and timeUnits must match noOfDoses
//       return (
//         data.intervals?.length === data.noOfDoses &&
//         data.timeUnits?.length === data.noOfDoses
//       );
//     }
//     return true;
//   },
//   {
//     message:
//       "Number of intervals and time units must match the number of doses",
//     path: ["intervals"],
//   }
// );

export const FirstAidSchema = z.object({
  fa_name: z.string().min(1, "Item name is Required").default(""),
  cat_id: z.string().min(1, "Category is required"),
  staff_id: z.string().optional(),

});

export const ImmunizationSchema = z.object({
  imz_name: z.string().min(1, "Required").default(""),
 
});


// Fixed VaccineSchema with conditional dose handling
export const VaccineSchema = z.object({
  vaccineName: z.string().min(1, "Vaccine name is required"),
  noOfDoses: z.union([
    z.string()
      .refine(val => val === "" || !isNaN(Number(val)), "Must be a number or empty")
      .transform(val => val === "" ? 0 : parseInt(val, 10)),
    z.number().min(0, "Dose count must be 0 or greater")
  ]),
  ageGroup: z.string().min(1, "Age group is required"),
  type: z.string().min(1, "Vaccine type is required").default("routine"),
  intervals: z.array(
    z.union([
      z.string()
        .refine(val => val === "" || !isNaN(Number(val)), "Must be a number or empty")
        .transform(val => val === "" ? 0 : parseInt(val, 10)),
      z.number().min(0, "Interval must be at least 0")
    ])
  ).optional().default([]),
  timeUnits: z.array(z.string()).optional().default([]),
  routineFrequency: z.object({
    interval: z.union([
      z.string()
        .min(1, "Interval is required")
        .refine(val => !isNaN(Number(val)), "Must be a number")
        .transform(val => parseInt(val, 10)),
      z.number().min(1, "Interval must be at least 1")
    ]),
    unit: z.string().min(1, "Unit is required"),
  }).optional(),
}).superRefine((data, ctx) => {
  // Add validation based on vaccine type
  if (data.type === "primary") {
    // Primary vaccines must have at least 1 dose
    if (data.noOfDoses < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 1 dose is required for primary vaccines",
        path: ["noOfDoses"],
      });
    }

    const expectedIntervals = Math.max(0, data.noOfDoses - 1);
    
    // Ensure intervals array has the correct length
    if (data.intervals && data.intervals.length !== expectedIntervals) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Primary vaccines require ${expectedIntervals} interval(s)`,
        path: ["intervals"],
      });
    }
    
    // Validate each interval
    if (data.intervals) {
      data.intervals.forEach((interval, index) => {
        if (interval === undefined || interval === null || interval <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Interval must be greater than 0",
            path: ["intervals", index],
          });
        }
      });
    }

    // Validate timeUnits length matches intervals length
    if (data.timeUnits && data.intervals && data.timeUnits.length !== data.intervals.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each interval must have a corresponding time unit",
        path: ["timeUnits"],
      });
    }
  } else if (data.type === "routine") {
    // Routine vaccines must have at least 1 dose
    if (data.noOfDoses < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 1 dose is required for routine vaccines",
        path: ["noOfDoses"],
      });
    }
    
    // Routine vaccines should have exactly 1 dose (you can adjust this if needed)
    if (data.noOfDoses !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Routine vaccines must have exactly 1 dose",
        path: ["noOfDoses"],
      });
    }
    
    if (!data.routineFrequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Routine frequency is required",
        path: ["routineFrequency"],
      });
    }
  } 
  // else if (data.type === "conditional") {
  //   // Conditional vaccines can have 0 doses (optional)
  //   // No specific dose validation needed for conditional vaccines
  //   // They will be administered based on healthcare provider assessment
  // }
});
  
export type VaccineType = z.infer<typeof VaccineSchema>;
export type MedicineType = z.infer<typeof MedicineListSchema>;
export type CommodityType = z.infer<typeof CommodityListSchema>;
export type FirstAidType = z.infer<typeof FirstAidSchema>;
export type ImmunizationType = z.infer<typeof ImmunizationSchema>;