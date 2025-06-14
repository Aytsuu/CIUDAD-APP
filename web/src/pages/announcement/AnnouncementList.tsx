"use client"

import { useState } from "react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Trash, Plus, Search, Eye, Calendar, FileText, Tag } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import AnnouncementCreateForm from "./announcementcreate"
import AnnouncementView from "./announcementview"
import { Input } from "@/components/ui/input"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { type Announcement, useDeleteAnnouncement } from "./queries/announcementDeleteQueries"
import { useGetAnnouncement } from "./queries/announcementFetchQueries"

function AnnouncementTracker() {
  const [data] = useState<Announcement[]>([])
  const [error] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(9) // Changed to 9 for better card grid layout
  const [currentPage, setCurrentPage] = useState(1)

  const { data: announcements = [], isLoading, refetch } = useGetAnnouncement()

  const { mutate: deleteEntry } = useDeleteAnnouncement()

  const handleDelete = async (ann_id: number) => {
    deleteEntry(ann_id)
  }

  // Filter data based on search query
  const filteredData = announcements.filter((announcement) => {
    const searchString =
      `${announcement.ann_id} ${announcement.ann_title} ${announcement.ann_details} ${announcement.ann_start_at} ${announcement.ann_end_at} ${announcement.ann_type}`.toLowerCase()
    return searchString.includes(searchQuery.toLowerCase())
  })

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "important":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "general":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-80 opacity-30" />
          <Skeleton className="h-10 w-24 opacity-30" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full opacity-30" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Announcement Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view announcement records</p>
        </div>
        <hr className="border-gray mb-6 sm:mb-8" />

        {/* Search and Create Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input
              placeholder="Search announcements..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DialogLayout
            trigger={
              <div className="flex items-center bg-blue py-2 px-4 text-white text-sm rounded-md gap-2 shadow-sm hover:bg-blue/90 cursor-pointer">
                <Plus size={16} /> Add Announcement
              </div>
            }
            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
            title=""
            description=""
            mainContent={
              <div className="w-full h-full">
                <AnnouncementCreateForm
                  onSuccess={() => {
                    setIsDialogOpen(false)
                    refetch()
                  }}
                />
              </div>
            }
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>

        {/* Cards Grid Section */}
        {paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first announcement."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedData.map((announcement) => (
                <Card key={announcement.ann_id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">#{announcement.ann_id}</span>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(announcement.ann_type)}`}>
                          <Tag size={10} className="mr-1" />
                          {announcement.ann_type}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {announcement.ann_title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{announcement.ann_details}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Created: {formatDate(String(announcement.ann_created_at))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Start: {formatDate(String(announcement.ann_start_at))}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>End: {formatDate(String(announcement.ann_end_at))}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <TooltipLayout
                        trigger={
                          <DialogLayout
                            trigger={
                              <div className="flex-1 bg-white hover:bg-gray-50 border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center gap-2 text-sm">
                                <Eye size={14} />
                                View
                              </div>
                            }
                            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                            title=""
                            description=""
                            mainContent={
                              <div className="w-full h-full">
                                <AnnouncementView ann_id={announcement.ann_id!} onSaveSuccess={refetch} />
                              </div>
                            }
                          />
                        }
                        content="View announcement details"
                      />

                      <TooltipLayout
                        trigger={
                          <ConfirmationModal
                            trigger={
                              <div className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded cursor-pointer flex items-center justify-center">
                                <Trash size={14} />
                              </div>
                            }
                            title="Confirm Delete"
                            description="Are you sure you want to delete this announcement?"
                            actionLabel="Confirm"
                            onClick={() => announcement.ann_id !== undefined && handleDelete(announcement.ann_id)}
                          />
                        }
                        content="Delete announcement"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination and Info Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-600">Show</p>
                  <Input
                    type="number"
                    className="w-16 h-8 text-center"
                    value={pageSize}
                    onChange={(e) => {
                      const value = +e.target.value
                      setPageSize(value >= 1 ? value : 1)
                      setCurrentPage(1)
                    }}
                  />
                  <p className="text-xs sm:text-sm text-gray-600">per page</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                  {filteredData.length} announcements
                </p>
              </div>

              {filteredData.length > pageSize && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

export default AnnouncementTracker
