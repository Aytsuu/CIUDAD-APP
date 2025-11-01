import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAnnualDevPlan } from "../restful-api/annualPostAPI";
import { getAnnualDevPlanById, getAnnualDevPlansByYear, getArchivedAnnualDevPlans, archiveAnnualDevPlans, restoreAnnualDevPlans } from "../restful-api/annualGetAPI";
import { updateAnnualDevPlan } from "../restful-api/annualPutAPI";
import { deleteAnnualDevPlans } from "../restful-api/annualDeleteAPI";

export interface BudgetItem {
    name: string;
    quantity: string;
    price: string;
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
        mutationFn: async (args: { formData: AnnualDevPlanFormData; budgetItems: BudgetItem[]; resPersons?: string[]; selectedAnnouncements?: string[]; eventSubject?: string }) => {
            const { formData, budgetItems, resPersons, selectedAnnouncements, eventSubject } = args;
            const { staff, ...restFormData } = formData;

            const payload: any = {
                ...restFormData,
                dev_project: restFormData.dev_project, // Keep as text
                dev_activity: restFormData.dev_activity || null, // Keep as JSON string
                dev_res_person: JSON.stringify(resPersons && resPersons.length ? resPersons : (restFormData.dev_res_person ? [restFormData.dev_res_person] : [])),
                dev_indicator: JSON.stringify(restFormData.dev_indicator ? [restFormData.dev_indicator] : []),
                dev_budget_items: JSON.stringify(
                    budgetItems
                        .filter(item => item.name && item.name.trim() !== "")
                        .map((item) => ({
                            name: item.name.trim(),
                            quantity: Number(item.quantity || "0"),
                            price: Number(item.price || "0"),
                        }))
                ),
                staff: staff || null,
            };
            
            // Add announcement fields if provided
            if (selectedAnnouncements && selectedAnnouncements.length > 0) {
                payload.selectedAnnouncements = selectedAnnouncements;
            }
            if (eventSubject) {
                payload.eventSubject = eventSubject;
            }
            
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
                dev_budget_items: JSON.stringify(
                    budgetItems
                        .filter(item => item.name && item.name.trim() !== "")
                        .map((item) => ({
                            name: item.name.trim(),
                            quantity: Number(item.quantity || "0"),
                            price: Number(item.price || "0"),
                        }))
                ),
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

// Archive queries
export const useGetArchivedAnnualDevPlans = (page?: number, pageSize?: number, search?: string, ordering?: string) => {
    return useQuery({
        queryKey: ["archivedAnnualDevPlans", page, pageSize, search, ordering],
        queryFn: async () => {
            return await getArchivedAnnualDevPlans(search, page, pageSize, ordering);
        },
    });
};

export const useArchiveAnnualDevPlans = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (devIds: number[]) => {
            return await archiveAnnualDevPlans(devIds);
        },
        onSuccess: () => {
            // Invalidate and refetch queries to update the data
            queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
            queryClient.invalidateQueries({ queryKey: ["archivedAnnualDevPlans"] });
        },
    });
};

export const useRestoreAnnualDevPlans = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (devIds: number[]) => {
            return await restoreAnnualDevPlans(devIds);
        },
        onSuccess: () => {
            // Invalidate and refetch queries to update the data
            queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
            queryClient.invalidateQueries({ queryKey: ["archivedAnnualDevPlans"] });
        },
    });
};

export const useDeleteAnnualDevPlans = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (devIds: number[]) => {
            return await deleteAnnualDevPlans(devIds);
        },
        onSuccess: () => {
            // Invalidate and refetch queries to update the data
            queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
            queryClient.invalidateQueries({ queryKey: ["archivedAnnualDevPlans"] });
        },
    });
};