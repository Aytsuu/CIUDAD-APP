import React from "react"
import { Users, CircleCheck, Clock } from "lucide-react"

import { Outlet, useNavigate } from "react-router"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { Card } from "@/components/ui/card/card"
import { cn } from "@/lib/utils"

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
  // ----------------- STATE INITIALIZATION --------------------
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/").pop() || ""
  const [selectedRecord, setSelectedRecord] = React.useState<string>(currentPath);

  const handleSelectionChange = (selected: string) => {
    setSelectedRecord(selected);
  }
  console.log(currentPath)
  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent
      title="Business"
      description="View and manage registered businesses, including their details, location, and registration information."
    >
      <div className="flex gap-4">
        <div className="w-64 flex-shrink-0">
          <Card className="overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-900">Record</h3>
              <p className="text-xs text-gray-600 mt-1">Select a record to view</p>
            </div>
            <div className="p-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isSelected = selectedRecord == 'details' && item.id == 'respondent' ? 
                                    true : selectedRecord == item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSelectionChange(item.id)
                      navigate(item.route, { replace: true })
                    }}
                                            className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left outline-none transition-colors duration-200 group",
                      isSelected
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900",
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          isSelected
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "font-medium text-sm truncate",
                            isSelected ? "text-blue-700" : "text-gray-900",
                          )}
                        >
                          {item.label}
                        </div>
                        <div className={cn("text-xs truncate", isSelected ? "text-blue-600" : "text-gray-500")}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
        <div className="w-full">
          <Outlet/>
        </div>
      </div>
    </MainLayoutComponent>
  )
}
