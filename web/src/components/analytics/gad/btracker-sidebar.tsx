import { Card } from "@/components/ui/card";
import { Clock, ChevronRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { useLatestExpenses } from "./btracker-analytics-queries";
import type { GADBudgetEntryUI } from "@/pages/record/gad/budget-tracker/budget-tracker-types";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { formatTimeAgo } from "@/helpers/dateHelper";

export const GADExpenseSidebar = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear().toString();
  const { data: expenses, isLoading } = useLatestExpenses(currentYear);
  const [_selectedExpense, setSelectedExpense] = useState<GADBudgetEntryUI | null>(null);

  // Helper function to format particulars for display
  const formatParticulars = (
    particulars: string | { name: string; pax: string; amount: number }[] | undefined
  ) => {
    if (particulars === undefined || particulars === null) {
      return "N/A";
    }
    if (typeof particulars === "string") {
      return particulars || "N/A";
    }
    if (Array.isArray(particulars)) {
      return particulars.map(item => item.name).join(", ") || "No items";
    }
    return "N/A";
  };

  // Truncate long particulars for display
  const truncateParticulars = (particulars: string, maxLength: number = 40) => {
    if (particulars.length <= maxLength) return particulars;
    return particulars.substring(0, maxLength) + '...';
  };

  const handleExpenseClick = (expense: GADBudgetEntryUI) => {
    setSelectedExpense(expense);
  };

  const handleViewAll = () => {
    navigate(`/gad/gad-budget-tracker-table/${currentYear}/`);
  };

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="p-4 space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <DialogLayout
                key={expense.gbud_num}
                trigger={
                  <Card 
                    className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                    onClick={() => handleExpenseClick(expense)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-700 truncate mb-1">
                            {truncateParticulars(formatParticulars(expense.gbud_particulars))}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-semibold text-red-600">
                              ₱{expense.gbud_amount?.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>{formatTimeAgo(expense.gbud_datetime)}</span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                }
                title="Expense Details"
                description={''}
                mainContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Particulars</Label>
                        <p className="text-sm text-gray-900 mt-1">{formatParticulars(expense.gbud_particulars)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Amount</Label>
                        <p className="text-sm font-semibold text-red-600 mt-1">
                          ₱{expense.gbud_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Date</Label>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(expense.gbud_datetime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      {expense.gbud_reference_num && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Reference Number</Label>
                          <p className="text-sm text-gray-900 mt-1">{expense.gbud_reference_num}</p>
                        </div>
                      )}
                    </div>
                    {expense.gbud_add_notes && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{expense.gbud_add_notes}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-200">
                      <Label className="text-sm font-medium text-gray-700">Entry Information</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-xs text-gray-500">Entry ID</span>
                          <p className="text-sm font-mono text-gray-900">{expense.gbud_num}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Created</span>
                          <p className="text-sm text-gray-900">
                            {formatTimeAgo(expense.gbud_datetime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No recent expenses
            </h3>
            <p className="text-sm text-gray-500">
              Recent GAD budget expenses will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {expenses && expenses.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button 
            variant={"link"} 
            onClick={handleViewAll}
            className="text-blue-600 hover:text-blue-700"
          >
            View All Expenses ({expenses.length > 100 ? "100+" : expenses.length})
          </Button>
        </div>
      )}
    </Card>
  );
};