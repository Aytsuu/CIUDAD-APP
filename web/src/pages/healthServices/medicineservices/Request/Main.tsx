import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, XCircle, ArrowRightLeft, Ban } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useReportsCount } from "../../count-return/count";

export default function MedicineRequestMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedView, setSelectedView] = useState<string>("pickup");
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useReportsCount();

  // Get current view from URL path
  const getCurrentViewFromPath = () => {
    const pathSegments = location.pathname.split("/");
    
    // Find the segment after "requests" in the path
    const requestsIndex = pathSegments.indexOf("requests");
    if (requestsIndex !== -1 && requestsIndex + 1 < pathSegments.length) {
      const viewSegment = pathSegments[requestsIndex + 1];
      if (["pickup", "pending", "completed", "cancelled", "referred", "rejected"].includes(viewSegment)) {
        return viewSegment;
      }
    }
    
    // Default to pickup if no valid segment found
    return "pickup";
  };

  useEffect(() => {
    setIsMounted(true);
    setSelectedView(getCurrentViewFromPath());
  }, []);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSelectedView(value);
    navigate(value, { replace: true });
    localStorage.setItem("medicineRequestView", value);
  };

  // Update selected view when URL changes
  useEffect(() => {
    if (isMounted) {
      setSelectedView(getCurrentViewFromPath());
    }
  }, [location.pathname, isMounted]);

  if (!isMounted) {
    return (
      <MainLayoutComponent title="Medicine Requests" description="Manage and process medicine requests efficiently.">
        <div className="p-4">Loading...</div>
      </MainLayoutComponent>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-0">
        <Tabs value={selectedView} onValueChange={handleTabChange} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-6 gap-2 h-auto p-1">
              {/* For Pick Up Tab */}
              <TabsTrigger value="pickup" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <ClipboardList className="h-4 w-4" />
                <span>For Pick Up</span>
                {isLoading ? (
                  <span className="ml-2 text-xs font-semibold text-gray-500">...</span>
                ) : data?.data?.medrequest_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">
                    {data.data?.medrequest_count}
                  </span>
                )}
              </TabsTrigger>
              
              {/* Pending Confirmation Tab */}
              <TabsTrigger value="pending" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Clock className="h-4 w-4" />
                <span>Pending</span>
                {isLoading ? (
                  <span className="ml-2 text-xs font-semibold text-gray-500">...</span>
                ) : data?.data?.apprequest_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-yellow-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">
                    {data.data?.apprequest_count}
                  </span>
                )}
              </TabsTrigger>

              {/* Completed Tab */}
              <TabsTrigger value="completed" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed</span>
                {isLoading ? (
                  <span className="ml-2 text-xs font-semibold text-gray-500">...</span>
                ) : data?.data?.completed_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-green-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">
                    {data.data?.completed_count}
                  </span>
                )}
              </TabsTrigger>

              {/* Cancelled Tab */}
              <TabsTrigger value="cancelled" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <XCircle className="h-4 w-4" />
                <span>Cancelled</span>
                {isLoading ? (
                  <span className="ml-2 text-xs font-semibold text-gray-500">...</span>
                ) : data?.data?.cancelled_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">
                    {data.data?.cancelled_count}
                  </span>
                )}
              </TabsTrigger>

              {/* Referred Tab */}
              <TabsTrigger value="referred" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <ArrowRightLeft className="h-4 w-4" />
                <span>Referred</span>
                {isLoading ? (
                  <span className="ml-2 text-xs font-semibold text-gray-500">...</span>
                ) : data?.data?.referred_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-blue-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">
                    {data.data?.referred_count}
                  </span>
                )}
              </TabsTrigger>

              {/* Rejected Tab */}
              <TabsTrigger value="rejected" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Ban className="h-4 w-4" />
                <span>Rejected</span>
                {isLoading ? (
                  <span className="ml-2 text-xs font-semibold text-gray-500">...</span>
                ) : data?.data?.rejected_count > 0 && (
                  <span className="ml-2 text-xs font-semibold text-white bg-gray-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">
                    {data.data?.rejected_count}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4 pt-6">
            {/* Render nested route component */}
            <Outlet />
          </CardContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}