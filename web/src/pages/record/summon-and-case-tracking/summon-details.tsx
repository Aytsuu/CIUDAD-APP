import { useLocation } from "react-router"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useState } from "react"
import { useNavigate } from "react-router"
import { ComplaintRecordForSummon } from "./complaint-record"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronLeft, RefreshCw, Inspect, Check, AlertTriangle, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import SummonPreview from "./summon-preview"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import SummonSuppDocForm from "./summon-supp-doc-form"
import { useGetTemplateRecord } from "../council/templates/queries/template-FetchQueries"
import { formatTime } from "@/helpers/timeFormatter"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useResolveCase } from "./queries/summonUpdateQueries"
import { useEscalateCase } from "./queries/summonUpdateQueries"
import { useGetSummonCaseDetails } from "./queries/summonFetchQueries"
import type { HearingSchedule } from "./summon-types"
import { formatTimestamp } from "@/helpers/timestampformatter"
import CreateSummonSched from "./summon-create"
import SummonSuppDocs from "./summon-supp-doc-view"

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

  console.log('sc_id', sc_id)
  console.log('accused_addresses', accused_addresses)
  console.log('complainant_addresses', complainant_addresses)
  console.log('comp_names', comp_names)
  console.log('acc_names', acc_names)

  const { data: caseDetails, isLoading: isDetailLoading } = useGetSummonCaseDetails(sc_id)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const { mutate: resolve } = useResolveCase()
  const { mutate: escalate } = useEscalateCase()
  const { data: templates = [], isLoading: isLoadingTemplate } = useGetTemplateRecord()

  console.log('caseDetails', caseDetails)

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
    sc_case_status: case_status,
    sc_date_marked,
    sc_reason,
    comp_id,
    hearing_schedules = [],
  } = caseDetails || {}

  const isCaseClosed = case_status === "Resolved" || case_status === "Escalated"
  
  const lastScheduleIsRescheduled = hearing_schedules.length > 0 
    ? hearing_schedules[hearing_schedules.length - 1].hs_is_closed 
    : false

  const highestMediationLevel = hearing_schedules.length > 0 
    ? Math.max(...hearing_schedules.map((s: HearingSchedule) => {
        const level = s.hs_level;
        if (level === '1st Mediation') return 1;
        if (level === '2nd Mediation') return 2;
        if (level === '3rd Mediation') return 3;
        return 0;
      }))
    : 0;

  const isThirdMediationLevel = highestMediationLevel === 3;

  // Determine if Create button should be shown
  const shouldShowCreateButton = !isCaseClosed && 
                                !hasResident && 
                                (hearing_schedules.length === 0 || lastScheduleIsRescheduled) &&
                                !isThirdMediationLevel;

  // Determine if Resolve button should be shown
  const shouldShowResolveButton = !isCaseClosed && case_status !== "Waiting for Schedule";

  // Determine if Escalate button should be shown
  const shouldShowEscalateButton = !isCaseClosed && isThirdMediationLevel;

  const handleResolve = () => resolve(sc_id)
  const handleEscalate = () => escalate(sc_id)

  const columns: ColumnDef<HearingSchedule>[] = [
    {
      accessorKey: "summon_date.sd_date",
      header: "Hearing Date",
      cell: ({ row }) => <span>{new Date(row.original.summon_date.sd_date).toLocaleDateString()}</span>,
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
      accessorKey: "remarks",
      header: "Remarks Count",
      cell: ({ row }) => <span>{row.original.remarks.length}</span>,
    },
    {
      accessorKey: "hearing_minutes",
      header: "Minutes Count",
      cell: ({ row }) => <span>{row.original.hearing_minutes.length}</span>,
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
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const schedule = row.original
        const canReschedule = !schedule.hs_is_closed && !isThirdMediationLevel
        const showPreview = !schedule.hs_is_closed

        return (
          <div className="flex justify-center gap-2">
            {/* View Supporting Documents */}
            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                      <Eye size={16} />
                    </div>
                  }
                  title="Supporting Documents & Remarks"
                  description={`Documents and remarks for ${schedule.hs_level} on ${new Date(schedule.summon_date.sd_date).toLocaleDateString()}`}
                  className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
                  mainContent={
                    <div>
                      <SummonSuppDocs
                      hs_id={schedule.hs_id} />
                    </div>
                  }
                />
              }
              content="View Details"
            />
            
            {/* Reschedule */}
            {canReschedule && (
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
                        <RefreshCw size={16} />
                      </div>
                    }
                    mainContent={
                      <SummonSuppDocForm
                        hs_id={row.original.hs_id}
                        sc_id={sc_id}
                        onSuccess={() => setEditingRowId(null)}
                      />
                    }
                    title="Mark as Rescheduled"
                    description="Add supporting document and a reason to confirm reschedule."
                    isOpen={editingRowId === row.original.hs_id}
                    onOpenChange={(open) => setEditingRowId(open ? row.original.hs_id : null)}
                  />
                }
                content="Reschedule"
              />
            )}
        
            {/* Preview Summon */}
            {showPreview && (
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                        <Inspect size={16} />
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
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-16 w-full mt-4" />
      </div>
    )
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
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Highest Mediation Level</Label>
                    <p className="text-lg font-medium text-gray-800">
                      {highestMediationLevel === 3 
                        ? "3rd Mediation" 
                        : highestMediationLevel === 2 
                        ? "2nd Mediation" 
                        : highestMediationLevel === 1 
                        ? "1st Mediation" 
                        : "No mediation scheduled"}
                    </p>
                  </div>
                  {/* Removed Date Marked from here */}
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
                {shouldShowEscalateButton && (
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
                )}
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

        {/* Only show Create New Schedule button if conditions are met */}
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