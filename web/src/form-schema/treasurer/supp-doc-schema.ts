import z from "zod"

export const BudgetPlanSuppDocSchema = z.object({
    // suppDocs: z.string().url("Please insert the supporting document")
    //     .min(1, "At least one image is required")

    files: z.array(z.object({
        publicUrl: z.string().url(),
        storagePath: z.string(),
        type: z.enum(["image", "video", "document"]),
        name: z.string()
    })).min(1, "At least one file is required"),
    description: z.string().nonempty('This field is required')
});


