import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWeekNumber, getMonthName } from "@/helpers/dateHelper";
import { Clock, FileText } from "lucide-react";

export default function RecentWeeklyAR({
  recentReports
} : {
  recentReports: Record<string, any>[]
}) {
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
              className="p-3 bg-muted/20 rounded-lg border hover:bg-muted/40 transition-colors"
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
              <div className="space-y-1">
                {report.war_composition
                  .slice(0, 2)
                  .map((comp: any, compIndex: number) => (
                    <div key={`recent-comp-${compIndex}`} className="text-xs">
                      <span className="font-mono text-primary">
                        {comp.ar.id}
                      </span>
                      {comp.ar.ar_status && (
                        <Badge
                          variant={
                            comp.ar.status === "Signed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs ml-2 h-4"
                        >
                          {comp.ar.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                {report.war_composition.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{report.war_composition.length - 2} more
                  </div>
                )}
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
