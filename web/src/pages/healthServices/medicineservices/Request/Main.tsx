import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import MedicineRequests from "./request-processing/request-table";
import PendingConfirmation from "./request-pending/request-pending-table";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

export default function MedicineRequestMain() {
  const [selectedView, setSelectedView] = useState<string>("requests");
  const [isMounted, setIsMounted] = useState(false);

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
    <MainLayoutComponent title="Medicine Requests" description="Manage and process medicine requests efficiently.">
      <Card className="border shadow-sm">
        <CardHeader className="p-0">
          <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 gap-2 h-auto p-1">
                <TabsTrigger value="requests" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <ClipboardList className="h-4 w-4" />
                  <span>For Pick Up</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Clock className="h-4 w-4" />
                  <span>Pending Confirmation</span>
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
    </MainLayoutComponent>
  );
}
