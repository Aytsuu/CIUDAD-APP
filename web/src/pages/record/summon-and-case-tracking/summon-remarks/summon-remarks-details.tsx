// import { useLocation } from "react-router"
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router"
// import { ComplaintRecordForSummon } from "../complaint-record"
// import { Button } from "@/components/ui/button/button"
// import { DataTable } from "@/components/ui/table/data-table"
// import type { ColumnDef } from "@tanstack/react-table"
// import { ChevronLeft, CircleAlert } from "lucide-react"
// import { Spinner } from "@/components/ui/spinner"
// import { formatTime } from "@/helpers/timeFormatter"
// import { Card } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { useGetSummonCaseDetails } from "../queries/summonFetchQueries"
// import type { HearingSchedule } from "../summon-types"
// import { formatTimestamp } from "@/helpers/timestampformatter"
// import { useLoading } from "@/context/LoadingContext"
// import { formatDate } from "@/helpers/dateHelper"
// import SummonRemarksForm from "./summon-remarks-form"
// import SummonRemarksView from "../summon-remarks-view"

// function ResidentBadge({ hasRpId }: { hasRpId: boolean }) {
//   return (
//     <span
//       className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
//         hasRpId
//           ? "bg-green-100 text-green-700 border border-green-300"
//           : "bg-gray-200 text-gray-700 border border-gray-300"
//       }`}
//     >
//       {hasRpId ? "Resident" : "Non-resident"}
//     </span>
//   )
// }

// export default function SummonRemarksDetails() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const { 
//     sc_id, 
//     incident_type, 
//     comp_names = [], 
//     acc_names = [] ,
//     hasResident = false,
//   } = location.state || {}

//   const { data: caseDetails, isLoading: isDetailLoading } = useGetSummonCaseDetails(sc_id)
//   const [editingRowId, setEditingRowId] = useState<string | null>(null)
//   const { showLoading, hideLoading } = useLoading()

//   useEffect(() => {
//     if (isDetailLoading) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [isDetailLoading, showLoading, hideLoading]);

//   // Template data fetching
//   const {
//     sc_code,
//     sc_mediation_status: case_status,
//     sc_date_marked,
//     sc_reason,
//     comp_id,
//     hearing_schedules = [],
//   } = caseDetails || {}

//   const isCaseClosed = case_status === "Resolved" || case_status === "Escalated"


//   const columns: ColumnDef<HearingSchedule>[] = [
//     {
//       accessorKey: "summon_date.sd_date",
//       header: "Hearing Date",
//       cell: ({ row }) => <span>{formatDate(row.original.summon_date.sd_date, "long")}</span>,
//     },
//     {
//       accessorKey: "summon_time.st_start_time",
//       header: "Hearing Time",
//       cell: ({ row }) => <span>{formatTime(row.original.summon_time.st_start_time)}</span>,
//     },
//     {
//       accessorKey: "hs_level",
//       header: "Mediation Level",
//       cell: ({ row }) => (
//         <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//           {row.original.hs_level}
//         </span>
//       ),
//     },
//     {
//       accessorKey: "hs_is_closed",
//       header: "Status",
//       cell: ({ row }) => {
//         const isClosed = row.original.hs_is_closed
//         return (
//           <div className="flex justify-center gap-2">
//             <span
//               className={`px-3 py-1 rounded-full text-xs font-medium ${
//                 isClosed
//                   ? "bg-orange-100 text-orange-800 border border-orange-200"
//                   : "bg-green-100 text-green-800 border border-green-200"
//               }`}
//             >
//               {isClosed ? "Closed" : "Open"}
//             </span>
//           </div>
//         )
//       },
//     },
//     {
//       accessorKey: "remark",
//       header: "Remarks",
//       cell: ({ row }) => {
//         const remark = row.original.remark;
        
//         if (remark && remark.rem_id) {
//           return (
//             <DialogLayout
//               className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
//               trigger={
//                 <div className="bg-white cursor-pointer hover:text-[#0e5a97] text-[#1273B8] text-[12px] underline">
//                   View Remarks  
//                 </div>
//               }
//               mainContent={
//                 <SummonRemarksView
//                   rem_remarks={remark.rem_remarks}
//                   rem_date={remark.rem_date}
//                   supp_docs={remark.supp_docs}
//                 />
//               }
//               title="Remarks"
//               description="Detailed view of remarks and attached files."
//             />
//           );
//         } else {
//           return (
//             <DialogLayout
//               trigger={
//                 <div className="text-red-500 flex items-center gap-1 justify-center underline cursor-pointer">
//                   <CircleAlert size={16} />
//                   <span className="text-xs">No remarks available</span>
//                 </div>
//               }
//               mainContent={
//                 <SummonRemarksForm 
//                   hs_id={row.original.hs_id}
//                   st_id={row.original.summon_time.st_id}
//                   sc_id = {sc_id}
//                   onSuccess={() => setEditingRowId(null)}
//                 />
//               }
//               title="Add Remarks"
//               description="Add hearing minutes document to close the schedule."
//               isOpen={editingRowId === row.original.hs_id}
//               onOpenChange={(open) => setEditingRowId(open ? row.original.hs_id : null)}
//             />
//           );
//         }
//       }
//     }
//   ]

//   if (isDetailLoading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <Spinner size="lg" />
//         <span className="ml-2 text-gray-600">Loading summon case details...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full">
//       <div className="overflow-y-auto h-full">
//         {/* Header */}
//         <div className="flex flex-col gap-3 mb-3">
//           <div className="flex flex-row gap-4">
//             <Button className="text-black p-2 self-start" variant="outline" onClick={() => navigate(-1)}>
//               <ChevronLeft />
//             </Button>
//             <div className="flex flex-col gap-2">
//               <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                 Case No. {sc_code || "N/A"}
//               </h1>
//               {/* Only show reason if not null */}
//               {sc_reason && (
//                 <p className="text-sm text-gray-600">Reason: {sc_reason}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <hr className="border-gray mb-7 sm:mb-8" />

//         <Card className="w-full bg-white p-6 shadow-sm mb-8">
//           <div className="flex justify-between items-start mb-6">
//             <div className="flex-1">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {/* Left Column - People */}
//                 <div className="space-y-6">
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Complainant</Label>
//                     <div className="space-y-1">
//                       {comp_names.length > 0 ? (
//                         comp_names.map((name: string, index: number) => (
//                           <div
//                             key={index}
//                             className="flex items-center text-lg font-medium text-gray-800"
//                           >
//                             {name}
//                             <ResidentBadge hasRpId={hasResident} />
//                           </div>
//                         ))
//                       ) : (
//                         <span className="text-lg font-medium text-gray-800">N/A</span>
//                       )}
//                     </div>
//                   </div>
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Accused</Label>
//                     <div className="space-y-1">
//                       {acc_names.length > 0 ? (
//                         acc_names.map((name: string, index: number) => (
//                           <p key={index} className="text-lg font-medium text-gray-800">
//                             {name}
//                           </p>
//                         ))
//                       ) : (
//                         <p className="text-lg font-medium text-gray-800">N/A</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column - Case Details */}
//                 <div className="space-y-6">
//                   <div>
//                     <Label className="text-sm text-gray-500 font-normal mb-2 block">Incident Type</Label>
//                     <p className="text-lg font-medium text-gray-800">{incident_type || "N/A"}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Status Badge */}
//             <div
//               className={`px-4 py-1 rounded-full text-sm font-medium flex items-center justify-center ${
//                 case_status === "Ongoing"
//                   ? "bg-[#5B72CF]/40 border border-[#5B72CF] text-[#5B72CF]"
//                   : case_status === "Resolved"
//                   ? "bg-green-100 border border-green-500 text-green-700"
//                   : case_status === "Waiting for Schedule"
//                   ? "bg-yellow-100 border border-yellow-500 text-yellow-700"
//                   : "bg-red-100 border border-red-500 text-red-700"
//               }`}
//             >
//               <span className="font-medium">{case_status || "Unknown"}</span>
//             </div>
//           </div>

//           {/* Action Buttons or Decision Date */}
//           <div className="border-t border-gray-100 flex justify-between items-center pt-4">
//             {/* Left side - View Complaint button */}
//             <DialogLayout
//               className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
//               trigger={
//                 <Button className="text-[#1273B8] underline cursor-pointer bg-transparent shadow-none text-sm font-medium hover:text-[#0e5a97] hover:bg-white transition-colors">
//                   View Complaint
//                 </Button>
//               }
//               mainContent={
//                 <div className="flex flex-col h-full overflow-y-hidden">
//                   <div className="overflow-y-auto flex-1 pr-2 max-h-[calc(90vh-100px)]">
//                     <ComplaintRecordForSummon comp_id={comp_id || ""}/>
//                   </div>
//                 </div>
//               }
//               title="Complaint Record"
//               description="Full details of the complaint filed."
//             />

//             {/* Right side - Action buttons or status */}
//             {!isCaseClosed ? (
//               null
//             ) : (
//               // Only show date marked if not null and case is closed
//               sc_date_marked && (
//                 <p className="text-sm text-gray-500">
//                   Marked on{" "}
//                   {formatTimestamp(new Date(sc_date_marked))}
//                 </p>
//               )
//             )}
//           </div>
//         </Card>

//         <div className="bg-white rounded-lg shadow p-2">
//           <DataTable columns={columns} data={hearing_schedules} />
//         </div>
//       </div>
//     </div>
//   )
// }
import { useLocation } from "react-router"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { ComplaintRecordForSummon } from "../complaint-record"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronLeft, CircleAlert } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { formatTime } from "@/helpers/timeFormatter"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useGetSummonCaseDetails } from "../queries/summonFetchQueries"
import type { HearingSchedule } from "../summon-types"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { useLoading } from "@/context/LoadingContext"
import { formatDate } from "@/helpers/dateHelper"
import SummonRemarksForm from "./summon-remarks-form"
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

export default function SummonRemarksDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    sc_id, 
    incident_type, 
    comp_names = [], 
    acc_names = [] ,
    hasResident = false,
  } = location.state || {}

  const { data: caseDetails, isLoading: isDetailLoading } = useGetSummonCaseDetails(sc_id)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    if (isDetailLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isDetailLoading, showLoading, hideLoading]);

  // Template data fetching
  const {
    sc_code,
    sc_mediation_status,
    sc_conciliation_status,
    sc_date_marked,
    sc_reason,
    comp_id,
    hearing_schedules = [],
  } = caseDetails || {}

  // Use conciliation status if not null, otherwise use mediation status
  const displayStatus = sc_conciliation_status || sc_mediation_status
  const isCaseClosed = displayStatus === "Resolved" || displayStatus === "Escalated"

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
            <DialogLayout
              trigger={
                <div className="text-red-500 flex items-center gap-1 justify-center underline cursor-pointer">
                  <CircleAlert size={16} />
                  <span className="text-xs">No remarks available</span>
                </div>
              }
              mainContent={
                <SummonRemarksForm 
                  hs_id={row.original.hs_id}
                  st_id={row.original.summon_time.st_id}
                  sc_id = {sc_id}
                  schedCount = {hearing_schedules.length}
                  onSuccess={() => setEditingRowId(null)}
                />
              }
              title="Add Remarks"
              description="Add hearing minutes document to close the schedule."
              isOpen={editingRowId === row.original.hs_id}
              onOpenChange={(open) => setEditingRowId(open ? row.original.hs_id : null)}
            />
          );
        }
      }
    }
  ]

  if (isDetailLoading) {
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
                  {/* Show both statuses for transparency */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm text-gray-500 font-normal mb-1 block">Current Status</Label>
                      <p className="text-sm font-medium text-gray-800">
                        {sc_conciliation_status ? "Conciliation" : "Mediation"}: {displayStatus}
                      </p>
                    </div>
                    {sc_conciliation_status && (
                      <div>
                        <Label className="text-sm text-gray-500 font-normal mb-1 block">Previous Status</Label>
                        <p className="text-sm font-medium text-gray-800">
                          Mediation: {sc_mediation_status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`px-4 py-1 rounded-full text-sm font-medium flex items-center justify-center ${
                displayStatus === "Ongoing"
                  ? "bg-[#5B72CF]/40 border border-[#5B72CF] text-[#5B72CF]"
                  : displayStatus === "Resolved"
                  ? "bg-green-100 border border-green-500 text-green-700"
                  : displayStatus === "Waiting for Schedule"
                  ? "bg-yellow-100 border border-yellow-500 text-yellow-700"
                  : "bg-red-100 border border-red-500 text-red-700"
              }`}
            >
              <span className="font-medium">{displayStatus || "Unknown"}</span>
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
                    <ComplaintRecordForSummon comp_id={comp_id || ""}/>
                  </div>
                </div>
              }
              title="Complaint Record"
              description="Full details of the complaint filed."
            />

            {/* Right side - Action buttons or status */}
            {!isCaseClosed ? (
              null
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

        <div className="bg-white rounded-lg shadow p-2">
          <DataTable columns={columns} data={hearing_schedules} />
        </div>
      </div>
    </div>
  )
}