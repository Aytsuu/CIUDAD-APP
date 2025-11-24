import { useGetComplaint } from "@/pages/record/complaint/api-operations/queries/complaintGetQueries";
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function ComplaintSidebar() {
  const { data: complaints, isLoading, error } = useGetComplaint();
  const previousDataRef = useRef<string | null>(null);

  // Detect changes in complaint data
  useEffect(() => {
    if (!complaints) return;

    const currentData = JSON.stringify(complaints);
    const previousData = previousDataRef.current;

    if (previousData && currentData !== previousData) {
      // Data changed - detect what changed
      detectChanges(previousData, currentData);
    }

    previousDataRef.current = currentData;
  }, [complaints]);

  const detectChanges = (prevDataJson: string, currentDataJson: string) => {
    const prevData = JSON.parse(prevDataJson);
    const currData = JSON.parse(currentDataJson);

    // Detect deletions
    prevData.forEach((prevComplaint: any) => {
      const exists = currData.find((c: any) => c.id === prevComplaint.id);
      if (!exists) {
        console.log("DELETED:", prevComplaint);
        // Trigger notification, animation, etc.
      }
    });

    // Detect additions and updates
    currData.forEach((currComplaint: any) => {
      const prevComplaint = prevData.find((c: any) => c.id === currComplaint.id);

      if (!prevComplaint) {
        console.log("ADDED:", currComplaint);
        // Trigger notification, animation, etc.
      } else if (JSON.stringify(prevComplaint) !== JSON.stringify(currComplaint)) {
        console.log("UPDATED:", {
          before: prevComplaint,
          after: currComplaint,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error</h3>
          <p className="text-sm text-red-700">Failed to fetch complaints</p>
        </div>
      </div>
    );
  }

  const pendingComplaints = complaints
    ?.filter(
      (complaint: any) => complaint.comp_status?.toLowerCase() === "pending"
    )
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {pendingComplaints && pendingComplaints.length > 0 ? (
          <div className="divide-y">
            {pendingComplaints.map((complaint: any) => (
              <div
                key={complaint.id}
                className="p-4 hover:bg-blue-50 transition-colors duration-200 cursor-pointer group border-l-4 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm group-hover:text-blue-700 truncate">
                      {complaint.comp_incident_type || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {complaint.complainant?.[0]?.cpnt_name || "Unknown Complainant"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <CheckCircle className="w-12 h-12 text-green-400 mb-3 opacity-50" />
            <p className="text-sm font-medium">No pending complaints</p>
            <p className="text-xs text-gray-400 mt-1">Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
}