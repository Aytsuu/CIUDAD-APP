import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Check, FileDown, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { ARColumns } from "../ReportColumns"
import { useGetAcknowledgementReport, useGetWeeklyAR } from "../queries/reportFetch"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { LoadButton } from "@/components/ui/button/load-button"
import { useAddWAR, useAddWARComp } from "../queries/reportAdd"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate, getWeekNumber } from "@/helpers/dateHelper"
import { useNavigate } from "react-router"
import { useLoading } from "@/context/LoadingContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useDebounce } from "@/hooks/use-debounce"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"
import { Spinner } from "@/components/ui/spinner"

export default function ARRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isCreatingWeeklyAR, setIsCreatingWeeklyAR] = React.useState<boolean>(false);
  const [isCreatable, setIsCreatable] = React.useState<boolean>(true);
  const [reset, setReset] = React.useState<boolean>(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)
  const { data: arReports, isLoading: isLoadingArReports } = useGetAcknowledgementReport(
    currentPage, debouncedPageSize, debouncedSearchQuery)
  const { data: weeklyAR, isLoading: isLoadingWeeklyAR } = useGetWeeklyAR();
  const { mutateAsync: addWAR } = useAddWAR();
  const { mutateAsync: addWARComp } = useAddWARComp();

  const ARList = arReports?.results || []
  const totalCount = arReports?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  // // Check if weekly AR for this week has already been created
  const now = new Date()
  const warThisMonth = React.useMemo(() => (
    weeklyAR?.filter((w: any) => {
      const date = new Date(w.created_for);
      if(date.getFullYear() == now.getFullYear()) {
        if (date.getMonth() + 1 == now.getMonth() + 1) {
          return w;
        }
      }
    })
  ), [weeklyAR]);

  const compositions = React.useMemo(() => (
    weeklyAR?.reduce((acc: any[], war: any) => 
      acc.concat(war.war_composition)
    , [])
  ), [weeklyAR])

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if(isLoadingArReports) showLoading();
    else hideLoading();
  }, [isLoadingArReports])
  
  React.useEffect(() => {
    if(warThisMonth) {
      setIsCreatable(warThisMonth?.every((war: any) => 
        getWeekNumber(war.created_for) !== getWeekNumber(new Date().toISOString())
      ));
    }
  }, [warThisMonth]);

  const onSelectedRowsChange = React.useCallback((rows: any[]) => {
    setSelectedRows(rows)
  }, [])

  console.log(isCreatable)

  const handleCreateWAR = async () => {
    setIsSubmitting(true)
    
    // Check there are selected ARs
    if (!selectedRows.length && !(selectedRows.length > 0)) {
      showErrorToast("Please select acknowledgement report(s)");
      setIsSubmitting(false);
      return;
    }

    // Proceed to creation
    try {
      addWAR({staff: user?.staff?.staff_id}, {
        onSuccess: (data) => {
          const compositions = selectedRows.map((row) => ({
            ar: row.id,
            war: data.war_id,
          }))

          addWARComp(compositions, {
            onSuccess: () => {
              showSuccessToast("Weekly accomplishment report created successfully");
              setIsCreatingWeeklyAR(false);
              setIsCreatable(false);
              setReset(true);
              setIsSubmitting(false);
            },
          })
        },
      })
    } catch (err) {
      setIsSubmitting(false)
      showErrorToast("Failed to create Weekly AR")
    }
  }

  return (
    <MainLayoutComponent
      title="Acknowledgement Report"
      description="Manage and view all acknowledgement reports in your system"
    >
      {/* Selection Mode Banner */}
      {isCreatingWeeklyAR && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Selection Mode Active</h3>
              <p className="text-sm text-blue-600">Select the reports you want to include in your Weekly AR</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
            {selectedRows.length} Selected
          </Badge>
        </div>
      )}

      {/* Data Table Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {totalCount} Total Reports
              </Badge>
              {!isLoadingWeeklyAR && !isLoadingArReports && ARList.length > 0 &&  (isCreatable ? (
                isCreatingWeeklyAR ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedRows.length} Reports Selected
                    </Badge>
                    {isSubmitting ? (
                      <LoadButton>Creating...</LoadButton>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsCreatingWeeklyAR(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateWAR} className="gap-2">
                          <Check className="h-4 w-4" />
                          Create Weekly AR
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button onClick={() => setIsCreatingWeeklyAR(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Week {getWeekNumber(formatDate(now) as string)}
                  </Button>
                )
              ) : (
                <Badge variant={'secondary'} className="gap-1">
                  <Check size={14}/> 
                  Weekly AR Created
                </Badge>
              ))}
              {!isCreatingWeeklyAR && <Button onClick={() => navigate('form')}>
                Create AR
              </Button>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
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
            <div className="flex items-center gap-1">
              <DropdownLayout
                trigger={
                  <Button variant="outline" className="shadow-none">
                    <FileDown className="h-4 w-4" />
                    Export
                  </Button>
                }
                options={[
                  { id: "csv", name: "Export as CSV" },
                  { id: "excel", name: "Export as Excel" },
                  { id: "pdf", name: "Export as PDF" },
                ]}
              />
            </div>
          </div>

          {isLoadingArReports || isLoadingWeeklyAR && (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg"/>
              <span className="ml-2 text-gray-600">Loading incident reports...</span>
            </div>
          )}

          <div className="border-t overflow-hidden">
            <div className="overflow-x-auto">
              <DataTable
                columns={ARColumns(isCreatingWeeklyAR, compositions)}
                data={ARList}
                onSelectedRowsChange={onSelectedRowsChange}
                reset={reset} 
                setReset={setReset}
              />
            </div>
          </div>
        </CardContent>

        {/* Pagination Section */}
        {totalPages > 0 && (
          <>
            <Separator />
            <div className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {isLoadingArReports || isLoadingWeeklyAR ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      Loading...
                    </div>
                  ) : (
                    `Showing ${totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0} -
                    ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`
                  )}  
                </div>
                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </div>
          </>
        )}
      </Card>
    </MainLayoutComponent>
  )
}
