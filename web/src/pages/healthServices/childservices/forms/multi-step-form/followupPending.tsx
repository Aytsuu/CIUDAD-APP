import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Clock, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { useChildNotesFollowup } from "../queries/fetchQueries";
import { useUpdateFollowupStatus } from "../queries/update";

export function PendingFollowupsSection({ chrecId }: { chrecId: string }) {
  const { data: notesFollowupData, isLoading: isNotesFollowupLoading, refetch } = useChildNotesFollowup(chrecId || "");
  const updateFollowupMutation = useUpdateFollowupStatus();
  const [completingFollowup, setCompletingFollowup] = useState<number | null>(null);

  const pendingFollowupsData = notesFollowupData as any;

  const handleStatusChange = async (followvId: number, newStatus: string) => {
    setCompletingFollowup(followvId);
    try {
      await updateFollowupMutation.mutateAsync({
        followv_id: followvId.toString(),
        status: newStatus
      });
      await refetch();
    } catch (error) {
      console.error("Error updating followup status:", error);
    } finally {
      setCompletingFollowup(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        {pendingFollowupsData.pending_followups.map((followup: any) => (
          <div key={followup.followv_id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{followup.followv_description}</h4>
                  <Badge className={`text-xs ${getStatusColor(followup.followv_status)}`}>{followup.followv_status}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(followup.followv_date).toLocaleDateString()}</span>
                  </div>
                  {/*                   
                  {followup.notes_count > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{followup.notes_count} notes</span>
                    </div>
                  )} */}
                </div>
                {/* 
                {followup.child_health_notes.length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="text-gray-700 font-medium mb-1">Notes:</div>
                    {followup.child_health_notes.map((note: any) => (
                      <div key={note.chnotes_id} className="text-gray-600">
                        {note.ch_notes}
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>

              <div className="flex-shrink-0">
                <Select value={followup.followv_status} onValueChange={(value) => handleStatusChange(followup.followv_id, value)} disabled={completingFollowup === followup.followv_id}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
                {completingFollowup === followup.followv_id && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
