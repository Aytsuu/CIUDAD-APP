import * as z from "zod";

export const personalFormSchema = z.object({
  // lastName: z.string().min(1, "Last Name is required"),
  // firstName: z.string().min(1, "First Name is required"),
  // middleName: z.string().optional(),
  // suffix: z.string().optional(),
  // sex: z.string().min(1, "Sex is required"),
  // status: z.string().min(1, "Status is required"),
  // birthPlace: z.string().min(1, "Place of Birth is required"),
  // citizenship: z.string().min(1, "Citizenship is required"),
  // religion: z.string().min(1, "Religion is required"),
  // contact: z.string().min(1, "Contact is required"),
});

export const motherFormSchema = z.object({});

export const fatherFormSchema = z.object({});

export const dependentFormSchema = z.object({
  dependentFName: z.string(),
  dependentLName: z.string(),
  dependentMName: z.string(),
  dependentSuffix: z.string(),
  dependentDateOfBirth: z.string(),
  dependentSex: z.string(),
  additionalDependents: z.array(
    z.object({
      dependentFName: z.string(),
      dependentLName: z.string(),
      dependentMName: z.string(),
      dependentSuffix: z.string(),
      dependentDateOfBirth: z.string(),
      dependentSex: z.string(),
    })
  ),
});
