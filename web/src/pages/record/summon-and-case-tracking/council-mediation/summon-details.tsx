import { useLocation } from "react-router"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { ComplaintRecordForSummon } from "../complaint-record"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronLeft, Check, CircleAlert  } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import SummonPreview from "./summon-preview"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { useGetTemplateRecord } from "../../council/templates/queries/template-FetchQueries"
import { formatTime } from "@/helpers/timeFormatter"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useResolveCase } from "../queries/summonUpdateQueries"
import { useGetSummonCaseDetails } from "../queries/summonFetchQueries"
import type { HearingSchedule } from "../summon-types"
import { formatTimestamp } from "@/helpers/timestampformatter"
import CreateSummonSched from "./summon-create"
import { useLoading } from "@/context/LoadingContext"
import HearingMinutesForm from "./hearing-minutes-form"
import { formatDate } from "@/helpers/dateHelper"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import SummonRemarksView from "../summon-remarks-view"

function ResidentBadge({ hasRpId }: { hasRpId: boolean }) {
  return (
    <span
      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
        hasRpId
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-200 text-gray-700 border border-gray-300"
      }`}
    >
      {hasRpId ? "Resident" : "Non-resident"}
    </span>
  )
}

export default function SummonDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { 
    sc_id, 
    accused_addresses = [], 
    complainant_addresses = [], 
    incident_type, 
    comp_names = [], 
    acc_names = [] ,
    hasResident = false,
  } = location.state || {}

  const { data: caseDetails, isLoading: isDetailLoading } = useGetSummonCaseDetails(sc_id)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const { mutate: resolve } = useResolveCase()
  // const { mutate: escalate } = useEscalateCase()
  const { data: templates = [], isLoading: isLoadingTemplate } = useGetTemplateRecord()
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (isDetailLoading || isLoadingTemplate) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isDetailLoading, isLoadingTemplate, showLoading, hideLoading]);

  // Template data fetching
  const templateData = templates[0] || {}
  const barangayLogo =
    templateData.template_files?.find((file: any) => file.tf_logoType === "barangayLogo")?.tf_url || ""
  const cityLogo =
    templateData.template_files?.find((file: any) => file.tf_logoType === "cityLogo")?.tf_url || ""
  const email = templateData.temp_email || ""
  const telNum = templateData.temp_contact_num || ""

  // Extract data from caseDetails
  const {
    sc_code,
    sc_mediation_status: case_status,
    sc_date_marked,
    sc_reason,
    comp_id,
    hearing_schedules = [],
  } = caseDetails || {}

  const isCaseClosed = case_status === "Resolved" || case_status === "Escalated"
  
  const lastScheduleIsRescheduled = hearing_schedules.length > 0 
    ? hearing_schedules[hearing_schedules.length - 1].hs_is_closed 
    : false

  // Check if current mediation is 3rd level and closed
  const isThirdMediation = hearing_schedules.some(schedule => 
    schedule.hs_level === "3rd MEDIATION" && schedule.hs_is_closed
  )

  // Determine if Create button should be shown
  const shouldShowCreateButton = !isCaseClosed && 
                                !hasResident && 
                                (hearing_schedules.length === 0 || lastScheduleIsRescheduled) &&
                                !isThirdMediation // Hide if it's 3rd mediation and closed

  // Determine if Resolve button should be shown
  const shouldShowResolveButton = !isCaseClosed

  const handleResolve = () => resolve(sc_id)
  // const handleEscalate = () => escalate(sc_id)

  // Function to handle minutes view click
  const handleMinutesClick = (hearingMinutes: any[], hs_id: string) => {
    // Check if there are hearing minutes with URLs
    const hasMinutesWithUrl = hearingMinutes.length > 0 && hearingMinutes.some(minute => minute.hm_url);
    
    if (hasMinutesWithUrl) {
      // Open the first available minute URL in a new tab
      const firstMinute = hearingMinutes.find(minute => minute.hm_url);
      if (firstMinute?.hm_url) {
        window.open(firstMinute.hm_url, '_blank');
      }
    } else {
      // Open the dialog to add hearing minutes
      setEditingRowId(hs_id);
    }
  };

  const columns: ColumnDef<HearingSchedule>[] = [
    {
      accessorKey: "summon_date.sd_date",
      header: "Hearing Date",
      cell: ({ row }) => <span>{formatDate(row.original.summon_date.sd_date, "long")}</span>,
    },
    {
      accessorKey: "summon_time.st_start_time",
      header: "Hearing Time",
      cell: ({ row }) => <span>{formatTime(row.original.summon_time.st_start_time)}</span>,
    },
    {
      accessorKey: "hs_level",
      header: "Mediation Level",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {row.original.hs_level}
        </span>
      ),
    },
    {
        accessorKey: "remark",
        header: "Remarks",
        cell: ({ row }) => {
          const remark = row.original.remark;
          
          if (remark && remark.rem_id) {
            return (
              <DialogLayout
                className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
                trigger={
                  <div className="bg-white cursor-pointer hover:text-[#0e5a97] text-[#1273B8] text-[12px] underline">
                    View Remarks  
                  </div>
                }
                mainContent={
                  <SummonRemarksView
                    rem_remarks={remark.rem_remarks}
                    rem_date={remark.rem_date}
                    supp_docs={remark.supp_docs}
                  />
                }
                title="Remarks"
                description="Detailed view of remarks and attached files."
              />
            );
          } else {
            return (
              <div className="text-red-500 flex items-center gap-1 justify-center">
                  <CircleAlert size={16} />
                  <span className="text-xs">No remarks available</span>
              </div>
            )
          }
        }
    },
    {
      accessorKey: "hearing_minutes",
      header: "Minutes",
      cell: ({ row }) => {
        const hasMinutes = row.original.hearing_minutes.length > 0;
        const hasMinutesWithUrl = hasMinutes && row.original.hearing_minutes.some((minute: any) => minute.hm_url);
        const hasRemarks = row.original.remark && row.original.remark.rem_id;
        
        const isDisabled = !hasRemarks;
        
        if (hasMinutesWithUrl) {
          return (
            <div 
              className={`cursor-pointer text-[12px] underline ${
                isDisabled 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-[#1273B8] hover:text-[#0e5a97]"
              }`}
              onClick={isDisabled ? undefined : () => handleMinutesClick(row.original.hearing_minutes, row.original.hs_id)}
            >
              View Minutes
            </div>
          );
        } else {
          // If disabled, show non-clickable version
          if (isDisabled) {
            return (
              <div className="text-gray-400 flex items-center gap-1 justify-center cursor-not-allowed">
                <CircleAlert size={16} />
                <span className="text-xs">No minutes available</span>
              </div>
            );
          }
          return (
            <DialogLayout
              trigger={
                <div className="text-red-500 flex items-center gap-1 underline justify-center cursor-pointer">
                  <CircleAlert size={16} />
                  <span className="text-xs">No minutes available</span>
                </div>
              }
              mainContent={
                <HearingMinutesForm 
                  hs_id={row.original.hs_id}
                  sc_id={sc_id}
                  onSuccess={() => setEditingRowId(null)}
                />
              }
              title="Add Hearing Minutes"
              description="Add hearing minutes document to close the schedule."
              isOpen={editingRowId === row.original.hs_id}
              onOpenChange={(open) => setEditingRowId(open ? row.original.hs_id : null)}
            />
          );
        }
      },
    },
    {
      accessorKey: "hs_is_closed",
      header: "Status",
      cell: ({ row }) => {
        const isClosed = row.original.hs_is_closed
        return (
          <div className="flex justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isClosed
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              {isClosed ? "Closed" : "Open"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "",
      header: " ",
      cell: ({ row }) => {
        const schedule = row.original
        const showPreview = !schedule.hs_is_closed

        return (
          <div className="flex justify-center gap-2">
            {/* Preview Summon */}
            {showPreview && (
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className="px-4 py-2 rounded-md text-sm border bg-blue-100 text-blue-800 border-blue-500 hover:bg-blue-200 hover:text-blue-900 cursor-pointer">
                        <div className='text-12px'>Generate File</div>
                      </div>
                    }
                    title="Schedule Details"
                    description={`Details for ${schedule.hs_level} on ${new Date(
                      schedule.summon_date.sd_date
                    ).toLocaleDateString()}`}
                    className="w-[90vw] h-[90vh] max-w-[1800px] max-h-[1200px]"
                    mainContent={
                      <div className="w-full h-full">
                        <SummonPreview
                          sr_code={sc_code || ""}
                          barangayLogo={barangayLogo}
                          cityLogo={cityLogo}
                          email={email}
                          telnum={telNum}
                          complainant={comp_names}
                          complainant_address={complainant_addresses}
                          accused={acc_names}
                          accused_address={accused_addresses}
                          hearingDate={schedule.summon_date.sd_date}
                          hearingTime={schedule.summon_time.st_start_time}
                          mediation={schedule.hs_level}
                          issuance_date={new Date().toISOString()}
                        />
                      </div>
                    }
                  />
                }
                content="Preview"
              />
            )}
          </div>
        )
      },
    },
  ]

  if (isLoadingTemplate || isDetailLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading summon case details...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="overflow-y-auto h-full">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-row gap-4">
            <Button className="text-black p-2 self-start" variant="outline" onClick={() => navigate(-1)}>
              <ChevronLeft />
            </Button>
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                Case No. {sc_code || "N/A"}
              </h1>
              {/* Only show reason if not null */}
              {sc_reason && (
                <p className="text-sm text-gray-600">Reason: {sc_reason}</p>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray mb-7 sm:mb-8" />

        {/* Lupon Tagapamayapa Notice for 3rd Mediation */}
        {isThirdMediation && (
          <Alert className="bg-amber-50 border-amber-200 mb-6">
            <InfoIcon className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Case Forwarded:</strong> This case has completed the 3rd council mediation and has been forwarded to the Office of Lupon Tagapamayapa for further action.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full bg-white p-6 shadow-sm mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - People */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Complainant</Label>
                    <div className="space-y-1">
                      {comp_names.length > 0 ? (
                        comp_names.map((name: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center text-lg font-medium text-gray-800"
                          >
                            {name}
                            <ResidentBadge hasRpId={hasResident} />
                          </div>
                        ))
                      ) : (
                        <span className="text-lg font-medium text-gray-800">N/A</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Accused</Label>
                    <div className="space-y-1">
                      {acc_names.length > 0 ? (
                        acc_names.map((name: string, index: number) => (
                          <p key={index} className="text-lg font-medium text-gray-800">
                            {name}
                          </p>
                        ))
                      ) : (
                        <p className="text-lg font-medium text-gray-800">N/A</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Case Details */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Incident Type</Label>
                    <p className="text-lg font-medium text-gray-800">{incident_type || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`px-4 py-1 rounded-full text-sm font-medium flex items-center justify-center ${
                case_status === "Ongoing"
                  ? "bg-[#5B72CF]/40 border border-[#5B72CF] text-[#5B72CF]"
                  : case_status === "Resolved"
                  ? "bg-green-100 border border-green-500 text-green-700"
                  : case_status === "Waiting for Schedule"
                  ? "bg-yellow-100 border border-yellow-500 text-yellow-700"
                  : "bg-red-100 border border-red-500 text-red-700"
              }`}
            >
              <span className="font-medium">{case_status || "Unknown"}</span>
            </div>
          </div>

          {/* Action Buttons or Decision Date */}
          <div className="border-t border-gray-100 flex justify-between items-center pt-4">
            {/* Left side - View Complaint button */}
            <DialogLayout
              className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
              trigger={
                <Button className="text-[#1273B8] underline cursor-pointer bg-transparent shadow-none text-sm font-medium hover:text-[#0e5a97] hover:bg-white transition-colors">
                  View Complaint
                </Button>
              }
              mainContent={
                <div className="flex flex-col h-full overflow-y-hidden">
                  <div className="overflow-y-auto flex-1 pr-2 max-h-[calc(90vh-100px)]">
                    <ComplaintRecordForSummon comp_id={comp_id || ""} isPending={false} />
                  </div>
                </div>
              }
              title="Complaint Record"
              description="Full details of the complaint filed."
            />

            {/* Right side - Action buttons or status */}
            {!isCaseClosed ? (
              <div className="flex gap-3">
                {shouldShowResolveButton && (
                  <ConfirmationModal
                    trigger={
                      <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Mark as Resolved
                      </Button>
                    }
                    title="Confirm Resolution"
                    description="Are you sure you want to mark this case as resolved?"
                    actionLabel="Confirm"
                    onClick={handleResolve}
                  />
                )}
                {/* {shouldShowEscalateButton && (
                  <ConfirmationModal
                    trigger={
                      <Button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Escalate
                      </Button>
                    }
                    title="Confirm Escalation"
                    description="Are you sure you want to escalate this case?"
                    actionLabel="Confirm"
                    onClick={handleEscalate}
                  />
                )} */}
              </div>
            ) : (
              // Only show date marked if not null and case is closed
              sc_date_marked && (
                <p className="text-sm text-gray-500">
                  Marked on{" "}
                  {formatTimestamp(new Date(sc_date_marked))}
                </p>
              )
            )}
          </div>
        </Card>

        {/* Only show Create New Schedule button if conditions are met AND not in 3rd mediation */}
        {shouldShowCreateButton && (
          <div className='w-full py-2 flex flex-end justify-end'>
            <DialogLayout
              trigger={<Button>+ Create New Schedule</Button>}
              title="Create New Schedule"
              description="Schedule a new summon."
              mainContent={
                <CreateSummonSched
                  sc_id={sc_id}
                  onSuccess={() => setIsDialogOpen(false)}
                />
              }
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-2">
          <DataTable columns={columns} data={hearing_schedules} />
        </div>
      </div>
    </div>
  )
}