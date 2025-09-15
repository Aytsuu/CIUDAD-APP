import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import SummonPendingReqs from "./summon-pending-requests"
import SummonRejectedReq from "./summon-rejected-request"
import SummonAcceptedReq from "./summon-accepted-request"

export default function SummonReqTabs() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <div className="flex flex-col gap-3 mb-3">
            <div className="flex flex-row gap-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                Summon Request
                </h1>
            </div>
            <p className="text-xs sm:text-sm text-darkGray">
                Approve or Reject summon requests.
            </p>
        </div>
        <hr className="border-gray mb-7 sm:mb-8" />
      </div>

      {/* Tabs Section with Content */}
      <div className="flex-1 flex flex-col min-h-0"> 
        <Tabs defaultValue="pending" className="w-full h-full flex flex-col">
          {/* Tabs List - Fixed */}
          <div className="flex-shrink-0">
            <TabsList className="flex w-full bg-transparent p-0 text-muted-foreground border-b border-border">
              <TabsTrigger
                value="pending"
                className="flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted/50 gap-2 border-b-2 border-transparent bg-transparent rounded-none"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                className="flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted/50 gap-2 border-b-2 border-transparent bg-transparent rounded-none"
              >
                Accepted
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex-1 flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted/50 gap-2 border-b-2 border-transparent bg-transparent rounded-none"
              >
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto mt-4"> 
            <TabsContent value="pending" className="m-0">
              <SummonPendingReqs/>
            </TabsContent>

            <TabsContent value="accepted" className="m-0 h-full">
              <SummonAcceptedReq/>
            </TabsContent>

            <TabsContent value="rejected" className="m-0">
              <SummonRejectedReq/>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}