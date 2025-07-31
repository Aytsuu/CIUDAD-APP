"use client"

import { useState } from "react"
import RatesPage1 from "./rates-page1"
import RatesPage2 from "./rates-page2"
import RatesPage3 from "./rates-page3"
import RatesPage4 from "./rates-page4"
import RatesPage5 from "./rates-page5"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function RatesForm() {
  const [activeTab, setActiveTab] = useState<"page1" | "page2" | "page3" | "page4" | "page5">("page1")

  return (
    <div className="w-full pb-2 bg-snow">
      <div className="flex flex-col gap-3 mb-3">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
          <div>Rates</div>
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and configure rates for business permits, personal clearances, service charges, and other barangay
          fees.
        </p>
      </div>
      <hr className="border-gray mb-7 sm:mb-8" />
      <Tabs defaultValue="page1" className="mb-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
          <TabsTrigger
            value="page1"
            onClick={() => setActiveTab("page1")}
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-xs sm:text-sm flex items-center justify-center"
          >
            Page 1
          </TabsTrigger>
          <TabsTrigger
            value="page2"
            onClick={() => setActiveTab("page2")}
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-xs sm:text-sm flex items-center justify-center"
          >
            Page 2
          </TabsTrigger>
          <TabsTrigger
            value="page3"
            onClick={() => setActiveTab("page3")}
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-xs sm:text-sm flex items-center justify-center"
          >
            Page 3
          </TabsTrigger>
          <TabsTrigger
            value="page4"
            onClick={() => setActiveTab("page4")}
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-xs sm:text-sm flex items-center justify-center"
          >
            Page 4
          </TabsTrigger>
          <TabsTrigger
            value="page5"
            onClick={() => setActiveTab("page5")}
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-xs sm:text-sm flex items-center justify-center"
          >
            Page 5
          </TabsTrigger>
        </TabsList>
        <div>
          <TabsContent value="page1" className="mt-2">
            <RatesPage1 />
          </TabsContent>
          <TabsContent value="page2" className="mt-2">
            <RatesPage2 />
          </TabsContent>
          <TabsContent value="page3" className="mt-2">
            <RatesPage3 />
          </TabsContent>
          <TabsContent value="page4" className="mt-2">
            <RatesPage4 />
          </TabsContent>
          <TabsContent value="page5" className="mt-2">
            <RatesPage5 />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default RatesForm
