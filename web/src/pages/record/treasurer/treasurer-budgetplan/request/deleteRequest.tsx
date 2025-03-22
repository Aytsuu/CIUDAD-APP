import api from "@/api/api";

export const deleteBudgetPlan = async (plan_id: number, setBudgetPlans: React.Dispatch<React.SetStateAction<any[]>>) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this budget plan?"); 
    if (isConfirmed) {
        try {
            await api.delete(`/treasurer/budget-plan/${plan_id}/`);
            setBudgetPlans((prev) => prev.filter((plan) => plan.plan_id !== plan_id));
            console.log("Budget plan deleted successfully");
        } catch (error) {
            console.error("Failed to delete budget plan:", error);
        }
    }
};