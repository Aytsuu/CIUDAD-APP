import { z } from "zod";

// Shaping the certification request form schema
const CertificationRequestSchema = z.object({
    requestedBy: z.string().min(1, "Please enter the requestor's name"),
  typeOfClearance: z.string().min(1, "Please select a clearance type"),
  purpose: z.string().min(1, "Please select a purpose"),
  clearanceTypes: z.array(z.string()).min(1, "Please select at least one clearance type"),
});

export default CertificationRequestSchema;
