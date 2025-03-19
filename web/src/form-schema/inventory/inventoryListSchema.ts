import { z } from "zod";

export const MedicineListSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required").default(""),

});

export const CommodityListSchema = z.object({
  commodityName: z.string().min(1, "Enter Commodity Name").default(""),
 
});


export const VaccineListSchema = z.object({
  vaccineName: z.string().min(1, "Vaccine name is required").default(""),
  intervals: z.array(z.number()).optional(), // Array of intervals
  timeUnits: z.array(z.string()).optional(), // Array of time units
  noOfDoses: z.number().default(0),
  ageGroup: z.string().min(1, "Age group is required").default(""),
  specifyAge: z.string().default(""),
  administeredOnce: z.boolean().default(false), // New field for the checkbox
})
.refine(
  (data) => {
    if (data.administeredOnce) {
      // If administeredOnce is true, noOfDoses must be 1
      return data.noOfDoses === 1;
    }
    return true;
  },
  {
    message: "Number of doses must be 1 if administered only once",
    path: ["noOfDoses"],
  }
)
.refine(
  (data) => {
    if (!data.administeredOnce) {
      // If administeredOnce is false, intervals and timeUnits must match noOfDoses
      return (
        data.intervals?.length === data.noOfDoses &&
        data.timeUnits?.length === data.noOfDoses
      );
    }
    return true;
  },
  {
    message:
      "Number of intervals and time units must match the number of doses",
    path: ["intervals"],
  }
);

export const FirstAidSchema = z.object({
  firstAidName: z.string().min(1, "Item name is Required").default(""),
 
});

export type MedicineType = z.infer<typeof MedicineListSchema>;
export type CommodityType = z.infer<typeof CommodityListSchema>;
export type VacccineType = z.infer<typeof VaccineListSchema>;
export type FirstAidType = z.infer<typeof FirstAidSchema>;