import { Users, CircleCheck, Clock } from "lucide-react"
import { Outlet } from "react-router"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { CardSidebar } from "@/components/ui/card-sidebar"
import React from "react"

  const sidebarItems = [
    {
      id: "active",
      label: "Active",
      icon: CircleCheck,
      description: "Record of active businesses",
      route: "active",
    },
    {
      id: "pending",
      label: "Pending",
      icon: Clock,
      description: "Record of pending registrations",
      route: "pending",
    },
    {
      id: "respondent",
      label: "Respondent",
      icon: Users,
      description: "Record of business repsondents",
      route: "respondent",
    },
  ]

export default function BusinessRecords() {
  const currentPath = location.pathname.split("/").pop() || ""
  const [selectedRecord, setSelectedRecord] = React.useState<string>(currentPath);

  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent
      title="Business"
      description="View and manage registered businesses, including their details, location, and registration information."
    >
      <div className="flex gap-4">
        <div className="w-64 flex-shrink-0">
          <CardSidebar 
            header={<div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-900">Record</h3>
              <p className="text-xs text-gray-600 mt-1">Select a record to view</p>
            </div>}
            sidebarItems={sidebarItems}
            selectedItem={selectedRecord}
            setSelectedItem={setSelectedRecord}
          />
        </div>
        <div className="w-full">
          <Outlet/>
        </div>
      </div>
    </MainLayoutComponent>
  )
}
