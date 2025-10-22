//// filepath: /c:/CIUDAD-APP/web/src/pages/healthServices/childservices/forms/multi-step-form/followupPending.tsx
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select/select";
import { Clock, Calendar, Loader2 } from "lucide-react";
import { useChildNotesFollowup } from "../queries/fetchQueries";

interface PendingFollowupsSectionProps {
  chrecId: string;
  pendingStatuses: Record<number, string>;
  onFollowupChange: (followvId: number, newStatus: string) => void;
}

export function PendingFollowupsSection({ chrecId, pendingStatuses, onFollowupChange }: PendingFollowupsSectionProps) {
  const { data: notesFollowupData, isLoading: isNotesFollowupLoading } = useChildNotesFollowup(chrecId);
  const pendingFollowupsData = notesFollowupData as any;

  if (isNotesFollowupLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
        <span className="text-sm text-gray-600">Loading followups...</span>
      </div>
    );
  }

  if (!pendingFollowupsData?.pending_followups?.length) {
    return <></>;
  }

  return (
    <div className="border rounded-lg bg-white">
      <div className="border-b bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Follow-up Visits</span>
          <Badge variant="secondary" className="ml-auto">
            {pendingFollowupsData.count}
          </Badge>
        </div>
      </div>

      <div className="divide-y">
        {pendingFollowupsData.pending_followups.map((followup: any) => {
          // Use parent's pending status if set, otherwise use the original
          const currentStatus = pendingStatuses[followup.followv_id] ?? followup.followv_status;
          return (
            <div key={followup.followv_id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {followup.followv_description}
                    </h4>
                    <Badge className="text-xs bg-gray-100 text-gray-800">
                      {currentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due: {new Date(followup.followv_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Select
                    value={currentStatus}
                    onValueChange={(value) => onFollowupChange(followup.followv_id, value)}
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}