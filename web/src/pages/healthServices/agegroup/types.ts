import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";
// Zod Schema for Age Group
export const AgeGroupSchema = z
  .object({
    agegroup_name: z
      .string()
      .min(1, "Age group name is required")
      .min(2, "Age group name must be at least 2 characters")
      .max(50, "Age group name must be less than 50 characters")
      .trim(),
    min_age:
      positiveNumberSchema,
    max_age: positiveNumberSchema,
    time_unit: z.string().min(1, "Time unit is required"),
  })
  .refine((data) => data.max_age > data.min_age, {
    message: "Maximum age must be greater than minimum age",
    path: ["max_age"],
  });

// TypeScript type derived from schema
export type AgeGroupType = z.infer<typeof AgeGroupSchema>;

// Interface for time unit options
export interface TimeUnitOption {
  id: string;
  name: string;
}

// Time unit options for the select dropdown
export const time_unit_options: TimeUnitOption[] = [
  { id: "days", name: "Days" },
  { id: "weeks", name: "Weeks" },
  { id: "months", name: "Months" },
  { id: "years", name: "Years" },
];

// Interface for stored age groups (with id and timestamps)
export interface AgeGroupWithId extends AgeGroupType {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Helper function to format age range display
export const formatAgeRange = (ageGroup: AgeGroupWithId): string => {
  return `${ageGroup.min_age} - ${ageGroup.max_age} ${ageGroup.time_unit}`;
};