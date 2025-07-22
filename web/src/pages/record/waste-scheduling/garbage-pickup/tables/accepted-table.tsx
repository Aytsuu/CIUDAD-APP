import { Eye, ImageIcon, Pen, Search } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimestamp } from "@/helpers/timestampformatter"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { formatTime } from "@/helpers/timeFormatter"
import EditAcceptPickupRequest from "../assignment-edit-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Card } from "@/components/ui/card/card"
import { useGetGarbageAcceptRequest, type GarbageRequestAccept } from "../queries/GarbageRequestFetchQueries"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import React from "react"

export default function AcceptedTable() {
  const { data: acceptedReqData = [], isLoading } = useGetGarbageAcceptRequest()
  const [selectedAssignment, setSelectedAssignment] = useState<GarbageRequestAccept | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = acceptedReqData.filter((request) => {
    const searchString = `
      ${request.garb_requester} 
      ${request.garb_location} 
      ${request.garb_waste_type} 
      ${request.garb_created_at} 
      ${request.garb_additional_notes} 
      ${request.dec_date}
    `.toLowerCase()
    return searchString.includes(searchQuery.toLowerCase())
  })

  // Pagination logic
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleViewAssignment = (assignment: GarbageRequestAccept) => {
    setSelectedAssignment(assignment)
    setIsEditing(false)
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    setSelectedAssignment(null)
  }

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
    <div className="bg-white rounded-lg shadow-sm">
      {selectedAssignment && (
        <DialogLayout
          isOpen={!!selectedAssignment}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAssignment(null)
              setIsEditing(false)
            }
          }}
          title={isEditing ? "Edit Pickup Assignment" : "Pickup Assignment and Schedule Details"}
          description={isEditing ? "" : "Detailed information about the garbage pickup assignment"}
          mainContent={
            isEditing ? (
              <EditAcceptPickupRequest
                pick_id={selectedAssignment.pickup_assignment_id ?? ""}
                acl_id={selectedAssignment.assignment_collector_ids ?? []}
                onSuccess={handleEditSuccess}
                assignment={{
                  driver: selectedAssignment.driver_id ?? undefined,
                  truck: selectedAssignment.truck_id ?? undefined,
                  pick_date: selectedAssignment.assignment_info?.pick_date,
                  pick_time: selectedAssignment.assignment_info?.pick_time,
                  collectors: selectedAssignment.collector_ids,
                }}
              />
            ) : (
              <div className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Driver</Label>
                    <p className="font-sm">{selectedAssignment.assignment_info?.driver || "Not assigned"}</p>
                  </div>
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Truck</Label>
                    <p className="font-sm">{selectedAssignment.assignment_info?.truck || "Not assigned"}</p>
                  </div>
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Scheduled Date</Label>
                    <p className="font-sm">{selectedAssignment.assignment_info?.pick_date || "Not scheduled"}</p>
                  </div>
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Scheduled Time</Label>
                    <p className="font-sm">
                      {selectedAssignment.assignment_info?.pick_time
                        ? formatTime(selectedAssignment.assignment_info.pick_time)
                        : "Not scheduled"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-500">Collectors</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {selectedAssignment.assignment_info?.collectors?.length ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedAssignment.assignment_info.collectors.map((collector, index) => (
                          <li key={index} className="font-sm py-1">
                            {collector}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-sm text-center py-2">No collectors assigned</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pen size={16} />
                    Edit Assignment
                  </Button>
                </div>
              </div>
            )
          }
        />
      )}

      {/* Header with Count, Search, and Page Size Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
        {/* Left side - Title and Count */}
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-800">Accepted Requests ({totalItems})</h2>
        </div>

        {/* Right side - Search and Page Size Controls */}
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

          {/* Page Size Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number.parseInt(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm">entries</span>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="p-6 pt-0">
        {totalItems === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No accepted requests found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedData.map((request) => (
                <Card key={request.garb_id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start gap-4 p-4">
                    {/* Left Section - Main Info */}
                    <div className="flex-shrink-0 min-w-0 w-56">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{request.garb_requester}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{request.sitio_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                          <p className="text-xs font-medium text-gray-900 mt-0.5">{request.garb_location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Waste Type</p>
                          <p className="text-xs font-medium text-gray-900 mt-0.5">{request.garb_waste_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section - Dates and Assignment Info */}
                    <div className="flex-shrink-0 min-w-0 w-40">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Request Date</p>
                          <p className="text-xs font-medium text-gray-900 mt-0.5">
                            {formatTimestamp(request.garb_created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Date Accepted</p>
                          <p className="text-xs font-medium text-gray-900 mt-0.5">
                            {formatTimestamp(request.dec_date)}
                          </p>
                        </div>
                        {request.assignment_info?.pick_date && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled Date</p>
                            <p className="text-xs font-medium text-gray-900 mt-0.5">
                              {request.assignment_info.pick_date}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Additional Notes */}
                    <div className="flex-1 min-w-0">
                      {request.garb_additional_notes && (
                        <div className="h-full">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Additional Notes</p>
                          <div className="bg-gray-50 rounded-lg p-2 h-full min-h-[60px]">
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {request.garb_additional_notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0">
                        <div className="flex gap-1.5">
                          {/* View Assignment */}
                          <TooltipLayout
                            trigger={
                              <div
                                className="bg-white hover:bg-gray-100 border text-black p-2 rounded-lg cursor-pointer transition-colors"
                                onClick={() => handleViewAssignment(request)}
                              >
                                <Eye size={14} />
                              </div>
                            }
                            content="View Assignment"
                          />

                          {/* View Image */}
                          <TooltipLayout
                            trigger={
                              <div>
                                <DialogLayout
                                  trigger={
                                    <div className="bg-stone-200 hover:bg-stone-300 text-gray-500 p-2 rounded-lg cursor-pointer transition-colors">
                                      <ImageIcon size={14} />
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

                          {/* Confirm Pickup */}
                          {/* <TooltipLayout
                            trigger={
                              <div>
                                <ConfirmationModal
                                  trigger={
                                    <div className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg cursor-pointer transition-colors">
                                      <Check size={14} />
                                    </div>
                                  }
                                  title="Confirm Pickup"
                                  description="Would you like to confirm that the pickup has been done?"
                                  actionLabel="Confirm"
                                  onClick={() => handleConfirm(request.garb_id)}
                                />
                              </div>
                            }
                            content="Confirm"
                          /> */}
                        </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4 mt-6">
              <p className="text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} entries
              </p>
              {totalItems > 0 && (
                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
