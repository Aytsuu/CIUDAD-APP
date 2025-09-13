import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, Calendar, Scale } from "lucide-react"
import SummonCases from "./summon-cases"
import SummonCalendar from "./summonCalendar"

export default function SummonTabs() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-row gap-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
              Summon & Case Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage summons, schedule hearings, and generate summon and file action documents.
          </p>
        </div>
        <hr className="border-gray mb-7 sm:mb-8" />
      </div>

      {/* Tabs Section with Content */}
      <div className="flex-1 flex flex-col min-h-0"> {/* Added min-h-0 for proper flex scrolling */}
        <Tabs defaultValue="summon-requests" className="w-full h-full flex flex-col">
          {/* Tabs List - Fixed */}
          <div className="flex-shrink-0">
            <TabsList className="flex w-full bg-transparent p-0 text-muted-foreground border-b border-border">
              <TabsTrigger
                value="summon-requests"
                className="flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted/50 gap-2 border-b-2 border-transparent bg-transparent rounded-none"
              >
                <FileText className="h-4 w-4" />
                Summon Requests
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted/50 gap-2 border-b-2 border-transparent bg-transparent rounded-none"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="cases"
                className="flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted/50 gap-2 border-b-2 border-transparent bg-transparent rounded-none"
              >
                <Scale className="h-4 w-4" />
                Cases
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto mt-4"> {/* Added mt-4 for spacing below tabs */}
            <TabsContent value="summon-requests" className="m-0 h-full">
              <div className="bg-card p-6 rounded-lg border shadow-sm h-full">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-card-foreground">Summon Requests</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  View, create, and manage all summon requests. Track status, assign cases, and generate official documents.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-sm text-muted-foreground">Pending Requests</div>
                  </div>
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-secondary">12</div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-accent">8</div>
                    <div className="text-sm text-muted-foreground">Completed Today</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="m-0 h-full">
              <SummonCalendar/>
            </TabsContent>

            <TabsContent value="cases" className="m-0 h-full">
              <SummonCases/>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}