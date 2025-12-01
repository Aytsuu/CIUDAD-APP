import React from "react";
import { useLocation } from "react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Edit3, User, Calendar } from "lucide-react";

function computeChanges(oldObj: any, newObj: any) {
  if (!oldObj || !newObj) return [] as Array<{ field: string; previous: any; current: any }>;
  const fields = Array.from(new Set([ ...Object.keys(oldObj || {}), ...Object.keys(newObj || {}) ]));
  return fields
    .filter((f) => (oldObj?.[f] ?? null) !== (newObj?.[f] ?? null))
    .map((f) => ({ field: f, previous: oldObj?.[f] ?? null, current: newObj?.[f] ?? null }));
}

export default function PatientHistoryView() {
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const oldData = React.useMemo(() => params?.oldData, [params]);
  const newData = React.useMemo(() => params?.newData, [params]);

  const changes = React.useMemo(() => computeChanges(oldData, newData), [oldData, newData]);
  const totalChanges = changes.length;

  const ChangeItem = ({ change }: { change: { field: string; previous: any; current: any } }) => (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-medium text-gray-600 min-w-[120px] break-all">{change.field}:</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 truncate max-w-[40%]">
          {String(change.previous ?? 'Not set')}
        </span>
        <ArrowRight className="h-3 w-3 text-gray-400" />
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 truncate max-w-[40%]">
          {String(change.current ?? 'Not set')}
        </span>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-blue-600" />
            <h1 className="text-lg font-bold">Patient Update Comparison</h1>
          </div>
          <Badge variant={totalChanges > 0 ? 'default' : 'secondary'}>
            {totalChanges} change{totalChanges !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{newData?.history_user_name ?? 'Unknown user'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{newData?.history_date ?? 'Unknown date'}</span>
          </div>
        </div>

        <Separator />

        {totalChanges > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Changes Detected</h2>
            <Card className="p-3 border-l-4 border-l-blue-500">
              <div className="space-y-2">
                {changes.map((c) => (
                  <ChangeItem key={c.field} change={c} />
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-xs text-gray-600">No changes detected for this update.</div>
        )}
      </div>
    </Card>
  );
}
