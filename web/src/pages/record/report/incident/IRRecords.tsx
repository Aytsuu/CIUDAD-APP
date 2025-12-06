import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import React from "react";
import { useGetIncidentReport } from "../queries/reportFetch";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "@/components/ui/table/data-table";
import { IRColumns } from "../ReportColumns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Spinner } from "@/components/ui/spinner";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Skeleton } from "@/components/ui/skeleton"; 
import { 
  Search, 
  FileText, 
  Activity, 
  CheckCircle2,
  Archive, 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";

export default function IRRecords() {
  // ================ STATE INITIALIZATION ================
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [search, setSearch] = React.useState<string>("");
  const [severity, setSeverity] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  const debouncedSearch = useDebounce(search, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);

  // ================ QUERIES ================

  // 1. Main Table Data
  const { data: incidentReports, isLoading: isLoadingIR } = useGetIncidentReport(
    currentPage,
    debouncedPageSize,
    debouncedSearch,
    false,
    undefined,
    severity,
    true,
    status
  );

  const IRList = incidentReports?.results || [];
  const totalCount = incidentReports?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 2. Analytics Data
  const { data: inProgressIR, isLoading: isLoadingInProgress } = useGetIncidentReport(
    1, 1, '', false, undefined, 'all', true, 'in-progress'
  );
  const { data: resolvedIR, isLoading: isLoadingResolved } = useGetIncidentReport(
    1, 1, '', false, undefined, 'all', true, 'resolved'
  );

  const { data: archivedIR, isLoading: isLoadingArchived } = useGetIncidentReport(
    1, 1, '', true
  )

  // ================ CONFIGURATION ================
  
  const statCards = [
    { 
      label: "In-Progress", 
      icon: Activity, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      count: inProgressIR?.count || 0,
      isLoading: isLoadingInProgress,
      trend: "Active handling"
    },
    { 
      label: "Resolved", 
      icon: CheckCircle2, 
      color: "text-green-600", 
      bg: "bg-green-50",
      count: resolvedIR?.count || 0,
      isLoading: isLoadingResolved,
      trend: "Successful result"
    },
    { 
      label: "Archived", 
      icon: Archive, 
      color: "text-gray-600", 
      bg: "bg-gray-100",
      count: archivedIR?.count || 0,
      isLoading: isLoadingArchived,
      trend: "Historical record of unresolved reports"
    },
  ];

  // ================ RENDER ================
  return (
    <MainLayoutComponent
      title="Incident Reports"
      description="Manage and view all incident reports in your system"
    >
      <div className="flex flex-col w-full h-full gap-6">
        
        {/* --- ANALYTICS STATUS CARDS (Read Only) --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            
            return (
              <Card 
                key={stat.label}
                className="border border-gray-200 bg-white shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {stat.isLoading ? (
                        <Skeleton className="h-8 w-16 bg-slate-200" />
                    ) : (
                        stat.count
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* --- MAIN TABLE CARD --- */}
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={status === 'all' ? "Search all reports..." : `Search ${status} reports...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div> 

              <div className="flex items-center gap-2">
                <SelectLayout 
                  value={severity}
                  className="gap-4"
                  onChange={(value) => {
                    setCurrentPage(1)
                    setSeverity(value)
                  }}
                  placeholder=""
                  options={[
                    {id: "all", name: "All Severities"},
                    {id: "low", name: "Low"},
                    {id: "medium", name: "Medium"},
                    {id: "high", name: "High"}
                  ]}
                  withReset={false}
                  valueLabel="Severity"
                />

                <SelectLayout 
                  value={status}
                  className="gap-4"
                  onChange={(value) => {
                    setCurrentPage(1)
                    setStatus(value)
                  }}
                  placeholder=""
                  options={[
                    {id: "all", name: "All Statuses"},
                    {id: "in-progress", name: "In-Progress"},
                    {id: "resolved", name: "Resolved"},
                  ]}
                  withReset={false}
                  valueLabel="Status"
                />

                <TooltipLayout
                  trigger={
                    <Button variant={"outline"}
                      onClick={() => {
                        navigate('archive');
                      }}
                    >
                      <Archive className="text-gray-700" />
                    </Button>
                  }
                  content="Archive"
                />
              </div>  
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-sm font-medium text-gray-700">Show</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                    <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
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
                  <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>

            {/* Empty State */}
            {!isLoadingIR && IRList.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reports found
                </h3>
                <p className="text-gray-500 mb-4">
                   {status !== 'all' 
                     ? `There are no ${status} reports matching your criteria.` 
                     : "There are currently no reports."}
                </p>
              </div>
            )}
            
            {/* Loading State */}
            {isLoadingIR && (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg"/>
                <span className="ml-2 text-gray-600">Loading incident reports...</span>
              </div>
            )}

            {/* Data Table */}
            {!isLoadingIR && IRList?.length > 0 && (
                <DataTable
                  columns={IRColumns()}
                  data={IRList}
                  isLoading={isLoadingIR}
                />
            )}
          </CardContent>

          {/* Pagination Section */}
          {totalPages > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    {isLoadingIR ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        Loading...
                      </div>
                    ) : (
                      `Showing ${totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0} -
                      ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`
                    )}
                  </div>

                  <PaginationLayout
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </>
          )}
        </Card>
        </div>
    </MainLayoutComponent>
  );
}