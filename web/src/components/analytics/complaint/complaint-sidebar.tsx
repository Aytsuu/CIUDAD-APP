import { useGetComplaint } from "@/pages/record/complaint/api-operations/queries/complaintGetQueries";
import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, ChevronRight, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router";
import { formatTimeAgo } from "@/helpers/dateHelper";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

export default function ComplaintSidebar() {
  const navigate = useNavigate();
  const { data: complaints, isLoading, error } = useGetComplaint();
  const previousDataRef = useRef<string | null>(null);

  // Detect changes in complaint data
  useEffect(() => {
    if (!complaints) return;

    const currentData = JSON.stringify(complaints);
    const previousData = previousDataRef.current;

    if (previousData && currentData !== previousData) {
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
      }
    });

    // Detect additions and updates
    currData.forEach((currComplaint: any) => {
      const prevComplaint = prevData.find((c: any) => c.id === currComplaint.id);

      if (!prevComplaint) {
        console.log("ADDED:", currComplaint);
      } else if (JSON.stringify(prevComplaint) !== JSON.stringify(currComplaint)) {
        console.log("UPDATED:", {
          before: prevComplaint,
          after: currComplaint,
        });
      }
    });
  };

  const handleClick = (complaint: any) => {
    navigate("/complaint/view/", {
      state: {
        params: {
          title: "Complaint Details",
          description: "Review the complaint details and take appropriate action.",
          data: complaint,
        },
      },
    });
  };

  const pendingComplaints = complaints
    ?.filter((complaint: any) => complaint.comp_status?.toLowerCase() === "pending")
    .slice(0, 3);

  const totalPending = complaints?.filter(
    (complaint: any) => complaint.comp_status?.toLowerCase() === "pending"
  ).length || 0;

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
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
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 text-sm">Error</h3>
                <p className="text-sm text-red-700">Failed to fetch complaints</p>
              </div>
            </div>
          </div>
        ) : totalPending > 0 ? (
          <div className="p-4 space-y-3">
            {pendingComplaints.map((complaint: any, index: number) => (
              <Card
                key={complaint.id || index}
                className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                onClick={() => handleClick(complaint)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-14">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-700 truncate mb-1">
                        {complaint.comp_incident_type || "Unknown Incident Type"}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatTimeAgo(complaint.created_at || complaint.comp_created_at)}</span>
                        <p className="text-orange-500 font-semibold">
                          Pending Complaint
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 truncate">
                        Complainant: {complaint.complainant?.[0]?.cpnt_name || "Unknown"}
                      </p>
                    </div>

                    {complaint.complainant?.length > 1 && (
                      <TooltipLayout 
                        trigger={
                          <div className="flex gap-1">
                            <UsersRound size={18} className="text-blue-600"/>
                            <p className="text-sm font-medium text-blue-700">+{complaint.complainant.length - 1}</p>
                          </div>
                        }
                        content={`Complaint with ${complaint.complainant.length} complainants`}
                      />
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No pending complaints
            </h3>
            <p className="text-sm text-gray-500">
              Pending complaints will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalPending > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/complaint/request">
            <Button variant={"link"}>
              View All Complaints ({totalPending > 100 ? "100+" : totalPending})
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}