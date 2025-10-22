import z from "zod"
import { positiveNumberSchema } from "@/form-schema/maternal/prenatal-schema"


export const BHWFormSchema = z.object({
   staffId: z.string(),
   dateToday: z.string(),
   weight: z.string().optional(),
   height: z.string().optional(),

   surveillanceCasesCount: z.object({
      feverCount: positiveNumberSchema.optional(),
      dengueCount: positiveNumberSchema.optional(),
      diarrheaCount: positiveNumberSchema.optional(),
      pneumoniaCount: positiveNumberSchema.optional(),
      measlesCount: positiveNumberSchema.optional(),
      typhoidFeverCount: positiveNumberSchema.optional(),
      hepatitisCount: positiveNumberSchema.optional(),
      influenzaCount: positiveNumberSchema.optional(),
      hypertensiveCount: positiveNumberSchema.optional(),
      diabetesMellitusCount: positiveNumberSchema.optional(),
      tuberculosisCount: positiveNumberSchema.optional(),
      leprosyCount: positiveNumberSchema.optional(),
      othersCount: positiveNumberSchema.optional(),
   })
})