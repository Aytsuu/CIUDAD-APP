import { Agent } from "http"
import {z} from "zod"


export const PatientQueueSchema = z.object({
    lname: z.string().min(1, "Last name is Required"),
    fname: z.string().min(1, "First Name is required"),
    mname: z.string().optional(),
    age: z.string().min(1, "Age is required"),
    sex: z.string().min(1, "Gender is required"),
    address: z.string().min(1, "Address is required"),
    purok: z.string().optional(),
    service: z.string().min(1, "Service is required"),
    // prioritynum: z.string().optional(),
    ispregnant: z.boolean().default(false),
    issenior: z.boolean().default(false),
    isregular: z.boolean().default(false),
    iswalkin: z.boolean().default(true),
    istransient: z.boolean().default(false),
});


export default PatientQueueSchema;