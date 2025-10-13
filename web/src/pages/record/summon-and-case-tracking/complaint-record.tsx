// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Separator } from "@/components/ui/separator";
// // import { CalendarDays, MapPin, FileText, Users, UserX, Clock, AlertTriangle, XCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
// // import { useGetComplaintDetails } from "./queries/summonFetchQueries";
// // import { formatTimestamp } from "@/helpers/timestampformatter";
// // import { useAcceptRequest, useRejectRequest } from "./queries/summonUpdateQueries";
// // import { Button } from "@/components/ui/button/button";
// // import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// // import DialogLayout from "@/components/ui/dialog/dialog-layout";
// // import { Input } from "@/components/ui/input";
// // import { useState } from "react";
// // import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// // export function ComplaintRecordForSummon({
// //   comp_id,
// //   sr_id,
// //   isPending,
// //   onSuccess,
// // }: {
// //   comp_id: string;
// //   sr_id?: string;
// //   isPending?: boolean;
// //   onSuccess?: () => void;
// // }) {
// //   const { data: complaintDetails, isLoading, error } = useGetComplaintDetails(comp_id);
// //   const [reason, setReason] = useState("");
// //   const [openSections, setOpenSections] = useState({
// //     complainants: true,
// //     accused: true,
// //     files: true,
// //   });
// //   const { mutate: acceptReq, isPending: isAcceptPending } = useAcceptRequest(onSuccess);
// //   const { mutate: rejectReq, isPending: isRejectPending } = useRejectRequest(onSuccess);

// //   const handleAccept = (sr_id: string) => {
// //     acceptReq(sr_id);
// //   };

// //   const handleReject = (sr_id: string, reason: string) => {
// //     const values = { sr_id, reason };
// //     rejectReq(values);
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
// //       </div>
// //     );
// //   }

// //   if (error || !complaintDetails) {
// //     return (
// //       <Card className="border-destructive">
// //         <CardContent className="pt-6">
// //           <div className="flex items-center gap-2 text-destructive">
// //             <AlertTriangle className="h-5 w-5" />
// //             <span>{(error as Error)?.message || "Complaint not found"}</span>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto h-full p-4">
// //       {/* Sticky Action Buttons */}
// //       {isPending ? (
// //         <div className="sticky top-0 z-10 flex justify-end gap-3 mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
// //           <DialogLayout
// //             trigger={
// //               <Button
// //                 variant="outline"
// //                 className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
// //                 disabled={isAcceptPending || isRejectPending}
// //               >
// //                 <XCircle className="h-4 w-4" />
// //                 Reject Request
// //               </Button>
// //             }
// //             title="Reason for Rejection"
// //             description="Provide the reason to confirm rejection."
// //             mainContent={
// //               <div className="mt-2">
// //                 <Input
// //                   placeholder="Enter rejection reason"
// //                   value={reason}
// //                   onChange={(e) => setReason(e.target.value)}
// //                   disabled={isRejectPending}
// //                 />
// //                 <div className="mt-3 flex justify-end">
// //                   <Button
// //                     disabled={isRejectPending || !reason.trim()}
// //                     onClick={() => handleReject(sr_id || "", reason)}
// //                   >
// //                     {isRejectPending ? "Submitting" : "Submit"}
// //                   </Button>
// //                 </div>
// //               </div>
// //             }
// //           />
// //           <ConfirmationModal
// //             trigger={
// //               <Button
// //                 className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
// //                 disabled={isAcceptPending || isRejectPending}
// //               >
// //                 <CheckCircle className="h-4 w-4" />
// //                 Accept Request
// //               </Button>
// //             }
// //             title="Confirm Accept"
// //             description="Are you sure you want to accept this request?"
// //             actionLabel="Confirm"
// //             onClick={() => handleAccept(sr_id || "")}
// //           />
// //         </div>
// //       ) : null}

// //       {/* Header */}
// //       <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow duration-200">
// //         <CardHeader>
// //           <div className="flex items-center justify-between mb-2">
// //             <CardTitle className="text-xl font-semibold text-gray-800">
// //               Complaint #{complaintDetails.comp_id}
// //             </CardTitle>
// //             <div
// //               className={`px-3 py-1 rounded-full text-xs font-medium ${
// //                 complaintDetails.comp_status === "Pending"
// //                   ? "bg-yellow-100 text-yellow-800"
// //                   : complaintDetails.comp_status === "Resolved"
// //                   ? "bg-green-100 text-green-800"
// //                   : "bg-blue-100 text-blue-800"
// //               }`}
// //             >
// //               {complaintDetails.comp_status}
// //             </div>
// //           </div>
// //         </CardHeader>
// //         <CardContent className="space-y-4">
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             <div className="flex items-center gap-2 text-muted-foreground">
// //               <MapPin className="h-4 w-4" />
// //               <span className="text-sm">
// //                 {complaintDetails.comp_location || "Location not specified"}
// //               </span>
// //             </div>
// //             <div className="flex items-center gap-2 text-muted-foreground">
// //               <CalendarDays className="h-4 w-4" />
// //               <span className="text-sm">{formatTimestamp(complaintDetails.comp_datetime)}</span>
// //             </div>
// //           </div>
// //           <div className="flex items-center gap-2 text-muted-foreground">
// //             <Clock className="h-4 w-4" />
// //             <span className="text-sm">Filed: {formatTimestamp(complaintDetails.comp_created_at)}</span>
// //           </div>
// //           <div className="flex items-center gap-2 text-muted-foreground">
// //             <FileText className="h-4 w-4" />
// //             <span className="text-sm">Incident Type: {complaintDetails.comp_incident_type}</span>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       {/* Allegation */}
// //       <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
// //         <CardHeader>
// //           <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
// //             <FileText className="h-5 w-5" />
// //             Allegation Details
// //           </CardTitle>
// //         </CardHeader>
// //         <CardContent className="space-y-4">
// //           <p className="text-sm leading-relaxed text-foreground">
// //             {complaintDetails.comp_allegation || "No allegation details provided"}
// //           </p>
// //         </CardContent>
// //       </Card>

// //       {/* Complainants */}
// //       <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
// //         <Collapsible
// //           open={openSections.complainants}
// //           onOpenChange={(open) =>
// //             setOpenSections((prev) => ({ ...prev, complainants: open }))
// //           }
// //         >
// //           <CardHeader>
// //             <CollapsibleTrigger className="flex items-center justify-between w-full pb-4">
// //               <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
// //                 <Users className="h-5 w-5" />
// //                 Complainant{complaintDetails.complainant?.length > 1 ? "s" : ""} (
// //                 {complaintDetails.complainant?.length || 0})
// //               </CardTitle>
// //               {openSections.complainants ? (
// //                 <ChevronUp className="h-5 w-5" />
// //               ) : (
// //                 <ChevronDown className="h-5 w-5" />
// //               )}
// //             </CollapsibleTrigger>
// //           </CardHeader>
// //           <CollapsibleContent>
// //             <CardContent className="space-y-4">
// //               {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
// //                 complaintDetails.complainant.map((complainant: any, index: number) => (
// //                   <div key={complainant.cpnt_id || index} className="border rounded-lg p-4 bg-muted/30">
// //                     {index > 0 && <Separator className="mb-4" />}
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                       <div>
// //                         <h4 className="font-semibold text-lg">
// //                           {complainant.cpnt_name || "Unnamed Complainant"}
// //                         </h4>
// //                         <div className="space-y-1 text-sm text-muted-foreground mt-2">
// //                           {complainant.cpnt_age && (
// //                             <p>
// //                               <span className="font-medium">Age:</span> {complainant.cpnt_age}
// //                             </p>
// //                           )}
// //                           {complainant.cpnt_gender && (
// //                             <p>
// //                               <span className="font-medium">Gender:</span>{" "}
// //                               {complainant.cpnt_gender}
// //                             </p>
// //                           )}
// //                           {complainant.cpnt_number && (
// //                             <p>
// //                               <span className="font-medium">Contact:</span>{" "}
// //                               {complainant.cpnt_number}
// //                             </p>
// //                           )}
// //                           {complainant.cpnt_relation_to_respondent && (
// //                             <p>
// //                               <span className="font-medium">Relation:</span>{" "}
// //                               {complainant.cpnt_relation_to_respondent}
// //                             </p>
// //                           )}
// //                         </div>
// //                       </div>
// //                       <div>
// //                         <h5 className="font-medium text-sm text-muted-foreground mb-1">
// //                           Address
// //                         </h5>
// //                         <p className="text-sm">
// //                           {complainant.cpnt_address || "Address not specified"}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))
// //               ) : (
// //                 <p className="text-muted-foreground text-sm">No complainants listed</p>
// //               )}
// //             </CardContent>
// //           </CollapsibleContent>
// //         </Collapsible>
// //       </Card>

// //       {/* Accused Persons */}
// //       <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
// //         <Collapsible
// //           open={openSections.accused}
// //           onOpenChange={(open) =>
// //             setOpenSections((prev) => ({ ...prev, accused: open }))
// //           }
// //         >
// //           <CardHeader>
// //             <CollapsibleTrigger className="flex items-center justify-between w-full pb-4">
// //               <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
// //                 <UserX className="h-5 w-5" />
// //                 Accused Person{complaintDetails.accused?.length > 1 ? "s" : ""} (
// //                 {complaintDetails.accused?.length || 0})
// //               </CardTitle>
// //               {openSections.accused ? (
// //                 <ChevronUp className="h-5 w-5" />
// //               ) : (
// //                 <ChevronDown className="h-5 w-5" />
// //               )}
// //             </CollapsibleTrigger>
// //           </CardHeader>
// //           <CollapsibleContent>
// //             <CardContent className="space-y-4">
// //               {complaintDetails.accused && complaintDetails.accused.length > 0 ? (
// //                 complaintDetails.accused.map((accused: any, index: number) => (
// //                   <div key={accused.acsd_id || index} className="border rounded-lg p-4 bg-red-50/50">
// //                     {index > 0 && <Separator className="mb-4" />}
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                       <div>
// //                         <h4 className="font-semibold text-lg">
// //                           {accused.acsd_name || "Unnamed Accused"}
// //                         </h4>
// //                         <div className="space-y-1 text-sm text-muted-foreground mt-2">
// //                           {accused.acsd_age && (
// //                             <p>
// //                               <span className="font-medium">Age:</span> {accused.acsd_age}
// //                             </p>
// //                           )}
// //                           {accused.acsd_gender && (
// //                             <p>
// //                               <span className="font-medium">Gender:</span> {accused.acsd_gender}
// //                             </p>
// //                           )}
// //                         </div>
// //                         {accused.acsd_description && (
// //                           <div className="mt-3">
// //                             <h5 className="font-medium text-sm text-muted-foreground mb-1">
// //                               Description
// //                             </h5>
// //                             <p className="text-sm">{accused.acsd_description}</p>
// //                           </div>
// //                         )}
// //                       </div>
// //                       <div>
// //                         <h5 className="font-medium text-sm text-muted-foreground mb-1">
// //                           Address
// //                         </h5>
// //                         <p className="text-sm">
// //                           {accused.acsd_address || "Address not specified"}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))
// //               ) : (
// //                 <p className="text-muted-foreground text-sm">No accused persons listed</p>
// //               )}
// //             </CardContent>
// //           </CollapsibleContent>
// //         </Collapsible>
// //       </Card>

// //       {/* Attached Files */}
// //       {complaintDetails.complaint_files && complaintDetails.complaint_files.length > 0 && (
// //         <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
// //           <Collapsible
// //             open={openSections.files}
// //             onOpenChange={(open) =>
// //               setOpenSections((prev) => ({ ...prev, files: open }))
// //             }
// //           >
// //             <CardHeader>
// //               <CollapsibleTrigger className="flex items-center justify-between w-full">
// //                 <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
// //                   <FileText className="h-5 w-5" />
// //                   Attached Files ({complaintDetails.complaint_files.length})
// //                 </CardTitle>
// //                 {openSections.files ? (
// //                   <ChevronUp className="h-5 w-5" />
// //                 ) : (
// //                   <ChevronDown className="h-5 w-5" />
// //                 )}
// //               </CollapsibleTrigger>
// //             </CardHeader>
// //             <CollapsibleContent>
// //               <CardContent className="space-y-4">
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //                   {complaintDetails.complaint_files.map((file: any) => (
// //                     <div
// //                       key={file.comp_file_id}
// //                       className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
// //                     >
// //                       <FileText className="h-8 w-8 text-muted-foreground" />
// //                       <div className="flex-1 min-w-0">
// //                         <p className="font-medium text-sm truncate">
// //                           {file.comp_file_name || "Unnamed file"}
// //                         </p>
// //                         {file.comp_file_type && (
// //                           <p className="text-xs text-muted-foreground">{file.comp_file_type}</p>
// //                         )}
// //                         {file.comp_file_url && (
// //                           <a
// //                             href={file.comp_file_url}
// //                             target="_blank"
// //                             rel="noopener noreferrer"
// //                             className="text-xs text-blue-600 hover:underline mt-1 block"
// //                           >
// //                             View File
// //                           </a>
// //                         )}
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </CardContent>
// //             </CollapsibleContent>
// //           </Collapsible>
// //         </Card>
// //       )}
// //     </div>
// //   );
// // }

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { CalendarDays, MapPin, FileText, Users, UserX, Clock, AlertTriangle, XCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
// import { useGetComplaintDetails } from "./queries/summonFetchQueries";
// import { formatTimestamp } from "@/helpers/timestampformatter";
// import { Button } from "@/components/ui/button/button";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// import { Badge } from "@/components/ui/badge";

// export function ComplaintRecordForSummon({
//   comp_id,
//   sr_id,
//   isPending,
//   onSuccess,
// }: {
//   comp_id: string;
//   sr_id?: string;
//   isPending?: boolean;
//   onSuccess?: () => void;
// }) {
//   const { data: complaintDetails, isLoading, error } = useGetComplaintDetails(comp_id);
//   const [reason, setReason] = useState("");
//   const [openSections, setOpenSections] = useState({
//     complainants: true,
//     accused: true,
//     files: true,
//   });
 

//   const handleAccept = (sr_id: string) => {
//     acceptReq(sr_id);
//   };

//   const handleReject = (sr_id: string, reason: string) => {
//     const values = { sr_id, reason };
//     rejectReq(values);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error || !complaintDetails) {
//     return (
//       <Card className="border-red-200 bg-red-50">
//         <CardContent className="pt-6">
//           <div className="flex items-center gap-2 text-red-700">
//             <AlertTriangle className="h-5 w-5" />
//             <span>{(error as Error)?.message || "Complaint not found"}</span>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto h-full p-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
//       {/* Sticky Action Buttons */}
//       {isPending ? (
//         <div className="sticky top-0 z-10 flex justify-end gap-3 mb-4 p-4 bg-white rounded-lg shadow-lg border border-blue-100">
//           <DialogLayout
//             trigger={
//               <Button
//                 variant="outline"
//                 className="border-red-500 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 flex items-center gap-2 transition-colors duration-200"
//                 disabled={isAcceptPending || isRejectPending}
//               >
//                 <XCircle className="h-4 w-4" />
//                 Reject Request
//               </Button>
//             }
//             title="Reason for Rejection"
//             description="Provide the reason to confirm rejection."
//             mainContent={
//               <div className="mt-2">
//                 <Input
//                   placeholder="Enter rejection reason"
//                   value={reason}
//                   onChange={(e) => setReason(e.target.value)}
//                   disabled={isRejectPending}
//                   className="border-red-200 focus:border-red-500"
//                 />
//                 <div className="mt-3 flex justify-end">
//                   <Button
//                     disabled={isRejectPending || !reason.trim()}
//                     onClick={() => handleReject(sr_id || "", reason)}
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     {isRejectPending ? "Submitting" : "Submit Rejection"}
//                   </Button>
//                 </div>
//               </div>
//             }
//           />
//           <ConfirmationModal
//             trigger={
//               <Button
//                 className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-200"
//                 disabled={isAcceptPending || isRejectPending}
//               >
//                 <CheckCircle className="h-4 w-4" />
//                 Accept Request
//               </Button>
//             }
//             title="Confirm Accept"
//             description="Are you sure you want to accept this request?"
//             actionLabel="Confirm"
//             onClick={() => handleAccept(sr_id || "")}
//           />
//         </div>
//       ) : null}

//       {/* Header */}
//       <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
//         <CardHeader className="pb-4">
//           <div className="flex items-center justify-between mb-2">
//             <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
//               Complaint #{complaintDetails.comp_id}
//             </CardTitle>
//             <Badge
//               variant="secondary"
//               className={`text-sm font-semibold px-3 py-1 ${
//                 complaintDetails.comp_status === "Pending"
//                   ? "bg-amber-100 text-amber-800 border-amber-200"
//                   : complaintDetails.comp_status === "Resolved"
//                   ? "bg-emerald-100 text-emerald-800 border-emerald-200"
//                   : "bg-blue-100 text-blue-800 border-blue-200"
//               }`}
//             >
//               {complaintDetails.comp_status}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4 pt-0">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <MapPin className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Location</p>
//                 <p className="text-sm text-gray-900">
//                   {complaintDetails.comp_location || "Location not specified"}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <CalendarDays className="h-5 w-5 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Incident Date</p>
//                 <p className="text-sm text-gray-900">{formatTimestamp(complaintDetails.comp_datetime)}</p>
//               </div>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <Clock className="h-5 w-5 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Filed Date</p>
//                 <p className="text-sm text-gray-900">{formatTimestamp(complaintDetails.comp_created_at)}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100 shadow-sm">
//               <div className="p-2 bg-orange-100 rounded-lg">
//                 <FileText className="h-5 w-5 text-orange-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Incident Type</p>
//                 <p className="text-sm text-gray-900 font-medium">{complaintDetails.comp_incident_type}</p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Allegation */}
//       <Card className="bg-gradient-to-r from-white to-amber-50 border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3 text-xl font-bold text-amber-900 pb-4">
//             <div className="p-2 bg-amber-100 rounded-lg">
//               <FileText className="h-6 w-6 text-amber-600" />
//             </div>
//             Allegation Details
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
//             <p className="text-sm leading-relaxed text-gray-800">
//               {complaintDetails.comp_allegation || "No allegation details provided"}
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Complainants */}
//       <Card className="bg-gradient-to-r from-white to-emerald-50 border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300">
//         <Collapsible
//           open={openSections.complainants}
//           onOpenChange={(open) =>
//             setOpenSections((prev) => ({ ...prev, complainants: open }))
//           }
//         >
//           <CardHeader>
//             <CollapsibleTrigger className="flex items-center justify-between w-full pb-4 group">
//               <CardTitle className="flex items-center gap-3 text-xl font-bold text-emerald-900">
//                 <div className="p-2 bg-emerald-100 rounded-lg">
//                   <Users className="h-6 w-6 text-emerald-600" />
//                 </div>
//                 Complainant{complaintDetails.complainant?.length > 1 ? "s" : ""} (
//                 {complaintDetails.complainant?.length || 0})
//               </CardTitle>
//               <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
//                 {openSections.complainants ? (
//                   <ChevronUp className="h-5 w-5 text-emerald-600" />
//                 ) : (
//                   <ChevronDown className="h-5 w-5 text-emerald-600" />
//                 )}
//               </div>
//             </CollapsibleTrigger>
//           </CardHeader>
//           <CollapsibleContent>
//             <CardContent className="space-y-4">
//               {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
//                 complaintDetails.complainant.map((complainant: any, index: number) => (
//                   <div 
//                     key={complainant.cpnt_id || index} 
//                     className="border-2 border-emerald-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
//                   >
//                     {index > 0 && <Separator className="mb-4 border-emerald-100" />}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-bold text-lg text-emerald-900 mb-3">
//                           {complainant.cpnt_name || "Unnamed Complainant"}
//                         </h4>
//                         <div className="space-y-2">
//                           {complainant.cpnt_age && (
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Age</span>
//                               <span className="text-sm text-gray-700">{complainant.cpnt_age}</span>
//                             </div>
//                           )}
//                           {complainant.cpnt_gender && (
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Gender</span>
//                               <span className="text-sm text-gray-700">{complainant.cpnt_gender}</span>
//                             </div>
//                           )}
//                           {complainant.cpnt_number && (
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Contact</span>
//                               <span className="text-sm text-gray-700">{complainant.cpnt_number}</span>
//                             </div>
//                           )}
//                           {complainant.cpnt_relation_to_respondent && (
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Relation</span>
//                               <span className="text-sm text-gray-700">{complainant.cpnt_relation_to_respondent}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
//                         <h5 className="font-semibold text-sm text-emerald-800 mb-2 flex items-center gap-2">
//                           <MapPin className="h-4 w-4" />
//                           Address
//                         </h5>
//                         <p className="text-sm text-gray-700">
//                           {complainant.cpnt_address || "Address not specified"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8 bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200">
//                   <Users className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
//                   <p className="text-emerald-700 font-medium">No complainants listed</p>
//                 </div>
//               )}
//             </CardContent>
//           </CollapsibleContent>
//         </Collapsible>
//       </Card>

//       {/* Accused Persons */}
//       <Card className="bg-gradient-to-r from-white to-red-50 border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-all duration-300">
//         <Collapsible
//           open={openSections.accused}
//           onOpenChange={(open) =>
//             setOpenSections((prev) => ({ ...prev, accused: open }))
//           }
//         >
//           <CardHeader>
//             <CollapsibleTrigger className="flex items-center justify-between w-full pb-4 group">
//               <CardTitle className="flex items-center gap-3 text-xl font-bold text-red-900">
//                 <div className="p-2 bg-red-100 rounded-lg">
//                   <UserX className="h-6 w-6 text-red-600" />
//                 </div>
//                 Accused Person{complaintDetails.accused?.length > 1 ? "s" : ""} (
//                 {complaintDetails.accused?.length || 0})
//               </CardTitle>
//               <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
//                 {openSections.accused ? (
//                   <ChevronUp className="h-5 w-5 text-red-600" />
//                 ) : (
//                   <ChevronDown className="h-5 w-5 text-red-600" />
//                 )}
//               </div>
//             </CollapsibleTrigger>
//           </CardHeader>
//           <CollapsibleContent>
//             <CardContent className="space-y-4">
//               {complaintDetails.accused && complaintDetails.accused.length > 0 ? (
//                 complaintDetails.accused.map((accused: any, index: number) => (
//                   <div 
//                     key={accused.acsd_id || index} 
//                     className="border-2 border-red-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
//                   >
//                     {index > 0 && <Separator className="mb-4 border-red-100" />}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <h4 className="font-bold text-lg text-red-900 mb-3">
//                           {accused.acsd_name || "Unnamed Accused"}
//                         </h4>
//                         <div className="space-y-2 mb-3">
//                           {accused.acsd_age && (
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded">Age</span>
//                               <span className="text-sm text-gray-700">{accused.acsd_age}</span>
//                             </div>
//                           )}
//                           {accused.acsd_gender && (
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded">Gender</span>
//                               <span className="text-sm text-gray-700">{accused.acsd_gender}</span>
//                             </div>
//                           )}
//                         </div>
//                         {accused.acsd_description && (
//                           <div className="mt-3">
//                             <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
//                               <FileText className="h-4 w-4" />
//                               Description
//                             </h5>
//                             <p className="text-sm text-gray-700 bg-red-50 rounded-lg p-3 border border-red-100">
//                               {accused.acsd_description}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                       <div className="bg-red-50 rounded-lg p-4 border border-red-200">
//                         <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
//                           <MapPin className="h-4 w-4" />
//                           Address
//                         </h5>
//                         <p className="text-sm text-gray-700">
//                           {accused.acsd_address || "Address not specified"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
//                   <UserX className="h-12 w-12 text-red-300 mx-auto mb-3" />
//                   <p className="text-red-700 font-medium">No accused persons listed</p>
//                 </div>
//               )}
//             </CardContent>
//           </CollapsibleContent>
//         </Collapsible>
//       </Card>

//       {/* Attached Files */}
//       {complaintDetails.complaint_files && complaintDetails.complaint_files.length > 0 && (
//         <Card className="bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
//           <Collapsible
//             open={openSections.files}
//             onOpenChange={(open) =>
//               setOpenSections((prev) => ({ ...prev, files: open }))
//             }
//           >
//             <CardHeader>
//               <CollapsibleTrigger className="flex items-center justify-between w-full group">
//                 <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
//                   <div className="p-2 bg-purple-100 rounded-lg">
//                     <FileText className="h-6 w-6 text-purple-600" />
//                   </div>
//                   Attached Files ({complaintDetails.complaint_files.length})
//                 </CardTitle>
//                 <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
//                   {openSections.files ? (
//                     <ChevronUp className="h-5 w-5 text-purple-600" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5 text-purple-600" />
//                   )}
//                 </div>
//               </CollapsibleTrigger>
//             </CardHeader>
//             <CollapsibleContent>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {complaintDetails.complaint_files.map((file: any) => (
//                     <div
//                       key={file.comp_file_id}
//                       className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
//                     >
//                       <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
//                         <FileText className="h-6 w-6 text-purple-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-semibold text-sm text-gray-800 truncate">
//                           {file.comp_file_name || "Unnamed file"}
//                         </p>
//                         {file.comp_file_type && (
//                           <p className="text-xs text-purple-600 font-medium mt-1">{file.comp_file_type}</p>
//                         )}
//                         {file.comp_file_url && (
//                           <a
//                             href={file.comp_file_url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-200 inline-block mt-2"
//                           >
//                             View File
//                           </a>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </CollapsibleContent>
//           </Collapsible>
//         </Card>
//       )}
//     </div>
//   );
// }

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  MapPin,
  FileText,
  Users,
  UserX,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useGetComplaintDetails } from "./queries/summonFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export function ComplaintRecordForSummon({
  comp_id,
}: {
  comp_id: string;
}) {
  const { data: complaintDetails, isLoading, error } = useGetComplaintDetails(comp_id);
  const [openSections, setOpenSections] = useState({
    complainants: true,
    accused: true,
    files: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !complaintDetails) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{(error as Error)?.message || "Complaint not found"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto h-full p-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Complaint #{complaintDetails.comp_id}
            </CardTitle>
            <Badge
              variant="secondary"
              className={`text-sm font-semibold px-3 py-1 ${
                complaintDetails.comp_status === "Pending"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : complaintDetails.comp_status === "Resolved"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-blue-100 text-blue-800 border-blue-200"
              }`}
            >
              {complaintDetails.comp_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-sm text-gray-900">
                  {complaintDetails.comp_location || "Location not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Incident Date</p>
                <p className="text-sm text-gray-900">
                  {formatTimestamp(complaintDetails.comp_datetime)}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Filed Date</p>
                <p className="text-sm text-gray-900">
                  {formatTimestamp(complaintDetails.comp_created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100 shadow-sm">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Incident Type</p>
                <p className="text-sm text-gray-900 font-medium">
                  {complaintDetails.comp_incident_type}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allegation */}
      <Card className="bg-gradient-to-r from-white to-amber-50 border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-amber-900 pb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            Allegation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-800">
              {complaintDetails.comp_allegation || "No allegation details provided"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Complainants */}
      <Card className="bg-gradient-to-r from-white to-emerald-50 border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <Collapsible
          open={openSections.complainants}
          onOpenChange={(open) =>
            setOpenSections((prev) => ({ ...prev, complainants: open }))
          }
        >
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full pb-4 group">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-emerald-900">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                Complainant{complaintDetails.complainant?.length > 1 ? "s" : ""} (
                {complaintDetails.complainant?.length || 0})
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                {openSections.complainants ? (
                  <ChevronUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-emerald-600" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
                complaintDetails.complainant.map((complainant: any, index: number) => (
                  <div
                    key={complainant.cpnt_id || index}
                    className="border-2 border-emerald-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {index > 0 && <Separator className="mb-4 border-emerald-100" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-emerald-900 mb-3">
                          {complainant.cpnt_name || "Unnamed Complainant"}
                        </h4>
                        <div className="space-y-2">
                          {complainant.cpnt_age && (
                            <p className="text-sm text-gray-700">
                              <strong>Age:</strong> {complainant.cpnt_age}
                            </p>
                          )}
                          {complainant.cpnt_gender && (
                            <p className="text-sm text-gray-700">
                              <strong>Gender:</strong> {complainant.cpnt_gender}
                            </p>
                          )}
                          {complainant.cpnt_number && (
                            <p className="text-sm text-gray-700">
                              <strong>Contact:</strong> {complainant.cpnt_number}
                            </p>
                          )}
                          {complainant.cpnt_relation_to_respondent && (
                            <p className="text-sm text-gray-700">
                              <strong>Relation:</strong>{" "}
                              {complainant.cpnt_relation_to_respondent}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                        <h5 className="font-semibold text-sm text-emerald-800 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h5>
                        <p className="text-sm text-gray-700">
                          {complainant.cpnt_address || "Address not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-emerald-50 rounded-lg border-2 border-dashed border-emerald-200">
                  <Users className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                  <p className="text-emerald-700 font-medium">No complainants listed</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Accused Persons */}
      <Card className="bg-gradient-to-r from-white to-red-50 border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-all duration-300">
        <Collapsible
          open={openSections.accused}
          onOpenChange={(open) =>
            setOpenSections((prev) => ({ ...prev, accused: open }))
          }
        >
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full pb-4 group">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-red-900">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                Accused Person{complaintDetails.accused?.length > 1 ? "s" : ""} (
                {complaintDetails.accused?.length || 0})
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                {openSections.accused ? (
                  <ChevronUp className="h-5 w-5 text-red-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {complaintDetails.accused && complaintDetails.accused.length > 0 ? (
                complaintDetails.accused.map((accused: any, index: number) => (
                  <div
                    key={accused.acsd_id || index}
                    className="border-2 border-red-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {index > 0 && <Separator className="mb-4 border-red-100" />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-red-900 mb-3">
                          {accused.acsd_name || "Unnamed Accused"}
                        </h4>
                        <div className="space-y-2 mb-3">
                          {accused.acsd_age && (
                            <p className="text-sm text-gray-700">
                              <strong>Age:</strong> {accused.acsd_age}
                            </p>
                          )}
                          {accused.acsd_gender && (
                            <p className="text-sm text-gray-700">
                              <strong>Gender:</strong> {accused.acsd_gender}
                            </p>
                          )}
                        </div>
                        {accused.acsd_description && (
                          <div className="mt-3">
                            <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Description
                            </h5>
                            <p className="text-sm text-gray-700 bg-red-50 rounded-lg p-3 border border-red-100">
                              {accused.acsd_description}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h5>
                        <p className="text-sm text-gray-700">
                          {accused.acsd_address || "Address not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
                  <UserX className="h-12 w-12 text-red-300 mx-auto mb-3" />
                  <p className="text-red-700 font-medium">No accused persons listed</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Attached Files */}
      {complaintDetails.complaint_files &&
        complaintDetails.complaint_files.length > 0 && (
          <Card className="bg-gradient-to-r from-white to-purple-50 border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <Collapsible
              open={openSections.files}
              onOpenChange={(open) =>
                setOpenSections((prev) => ({ ...prev, files: open }))
              }
            >
              <CardHeader>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    Attached Files ({complaintDetails.complaint_files.length})
                  </CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    {openSections.files ? (
                      <ChevronUp className="h-5 w-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complaintDetails.complaint_files.map((file: any) => (
                      <div
                        key={file.comp_file_id}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
                      >
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {file.comp_file_name || "Unnamed file"}
                          </p>
                          {file.comp_file_type && (
                            <p className="text-xs text-purple-600 font-medium mt-1">
                              {file.comp_file_type}
                            </p>
                          )}
                          {file.comp_file_url && (
                            <a
                              href={file.comp_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-200 inline-block mt-2"
                            >
                              View File
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
    </div>
  );
}
