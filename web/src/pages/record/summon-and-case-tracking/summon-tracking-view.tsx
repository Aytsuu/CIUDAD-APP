// import { DataTable } from "@/components/ui/table/data-table"
// import { Card } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button/button"
// import { ChevronLeft, Check, AlertTriangle} from "lucide-react"
// import type { ColumnDef } from "@tanstack/react-table"
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
// import { FileInput } from "lucide-react"
// import { useNavigate } from "react-router"
// import { ConfirmationModal } from "@/components/ui/confirmation-modal"
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import CreateNewSummon from "./summon-create"
// import { useGetCaseDetails } from "./queries/summonFetchQueries"
// import { useLocation } from "react-router"
// import { useState } from "react"
// import { formatTime } from "@/helpers/timeFormatter"
// import { formatTimestamp } from "@/helpers/timestampformatter"
// import { useResolveCase, useEscalateCase } from "./queries/summonUpdateQueries"
// import { Skeleton } from "@/components/ui/skeleton"
// import SummonSuppDocs from "./summon-supp-doc-view"
// import { SummonPreview } from "./summon-preview"
// import { ComplaintRecordForSummon } from "./complaint-record"

// function SummonTrackingView() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const navigate = useNavigate()
//   const location = useLocation()
//   const { sr_id, comp_id, sr_code } = location.state || {}
//   const { data: caseDetails, isLoading } = useGetCaseDetails(sr_id || "")
//   const { mutate: markResolve } = useResolveCase()
//   const { mutate: markEscalate } = useEscalateCase()
//   const accusedNames = caseDetails?.complaint?.accused?.map((a) => a.acsd_name) || []

//   const isCaseClosed = caseDetails?.sr_status === "Resolved" || caseDetails?.sr_status === "Escalated"

//   const columns: ColumnDef<any>[] = [
//     {
//       accessorKey: "ca_hearing_date",
//       header: "Hearing Date",
//     },
//     {
//       accessorKey: "ca_hearing_time",
//       header: "Hearing Time",
//       cell: ({ row }) => formatTime(row.original.ca_hearing_time),
//     },
//     {
//       accessorKey: "ca_date_of_issuance",
//       header: "Date of Issuance",
//       cell: ({ row }) => formatTimestamp(row.original.ca_date_of_issuance),
//     },
//     { accessorKey: "ca_reason", header: "Reason" },
//     {
//       accessorKey: "supporting_documents",
//       header: "Supporting Documents",
//       cell: ({ row }) => {
//         const docs = row.original.supporting_documents || []
//         return (
//           <DialogLayout
//             trigger={<div className="cursor-pointer text-[#1273B8] underline">View ({docs.length})</div>}
//             className="w-[90vw] h-[90vh] max-w-[1800px] max-h-[1200px]"
//             title="Supporting Documents"
//             description="Documents associated with this case activity."
//             mainContent={
//               <div className="overflow-auto">
//                 <SummonSuppDocs ca_id={row.original.ca_id} />
//               </div>
//             }
//           />
//         )
//       },
//     },
//     {
//       accessorKey: "file",
//       header: "File",
//       cell: ({ row }) => {
//         const activity = row.original

//         return (
//           <DialogLayout
//             trigger={<div className="text-[#1273B8] underline cursor-pointer">View File</div>}
//             title="Summon Preview"
//             description={`Preview of summon for case ${caseDetails?.sr_code}`}
//             className="w-[90vw] h-[90vh] max-w-[1800px] max-h-[1200px]"
//             mainContent={
//               <div className="w-full h-full">
//                 <SummonPreview
//                   sr_code={caseDetails?.sr_code || ""}
//                   incident_type={caseDetails?.complaint?.comp_incident_type || ""}
//                   complainant={caseDetails?.complainant?.map((c) => c.cpnt_name) || []}
//                   complainant_address={
//                     caseDetails?.complainant?.map((c) => c.address?.formatted_address || "N/A") || []
//                   }
//                   accused={caseDetails?.complaint?.accused?.map((a) => a.acsd_name) || []}
//                   accused_address={caseDetails?.complaint?.accused?.map((a) => a.address?.formatted_address) || []}
//                   hearingDate={activity.ca_hearing_date}
//                   hearingTime={activity.ca_hearing_time}
//                   mediation={activity.ca_mediation}
//                   issuance_date={activity.ca_date_of_issuance}
//                 />
//               </div>
//             }
//           />
//         )
//       },
//     },
//   ]

//   if (isLoading) {
//     return (
//       <div className="p-4 border rounded-lg">
//         <Skeleton className="h-8 w-1/3 mb-4" />
//         <div className="space-y-3">
//           <Skeleton className="h-4 w-full" />
//           <Skeleton className="h-4 w-2/3" />
//           <Skeleton className="h-4 w-3/4" />
//           <Skeleton className="h-4 w-1/2" />
//         </div>
//         <Skeleton className="h-16 w-full mt-4" />
//       </div>
//     )
//   }

//   const handleResolve = (srId: string) => {
//     markResolve(srId)
//   }

//   const handleEscalate = (srId: string, comp_id: string) => {
//     markEscalate({
//       srId,
//       comp_id,
//     })
//   }

//   return (
//     <div className="w-full h-full">
//       <div className="overflow-y-auto h-full">
//         {/* Header */}
//         <div className="flex flex-col gap-3 mb-3">
//           <div className="flex flex-row gap-4">
//             <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
//               <ChevronLeft />
//             </Button>
//             <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//               Case No. {sr_code}
//             </h1>
//           </div>
//         </div>

//         <hr className="border-gray mb-7 sm:mb-8" />
//         {/* View Complaint Button */}
//         <div className='flex justify-end'>
//           <DialogLayout
//               className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
//               trigger={
//                   <Button className="text-[#1273B8] underline cursor-pointer bg-snow shadow-none text-sm font-medium hover:text-[#0e5a97] hover:bg-snow transition-colors" >
//                     View Complaint
//                   </Button>
//               }
//               mainContent={
//                   <div className="flex flex-col h-full overflow-y-hidden">
//                       <div className="overflow-y-auto flex-1 pr-2 max-h-[calc(90vh-100px)]">
//                           <ComplaintRecordForSummon 
//                               comp_id={comp_id}
//                               isPending={false}
//                           />
//                       </div>
//                   </div>
//               }
//               title="Complaint Record"
//               description="Full details of the complaint filed."
//           />
//         </div>

//         {/* Case Details Card */}
//         <Card className="w-full bg-white p-6 shadow-sm mb-8">
//           <div className="flex justify-between items-start mb-6">
//             <div className="flex-1">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {/* Left Column - People */}
//                 <div className="space-y-6">
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Complainant</Label>
//                     <p className="text-lg font-medium text-gray-800">
//                       {caseDetails?.complainant?.length
//                         ? caseDetails.complainant.map((c) => c.cpnt_name).join(", ")
//                         : "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Accused</Label>
//                     <p className="text-lg font-medium text-gray-800">
//                       {caseDetails?.complaint?.accused?.map((a) => a.acsd_name).join(", ") || "N/A"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Right Column - Case Details */}
//                 <div className="space-y-6">
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Allegation</Label>
//                     <p className="text-gray-700 leading-relaxed">
//                       {caseDetails?.complaint?.comp_allegation || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Incident Type</Label>
//                     <p className="text-lg font-medium text-gray-800">
//                       {caseDetails?.complaint?.comp_incident_type || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Status Badge */}
//             <div
//               className={`px-4 py-1 rounded-full text-sm font-medium flex items-center justify-center ${
//                 caseDetails?.sr_status === "Ongoing"
//                   ? "bg-[#5B72CF]/40 border border-[#5B72CF] text-[#5B72CF]"
//                   : caseDetails?.sr_status === "Resolved"
//                     ? "bg-green-100 border border-green-500 text-green-700"
//                     : "bg-red-100 border border-red-500 text-red-700"
//               }`}
//             >
//               <span className="font-medium">{caseDetails?.sr_status || "Unknown"}</span>
//             </div>
//           </div>

//           {/* Action Buttons or Decision Date */}
//           {!isCaseClosed ? (
//             <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
//               <ConfirmationModal
//                 trigger={
//                   <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center gap-2">
//                     <Check className="w-4 h-4" /> Mark as Resolved
//                   </Button>
//                 }
//                 title="Confirm Resolution"
//                 description="Are you sure you want to mark this case as resolved?"
//                 actionLabel="Confirm"
//                 onClick={() => handleResolve(sr_id)}
//               />
//               <ConfirmationModal
//                 trigger={
//                   <Button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2">
//                     <AlertTriangle className="w-4 h-4" /> Escalate
//                   </Button>
//                 }
//                 title="Confirm Escalation"
//                 description="Are you sure you want to escalate this case?"
//                 actionLabel="Confirm"
//                 onClick={() => handleEscalate(sr_id, caseDetails?.complaint.comp_id || "")}
//               />
//             </div>
//           ) : (
//             <div className="flex justify-end pt-4 border-t border-gray-100">
//               <p className="text-sm text-gray-500">
//                 Marked on{" "}
//                 {caseDetails.sr_decision_date ? formatTimestamp(caseDetails.sr_decision_date) : "an unknown date"}
//               </p>
//             </div>
//           )}
//         </Card>

//         {/* Case Activity Section */}
//         <div className="mt-8">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="font-semibold text-xl text-darkBlue2">Case Activity</h2>
//           </div>
//           <div className="bg-white rounded-lg shadow">
//             <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
//               <div>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline">
//                       <FileInput className="mr-2 h-4 w-4" />
//                       Export
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent>
//                     <DropdownMenuItem>Export as CSV</DropdownMenuItem>
//                     <DropdownMenuItem>Export as Excel</DropdownMenuItem>
//                     <DropdownMenuItem>Export as PDF</DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>

//               {!isCaseClosed && (
//                 <DialogLayout
//                   trigger={<Button>+ Create New Schedule</Button>}
//                   title="Create New Schedule"
//                   description="Schedule a new summon."
//                   mainContent={
//                     <CreateNewSummon
//                       sr_id={sr_id}
//                       sr_code={caseDetails?.sr_code || ""}
//                       complainant={caseDetails?.complainant?.map((c) => c.cpnt_name) || []}
//                       complainant_address={
//                         caseDetails?.complainant?.map((c) => c.address?.formatted_address || "N/A") || []
//                       }
//                       accused={accusedNames}
//                       accused_address={
//                         caseDetails?.complaint.accused.map((accused) => accused.address.formatted_address) || []
//                       }
//                       incident_type={caseDetails?.complaint.comp_incident_type || ""}
//                       onSuccess={() => setIsDialogOpen(false)}
//                     />
//                   }
//                   isOpen={isDialogOpen}
//                   onOpenChange={setIsDialogOpen}
//                 />
//               )}
//             </div>
//             <div>
//               <DataTable columns={columns} data={caseDetails?.case_activities || []} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default SummonTrackingView

import { useLocation } from "react-router"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useState } from "react"
import { useNavigate } from "react-router"
import { ComplaintRecordForSummon } from "./complaint-record"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ChevronLeft, RefreshCw, Eye, Inspect } from "lucide-react"
import { useGetScheduleList, type ScheduleList } from "./queries/summonFetchQueries"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTime } from "@/helpers/timeFormatter"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import SummonPreview from "./summon-preview"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import SummonSuppDocForm from "./summon-supp-doc-form"
import { useGetTemplateRecord } from "../council/templates/queries/template-FetchQueries"


export default function SummonScheduleList(){
  const navigate = useNavigate()
  const location = useLocation()
  const { sr_id, comp_id, sr_code,
    complainant = [], accused = [], accused_addresses = [], complainant_addresses = []
   } = location.state || {}
  const { data: schedList = [], isLoading: isSchedLoading} = useGetScheduleList(sr_id)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const { data: templates = [], isLoading: isLoadingTemplate } = useGetTemplateRecord()
  const templateData = templates[0] || {};
  const barangayLogo =
    templateData.template_files?.find(
      (file: any) => file.tf_logoType === "barangayLogo"
    )?.tf_url || "";
  const cityLogo =
    templateData.template_files?.find(
      (file: any) => file.tf_logoType === "cityLogo"
    )?.tf_url || "";
  const email = templateData.temp_email || "";
  const telNum = templateData.temp_contact_num || "";

  // const isCaseClosed = caseDetails?.sr_status === "Resolved" || caseDetails?.sr_status === "Escalated"

  
  console.log('Complainant', complainant_addresses)
  console.log('Accused', accused_addresses)

  const columns: ColumnDef<ScheduleList>[] = [
    {
      accessorKey: "hearing_date",
      header: "Hearing Date",
      cell: ({ row }) => (
        <span>{new Date(row.original.hearing_date).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "hearing_time",
      header: "Hearing Time",
      cell: ({ row }) => (
          <span>{formatTime(row.original.hearing_time)}</span>
      ),
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
        const canReschedule = !schedule.ss_is_rescheduled

        return (
            <div className="flex justify-center gap-2">
            {canReschedule && (
              <TooltipLayout
                  trigger={
                      <div>
                          <DialogLayout
                            trigger={
                              <div className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
                                  <RefreshCw size={16} />
                              </div>
                            }
                            mainContent={
                              <SummonSuppDocForm
                                ss_id = {row.original.ss_id}
                                sr_id = {sr_id}
                                onSuccess={() => setEditingRowId(null)}
                              />
                            }
                            title="Mark as Rescheduled"
                            description="Add supporting document and a reason to confirm reschedule."
                            isOpen={editingRowId == row.original.ss_id}
                            onOpenChange={(open) => setEditingRowId(open? row.original.ss_id: null)}
                          />
                          </div>
                  }
                  content="Reschedule"
              />
            )}
            {canReschedule && (
             <TooltipLayout
                  trigger={
                      <div>   
                        <DialogLayout
                          trigger={
                            <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                                <Inspect size={16} />
                            </div>
                                              
                          }
                          title="Schedule Details"
                          description={`Details for schedule on ${new Date(schedule.hearing_date).toLocaleDateString()}`}
                          className="w-[90vw] h-[90vh] max-w-[1800px] max-h-[1200px]"
                          mainContent={
                            <div className="w-full h-full">
                              <SummonPreview
                                sr_code={sr_code}
                                barangayLogo = {barangayLogo}
                                cityLogo = {cityLogo}
                                email = {email}
                                telnum = {telNum}
                                complainant={complainant || []}
                                complainant_address={complainant_addresses}
                                accused={accused || []}
                                accused_address={accused_addresses}
                                hearingDate={schedule.hearing_date}
                                hearingTime={schedule.hearing_time}
                                mediation={schedule.ss_mediation_level}
                                issuance_date={new Date().toISOString()}
                              />
                            </div>
                          }
                        />
                        </div>
                  }
                  content="Preview"
              />
            )}
          </div>
        )
      },
    },
  ]

  if (isSchedLoading || isLoadingTemplate) {
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

  return(
    <div className="w-full h-full">
      <div className="overflow-y-auto h-full">
        {/* Header */}
          <div className="flex flex-col gap-3 mb-3">
              <div className="flex flex-row gap-4">
                <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
                  <ChevronLeft />
                </Button>
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                  Case No. {sr_code}
                </h1>
              </div>
          </div>

          <hr className="border-gray mb-7 sm:mb-8" />
          {/* View Complaint Button */}
          <div className='flex justify-end'>
            <DialogLayout
                className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
                trigger={
                    <Button className="text-[#1273B8] underline cursor-pointer bg-snow shadow-none text-sm font-medium hover:text-[#0e5a97] hover:bg-snow transition-colors" >
                      View Complaint
                    </Button>
                }
                mainContent={
                    <div className="flex flex-col h-full overflow-y-hidden">
                        <div className="overflow-y-auto flex-1 pr-2 max-h-[calc(90vh-100px)]">
                            <ComplaintRecordForSummon 
                                comp_id={comp_id}
                                isPending={false}
                            />
                        </div>
                    </div>
                }
                title="Complaint Record"
                description="Full details of the complaint filed."
            />
          </div>
          <div className="bg-white rounded-lg shadow p-2">
               <DataTable columns={columns} data={schedList} />
           </div>
      </div>
    </div>
  )
}