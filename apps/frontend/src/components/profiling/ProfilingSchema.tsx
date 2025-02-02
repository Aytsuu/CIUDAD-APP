import * as z from "zod";

export const personalFormSchema = z.object({
  lastName: z.string().min(1, "Last Name is required"),
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  sex: z.string().min(1, "Sex is required"),
  status: z.string().min(1, "Status is required"),
  birthPlace: z.string().min(1, "Place of Birth is required"),
  citizenship: z.string().min(1, "Citizenship is required"),
  religion: z.string().min(1, "Religion is required"),
  contact: z.string().min(1, "Contact is required"),
});

export const parentsFormSchema = z.object({
  fatherFirstName: z.string().min(1, "Father's First Name is required"),
  fatherLastName: z.string().min(1, "Father's Last Name is required"),
  fatherMiddleName: z.string().optional(),
  motherFirstName: z.string().min(1, "Mother's First Name is required"),
  motherLastName: z.string().min(1, "Mother's Last Name is required"),
  motherMiddleName: z.string().optional(),
  fatherOccupation: z.string().min(1, "Father's Occupation is required"),
  motherOccupation: z.string().min(1, "Mother's Occupation is required"),
  parentAddress: z.string().min(1, "Parents' Address is required"),
});