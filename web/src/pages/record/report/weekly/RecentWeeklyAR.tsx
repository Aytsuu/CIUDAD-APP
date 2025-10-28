import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeekNumber, getMonthName, getRangeOfDaysInWeek } from "@/helpers/dateHelper";
import { Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router";

export default function RecentWeeklyAR({
  recentReports,
}: {
  recentReports: Record<string, any>[];
}) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          Recent Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentReports.length > 0 ? (
          recentReports.map((report, index) => (
            <div
              key={`recent-${report.id}-${index}`}
              className="p-3 bg-muted/20 rounded-lg border hover:bg-muted transition-all cursor-pointer hover:shadow-md"
              onClick={() => {
                navigate("/report/acknowledgement/document", {
                  state: {
                    params: {
                      type: "WAR",
                      data: {
                        ...report,
                        reportPeriod: getRangeOfDaysInWeek(
                          getWeekNumber(report.created_for),
                          getMonthName(report.created_for),
                          new Date().getFullYear()
                        ),
                      },
                    },
                  },
                });
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Week {getWeekNumber(report.created_for)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {report.war_composition.length}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                report for: {getMonthName(report.created_for)} •{" "}
                {new Date(report.created_for).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                created: {getMonthName(report.created_at)} •{" "}
                {new Date(report.created_at).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <p className="text-xs">composed of:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {report.war_composition
                    .slice(0, 2)
                    .map((comp: any, compIndex: number) => (
                      <div key={`recent-comp-${compIndex}`} className="text-xs">
                        <span className="font-mono text-primary">
                          AR-{comp.ar.id}
                        </span>
                      </div>
                    ))}
                  {report.war_composition.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{report.war_composition.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent reports</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
