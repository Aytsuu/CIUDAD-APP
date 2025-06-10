import { z } from "zod";

export const MedicineListSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required").default(""),
  cat_id: z.string().min(1, "Category is required"),
  med_type:z.string().min(1, "Medicine type is required").default(""),


});

export const CommodityListSchema = z.object({
  com_name: z.string().min(1, "Enter Commodity Name").default(""),
  cat_id: z.string().min(1, "Category is required"),

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

});

export const ImmunizationSchema = z.object({
  imz_name: z.string().min(1, "Required").default(""),
 
});

export const VaccineSchema = z.object({
  vaccineName: z.string().min(1, "Vaccine name is required"),
  noOfDoses: z.union([
    z.string()
      .min(1, "Dose count is required")
      .refine(val => !isNaN(Number(val)), "Must be a number")
      .transform(val => parseInt(val, 10)),
    z.number().min(1, "At least 1 dose is required")
  ]),
  ageGroup: z.string().min(1, "Age group is required"),
  specifyAge: z.string().optional().default("N/A"),
  type: z.string().min(1, "Vaccine type is required").default("routine"),
  intervals: z.array(
    z.union([
      z.string()
        .min(1, "Interval is required")
        .refine(val => !isNaN(Number(val)), "Must be a number")
        .transform(val => parseInt(val, 10)),
      z.number().min(1, "Interval must be at least 1")
    ])
  ).optional().default([]),
  timeUnits: z.array(z.string().min(1, "Time unit is required")).optional().default([]),
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
  if (data.type === "primary") {
    const expectedIntervals = Math.max(0, data.noOfDoses - 1);
    
    // Only validate length if intervals array exists
    if (data.intervals && data.intervals.length !== expectedIntervals) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Primary vaccines require ${expectedIntervals} interval(s)`,
        path: ["intervals"],
      });
    }
    
    // Validate each interval only if it exists
    data.intervals?.forEach((interval, index) => {
      if (interval === undefined || interval === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Interval is required",
          path: ["intervals", index],
        });
      } else if (isNaN(Number(interval))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Interval must be a valid number",
          path: ["intervals", index],
        });
      } else if (Number(interval) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Interval must be greater than 0",
          path: ["intervals", index],
        });
      }
    });
  } else if (data.type === "routine") {
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
});


  
export type VaccineType = z.infer<typeof VaccineSchema>;
export type MedicineType = z.infer<typeof MedicineListSchema>;
export type CommodityType = z.infer<typeof CommodityListSchema>;
export type FirstAidType = z.infer<typeof FirstAidSchema>;
export type ImmunizationType = z.infer<typeof ImmunizationSchema>;