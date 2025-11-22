import { Card } from "@/components/ui/card";
import { ChevronRight, Calendar, User, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { useGetCurrentYearBudgetPlan } from "./budgetplan-analytics-queries";
import { Link } from "react-router";

export const BudgetPlanSidebar = () => {
  const navigate = useNavigate();
  const { data: budgetPlan, isLoading, isFetching } = useGetCurrentYearBudgetPlan();

  const handleViewAll = () => {
    navigate("/treasurer-budget-plan"); 
  };

  const hasActiveBudgetPlan = budgetPlan && 
                             !budgetPlan.plan_is_archive && 
                             budgetPlan.plan_id;

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      <div className="flex-1 overflow-y-auto">
        {isLoading || isFetching ? (
          <div className="p-4 space-y-3">
            {[...Array(1)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !hasActiveBudgetPlan ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">
              No Budget Plan for This Year
            </h3>
            <p className="text-sm text-gray-500">
              Budget plan for {new Date().getFullYear()} will appear here once created
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <Link to="/treasurer-budgetplan-view" state={{ type: "viewing", planId: budgetPlan.plan_id }}>
              <Card className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200">
                 <div className="flex items-start justify-between">
                   <div className="flex items-start gap-3 flex-1 min-w-0">
                     <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                       <FileText className="w-4 h-4 text-green-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between mb-2">
                         <h3 className="text-sm font-medium text-gray-700 line-clamp-2">
                           Budget Plan {budgetPlan.plan_year}
                         </h3>
                       </div>

                       <div className="space-y-1 text-xs text-gray-500">
                         {/* Year */}
                         <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3" />
                           <span>Year: {budgetPlan.plan_year}</span>
                         </div>

                         {/* Issue Date */}
                         <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3" />
                           <span>
                             {budgetPlan.plan_issue_date
                              ? new Date(budgetPlan.plan_issue_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "Not specified"}
                          </span>
                        </div>

                        {/* Prepared By */}
                        {budgetPlan.staff_name && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            <span className="truncate">
                              Prepared by: {budgetPlan.staff_name}
                            </span>
                          </div>
                        )}

                        {/* Budgetary Obligations */}
                        <div className="flex items-center gap-2 text-blue-500 font-medium">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            Budgetary Obligations: ₱{budgetPlan.plan_budgetaryObligations?.toLocaleString()}
                          </span>
                        </div>

                        {/* Balance Unappropriated */}
                        <div className="flex items-center gap-2 text-green-500 font-medium">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            Balance Unappropriated: ₱{budgetPlan.plan_balUnappropriated?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          </div>
        )}
      </div>

      {/* Footer - Only show if there's an active budget plan */}
      {hasActiveBudgetPlan && (
        <div className="p-4 border-t border-gray-100">
          <Button
            variant={"link"}
            onClick={handleViewAll}
            className="text-blue-500 hover:text-blue-700"
          >
            View All Budget Plans
          </Button>
        </div>
      )}
    </Card>
  );
};