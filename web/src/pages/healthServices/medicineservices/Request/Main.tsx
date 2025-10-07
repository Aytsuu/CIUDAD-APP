import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import MedicineRequests from "./request-processing/request-table";
import PendingConfirmation from "./request-pending/request-pending-table";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useReportsCount } from "../../count-return/count";

export default function MedicineRequestMain() {
  const [selectedView, setSelectedView] = useState<string>("requests");
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useReportsCount();

  useEffect(() => {
    setIsMounted(true);
    const savedView = localStorage.getItem("medicineRequestView");
    if (savedView && ["requests", "pending"].includes(savedView)) {
      setSelectedView(savedView);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("medicineRequestView", selectedView);
    }
  }, [selectedView, isMounted]);

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
        <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2 gap-2 h-auto p-1">
              <TabsTrigger value="requests" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <ClipboardList className="h-4 w-4" />
                <span>For Pick Up</span>
                {isLoading ? <span className="ml-2 text-xs font-semibold text-gray-500">.</span> : data?.data?.medrequest_count > 0 && <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">{data.data?.medrequest_count}</span>}

              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Clock className="h-4 w-4" />
                <span>Pending Confirmation</span>
                {isLoading ? <span className="ml-2 text-xs font-semibold text-gray-500">.</span> : data?.data?.apprequest_count > 0 && <span className="ml-2 text-xs font-semibold text-white bg-red-500 rounded-full px-2 h-5 w-5 flex items-center justify-center">{data.data?.apprequest_count}</span>}
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4 pt-6">
            <TabsContent value="requests" className="mt-0">
              <MedicineRequests />
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              <PendingConfirmation />
            </TabsContent>
          </CardContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
