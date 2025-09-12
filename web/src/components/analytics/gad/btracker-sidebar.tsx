import { Card } from "@/components/ui/card";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { useLatestExpenses, useLatestIncomes } from "./btracker-analytics-queries";
import type { GADBudgetEntryUI } from "@/pages/record/gad/budget-tracker/queries/BTFetchQueries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";

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

  return (
    <Card className="w-80 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-black/10">
        <h2 className="text-lg font-semibold text-black/90">
          Recent Expenses
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <div className="animate-pulse">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-black/20 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="p-4 space-y-3">
            {expenses.slice(0, 2).map((expense) => (
              <DialogLayout
                key={expense.gbud_num}
                trigger={
                  <Card 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate mb-1">
                          {formatParticulars(expense.gbud_particulars)}
                        </h3>
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <span>₱{expense.gbud_amount?.toLocaleString()}</span>
                          <span>{new Date(expense.gbud_datetime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </Card>
                }
                title="Expense Details"
                description={`Entry #${expense.gbud_num}`}
                mainContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Particulars</Label>
                        <p>{formatParticulars(expense.gbud_particulars)}</p>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <p>₱{expense.gbud_amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label>Date</Label>
                        <p>{new Date(expense.gbud_datetime).toLocaleDateString()}</p>
                      </div>
                      {expense.gbud_reference_num && (
                        <div>
                          <Label>Reference Number</Label>
                          <p>{expense.gbud_reference_num}</p>
                        </div>
                      )}
                    </div>
                    {expense.gbud_add_notes && (
                      <div>
                        <Label>Description</Label>
                        <p className="whitespace-pre-wrap">{expense.gbud_add_notes}</p>
                      </div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Clock className="w-8 h-8 text-black/40 mb-4" />
            <h3 className="text-sm font-medium mb-1">
              No recent expenses
            </h3>
          </div>
        )}
      </div>

      {expenses && expenses.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button onClick={() => navigate(`/gad/gad-budget-tracker-table/${currentYear}/`)}>
            View All
          </Button>
        </div>
      )}
    </Card>
  );
};

