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
import { useGetServiceChargeReqDetails, type ScheduleList } from "./queries/summonFetchQueries"
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
  const { sr_id, accused_addresses = [], complainant_addresses = [] } = location.state || {}

  const { data: details = {}, isLoading: isDetailLoading } = useGetServiceChargeReqDetails(sr_id)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const { mutate: resolve } = useResolveCase()
  const { mutate: escalate } = useEscalateCase()
  const { data: templates = [], isLoading: isLoadingTemplate } = useGetTemplateRecord()

  // Template data fetching
  const templateData = templates[0] || {}
  const barangayLogo =
    templateData.template_files?.find((file: any) => file.tf_logoType === "barangayLogo")?.tf_url || ""
  const cityLogo =
    templateData.template_files?.find((file: any) => file.tf_logoType === "cityLogo")?.tf_url || ""
  const email = templateData.temp_email || ""
  const telNum = templateData.temp_contact_num || ""

  const {
    sr_code,
    sr_case_status: case_status,
    sr_date_marked,
    comp_id,
    complaint = {},
    schedules = [],
  } = details as any

  const incident_type = complaint.comp_incident_type || "N/A"
  const accused =
    (complaint.accused_persons || []).map((a: any) => a.acsd_name).join(", ") || "N/A"
  
  const hasNonResidentComplainant = (complaint.complainant || []).some(
    (c: any) => !c.rp_id
  )

  const isCaseClosed = case_status === "Resolved" || case_status === "Escalated"
  
  const lastScheduleIsRescheduled = schedules.length > 0 
    ? schedules[schedules.length - 1].ss_is_rescheduled 
    : false

  const highestMediationLevel = schedules.length > 0 
    ? Math.max(...schedules.map((s: any) => {
        const level = s.ss_mediation_level;
        if (level === '1st Conciliation Proceedings') return 1;
        if (level === '2nd Conciliation Proceedings') return 2;
        if (level === '3rd Conciliation Proceedings') return 3;
        return 0;
      }))
    : 0;

  const isThirdMediationLevel = highestMediationLevel === 3;

  // Determine if Create button should be shown
  const shouldShowCreateButton = !isCaseClosed && 
                                hasNonResidentComplainant && 
                                (schedules.length === 0 || lastScheduleIsRescheduled) &&
                                !isThirdMediationLevel;

  // Determine if Resolve button should be shown
  const shouldShowResolveButton = !isCaseClosed;

  // Determine if Escalate button should be shown
  const shouldShowEscalateButton = !isCaseClosed && isThirdMediationLevel;

  const handleResolve = () => resolve(sr_id)
  const handleEscalate = () => escalate(sr_id)

  const columns: ColumnDef<ScheduleList>[] = [
    {
      accessorKey: "hearing_date",
      header: "Hearing Date",
      cell: ({ row }) => <span>{new Date(row.original.hearing_date).toLocaleDateString()}</span>,
    },
    {
      accessorKey: "hearing_time",
      header: "Hearing Time",
      cell: ({ row }) => <span>{formatTime(row.original.hearing_time)}</span>,
    },
    {
      accessorKey: "ss_mediation_level",
      header: "Mediation Level",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {row.original.ss_mediation_level}
        </span>
      ),
    },
    {
      accessorKey: "ss_reason",
      header: "Reason",
    },
    {
      accessorKey: "ss_is_rescheduled",
      header: "Status",
      cell: ({ row }) => {
        const isRescheduled = row.original.ss_is_rescheduled
        return (
          <div className="flex justify-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isRescheduled
                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              {isRescheduled ? "Rescheduled" : "Scheduled"}
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
        const canReschedule = !schedule.ss_is_rescheduled && !isThirdMediationLevel
        const showPreview = !schedule.ss_is_rescheduled

        return (
          <div className="flex justify-center gap-2">
             {!canReschedule && (
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                        <Eye size={16} />
                      </div>
                    }
                    title="Supporting Documents"
                    description={`Supporting documents for schedule ${new Date(schedule.hearing_date).toLocaleDateString()}`}
                    className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
                    mainContent={
                      <div>
                        <SummonSuppDocs ss_id={schedule.ss_id} />
                      </div>
                    }
                  />
                }
                content="View Details"
              />
            )} 
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
                        ss_id={row.original.ss_id}
                        sr_id={sr_id}
                        onSuccess={() => setEditingRowId(null)}
                      />
                    }
                    title="Mark as Rescheduled"
                    description="Add supporting document and a reason to confirm reschedule."
                    isOpen={editingRowId === row.original.ss_id}
                    onOpenChange={(open) => setEditingRowId(open ? row.original.ss_id : null)}
                  />
                }
                content="Reschedule"
              />
            )}
        
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
                  description={`Details for schedule on ${new Date(
                    schedule.hearing_date
                  ).toLocaleDateString()}`}
                  className="w-[90vw] h-[90vh] max-w-[1800px] max-h-[1200px]"
                  mainContent={
                    <div className="w-full h-full">
                      <SummonPreview
                        sr_code={sr_code || ""}
                        barangayLogo={barangayLogo}
                        cityLogo={cityLogo}
                        email={email}
                        telnum={telNum}
                        complainant={(complaint.complainant || []).map((c: any) => c.cpnt_name)}
                        complainant_address={complainant_addresses}
                        accused={accused.split(", ") || []}
                        accused_address={accused_addresses}
                        hearingDate={schedule.hearing_date}
                        hearingTime={schedule.hearing_time}
                        mediation={schedule.ss_mediation_level}
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
                Case No. {sr_code || "N/A"}
              </h1>
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
                      {(complaint.complainant || []).length > 0 ? (
                        (complaint.complainant || []).map((c: any) => (
                          <div
                            key={c.cpnt_id || c.cpnt_name}
                            className="flex items-center text-lg font-medium text-gray-800"
                          >
                            {c.cpnt_name}
                            <ResidentBadge hasRpId={Boolean(c.rp_id)} />
                          </div>
                        ))
                      ) : (
                        <span className="text-lg font-medium text-gray-800">N/A</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Accused</Label>
                    <p className="text-lg font-medium text-gray-800">{accused}</p>
                  </div>
                </div>

                {/* Right Column - Case Details */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Incident Type</Label>
                    <p className="text-lg font-medium text-gray-800">{incident_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Highest Mediation Level</Label>
                    <p className="text-lg font-medium text-gray-800">
                      {highestMediationLevel === 3 
                        ? "3rd Conciliation Proceedings" 
                        : highestMediationLevel === 2 
                        ? "2nd Conciliation Proceedings" 
                        : highestMediationLevel === 1 
                        ? "1st Conciliation Proceedings" 
                        : "No mediation scheduled"}
                    </p>
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
              <p className="text-sm text-gray-500">
                Marked on{" "}
                {sr_date_marked ? formatTimestamp(new Date(sr_date_marked)) : "an unknown date"}
              </p>
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
                  sr_id={sr_id}
                  onSuccess={() => setIsDialogOpen(false)}
                />
              }
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-2">
          <DataTable columns={columns} data={schedules} />
        </div>
      </div>
    </div>
  )
}