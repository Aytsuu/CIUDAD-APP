  import { useState, useEffect } from "react";
  import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Outlet, useNavigate, useLocation } from "react-router-dom";
  import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
  import { useAuth } from "@/context/AuthContext";
  import { ProtectedComponentButton } from "@/ProtectedComponentButton";
  import { useReportsCount } from "../count-return/count";

  export default function MainMedicine() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { data, isLoading } = useReportsCount();

    // Get current view from URL path - FIXED VERSION
    const getCurrentViewFromPath = () => {
      const pathSegments = location.pathname.split("/");
      
      // Check if we're in the requests section (any path that contains "requests")
      const isInRequestsSection = pathSegments.includes("requests");
      
      if (isInRequestsSection) {
        return "requests";
      }
      
      // Otherwise, we're in records
      return "records";
    };

    const [selectedView, setSelectedView] = useState(getCurrentViewFromPath);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Handle tab change with proper navigation
    const handleTabChange = (value: string) => {
      setSelectedView(value);
      
      if (value === "requests") {
        // Navigate to requests/pickup when requests tab is clicked
        navigate("requests/pickup", { replace: true });
      } else {
        // Navigate to records when records tab is clicked
        navigate(value, { replace: true });
      }
      
      localStorage.setItem("selectedMedicineView", value);
    };

    // Update selected view when URL changes
    useEffect(() => {
      setSelectedView(getCurrentViewFromPath());
    }, [location.pathname]);



    if (!isMounted) {
      return null;
    }

    return (
      <MainLayoutComponent title="Medicine Management" description="Manage medicine requests and records efficiently.">
        <div className="bg-white p-4">
          <Tabs
            value={selectedView}
            className="mb-4"
            onValueChange={handleTabChange} // Use the fixed handler
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-[300px]" style={{ 
            }}>
              <TabsTrigger value="records" className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                All Records
              </TabsTrigger>
              
              {/* Use ProtectedComponentButton to conditionally show requests tab */}
              <ProtectedComponentButton  exclude={["DOCTOR"]}>
                <TabsTrigger value="requests" className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative">
                  Medicine Requests
                  {isLoading ? (
                    <span className="ml-2 text-xs font-semibold text-gray-500">.</span>
                  ) : (
                    data?.data?.total_medicine_requests > 0 && (
                      <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center absolute -top-1 -right-1">
                        {data.data?.total_medicine_requests}
                      </span>
                    )
                  )}
                </TabsTrigger>
              </ProtectedComponentButton>
            </TabsList>
          </Tabs>

          {/* Render nested route component */}
          <Outlet />
        </div>
      </MainLayoutComponent>
    );
  }