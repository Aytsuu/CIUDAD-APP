import * as z from "zod"

export const patientRecordSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  sex: z.string().min(1, "Sex is required"),
  contact: z.string().min(1, "Contact is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  patientType: z.string().min(1, "Patient type is required"),
  houseNo: z.string().min(1, "House number is required"),
  philhealthId: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    sitio: z.string().min(1, 'Sitio is required'),
    barangay: z.string().min(1, 'Barangay is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
  }),
})

export type PatientRecordFormValues = z.infer<typeof patientRecordSchema>


