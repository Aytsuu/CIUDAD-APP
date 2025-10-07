import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useFirstAidChart } from "@/pages/healthServices/reports/firstaid-report/queries/fetch";
import { useState } from "react";
import { FaFirstAid } from "react-icons/fa";
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

export function FirstAidDistributionSidebar() {
  const initialMonth = format(new Date(), "yyyy-MM");
  const { data, isLoading, error } = useFirstAidChart(initialMonth);
  // const currentDate = parseISO(`${initialMonth}-01`);
  const [showAll, setShowAll] = useState(false);

  // Transform and sort data with proper null checks
  const allFirstAidItems = data?.first_aid_counts
    ? Object.entries(data.first_aid_counts)
        .filter(([name]) => name !== "null" && name !== "undefined")
        .map(([name, count]) => ({ name, count: Number(count) || 0 }))
        .sort((a, b) => b.count - a.count)
    : [];

  // Determine which items to show
  const itemsToShow = showAll ? allFirstAidItems : allFirstAidItems.slice(0, 10);
  const totalItems = allFirstAidItems.length;
  const totalUses = allFirstAidItems.reduce((sum, item) => sum + item.count, 0);

  if (error) {
    return (
      <Card className="rounded-lg shadow-sm border-0">
        <CardContent className="pt-4">
          <Alert variant="destructive" className="border-red-100 bg-red-50">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Failed to load first aid distribution data. Please try again later.</AlertDescription>
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
        ) : !data?.success || allFirstAidItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <FaFirstAid className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">No first aid distribution data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              {itemsToShow.map((item, index) => {
                const color = COLORS[index % COLORS.length];
                const percentage = ((item.count / totalUses) * 100).toFixed(1);

                return (
                  <Link to="/inventory/stocks">
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: color }}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.count} total</p>
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

            {totalItems > 10 && (
              <div className="text-center pt-4">
                <button onClick={() => setShowAll(!showAll)} className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
                  {showAll ? "Show Less" : `View All ${totalItems} Items`}
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
