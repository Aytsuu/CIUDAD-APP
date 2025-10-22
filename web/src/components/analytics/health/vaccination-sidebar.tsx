import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Syringe, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import {useVaccinationChart } from "./queries/chart";

import { useState } from "react";
import { Link } from "react-router";

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#64748b" // Slate
];

export function VaccinationDistributionSidebar() {
  const initialMonth = format(new Date(), "yyyy-MM");
  const { data, isLoading, error } = useVaccinationChart(initialMonth);
  const [showAll, setShowAll] = useState(false);

  // Transform and sort data
  const allVaccines = data?.vaccine_counts
    ? Object.entries(data.vaccine_counts as Record<string, number>)
        .filter(([name]) => name !== "null")
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count) // Sort by count descending
    : [];

  // Determine which vaccines to show
  const vaccinesToShow = showAll ? allVaccines : allVaccines.slice(0, 10);
  const totalVaccines = allVaccines.length;
  const totalDoses = allVaccines.reduce((sum, item) => sum + item.count, 0);

  if (error) {
    return (
      <Card className="rounded-lg shadow-sm border-0">
        <CardHeader className="border-b border-gray-100 pb-3">
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="destructive" className="border-red-100 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Failed to load vaccination distribution data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-md shadow-none">
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !data || allVaccines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[300px] ">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Syringe className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">No vaccination administration data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              {vaccinesToShow.map((vaccine, index) => {
                const color = COLORS[index % COLORS.length];
                const percentage = ((vaccine.count / totalDoses) * 100).toFixed(1);

                return (
                  <Link
                    to="/reports/monthly-vaccination/records"
                    state={{
                      vaccineName: vaccine.name,
                      itemCount: vaccine.count,
                      month: initialMonth,
                      monthName: format(new Date(initialMonth + "-01"), "MMMM yyyy")
                      // You can add any other relevant data here
                    }}
                    key={vaccine.name}
                  >
                    <div className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{vaccine.name}</p>
                          <p className="text-xs text-muted-foreground">{vaccine.count} records</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalVaccines > 10 && (
              <div className="text-center pt-4">
                <button onClick={() => setShowAll(!showAll)} className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
                  {showAll ? "Show Less" : `View All ${totalVaccines} Vaccines`}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}