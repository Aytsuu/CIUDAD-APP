import { useState } from "react"
import { Archive } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import ActiveMOM from "./activeMOM"
import InactiveMOM from "./inactiveMOM"

export const getAreaFocusDisplayName = (focus: string): string => {
  switch (focus) {
    case "gad":
      return "GAD"
    case "finance":
      return "Finance"
    case "council":
      return "Council"
    case "waste":
      return "Waste"
    default:
      return focus
  }
}

export const getAreaFocusColor = (focus: string): string => {
  switch (focus) {
    case "gad":
      return "bg-primary/10 text-primary"
    case "finance":
      return "bg-green-100 text-green-800"
    case "council":
      return "bg-purple-100 text-purple-800"
    case "waste":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}


function MinutesOfMeetingPage() {
  const [activeTab, setActiveTab] = useState("active")

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Minutes Of Meeting</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view documentation information</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      {/* Main Card with Tabs */}
      <Card className="w-full">
        <div className="w-full bg-white border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Headers */}
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 max-w-xs">
                <TabsTrigger value="active">
                  Active Records
                </TabsTrigger>
                <TabsTrigger value="archive">
                  <div className="flex items-center gap-2">
                    <Archive size={16} />
                    Archive
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Active Records Tab */}
            <TabsContent value="active" className="m-0">
              <ActiveMOM />
            </TabsContent>

            {/* Archive Records Tab */}
            <TabsContent value="archive" className="m-0">
              <InactiveMOM />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}

export default MinutesOfMeetingPage
