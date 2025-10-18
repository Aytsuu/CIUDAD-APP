import { useState, useEffect } from "react";
import InactiveBudgetPlan from "./inactiveBudgetPlan";
import ActiveBudgetPlan from "./activeBudgetPlan";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Archive } from "lucide-react";
import { usegetBudgetPlanActive, usegetBudgetPlanInactive, type BudgetPlanType } from "./queries/budgetplanFetchQueries";

export default function BudgetPlan() {
  const [activeTab, setActiveTab] = useState("active");
  const [deletedPlanYear, setDeletedPlanYear] = useState<string | null>(null);
  const currentYear = new Date().getFullYear().toString();

  const { data: activePlansData } = usegetBudgetPlanActive(1, 100, "");
  const { data: inactivePlansData } = usegetBudgetPlanInactive(1, 100, "");

  const activePlans = activePlansData?.results || [];
  const inactivePlans = inactivePlansData?.results || [];
  const allPlans = [...activePlans, ...inactivePlans];
  const currentYearPlanExists = allPlans.some((plan: BudgetPlanType) => plan.plan_year === currentYear);
  const isCurrentYearDeleted = deletedPlanYear === currentYear;
  const showAddButton = !currentYearPlanExists || isCurrentYearDeleted;

  useEffect(() => {
    if (deletedPlanYear) {
      const timer = setTimeout(() => {
        setDeletedPlanYear(null);
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [deletedPlanYear]);

  return (
    <div>
      <div className="w-full h-full">
        <div className="flex flex-col gap-3 mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
            <div>Budget Plan</div>
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Efficiently oversee and allocate your budget to optimize financial planning and sustainability.
          </p>
        </div>
        <hr className="border-gray mb-7 sm:mb-9" />
      </div>

      <div className="bg-white p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="pt-4">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="active">Active Plans</TabsTrigger>
              <TabsTrigger value="archive">
                <div className="flex items-center gap-2">
                  <Archive size={16} />
                  Archive
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Active Plans Tab */}
          <TabsContent value="active">
            <ActiveBudgetPlan 
              deletedPlanYear={deletedPlanYear}
              showAddButton={showAddButton}
            />
          </TabsContent>

          {/* Archive Plans Tab */}
          <TabsContent value="archive">
            <InactiveBudgetPlan 
              deletedPlanYear={deletedPlanYear}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}