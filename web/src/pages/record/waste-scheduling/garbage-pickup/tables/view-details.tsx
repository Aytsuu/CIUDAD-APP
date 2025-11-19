import { Label } from "@/components/ui/label"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, User, FileText, Trash2, Pen, CheckCircle, XCircle } from "lucide-react"
import { formatTime } from "@/helpers/timeFormatter"
import { Button } from "@/components/ui/button/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import EditAcceptPickupRequest from "../assignment-edit-form"
import { useState } from "react"
import { formatDate } from "@/helpers/dateHelper"

export default function ViewGarbageRequestDetails({
  garb_requester,
  garb_location,
  sitio_name,
  garb_created_at,
  garb_pref_time,
  garb_pref_date,
  garb_additional_notes,
  file_url,
  garb_waste_type,
  rejection_reason,
  dec_date,
  enableAssignmentEditing = false,
  pickup_assignment_id = "",
  assignment_collector_ids = [],
  driver_id,
  collector_ids = [],
  assignment_info,
  onEditSuccess,
  truck_id,
  staff_name,
  conf_resident_conf_date = null,
  conf_staff_conf_date = null,
  conf_resident_conf = null,
  conf_staff_conf = null,
  isRejected,
  isAccepted,
}: {
  garb_requester: string
  garb_location: string
  sitio_name: string
  garb_created_at: string
  garb_pref_date?: string
  garb_pref_time?: string
  garb_additional_notes?: string
  file_url: string
  garb_waste_type: string;
  rejection_reason?: string;
  dec_date?: string;
  enableAssignmentEditing?: boolean;
  pickup_assignment_id?: string;
  assignment_collector_ids?: string[];
  driver_id?: string;
  collector_ids?: string[];
  assignment_info?: {
    driver?: string;
    truck?: string;
    pick_date?: string;
    pick_time?: string;
    collectors?: string[];
  };
  onEditSuccess?: () => void;
  truck_id?: string;
  staff_name?: string;
  conf_resident_conf_date?: string | null;
  conf_staff_conf_date?: string | null;
  conf_resident_conf?: boolean | null;
  conf_staff_conf?: boolean | null;
  isRejected?: boolean;
  isAccepted?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)

  const handleEditClick = () => {
    setSelectedAssignment({
      pickup_assignment_id,
      assignment_collector_ids,
      driver_id,
      collector_ids,
      assignment_info,
      truck_id
    })
    setIsEditing(true)
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    setSelectedAssignment(null)
    onEditSuccess?.()
  }


  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Request Information Card */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex pb-4 items-center gap-2 text-blue-900">
                <FileText className="w-5 h-5 text-blue-600" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Requester</Label>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-900">{garb_requester}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Location</Label>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{sitio_name}</p>
                    <p className="text-sm text-slate-600">{garb_location}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-slate-600">Waste Type</Label>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 p-2">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {garb_waste_type}
                </Badge>            
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Request Created</Label>
                <p className="text-sm text-slate-700 font-medium">{formatTimestamp(garb_created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Preferred Schedule Card */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <CardTitle className="flex items-center pb-4 gap-2 text-emerald-900">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                Preferred Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Preferred Date & Time</Label>
                <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">{formatDate(garb_pref_date || '', "long")}, {formatTime(garb_pref_time || '')}</span>
                </div>
              </div>

              {garb_additional_notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Additional Notes</Label>
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <p className="text-sm text-slate-700 leading-relaxed">{garb_additional_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decision Status Card - Shows for both accepted and rejected requests */}
          {(staff_name || dec_date || rejection_reason) && (
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className={`bg-gradient-to-r border-b pb-4 ${
                isAccepted 
                  ? "from-green-50 to-emerald-50 border-green-100" 
                  : isRejected 
                  ? "from-red-50 to-rose-50 border-red-100"
                  : "from-slate-50 to-gray-50 border-slate-100"
              }`}>
                <CardTitle className={`flex items-center gap-2 ${
                  isAccepted ? "text-green-900" : isRejected ? "text-red-900" : "text-slate-900"
                }`}>
                  {isAccepted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isRejected ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-slate-600" />
                  )}
                  {isAccepted ? "Request Accepted" : isRejected ? "Request Rejected" : "Request Status"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-2">
                {staff_name && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">
                      {isAccepted ? "Accepted By" : isRejected ? "Rejected By" : "Processed By"}
                    </Label>
                    <div className={`flex items-center gap-3 p-2 rounded-lg ${
                      isAccepted ? "bg-green-50" : isRejected ? "bg-red-50" : "bg-slate-50"
                    }`}>
                      <User className={`w-4 h-4 ${
                        isAccepted ? "text-green-600" : isRejected ? "text-red-600" : "text-slate-600"
                      }`} />
                      <span className="font-semibold text-slate-900">{staff_name}</span>
                    </div>
                  </div>
                )}

                {dec_date && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">
                      {isAccepted ? "Date Accepted" : isRejected ? "Date Rejected" : "Decision Date"}
                    </Label>
                    <div className={`flex items-center gap-3 p-2 rounded-lg ${
                      isAccepted ? "bg-green-50" : isRejected ? "bg-red-50" : "bg-slate-50"
                    }`}>
                      <CalendarDays className={`w-4 h-4 ${
                        isAccepted ? "text-green-600" : isRejected ? "text-red-600" : "text-slate-600"
                      }`} />
                      <span className="font-semibold text-slate-900">{formatTimestamp(dec_date)}</span>
                    </div>
                  </div>
                )}

                {rejection_reason && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Reason for Rejection</Label>
                    <div className="bg-red-50 border border-red-200 p-2 rounded-lg">
                      <p className="text-sm text-slate-700 leading-relaxed">{rejection_reason}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Confirmation Status Card - Shows for completed requests */}
          {(conf_resident_conf_date || conf_staff_conf_date || conf_resident_conf !== null || conf_staff_conf !== null) && (
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-900 pb-4">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  Pickup Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resident Confirmation */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Resident Confirmation</Label>
                    <div className={`p-3 rounded-lg ${
                      conf_resident_conf ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          conf_resident_conf ? "bg-green-500" : "bg-slate-400"
                        }`} />
                        <span className="font-semibold text-slate-900">
                          {conf_resident_conf ? "Confirmed" : "Not Confirmed"}
                        </span>
                      </div>
                      {conf_resident_conf_date && (
                        <p className="text-sm text-slate-600 mt-1">
                          {formatTimestamp(conf_resident_conf_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Staff Confirmation */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Staff Confirmation</Label>
                    <div className={`p-3 rounded-lg ${
                      conf_staff_conf ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          conf_staff_conf ? "bg-green-500" : "bg-slate-400"
                        }`} />
                        <span className="font-semibold text-slate-900">
                          {conf_staff_conf ? "Confirmed" : "Not Confirmed"}
                        </span>
                      </div>
                      {conf_staff_conf_date && (
                        <p className="text-sm text-slate-600 mt-1">
                          {formatTimestamp(conf_staff_conf_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Status */}
                {(conf_resident_conf && conf_staff_conf) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Overall Status</Label>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Pickup Completed Successfully</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment Details Section - Only shows if assignment data exists (accepted requests) */}
          {(assignment_info?.driver || assignment_info?.truck || assignment_info?.pick_date) && (
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <CardTitle className="flex items-center justify-between text-purple-900 pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-purple-600" />
                    Pickup Assignment
                  </div>
                  {enableAssignmentEditing && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                      onClick={handleEditClick}
                    >
                      <Pen size={16} />
                      Edit Assignment
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Driver</Label>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-slate-900">{assignment_info?.driver || "Not assigned"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Truck</Label>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-slate-900">{assignment_info?.truck || "Not assigned"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Scheduled Date & Time</Label>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-semibold text-slate-900">{formatDate(assignment_info?.pick_date || "Not scheduled", "long")}, {assignment_info?.pick_time ? formatTime(assignment_info.pick_time) : "Not scheduled"}</p>
                  </div>
                </div> 
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Collectors</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-purple-50">
                    {assignment_info?.collectors?.length ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {assignment_info.collectors.map((collector, index) => (
                          <li key={index} className="font-sm py-1 text-slate-900">
                            {collector}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-sm text-center py-2 text-slate-600">No collectors assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {file_url && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100">
              <CardTitle className="text-slate-900">Attached Image</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={file_url || "/placeholder.svg"}
                  alt="Garbage collection request image"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Assignment Dialog */}
      {enableAssignmentEditing && selectedAssignment && (
        <DialogLayout
          isOpen={isEditing}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditing(false)
              setSelectedAssignment(null)
            }
          }}
          title="Edit Pickup Assignment"
          description="Update the pickup assignment details"
          mainContent={
            <EditAcceptPickupRequest
              pick_id={selectedAssignment.pickup_assignment_id}
              acl_id={selectedAssignment.assignment_collector_ids}
              onSuccess={handleEditSuccess}
              assignment={{
                driver: selectedAssignment.driver_id,
                truck: selectedAssignment.truck_id,
                pick_date: selectedAssignment.assignment_info?.pick_date,
                pick_time: selectedAssignment.assignment_info?.pick_time,
                collectors: selectedAssignment.collector_ids,
              }}
            />
          }
        />
      )}
    </>
  )
}