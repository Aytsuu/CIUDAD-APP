import { z } from "zod"

export const CreateFolderSchema = z.object({
  type: z.enum(["income", "disbursement"], {
    required_error: "Folder type is required",
  }),
  name: z.string()
    .min(1, "Folder name is required")
    .max(100, "Name must be 100 characters or less"),
  year: z.string().min(4, "Folder year is required")
})