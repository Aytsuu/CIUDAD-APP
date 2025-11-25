"use client"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import BHWReportPage1 from "./pages/page-1"
import BHWReportPage2 from "./pages/page-2"

export default function BHWReportDetails() {
   return (
      <LayoutWithBack
         title="BHW Accomplishment Report Details"
         description="View detailed accomplishment report of Barangay Health Workers"
      >
         <div className="bg-white p-4">
            <Tabs defaultValue="page1" className="w-full">
               <div className="flex justify-center m-4">
                  <TabsList>
                     <TabsTrigger value="page1">Page 1</TabsTrigger>
                     <TabsTrigger value="page2">Page 2</TabsTrigger>
                  </TabsList>
               </div>
               <TabsContent value="page1">
                  <BHWReportPage1 />
               </TabsContent>
               <TabsContent value="page2">
                  <BHWReportPage2 />
               </TabsContent>
            </Tabs>
         </div>
         
      </LayoutWithBack>
      
   )
}