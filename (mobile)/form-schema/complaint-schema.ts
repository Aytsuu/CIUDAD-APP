import { z } from 'zod';

export const accusedSchema = z.object({
  accusedName: z.string().min(1)
});

export const complaintFormSchema = z.object({
  comp_incident_type: z.string().min(1, "Incident type is required"),
  comp_allegation: z.string().min(1, "Allegation is required"),
  comp_datetime: z.string().datetime(),
  accused: z.object({
    list: z.array(accusedSchema).default([]),
    new: accusedSchema
  })
});