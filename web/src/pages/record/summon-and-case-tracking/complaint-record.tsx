// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { CalendarDays, MapPin, FileText, Users, UserX, Clock, AlertTriangle } from "lucide-react"
// import { useGetComplaintDetails } from "./queries/summonFetchQueries"

// interface Address {
//   street: string
//   barangay: string
//   city: string
//   province: string
// }

// interface Complainant {
//   cpnt_id: number
//   cpnt_name: string
//   cpnt_gender: string
//   cpnt_age: string
//   cpnt_number: string
//   cpnt_relation_to_respondent: string
//   address: Address
// }

// interface Accused {
//   acsd_id: number
//   acsd_name: string
//   acsd_age: string
//   acsd_gender: string
//   acsd_description: string
//   address: Address
// }

// interface ComplaintFile {
//   comp_file_id: number
//   comp_file_name: string
//   comp_file_type: string
// }

// interface ComplaintRecipient {
//   comp_rec_id: number
//   recipient: {
//     username: string
//     email: string
//   }
//   status: "pending" | "reviewed" | "actioned"
//   created_at: string
//   updated_at: string
// }

// interface ComplaintData {
//   comp_id: string
//   comp_location: string
//   comp_incident_type: string
//   comp_datetime: string
//   comp_allegation: string
//   comp_created_at: string
//   comp_is_archive: boolean
//   complainants: Complainant[]
//   accused: Accused[]
//   files: ComplaintFile[]
//   recipients: ComplaintRecipient[]
// }



// export function ComplaintRecordForSummon({ comp_id }: {comp_id: string}) {
//   const [complaint, setComplaint] = useState<ComplaintData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const {data: complaintDetails, isLoading} = useGetComplaintDetails(comp_id)

//   console.log('Complaint',complaintDetails)

//   useEffect(() => {
//     // Mock data for demonstration - replace with actual API call
//     const mockComplaint: ComplaintData = {
//       comp_id: '1',
//       comp_location: "Barangay San Antonio, Quezon City",
//       comp_incident_type: "Domestic Violence",
//       comp_datetime: "2024-01-15 14:30:00",
//       comp_allegation:
//         "The accused has been physically and verbally abusing the complainant for several months. The incident escalated on January 15, 2024, when the accused threatened the complainant with a knife during a heated argument about household expenses.",
//       comp_created_at: "2024-01-15T16:45:00Z",
//       comp_is_archive: false,
//       complainants: [
//         {
//           cpnt_id: 1,
//           cpnt_name: "Maria Santos",
//           cpnt_gender: "Female",
//           cpnt_age: "32",
//           cpnt_number: "09123456789",
//           cpnt_relation_to_respondent: "Spouse",
//           address: {
//             street: "123 Sampaguita Street",
//             barangay: "San Antonio",
//             city: "Quezon City",
//             province: "Metro Manila",
//           },
//         },
//       ],
//       accused: [
//         {
//           acsd_id: 1,
//           acsd_name: "Juan Santos",
//           acsd_age: "35",
//           acsd_gender: "Male",
//           acsd_description:
//             "Approximately 5'8\" tall, medium build, with black hair and brown eyes. Has a scar on the left cheek. Usually wears casual clothing.",
//           address: {
//             street: "123 Sampaguita Street",
//             barangay: "San Antonio",
//             city: "Quezon City",
//             province: "Metro Manila",
//           },
//         },
//       ],
//       files: [
//         {
//           comp_file_id: 1,
//           comp_file_name: "incident_photos.jpg",
//           comp_file_type: "image/jpeg",
//         },
//         {
//           comp_file_id: 2,
//           comp_file_name: "witness_statement.pdf",
//           comp_file_type: "application/pdf",
//         },
//       ],
//       recipients: [
//         {
//           comp_rec_id: 1,
//           recipient: {
//             username: "officer_garcia",
//             email: "garcia@police.gov.ph",
//           },
//           status: "reviewed",
//           created_at: "2024-01-15T17:00:00Z",
//           updated_at: "2024-01-16T09:30:00Z",
//         },
//         {
//           comp_rec_id: 2,
//           recipient: {
//             username: "supervisor_reyes",
//             email: "reyes@police.gov.ph",
//           },
//           status: "pending",
//           created_at: "2024-01-15T17:00:00Z",
//           updated_at: "2024-01-15T17:00:00Z",
//         },
//       ],
//     }

//     // Simulate API call delay
//     setTimeout(() => {
//       setComplaint(mockComplaint)
//       setLoading(false)
//     }, 1000)
//   }, [comp_id])

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200"
//       case "reviewed":
//         return "bg-blue-100 text-blue-800 border-blue-200"
//       case "actioned":
//         return "bg-green-100 text-green-800 border-green-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200"
//     }
//   }

//   const formatAddress = (address: Address) => {
//     return `${address.street}, ${address.barangay}, ${address.city}, ${address.province}`
//   }

//   const formatDateTime = (dateTime: string) => {
//     return new Date(dateTime).toLocaleString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   if (error || !complaint) {
//     return (
//       <Card className="border-destructive">
//         <CardContent className="pt-6">
//           <div className="flex items-center gap-2 text-destructive">
//             <AlertTriangle className="h-5 w-5" />
//             <span>{error || "Complaint not found"}</span>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <Card className="border-l-4 border-l-primary">
//         <CardHeader>
//           <div className="flex items-center justify-between mb-2">
//             <CardTitle className="text-2xl font-bold">Complaint #{complaint.comp_id}</CardTitle>
//             <div className="flex items-center gap-2">
//               {complaint.comp_is_archive && <Badge variant="secondary">Archived</Badge>}
//               <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//                 {complaint.comp_incident_type}
//               </Badge>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <MapPin className="h-4 w-4" />
//               <span className="text-sm">{complaint.comp_location}</span>
//             </div>
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <CalendarDays className="h-4 w-4" />
//               <span className="text-sm">{formatDateTime(complaint.comp_datetime)}</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <Clock className="h-4 w-4" />
//             <span className="text-sm">Filed: {formatDateTime(complaint.comp_created_at)}</span>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Allegation */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <FileText className="h-5 w-5 mb-2" />
//             Allegation Details
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm leading-relaxed text-foreground">{complaint.comp_allegation}</p>
//         </CardContent>
//       </Card>

//       {/* Complainants */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 mb-2">
//             <Users className="h-5 w-5" />
//             Complainant{complaint.complainants.length > 1 ? "s" : ""} ({complaint.complainants.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {complaint.complainants.map((complainant, index) => (
//             <div key={complainant.cpnt_id} className="border rounded-lg p-4 bg-muted/30">
//               {index > 0 && <Separator className="mb-4" />}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-semibold text-lg">{complainant.cpnt_name}</h4>
//                   <div className="space-y-1 text-sm text-muted-foreground mt-2">
//                     <p>
//                       <span className="font-medium">Age:</span> {complainant.cpnt_age}
//                     </p>
//                     <p>
//                       <span className="font-medium">Gender:</span> {complainant.cpnt_gender}
//                     </p>
//                     <p>
//                       <span className="font-medium">Contact:</span> {complainant.cpnt_number}
//                     </p>
//                     <p>
//                       <span className="font-medium">Relation:</span> {complainant.cpnt_relation_to_respondent}
//                     </p>
//                   </div>
//                 </div>
//                 <div>
//                   <h5 className="font-medium text-sm text-muted-foreground mb-1">Address</h5>
//                   <p className="text-sm">{formatAddress(complainant.address)}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       {/* Accused */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <UserX className="h-5 w-5 mb-2" />
//             Accused Person{complaint.accused.length > 1 ? "s" : ""} ({complaint.accused.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {complaint.accused.map((accused, index) => (
//             <div key={accused.acsd_id} className="border rounded-lg p-4 bg-red-50/50">
//               {index > 0 && <Separator className="mb-4" />}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-semibold text-lg">{accused.acsd_name}</h4>
//                   <div className="space-y-1 text-sm text-muted-foreground mt-2">
//                     <p>
//                       <span className="font-medium">Age:</span> {accused.acsd_age}
//                     </p>
//                     <p>
//                       <span className="font-medium">Gender:</span> {accused.acsd_gender}
//                     </p>
//                   </div>
//                   <div className="mt-3">
//                     <h5 className="font-medium text-sm text-muted-foreground mb-1">Description</h5>
//                     <p className="text-sm">{accused.acsd_description}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <h5 className="font-medium text-sm text-muted-foreground mb-1">Address</h5>
//                   <p className="text-sm">{formatAddress(accused.address)}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       {/* Files */}
//       {complaint.files.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5 mb-2" />
//               Attached Files ({complaint.files.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {complaint.files.map((file) => (
//                 <div key={file.comp_file_id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
//                   <FileText className="h-8 w-8 text-muted-foreground" />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-medium text-sm truncate">{file.comp_file_name}</p>
//                     <p className="text-xs text-muted-foreground">{file.comp_file_type}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Recipients */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5 mb-2" />
//             Case Recipients ({complaint.recipients.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {complaint.recipients.map((recipient) => (
//               <div key={recipient.comp_rec_id} className="flex items-center justify-between p-3 border rounded-lg">
//                 <div className="flex-1">
//                   <p className="font-medium text-sm">{recipient.recipient.username}</p>
//                   <p className="text-xs text-muted-foreground">{recipient.recipient.email}</p>
//                   <p className="text-xs text-muted-foreground mt-1">Assigned: {formatDateTime(recipient.created_at)}</p>
//                 </div>
//                 <Badge className={getStatusColor(recipient.status)}>
//                   {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
//                 </Badge>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, FileText, Users, UserX, Clock, AlertTriangle } from "lucide-react"
import { useGetComplaintDetails } from "./queries/summonFetchQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"

export function ComplaintRecordForSummon({ comp_id }: {comp_id: string}) {
  const {data: complaintDetails, isLoading, error} = useGetComplaintDetails(comp_id)

  if (isLoading ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !complaintDetails) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{(error as Error)?.message || "Complaint not found"}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold">Complaint #{complaintDetails.comp_id}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{complaintDetails.comp_location || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm">{formatTimestamp(complaintDetails.comp_datetime)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Filed: {formatTimestamp(complaintDetails.comp_created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Allegation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 mb-2" />
            Allegation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">
            {complaintDetails.comp_allegation || "No allegation details provided"}
          </p>
        </CardContent>
      </Card>

      {/* Complainants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5" />
            Complainant{(complaintDetails.complainant && complaintDetails.complainant.length > 1) ? "s" : ""} 
            ({complaintDetails.complainant ? complaintDetails.complainant.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complaintDetails.complainant && complaintDetails.complainant.length > 0 ? (
            complaintDetails.complainant.map((complainant: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-muted/30">
                {index > 0 && <Separator className="mb-4" />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{complainant.cpnt_name || "Unnamed Complainant"}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground mt-2">
                      {complainant.cpnt_age && (
                        <p><span className="font-medium">Age:</span> {complainant.cpnt_age}</p>
                      )}
                      {complainant.cpnt_gender && (
                        <p><span className="font-medium">Gender:</span> {complainant.cpnt_gender}</p>
                      )}
                      {complainant.cpnt_number && (
                        <p><span className="font-medium">Contact:</span> {complainant.cpnt_number}</p>
                      )}
                      {complainant.cpnt_relation_to_respondent && (
                        <p><span className="font-medium">Relation:</span> {complainant.cpnt_relation_to_respondent}</p>
                      )}
                    </div>
                  </div>
                  {complainant.address && (
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-1">Address</h5>
                      <p className="text-sm">
                        {complainant.address.street && `${complainant.address.street}, `}
                        {complainant.address.barangay && `${complainant.address.barangay}, `}
                        {complainant.address.city && `${complainant.address.city}, `}
                        {complainant.address.province}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No complainants listed</p>
          )}
        </CardContent>
      </Card>

      {/* Accused Persons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 mb-2" />
            Accused Person{(complaintDetails.accused_persons && complaintDetails.accused_persons.length > 1) ? "s" : ""} 
            ({complaintDetails.accused_persons ? complaintDetails.accused_persons.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complaintDetails.accused_persons && complaintDetails.accused_persons.length > 0 ? (
            complaintDetails.accused_persons.map((accused: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-red-50/50">
                {index > 0 && <Separator className="mb-4" />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{accused.acsd_name || "Unnamed Accused"}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground mt-2">
                      {accused.acsd_age && (
                        <p><span className="font-medium">Age:</span> {accused.acsd_age}</p>
                      )}
                      {accused.acsd_gender && (
                        <p><span className="font-medium">Gender:</span> {accused.acsd_gender}</p>
                      )}
                    </div>
                    {accused.acsd_description && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm text-muted-foreground mb-1">Description</h5>
                        <p className="text-sm">{accused.acsd_description}</p>
                      </div>
                    )}
                  </div>
                  {accused.address && (
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-1">Address</h5>
                      <p className="text-sm">
                        {accused.address.street && `${accused.address.street}, `}
                        {accused.address.barangay && `${accused.address.barangay}, `}
                        {accused.address.city && `${accused.address.city}, `}
                        {accused.address.province}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No accused persons listed</p>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      {complaintDetails.complaint_files && complaintDetails.complaint_files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 mb-2" />
              Attached Files ({complaintDetails.complaint_files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {complaintDetails.complaint_files.map((file: any) => (
                <div key={file.comp_file_id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.comp_file_name || "Unnamed file"}</p>
                    {file.comp_file_type && (
                      <p className="text-xs text-muted-foreground">{file.comp_file_type}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}