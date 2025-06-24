import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { AlertTriangle } from "lucide-react";

export default function MissedWeeklyAR() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Missed Weekly Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No missed reports</p>
          <p className="text-xs text-muted-foreground mt-1">
            All weeks are up to date
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
