import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Button } from "@/components/ui/button/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, FileText, CheckCircle2, Loader2, Plus, Check } from "lucide-react"
import React from "react"
import { useLocation } from "react-router"
import { useGetARByDate } from "../queries/reportFetch"
import { formatDate, monthNameToNumber } from "@/helpers/dateHelper"
import { useAddWAR, useAddWARComp } from "../queries/reportAdd"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export default function CreateMissingWeeks() {
  const { user } = useAuth();
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params, [location.state])
  const year = React.useMemo(() => params?.year || new Date().getFullYear(), [params])
  const month = React.useMemo(() => params?.month || "", [params])
  const week = React.useMemo(() => params?.week || 0, [params])

  const { data: ARByDate, isLoading } = useGetARByDate(year, monthNameToNumber(month) as number)
  const { mutateAsync: addWAR } = useAddWAR();
    const { mutateAsync: addWARComp } = useAddWARComp();
  

  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  // Handle individual checkbox change
  const handleReportSelection = (reportId: string, checked: boolean) => {
    setSelectedReports((prev) => (checked ? [...prev, reportId] : prev.filter((id) => id !== reportId)))
  }

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked && ARByDate) {
      setSelectedReports(ARByDate.map((report: any) => report.id))
    } else {
      setSelectedReports([])
    }
  }

  // Handle weekly report creation
  const handleCreateWeeklyReport = async () => {
    if (selectedReports.length === 0) return
    setIsCreating(true);
    addWAR(user?.staff?.staff_id as string, {
      onSuccess: (data) => {
        const compositions = selectedReports.map((id) => ({
          ar: id,
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
            setIsCreating(false);
            setSelectedReports([]);
          },
        })
      },
    })
  }

  if (isLoading) {
    return (
      <LayoutWithBack title="Create Missed Reports (Weekly)" description={`${month} ${year} - Week ${week}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading AR reports...</p>
            </div>
          </CardContent>
        </Card>
      </LayoutWithBack>
    )
  }

  if (!ARByDate || ARByDate.length === 0) {
    return (
      <LayoutWithBack title="Create Missed Reports (Weekly)" description={`${month} ${year} - Week ${week}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No AR Reports Found</h3>
              <p className="text-muted-foreground">
                No acknowledgment reports found for {month} {year}.
              </p>
            </div>
          </CardContent>
        </Card>
      </LayoutWithBack>
    )
  }

  const allSelected = selectedReports.length === ARByDate.length
  const someSelected = selectedReports.length > 0 && selectedReports.length < ARByDate.length

  return (
    <LayoutWithBack title="Create Missed Reports (Weekly)" description={`${month} ${year} - Week ${week}`}>
      <div className="space-y-6">
        {/* Header with selection controls */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Available AR Reports</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Select acknowledgment reports to include in the weekly report
                </p>
              </div>
              <Badge variant="secondary">
                {ARByDate.length} {ARByDate.length === 1 ? "Report" : "Reports"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  ref={(el: HTMLButtonElement | null) => {
                    if (el) {
                      const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement | null
                      if (input) input.indeterminate = someSelected
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  {allSelected ? "Deselect All" : someSelected ? "Select All" : "Select All"}
                </label>
              </div>
              {selectedReports.length > 0 && <Badge variant="default">{selectedReports.length} selected</Badge>}
            </div>
          </CardHeader>
        </Card>

        {/* AR Reports List */}
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 p-6">
                {ARByDate.map((report: any) => (
                  <Card key={report.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          id={`report-${report.id}`}
                          checked={selectedReports.includes(report.id)}
                          onCheckedChange={(checked) => handleReportSelection(report.id, checked as boolean)}
                          className="mt-1"
                        />

                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-base">
                                {report.ar_title || `AR Report #${report.id}`}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">ID: {report.id}</p>
                            </div>
                            <Badge
                              variant={report.status === "Completed" ? "default" : "secondary"}
                              className={report.status === "Completed" ? "bg-green-500" : ""}
                            >
                              {report.status}
                            </Badge>
                          </div>

                          {/* Action Taken */}
                          {report.ar_action_taken && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Action Taken:</p>
                              <p className="text-sm">{report.ar_action_taken}</p>
                            </div>
                          )}

                          {/* Result */}
                          {report.ar_result && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Result:</p>
                              <p className="text-sm">{report.ar_result}</p>
                            </div>
                          )}

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* Date Started */}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Started:</span>
                              <span>
                                {formatDate(report.ar_date_started)}
                                {report.ar_time_started && ` at ${report.ar_time_started}`}
                              </span>
                            </div>

                            {/* Date Completed */}
                            {report.ar_date_completed && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">Completed:</span>
                                <span>
                                  {formatDate(report.ar_date_completed)}
                                  {report.ar_time_completed && ` at ${report.ar_time_completed}`}
                                </span>
                              </div>
                            )}

                            {/* Location */}
                            {(report.ar_sitio || report.ar_street) && (
                              <div className="flex items-center gap-2 md:col-span-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Location:</span>
                                <span>{[report.ar_sitio, report.ar_street].filter(Boolean).join(", ")}</span>
                              </div>
                            )}

                            {/* Files */}
                            {report.ar_files && report.ar_files.length > 0 && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Files:</span>
                                <Badge variant="outline">
                                  {report.ar_files.length} {report.ar_files.length === 1 ? "file" : "files"}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCreateWeeklyReport}
            disabled={selectedReports.length === 0 || isCreating}
            size="lg"
            className="min-w-[200px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Weekly Report ({selectedReports.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </LayoutWithBack>
  )
}
