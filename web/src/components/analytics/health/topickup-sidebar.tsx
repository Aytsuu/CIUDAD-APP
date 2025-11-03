import { Card } from "@/components/ui/card";
import { ChevronRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router-dom";
import { useProcessingMedrequest } from "@/pages/healthServices/medicineservices/Request/queries/fetch";
export const ToPickupMedicineRequestsSidebar = () => {
  const navigate = useNavigate();

  const { data: apiResponse, isLoading } = useProcessingMedrequest();

  const requests = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;

  const formatName = (firstName: string, middleName: string | null, lastName: string) => {
    const middle = middleName && middleName.trim() ? `${middleName[0].toUpperCase()}.` : "";
    return `${firstName.trim()} ${middle} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
  };

  const calculateDaysPending = (requestedDate: string) => {
    const requested = new Date(requestedDate);
    const now = new Date();

    // Check if the requested date is today
    const isToday =
      requested.getDate() === now.getDate() &&
      requested.getMonth() === now.getMonth() &&
      requested.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const diffTime = Math.abs(now.getTime() - requested.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleClick = (request: any) => {
    // const address = request.address || {};
    navigate("/request/medicine/pending-pickup", {
      state: {
        params: {
          request,
          patientData: {
            pat_type: request.pat_type,
            age: request.age,
            addressFull: request.address?.full_address || "No address provided",
            address: request.address
              ? {
                  add_street: request.address.add_street,
                  add_barangay: request.address.add_barangay,
                  add_city: request.address.add_city,
                  add_province: request.address.add_province,
                  add_sitio: request.address.add_sitio,
                }
              : {},
            households: [{ hh_id: request.householdno }],
            personal_info: {
              per_fname: request.personal_info?.per_fname,
              per_mname: request.personal_info?.per_mname,
              per_lname: request.personal_info?.per_lname,
              per_dob: request.personal_info?.per_dob,
              per_sex: request.personal_info?.per_sex,
            },
          },
        },
      },
    });
  };

  // Display only first 5 requests
  const displayedRequests = requests.slice(0, 5);

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
        ) : displayedRequests.length > 0 ? (
          <div className="p-4 space-y-3">
            {displayedRequests.map((request: any) => (
              <Card
                key={request.medreq_id}
                className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                onClick={() => handleClick(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-14">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-700 truncate">
                          {formatName(request.personal_info?.per_fname || "Unknown", request.personal_info?.per_mname || "", request.personal_info?.per_lname || "")}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{calculateDaysPending(request.requested_at)}</span>
                        <p className="text-green-500 font-semibold">To Pickup</p>
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
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Pill className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">No requests to pickup</h3>
            <p className="text-sm text-gray-500">Medicine requests ready for pickup will appear here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalCount > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/services/medicine/requests/pickup">
            <Button variant="link">
              View All Requests ({totalCount > 100 ? "100+" : totalCount}){totalCount > 5 && <span className="ml-1 text-gray-400">• Showing 5 of {totalCount}</span>}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};
