import { useState } from "react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { CheckCircle, XCircle, ImageIcon, Search } from "lucide-react"
import AcceptPickupRequest from "../assignment-form"
import RejectPickupForm from "../reject-request-form"
import { useGetGarbagePendingRequest } from "../queries/GarbageRequestFetchQueries"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { formatTime } from "@/helpers/timeFormatter"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card/card"

export default function PendingCards() {
  const [acceptedRowId, setAcceptedRowId] = useState<number | null>(null)
  const [rejectedRowId, setRejectedRowId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: pendingReqData = [], isLoading } = useGetGarbagePendingRequest()

  const filteredData = pendingReqData.filter((request) => {
    const searchString = `
      ${request.garb_requester} 
      ${request.garb_location} 
      ${request.garb_waste_type} 
      ${request.garb_pref_date} 
      ${request.garb_pref_time} 
      ${request.garb_additional_notes}
    `.toLowerCase()
    return searchString.includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full opacity-30" />
          ))}
        </div>
      </div>
    )
  }

  return (
      <div className="bg-white rounded-lg shadow-sm mt-6">
        {/* Header with Count, Search, and Export Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
          {/* Left side - Title and Count */}
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-800">Pending Requests ({filteredData.length})</h2>
          </div>
          {/* Right side - Search and Export Button */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Cards Container */}
        <div className="p-6 pt-0">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((request) => (
                <Card key={request.garb_id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start gap-6 p-6">
                    {/* Left Section - Main Info */}
                    <div className="flex-shrink-0 min-w-0 w-64">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-base text-gray-900 truncate">{request.garb_requester}</h3>
                          <p className="text-sm text-gray-500 mt-1">{request.sitio_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{request.garb_location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Waste Type</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{request.garb_waste_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Dates and Times */}
                    <div className="flex-shrink-0 min-w-0 w-48">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Preferred Date</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {request.garb_pref_date || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Preferred Time</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatTime(request.garb_pref_time) || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Request Date</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatTimestamp(request.garb_created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Additional Notes (Flexible) */}
                    <div className="flex-1 min-w-0">
                      {request.garb_additional_notes && (
                        <div className="h-full">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Additional Notes</p>
                          <div className="bg-gray-50 rounded-lg p-3 h-full min-h-[80px]">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {request.garb_additional_notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0">
                      <div className="flex gap-2">
                        {/* View Image */}
                        <TooltipLayout
                          trigger={
                            <div>
                              <DialogLayout
                                trigger={
                                  <div className="bg-white hover:bg-gray-100 border text-black p-2.5 rounded-lg cursor-pointer transition-colors">
                                    <ImageIcon size={16} />
                                  </div>
                                }
                                title="Request Image"
                                mainContent={
                                  <div className="flex justify-center items-center w-full h-full p-6">
                                    <img
                                      src={request.file_url || "/placeholder.svg"}
                                      alt="Request"
                                      className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                                    />
                                  </div>
                                }
                              />
                            </div>
                          }
                          content="View Image"
                        />

                        {/* Accept Request */}
                        <TooltipLayout
                          trigger={
                            <div>
                              <DialogLayout
                                trigger={
                                  <div className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-lg cursor-pointer transition-colors">
                                    <CheckCircle size={16} />
                                  </div>
                                }
                                title="Schedule & Assign for Pickup"
                                description="Set date, time, team and vehicle for garbage pickup."
                                mainContent={
                                  <AcceptPickupRequest
                                    garb_id={request.garb_id}
                                    onSuccess={() => setAcceptedRowId(null)}
                                  />
                                }
                                isOpen={acceptedRowId === Number(request.garb_id)}
                                onOpenChange={(open) => setAcceptedRowId(open ? Number(request.garb_id) : null)}
                              />
                            </div>
                          }
                          content="Accept"
                        />

                        {/* Reject Request */}
                        <TooltipLayout
                          trigger={
                            <div>
                              <DialogLayout
                                trigger={
                                  <div className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg cursor-pointer transition-colors">
                                    <XCircle size={16} />
                                  </div>
                                }
                                title="Confirm Rejection"
                                description="Reject the selected garbage pickup request. A reason is required before confirming this action."
                                mainContent={
                                  <RejectPickupForm
                                    garb_id={request.garb_id}
                                    onSuccess={() => setRejectedRowId(null)}
                                  />
                                }
                                isOpen={rejectedRowId === Number(request.garb_id)}
                                onOpenChange={(open) => setRejectedRowId(open ? Number(request.garb_id) : null)}
                              />
                            </div>
                          }
                          content="Reject"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}
