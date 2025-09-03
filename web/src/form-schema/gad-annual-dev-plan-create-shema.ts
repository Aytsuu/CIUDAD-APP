import { z } from "zod";

export const GADAnnualDevPlanBudgetItemSchema = z.object({
    gdb_name: z.string().min(1, "Budget item name is required"),
    gdb_pax: z.string().min(1, "Pax is required"),
    gdb_price: z.string().min(1, "Price is required"),
});

export const GADAnnualDevPlanCreateSchema = z.object({
    dev_date: z.string().min(1, "Date is required"),
    dev_client: z.string().min(1, "Client is required"),
    dev_issue: z.string().min(1, "Gender issue or GAD mandate is required"),
    dev_project: z.string().min(1, "Project is required"),
    dev_indicator: z.string().min(1, "Performance indicator is required"),
    dev_res_person: z.string().min(1, "Responsible person is required"),
    budgets: z.array(GADAnnualDevPlanBudgetItemSchema).min(1, "At least one budget item is required"),
    staff: z.string().optional().nullable(),
});

export type GADAnnualDevPlanCreateInput = z.infer<typeof GADAnnualDevPlanCreateSchema>;