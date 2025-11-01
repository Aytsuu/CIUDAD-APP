import { z } from "zod";

export const GADAnnualDevPlanBudgetItemSchema = z.object({
    gdb_name: z.string().min(1, "Budget item name is required"),
    gdb_pax: z.string().min(1, "Pax is required"),
    gdb_price: z.string().min(1, "Price is required"),
});

export const GADAnnualDevPlanCreateSchema = z.object({
    dev_date: z.string()
        .min(1, "Date is required")
        .refine((date) => {
            if (!date) return false;
            const selectedDate = new Date(date);
            const currentYear = new Date().getFullYear();
            const selectedYear = selectedDate.getFullYear();
            return selectedYear >= currentYear;
        }, {
            message: "Cannot create development plan for past years. Please select current year or future year.",
            path: ["dev_date"]
        }),
    dev_client: z.string().min(1, "Client is required"),
    dev_issue: z.string().min(1, "Gender issue or GAD mandate is required"),
    dev_mandated: z.boolean().default(false),
    dev_project: z.string().min(1, "GAD Program/Project/Activity is required"),
    dev_activity: z.string().optional(),
    dev_indicator: z.string().min(1, "Performance indicator is required"),
    dev_res_person: z.string().min(1, "Responsible person is required"),
    dev_budget_items: z.string().default("0"),
    dev_gad_budget: z.string().optional(),
    staff: z.string().optional().nullable(),
    selectedAnnouncements: z.array(z.string()).optional(),
    eventSubject: z.string().optional(),
});

export type GADAnnualDevPlanCreateInput = z.infer<typeof GADAnnualDevPlanCreateSchema>;