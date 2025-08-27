import React from "react";
import { Card } from "./card/card"
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export const CardSidebar = ({
  header,
  sidebarItems,
  selectedItem,
  setSelectedItem
} : {
  header?: React.ReactNode
  sidebarItems: any[]
  selectedItem: string
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>
}) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      {header}
      <div className="p-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isSelected = selectedItem == 'details' && item.id == 'respondent' ? 
                              true : selectedItem == item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedItem(item.id);
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
                  <Icon className={cn("h-4 w-4", isSelected && item.iconColor)} />
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
  )
}