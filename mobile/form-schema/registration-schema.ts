import * as z from "zod";

// PersonInfo
const PersonInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  dob: z.string().optional(),
  civilStatus: z.string().optional(),
  sex: z.string().optional(),
});

// FormData
export const FormDataSchema = z.object({
  identityVerification: z.object({
    dob: z.string().min(1, "Date of birth is required"),
    residency: z.string().min(1, "Residency is required"),
  }),
  demographicData: z.object({
    householdNo: z.string().min(1, "Household number is required"),
    familyNo: z.string().min(1, "Family number is required"),
  }),
  personalInformation: PersonInfoSchema.extend({
    placeOfBrith: z.string().min(1, "Place of birth is required"),
    citizenship: z.string().min(1, "Citizenship is required"),
    religion: z.string().min(1, "Religion is required"),
    address: z.string().min(1, "Address is required"),
    contactNo: z.string().min(1, "Contact number is required"),
    occupation: z.string().min(1, "Occupation is required"),
    dateOfResidency: z.string().min(1, "Date of residency is required"),
  }),
  motherInformation: PersonInfoSchema,
  fatherInformation: PersonInfoSchema,
  dependentInformation: z.array(
    PersonInfoSchema.extend({
      educAtt: z.string().min(1, "Educational attainment is required"),
      employment: z.string().min(1, "Employment status is required"),
    })
  ),
  identification: z.object({
    id: z.string().min(1, "ID is required"),
    userPhoto: z.string().min(1, "User photo is required"),
  }),
  accountDetails: z.object({
    userName: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

// interfaces derived from Zod schemas
type PersonInfo = z.infer<typeof PersonInfoSchema>;
export type DependentInfo = z.infer<typeof FormDataSchema>["dependentInformation"][number];
export type FormData = z.infer<typeof FormDataSchema>;

export const emptyPersonInfo: PersonInfo = {
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  dob: "",
  civilStatus: "",
  sex: "",
};

// Function to validate FormData using Zod
export const validateFormData = (data: FormData) => {
  return FormDataSchema.safeParse(data);
};
