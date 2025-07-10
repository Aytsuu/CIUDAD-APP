// import React from "react"
// import { Button } from "@/components/ui/button/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
// import { Badge } from "@/components/ui/badge"
// import { Plus, ClockArrowUp, FileDown, Search, Users, Loader2, Download } from "lucide-react"
// import { Link } from "react-router"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
// import { DataTable } from "@/components/ui/table/data-table"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import PaginationLayout from "@/components/ui/pagination/pagination-layout"
// import { exportToCSV, exportToExcel, exportToPDF } from "./ExportFunctions"
// import { residentColumns } from "./ResidentColumns"
// import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
// import { useResidentsTable } from "../queries/profilingFetchQueries"
// import { useResidentsTableHealth } from "../../health-family-profiling/family-profling/queries/profilingFetchQueries"
// import { useDebounce } from "@/hooks/use-debounce"
// import { useLoading } from "@/context/LoadingContext"

// export default function ResidentRecords() {
//   // ----------------- STATE INITIALIZATION --------------------
//   const {showLoading, hideLoading} = useLoading();
//   const [searchQuery, setSearchQuery] = React.useState<string>("")
//   const [pageSize, setPageSize] = React.useState<number>(10)
//   const [currentPage, setCurrentPage] = React.useState<number>(1)
//   const [activeTab, setActiveTab] = React.useState<"profile" | "health">("profile")
//   const debouncedSearchQuery = useDebounce(searchQuery, 300)
//   const debouncedPageSize = useDebounce(pageSize, 100)

//   const { data: residentsTableData, isLoading } = useResidentsTable(
//     currentPage,
//     debouncedPageSize,
//     debouncedSearchQuery,
//   )

//   const { data: residentsTableHealthData, isLoading: isLoadingHealth } = useResidentsTableHealth(
//     currentPage,
//     debouncedPageSize,
//     debouncedSearchQuery,
//   )

//   const residents = residentsTableData?.results || [];
//   const residentsHealth = residentsTableHealthData?.results || [];
//   const totalCount = activeTab === "profile" 
//     ? residentsTableData?.count || 0 
//     : residentsTableHealthData?.count || 0;
//   const totalPages = Math.ceil(totalCount / pageSize);

//   const currentData = activeTab === "profile" ? residents : residentsHealth;
//   const currentLoading = activeTab === "profile" ? isLoading : isLoadingHealth;

//   // ----------------- SIDE EFFECTS --------------------
//   // Reset to page 1 when search changes or tab changes
//   React.useEffect(() => {
//     setCurrentPage(1)
//   }, [debouncedSearchQuery, activeTab])

//   React.useEffect(() => {
//     if(currentLoading) showLoading();
//     else hideLoading();
//   }, [currentLoading])

//   // ----------------- HANDLERS --------------------
//   const handleExport = (type: "csv" | "excel" | "pdf") => {
//     const dataToExport = activeTab === "profile" ? residents : residentsHealth;
//     switch (type) {
//       case "csv":
//         exportToCSV(dataToExport)
//         break
//       case "excel":
//         exportToExcel(dataToExport)
//         break
//       case "pdf":
//         exportToPDF(dataToExport)
//         break
//     }
//   }

//   return (
//     // ----------------- RENDER --------------------
//     <MainLayoutComponent title="Resident Profiling" description="Manage and view all residents in your community">
//       <div className="space-y-6">
//         {/* Search and Actions */}
//         <Card>
//           <CardHeader className="pb-4">
//             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//               <div className="flex-1 w-full sm:max-w-md">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
//                   <Input
//                     placeholder="Search residents by name, ID, or address..."
//                     className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2 w-full sm:w-auto">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline" className="flex-1 sm:flex-none">
//                       <Download className="h-4 w-4 mr-2" />
//                       Export
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem onClick={() => handleExport("csv")}>
//                       <FileDown className="h-4 w-4 mr-2" />
//                       Export as CSV
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => handleExport("excel")}>
//                       <FileDown className="h-4 w-4 mr-2" />
//                       Export as Excel
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => handleExport("pdf")}>
//                       <FileDown className="h-4 w-4 mr-2" />
//                       Export as PDF
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>

//                 <Link to="/resident/pending" className="flex-1 sm:flex-none">
//                   <Button variant="outline" className="w-full sm:w-auto">
//                     <ClockArrowUp className="h-4 w-4 mr-2" />
//                     Pending
//                     <Badge variant="secondary" className="ml-2">
//                       -
//                     </Badge>
//                   </Button>
//                 </Link>

//                 <Link
//                   to="/resident/form"
//                   state={{
//                     params: {
//                       origin: "create",
//                       title: "Resident Registration",
//                       Description: "Provide the necessary details, and complete the registration.",
//                     },
//                   }}
//                   className="flex-1 sm:flex-none"
//                 >
//                   <Button className="w-full sm:w-auto">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Register Resident
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-0">
//             {/* Tabs */}
//             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "health")}>
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b bg-gray-50">
//                 <TabsList>
//                   <TabsTrigger value="profile">Profile Data</TabsTrigger>
//                   <TabsTrigger value="health">Health Data</TabsTrigger>
//                 </TabsList>

//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <span>Show</span>
//                   <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
//                     <SelectTrigger className="w-20 h-8">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="5">5</SelectItem>
//                       <SelectItem value="10">10</SelectItem>
//                       <SelectItem value="25">25</SelectItem>
//                       <SelectItem value="50">50</SelectItem>
//                       <SelectItem value="100">100</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <span>entries</span>
//                 </div>
//               </div>

//               {/* Loading State */}
//               {currentLoading && (
//                 <div className="flex items-center justify-center py-12">
//                   <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//                   <span className="ml-2 text-gray-600">
//                     Loading {activeTab === "profile" ? "residents" : "health data"}...
//                   </span>
//                 </div>
//               )}

//               {/* Empty State */}
//               {!currentLoading && currentData.length === 0 && (
//                 <div className="text-center py-12">
//                   <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">
//                     {searchQuery 
//                       ? `No ${activeTab === "profile" ? "residents" : "Residents"} found` 
//                       : `No ${activeTab === "profile" ? "residents" : "Residents"} yet`}
//                   </h3>
//                   <p className="text-gray-500 mb-4">
//                     {searchQuery
//                       ? `No ${activeTab === "profile" ? "residents" : "Residents"} match "${searchQuery}". Try adjusting your search.`
//                       : `Get started by ${activeTab === "profile" ? "registering your first resident" : "checking the health profiling section"}.`}
//                   </p>
//                   {!searchQuery && activeTab === "profile" && (
//                     <Link
//                       to="/resident/form"
//                       state={{
//                         params: {
//                           origin: "create",
//                           title: "Resident Registration",
//                           Description: "Provide the necessary details, and complete the registration.",
//                         },
//                       }}
//                     >
//                       <Button>
//                         <Plus className="h-4 w-4 mr-2" />
//                         Register First Resident
//                       </Button>
//                     </Link>
//                   )}
//                 </div>
//               )}

//               {/* Data Tables */}
//               <TabsContent value="profile" className="m-0">
//                 {!isLoading && residents.length > 0 && (
//                   <DataTable columns={residentColumns} data={residents} isLoading={isLoading} />
//                 )}
//               </TabsContent>

//               <TabsContent value="health" className="m-0">
//                 {!isLoadingHealth && residentsHealth.length > 0 && (
//                   <DataTable 
//                     columns={residentColumns} // You might want different columns for health data
//                     data={residentsHealth} 
//                     isLoading={isLoadingHealth} 
//                   />
//                 )}
//               </TabsContent>
//             </Tabs>

//             {/* Pagination */}
//             {!currentLoading && currentData.length > 0 && (
//               <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
//                 <p className="text-sm text-gray-600 mb-2 sm:mb-0">
//                   Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
//                   <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
//                   <span className="font-medium">{totalCount}</span> {activeTab === "profile" ? "residents" : "Residents"}
//                 </p>

//                 {totalPages > 0 && (
//                   <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </MainLayoutComponent>
//   )
// }
import React from "react"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ClockArrowUp, FileDown, Search, Users, Loader2, Download } from "lucide-react"
import { Link } from "react-router"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { DataTable } from "@/components/ui/table/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { exportToCSV, exportToExcel, exportToPDF } from "./ExportFunctions"
import { residentColumns } from "./ResidentColumns"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { useResidentsTable } from "../queries/profilingFetchQueries"
import { useResidentsTableHealth } from "../../health-family-profiling/family-profling/queries/profilingFetchQueries"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"

export default function ResidentRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [activeTab, setActiveTab] = React.useState<"profile" | "health">("profile")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)

  const { data: residentsTableData, isLoading, error } = useResidentsTable(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery,
  )

  const { 
    data: residentsTableHealthData, 
    isLoading: isLoadingHealth, 
    error: errorHealth,
    refetch: refetchHealth 
  } = useResidentsTableHealth(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery,
  )

  const residents = residentsTableData?.results || [];
  const residentsHealth = residentsTableHealthData?.results || [];
  const totalCount = activeTab === "profile" 
    ? residentsTableData?.count || 0 
    : residentsTableHealthData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const currentData = activeTab === "profile" ? residents : residentsHealth;
  const currentLoading = activeTab === "profile" ? isLoading : isLoadingHealth;
  const currentError = activeTab === "profile" ? error : errorHealth;

  // ----------------- SIDE EFFECTS --------------------
  // Reset to page 1 when search changes or tab changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, activeTab])

  React.useEffect(() => {
    if(currentLoading) showLoading();
    else hideLoading();
  }, [currentLoading])

  // Debug effect to check health data fetching
  React.useEffect(() => {
    console.log('Health Data Debug:', {
      isLoadingHealth,
      residentsTableHealthData,
      errorHealth,
      activeTab,
      currentPage,
      debouncedPageSize,
      debouncedSearchQuery
    });
  }, [isLoadingHealth, residentsTableHealthData, errorHealth, activeTab, currentPage, debouncedPageSize, debouncedSearchQuery]);

  // Refetch health data when switching to health tab
  React.useEffect(() => {
    if (activeTab === "health" && !isLoadingHealth && !residentsTableHealthData) {
      console.log('Refetching health data...');
      refetchHealth();
    }
  }, [activeTab, isLoadingHealth, residentsTableHealthData, refetchHealth]);

  // ----------------- HANDLERS --------------------
  const handleExport = (type: "csv" | "excel" | "pdf") => {
    const dataToExport = activeTab === "profile" ? residents : residentsHealth;
    switch (type) {
      case "csv":
        exportToCSV(dataToExport)
        break
      case "excel":
        exportToExcel(dataToExport)
        break
      case "pdf":
        exportToPDF(dataToExport)
        break
    }
  }

  const handleRetry = () => {
    if (activeTab === "health") {
      refetchHealth();
    }
  }

  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent title="Resident Profiling" description="Manage and view all residents in your community">
      <div className="space-y-6">
        {/* Search and Actions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search residents by name, ID, or address..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("excel")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link to="/resident/pending" className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ClockArrowUp className="h-4 w-4 mr-2" />
                    Pending
                    <Badge variant="secondary" className="ml-2">
                      -
                    </Badge>
                  </Button>
                </Link>

                <Link
                  to="/resident/form"
                  state={{
                    params: {
                      origin: "create",
                      title: "Resident Registration",
                      Description: "Provide the necessary details, and complete the registration.",
                    },
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Resident
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "health")}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b bg-gray-50">
                <TabsList>
                  <TabsTrigger value="profile">Profile Data</TabsTrigger>
                  <TabsTrigger value="health">Health Data</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
              </div>

              {/* Error State */}
              {currentError && (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error loading {activeTab === "profile" ? "residents" : "health data"}
                  </h3>
                  <p className="text-gray-500 mb-4 text-center">
                    {currentError instanceof Error ? currentError.message : "Something went wrong while fetching the data."}
                  </p>
                  <Button onClick={handleRetry} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {currentLoading && !currentError && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Loading {activeTab === "profile" ? "residents" : "health data"}...
                  </span>
                </div>
              )}

              {/* Empty State */}
              {!currentLoading && !currentError && currentData.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery 
                      ? `No ${activeTab === "profile" ? "residents" : "Residents"} found` 
                      : `No ${activeTab === "profile" ? "residents" : "Residents"} yet`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? `No ${activeTab === "profile" ? "residents" : "Residents"} match "${searchQuery}". Try adjusting your search.`
                      : `Get started by ${activeTab === "profile" ? "registering your first resident" : "checking the health profiling section"}.`}
                  </p>
                  {!searchQuery && activeTab === "profile" && (
                    <Link
                      to="/resident/form"
                      state={{
                        params: {
                          origin: "create",
                          title: "Resident Registration",
                          Description: "Provide the necessary details, and complete the registration.",
                        },
                      }}
                    >
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Register First Resident
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Data Tables */}
              <TabsContent value="profile" className="m-0">
                {!isLoading && !error && residents.length > 0 && (
                  <DataTable columns={residentColumns} data={residents} isLoading={isLoading} />
                )}
              </TabsContent>

              <TabsContent value="health" className="m-0">
                {!isLoadingHealth && !errorHealth && residentsHealth.length > 0 && (
                  <DataTable 
                    columns={residentColumns} // You might want different columns for health data
                    data={residentsHealth} 
                    isLoading={isLoadingHealth} 
                  />
                )}
              </TabsContent>
            </Tabs>

            {/* Pagination */} 
            {!currentLoading && !currentError && currentData.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> {activeTab === "profile" ? "residents" : "Residents"}
                </p>

                {totalPages > 0 && (
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayoutComponent>
  )
}