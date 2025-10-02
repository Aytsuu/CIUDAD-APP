import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAnnualDevPlan } from "../restful-api/annualPostAPI";
import { getAnnualDevPlanById, getAnnualDevPlansByYear } from "../restful-api/annualGetAPI";
import { updateAnnualDevPlan } from "../restful-api/annualPutAPI";

export interface BudgetItem {
    gdb_name: string;
    gdb_pax: string;
    gdb_price: string;
}

export interface AnnualDevPlanFormData {
    dev_date: string;
    dev_client: string;
    dev_issue: string;
    dev_project: string;
    dev_activity?: string;
    dev_res_person: string;
    dev_indicator: string;
    dev_budget_items: string;
    staff?: string | null;
}

export const useCreateAnnualDevPlan = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (args: { formData: AnnualDevPlanFormData; budgetItems: BudgetItem[]; resPersons?: string[] }) => {
            const { formData, budgetItems, resPersons } = args;
            const { staff, ...restFormData } = formData;

            const payload = {
                ...restFormData,
                dev_project: restFormData.dev_project, // Keep as text
                dev_activity: restFormData.dev_activity || null, // Keep as JSON string
                dev_res_person: JSON.stringify(resPersons && resPersons.length ? resPersons : (restFormData.dev_res_person ? [restFormData.dev_res_person] : [])),
                dev_indicator: JSON.stringify(restFormData.dev_indicator ? [restFormData.dev_indicator] : []),
                dev_budget_items: JSON.stringify(budgetItems),
                staff: staff || null,
            };

            return await createAnnualDevPlan(payload);
        },
        onSuccess: () => {
            // Invalidate and refetch annual dev plans queries to update the calendar
            queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
            queryClient.invalidateQueries({ queryKey: ["annualDevPlan"] });
        },
    });
};

export const useGetAnnualDevPlanById = (devId?: string) => {
    return useQuery({
        queryKey: ["annualDevPlan", devId],
        queryFn: async () => {
            if (!devId) throw new Error("No development plan ID provided");
            return await getAnnualDevPlanById(devId);
        },
        enabled: Boolean(devId),
    });
};

export const useUpdateAnnualDevPlan = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (args: { devId: number; formData: AnnualDevPlanFormData; budgetItems: BudgetItem[] }) => {
            const { devId, formData, budgetItems } = args;
            const { staff, ...restFormData } = formData;
            const payload = {
                ...restFormData,
                staff: staff || null,
                budgets: budgetItems,
            };
            return await updateAnnualDevPlan(devId, payload);
        },
        onSuccess: () => {
            // Invalidate and refetch annual dev plans queries to update the calendar
            queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
            queryClient.invalidateQueries({ queryKey: ["annualDevPlan"] });
        },
    });
};

export const useGetAnnualDevPlansByYear = (year: number) => {
    return useQuery({
        queryKey: ["annualDevPlans", year],
        queryFn: async () => {
            return await getAnnualDevPlansByYear(year);
        },
        enabled: Boolean(year),
    });
};
