import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Check, CircleAlert, FileDown, Filter, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { ARColumns } from "../ReportColumns"
import { useGetAcknowledgementReport, useGetWeeklyAR } from "../queries/reportFetch"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { LoadButton } from "@/components/ui/button/load-button"
import { useAddWAR, useAddWARComp } from "../queries/reportAdd"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate, getWeekNumber } from "@/helpers/dateFormatter"

export default function ARRecords() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isCreatingWeeklyAR, setIsCreatingWeeklyAR] = React.useState<boolean>(false);
  const [isCreatable, setIsCreatable] = React.useState<boolean>(true);
  const [reset, setReset] = React.useState<boolean>(false);
  const { data: arReports, isLoading: isLoadingArReports } = useGetAcknowledgementReport()
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
      const date = new Date(w.war_created_at);
      if(date.getFullYear() == now.getFullYear()) {
        if (date.getMonth() + 1 == now.getMonth() + 1) {
          return w;
        }
      }
    })
  ), [weeklyAR]);
  
  React.useEffect(() => {
    if(warThisMonth) {
      setIsCreatable(warThisMonth?.every((war: any) => 
        getWeekNumber(war.war_created_at) !== getWeekNumber(formatDate(now)
      )));
    }
  }, [warThisMonth]);

  const onSelectedRowsChange = React.useCallback((rows: any[]) => {
    setSelectedRows(rows)
  }, [])

  const handleCreateWAR = async () => {
    setIsSubmitting(true)
    
    // Check there are selected ARs
    if (!selectedRows.length && !(selectedRows.length > 0)) {
      toast("Please select acknowledgement report(s)", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: "1px solid rgb(225, 193, 193)",
          padding: "16px",
          color: "#b91c1c",
          background: "#fef2f2",
        }
      })
      setIsSubmitting(false);
      return;
    }

    // Proceed to creation
    try {
      addWAR(user?.staff.staff_id, {
        onSuccess: (data) => {
          const compositions = selectedRows.map((row) => ({
            ar: row.ar_id,
            war: data.war_id,
          }))

          addWARComp(compositions, {
            onSuccess: () => {
              toast("Weekly AR created successfully", {
                icon: <Check size={24} className="text-green-500" />,
                style: {
                  border: "1px solid rgb(187, 247, 208)",
                  padding: "16px",
                  color: "#166534",
                  background: "#f0fdf4",
                },
              })
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
      toast("Failed to create Weekly AR", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: "1px solid rgb(225, 193, 193)",
          padding: "16px",
          color: "#b91c1c",
          background: "#fef2f2",
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-darkBlue2">Acknowledgement Reports</h1>
            <p className="text-xs sm:text-sm text-darkGray">Manage and view all acknowledgement reports in your system</p>
          </div>  
          <div className="flex items-center gap-2">
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
                  Create Week {getWeekNumber(formatDate(now))} AR
                </Button>
              )
            ) : (
              <Badge variant={'secondary'} className="gap-1">
                <Check size={14}/> 
                Weekly AR Created
              </Badge>
            ))}
          </div>
        </div>

        {/* Selection Mode Banner */}
        {isCreatingWeeklyAR && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
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

        {/* Filters and Search Section */}
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
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <DropdownLayout
                  trigger={
                    <Button variant="outline" className="gap-2">
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
          </CardHeader>
        </Card>

        {/* Data Table Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  className="w-16 h-8 text-center border-gray-200"
                  value={pageSize}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (value >= 1 && value <= 100) {
                      setPageSize(value)
                      setCurrentPage(1) // Reset to first page
                    }
                  }}
                />
                <span>entries</span>
              </div>

              <div className="text-sm text-gray-600">
                {isLoadingArReports || isLoadingWeeklyAR ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    Loading...
                  </div>
                ) : (
                  `Showing ${totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-t overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable
                  columns={ARColumns(isCreatingWeeklyAR)}
                  data={ARList}
                  onSelectedRowsChange={onSelectedRowsChange}
                  isLoading={isLoadingArReports || isLoadingWeeklyAR}
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
                    Page {currentPage} of {totalPages}
                  </div>
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Empty State */}
        {!isLoadingArReports && totalCount === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Search className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  {searchQuery
                    ? `No acknowledgement reports match your search for "${searchQuery}"`
                    : "No acknowledgement reports are available at this time"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
