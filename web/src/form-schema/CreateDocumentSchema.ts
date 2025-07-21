import { z } from "zod";

export const addDocumentSchema = z.object({
    Title: z.string().min(1, "Title is required"),
    Date: z.string().min(1, "Date is required"),
    Description: z.string().min(1, "Description is required"),
});

export default addDocumentSchema;