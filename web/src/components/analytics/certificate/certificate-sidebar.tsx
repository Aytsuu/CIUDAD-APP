import { useGetCertificateCardAnalytics } from "./certificate-analytics-queries";
import { Card } from "@/components/ui/card";
import { Clock, ChevronRight, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router";
import { formatTimeAgo } from "@/helpers/dateHelper";

export const CertificateSidebar = () => {
  const navigate = useNavigate();
  const { data: certificateData, isLoading } = useGetCertificateCardAnalytics();

  const formatName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleClick = (data: any) => {
    navigate("/treasurer-personal-and-others", {
      state: {
        searchParams: {
          search: data.cr_id
        }
      }
    });
  };

  const recentRequests = certificateData?.recent_requests || [];

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
        ) : recentRequests.length > 0 ? (
          <div className="p-4 space-y-3">
            {recentRequests.map((request: any, index: number) => (
              <Card
                key={request.cr_id || index}
                className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                onClick={() => handleClick(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-700 truncate mb-1">
                        {formatName(
                          request?.rp_id__per__per_fname || 'Unknown',
                          request?.rp_id__per__per_lname || 'User'
                        )}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(request.cr_req_request_date)}
                        </span>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${getStatusColor(request.cr_req_status)}`}>
                          {getStatusIcon(request.cr_req_status)}
                          {request.cr_req_status}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Purpose:</span> {request.pr_id__pr_purpose || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">
              No recent requests
            </h3>
            <p className="text-sm text-gray-500">
              Certificate requests recently submitted will appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {recentRequests.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/treasurer-personal-and-others">
            <Button variant={"link"}>
              View All Requests ({recentRequests.length > 100 ? "100+" : recentRequests.length})
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};
