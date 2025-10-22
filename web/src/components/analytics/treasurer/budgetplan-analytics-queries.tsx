    import { useQuery } from "@tanstack/react-query";
    import api from "@/api/api";

    export type CurrentYearPlan = {
        plan_id: number;
        plan_year: string;
        plan_budgetaryObligations: number;
        plan_balUnappropriated: number;
        plan_issue_date: string;
        staff_name?: string;
    }

    export const useGetCurrentYearBudgetPlan = () => {
        return useQuery<CurrentYearPlan>({
            queryKey: ["activeBudgetPlan"], 
            queryFn: async () => {
                const response = await api.get('treasurer/budget-plan-analytics/');
                return response.data;
            },
            staleTime: 1000 * 60 * 30,
        });
    }