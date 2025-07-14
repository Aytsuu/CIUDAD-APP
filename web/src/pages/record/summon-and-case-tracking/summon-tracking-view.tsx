import { DataTable } from "@/components/ui/table/data-table"
import { Card } from "@/components/ui/card/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft, Check, AlertTriangle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { FileInput } from "lucide-react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import CreateNewSummon from "./summon-create"
import { useGetCaseDetails } from "./queries/summonFetchQueries"
import { useLocation } from "react-router"
import { useState } from "react"
import { formatTime } from "@/helpers/timeFormatter"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { useResolveCase, useEscalateCase } from "./queries/summonUpdateQueries"
import { Skeleton } from "@/components/ui/skeleton"
import SummonSuppDocs from "./summon-supp-doc-view"

function SummonTrackingView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { sr_id } = location.state || {}
  const { data: caseDetails, isLoading } = useGetCaseDetails(sr_id || "")
  const { mutate: markResolve } = useResolveCase()
  const { mutate: markEscalate } = useEscalateCase()

  const isCaseClosed = caseDetails?.sr_status === "Resolved" || caseDetails?.sr_status === "Escalated"

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "ca_hearing_date",
      header: "Hearing Date",
    },
    {
      accessorKey: "ca_hearing_time",
      header: "Hearing Time",
      cell: ({ row }) => formatTime(row.original.ca_hearing_time),
    },
    {
      accessorKey: "ca_date_of_issuance",
      header: "Date of Issuance",
      cell: ({ row }) => formatTimestamp(row.original.ca_date_of_issuance),
    },
    {
      accessorKey: "supporting_documents",
      header: "Supporting Documents",
      cell: ({ row }) => {
        const docs = row.original.supporting_documents || []
        const hasDocs = docs.length > 0

        return (
            <DialogLayout
              trigger={
                <div className={`cursor-pointer ${hasDocs ? "text-[#1273B8] underline" : "text-primary"}`}>
                  {hasDocs ? `View (${docs.length})` : "View Supporting Documents"}
                </div>
              }
              className="w-[90vw] h-[90vh] max-w-[1800px] max-h-[1200px]"
              title="Supporting Documents"
              description={
                hasDocs ? "Documents associated with this case activity." : "No supporting documents available"
              }
              mainContent={
                    <div className="overflow-auto">
                        <SummonSuppDocs ca_id = {row.original.ca_id}/>
                    </div>
                }
            />
        )
      },
    },
    { accessorKey: "ca_reason", header: "Reason" },
    {
      accessorKey: "file",
      header: "File",
      cell: ({ row }) => (
        <Link
          to={row.original.caf?.caf_url || "#"}
          className="text-primary hover:text-blue-800 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          View File
        </Link>
      ),
    },
  ]

  if (isLoading) {
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

  const handleResolve = (srId: string) => {
    markResolve(srId)
  }

  const handleEscalate = (srId: string, comp_id: string) => {
    markEscalate({
      srId,
      comp_id,
    })
  }

  return (
    <div className="w-full h-full">
      <div className="overflow-y-auto h-full">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-row gap-4">
            <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
              <ChevronLeft />
            </Button>
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
              Case No. {caseDetails?.sr_id}
            </h1>
          </div>
        </div>

        <hr className="border-gray mb-7 sm:mb-8" />

        {/* Case Details Card */}
        <Card className="w-full bg-white p-6 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - People */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Complainant</Label>
                    <p className="text-lg font-medium text-gray-800">{caseDetails?.complainant?.cpnt_name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Accused</Label>
                    <p className="text-lg font-medium text-gray-800">
                      {caseDetails?.complaint?.accused?.map((a) => a.acsd_name).join(", ") || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Right Column - Case Details */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Allegation</Label>
                    <p className="text-gray-700 leading-relaxed">{caseDetails?.complaint?.comp_allegation || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 font-normal mb-2 block">Incident Type</Label>
                    <p className="text-lg font-medium text-gray-800">
                      {caseDetails?.complaint?.comp_incident_type || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`px-4 py-1 rounded-full text-sm font-medium flex items-center justify-center ${
                caseDetails?.sr_status === "Ongoing"
                  ? "bg-[#5B72CF]/40 border border-[#5B72CF] text-[#5B72CF]"
                  : caseDetails?.sr_status === "Resolved"
                    ? "bg-green-100 border border-green-500 text-green-700"
                    : "bg-red-100 border border-red-500 text-red-700"
              }`}
            >
              <span className="font-medium">{caseDetails?.sr_status || "Unknown"}</span>
            </div>
          </div>

          {/* Action Buttons or Decision Date */}
          {!isCaseClosed ? (
            <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
              <ConfirmationModal
                trigger={
                  <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Mark as Resolved
                  </Button>
                }
                title="Confirm Resolution"
                description="Are you sure you want to mark this case as resolved?"
                actionLabel="Confirm"
                onClick={() => handleResolve(sr_id)}
              />
              <ConfirmationModal
                trigger={
                  <Button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Escalate
                  </Button>
                }
                title="Confirm Escalation"
                description="Are you sure you want to escalate this case?"
                actionLabel="Confirm"
                onClick={() => handleEscalate(sr_id, caseDetails?.complaint.comp_id || "")}
              />
            </div>
          ) : (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Marked on{" "}
                {caseDetails.sr_decision_date ? formatTimestamp(caseDetails.sr_decision_date) : "an unknown date"}
              </p>
            </div>
          )}
        </Card>

        {/* Case Activity Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-xl text-darkBlue2">Case Activity</h2>
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <FileInput className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!isCaseClosed && (
                <DialogLayout
                  trigger={<Button>+ Create New Schedule</Button>}
                  title="Create New Schedule"
                  description="Schedule a new summon."
                  mainContent={<CreateNewSummon sr_id={sr_id} onSuccess={() => setIsDialogOpen(false)} />}
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                />
              )}
            </div>
            <div>
              <DataTable columns={columns} data={caseDetails?.case_activities || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummonTrackingView
