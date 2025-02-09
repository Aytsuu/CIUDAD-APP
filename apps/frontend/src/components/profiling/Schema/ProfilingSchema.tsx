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

export const motherFormSchema = z.object({});

export const fatherFormSchema = z.object({});

export const dependentFormSchema = z.object({
  dependentFName: z.string().min(1, "This is required"),
  dependentLName: z.string().min(1, "Must be 2 or more characters"),
  dependentMName: z.string().min(1, "This is required"),
  dependentSuffix: z.string().min(1, "This is required"),
  dependentDateOfBirth: z.string().min(1, "This is required"),
  dependentSex: z.string().min(1, "This is required"),
});
