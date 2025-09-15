import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, FileText, Users, UserX, Clock, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import { useGetComplaintDetails } from "./queries/summonFetchQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { useAcceptRequest } from "./queries/summonUpdateQueries"
import { Button } from "@/components/ui/button/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useRejectRequest } from "./queries/summonUpdateQueries"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function ComplaintRecordForSummon({ comp_id, sr_id, onSuccess }: {comp_id: string, sr_id?: string, onSuccess?: () => void}) {
  const {data: complaintDetails, isLoading, error} = useGetComplaintDetails(comp_id)
  const [reason, setReason] = useState("")
  const {mutate: acceptReq, isPending: isAcceptPending} = useAcceptRequest(onSuccess)
  const {mutate: rejectReq, isPending: isRejectPending} = useRejectRequest(onSuccess)

  console.log('Complaint:', complaintDetails)
  const handleAccept = (sr_id: string) => {
    acceptReq(sr_id)
  }

  const handleReject = (sr_id: string, reason: string) => {
    const values = {sr_id, reason}
    rejectReq(values)
  }


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
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
          <DialogLayout
              trigger={
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2" disabled={isAcceptPending || isRejectPending}>
                    <XCircle className="h-4 w-4" />
                    Reject Request
                </Button>
              }
              title="Reason for Rejection"
              description = "Provide the reason to confirm rejection."
              mainContent={
                <div className="mt-2">
                    <Input placeholder="Enter rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} disabled={isRejectPending} />

                    <div className="mt-3 flex justify-end">
                      <Button disabled={isRejectPending || !reason.trim()} onClick={() => handleReject(sr_id || '', reason)}>
                        {isRejectPending? "Submitting" : "Submit"}
                      </Button>
                    </div>
                </div>
              }
          />

          <ConfirmationModal
              trigger={
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" disabled={isAcceptPending || isRejectPending}>
                  <CheckCircle className="h-4 w-4" />
                  Accept Request
              </Button>
              }
              title="Confirm Accept"
              description="Are you sure you wanted to accept this request?"
              actionLabel="Confirm"
              onClick={() => handleAccept(sr_id || '')}
          />
      </div>
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