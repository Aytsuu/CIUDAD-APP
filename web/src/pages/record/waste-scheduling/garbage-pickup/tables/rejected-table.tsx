import { FileInput, ImageIcon, Search } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimestamp } from "@/helpers/timestampformatter"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Card } from "@/components/ui/card/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu"
import { useGetGarbageRejectRequest, type GarbageRequestReject } from "../queries/GarbageRequestFetchQueries"

export default function RejectedTable() {
  const { data: rejectedReqData = [], isLoading } = useGetGarbageRejectRequest()
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = rejectedReqData.filter((request) => {
    const searchString = `
      ${request.garb_requester} 
      ${request.garb_location} 
      ${request.garb_waste_type} 
      ${request.garb_created_at} 
      ${request.dec_reason}
      ${request.dec_date}
    `.toLowerCase()
    return searchString.includes(searchQuery.toLowerCase())
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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
          <h2 className="text-lg font-medium text-gray-800">Rejected Requests ({filteredData.length})</h2>
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
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
      </div>


      {/* Cards Container */}
      <div className="p-6 pt-0">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No rejected requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedData.map((request) => (
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

                  {/* Middle Section - Dates and Rejection Info */}
                  <div className="flex-shrink-0 min-w-0 w-48">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Request Date</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatTimestamp(request.garb_created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Date Rejected</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatTimestamp(request.dec_date || '')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Rejection Reason */}
                  <div className="flex-1 min-w-0">
                    <div className="h-full">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Rejection Reason</p>
                      <div className="bg-gray-50 rounded-lg p-3 h-full min-h-[80px]">
                        <p className="text-sm text-red-600 leading-relaxed whitespace-pre-wrap">
                          {request.dec_reason}
                        </p>
                      </div>
                    </div>
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
                                <div className="bg-stone-200 hover:bg-stone-300 text-gray-500 p-2.5 rounded-lg cursor-pointer transition-colors">
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