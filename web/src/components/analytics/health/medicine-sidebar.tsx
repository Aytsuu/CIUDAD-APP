import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Pill, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { useMedicineChart } from "@/pages/healthServices/reports/medicine-report/queries/fetchQueries";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";

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

export function MedicineDistributionSidebar() {
  const initialMonth = format(new Date(), "yyyy-MM");
  const { data, isLoading, error } = useMedicineChart(initialMonth);
  const [showAll] = useState(false);

  // Transform and sort data
  const allMedicines = data?.medicine_counts
    ? Object.entries(data.medicine_counts as Record<string, number>)
        .filter(([name]) => name !== "null")
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count) // Sort by count descending
    : [];

  // Determine which medicines to show
  const medicinesToShow = showAll ? allMedicines : allMedicines.slice(0, 10);
  const totalDoses = allMedicines.reduce((sum, item) => sum + item.count, 0);

  // Common link state for all medicine cards and "View More" button
  const getLinkState = (medicineName?: string, itemCount?: number) => ({
    medicineName: medicineName || "",
    itemCount: itemCount || totalDoses,
    monthlyrcplist_id: data?.monthly_report_id,
    month: initialMonth,
    monthName: format(new Date(initialMonth + "-01"), "MMMM yyyy")
  });

  if (error) {
    return (
      <Card className="rounded-lg shadow-sm border-0">
        <CardHeader className="border-b border-gray-100 pb-3">
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="destructive" className="border-red-100 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Failed to load medicine distribution data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-md shadow-none">
      <CardContent className="pt-4">
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
        ) : !data || allMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Pill className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">No medicine administration data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              {medicinesToShow.map((medicine, index) => {
                const color = COLORS[index % COLORS.length];
                const percentage = ((medicine.count / totalDoses) * 100).toFixed(1);

                return (
                  <Link
                    key={medicine.name}
                    to="/reports/monthly-medicine/records"
                    state={getLinkState(medicine.name, medicine.count)}
                  >
                    <div className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{medicine.name}</p>
                          <p className="text-xs text-muted-foreground">{medicine.count} records</p>
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

              

            {/* View More Button - Always visible when data exists */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <Link to="/reports/monthly-medicine/records" state={getLinkState()}>
                <Button 
                  variant="link" 
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium"
                >
                  View Monthly Requested Medicines
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}