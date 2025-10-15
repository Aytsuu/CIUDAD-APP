import z from "zod"


export const BHWFormSchema = z.object({
   staffId: z.string(),
   dateToday: z.string(),
   description: z.string().optional(),
   age: z.string(), // Add this
   gender: z.enum(["Male", "Female"]), // Add this
   weight: z.number().optional(),
   height: z.number().optional(),
   muac: z.number().optional(), // Optional
   nutritionalStatus: z.object({ // Add this to store the calculated status
      wfa: z.string(),
      lhfa: z.string(),
      wfh: z.string(),
      muac: z.number().optional(),
      muac_status: z.string(),
   }).optional(),
   surveillanceCasesCount: z.object({
      feverCount: z.number().optional(),
      dengueCount: z.number().optional(),
      diarrheaCount: z.number().optional(),
      pneumoniaCount: z.number().optional(),
      measlesCount: z.number().optional(),
      typhoidFeverCount: z.number().optional(),
      hepatitisCount: z.number().optional(),
      influenzaCount: z.number().optional(),
      hypertensiveCount: z.number().optional(),
      diabetesMellitusCount: z.number().optional(),
      tuberculosisCount: z.number().optional(),
      leprosyCount: z.number().optional(),
      // Remove othersCount, replace with array
      others: z.array(z.object({
         diseaseName: z.string().min(1, "Disease name is required"),
         count: z.number().min(0, "Count must be 0 or greater")
      })).optional()
   }),
})