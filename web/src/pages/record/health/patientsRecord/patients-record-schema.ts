import * as z from "zod"

export const patientRecordSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  contact: z.string().min(1, "Contact is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  patientType: z.string().min(1, "Patient type is required"),
  houseNo: z.string().min(1, "House number is required"),
  street: z.string().min(1, "Street Address is required"),
  sitio: z.string().min(1, "Sitio is required"),
})

export type PatientRecordFormValues = z.infer<typeof patientRecordSchema>


