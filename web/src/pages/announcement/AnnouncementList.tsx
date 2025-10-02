"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Plus, Search, FileText, Eye, Trash, Filter, Calendar, Clock, Mail, MessageSquare } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Input } from "@/components/ui/input"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDeleteAnnouncement } from "./queries/announcementDeleteQueries"
import { useGetCreatedReceivedAnnouncements } from "./queries/announcementFetchQueries"
import { Button } from "@/components/ui/button/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";

function AnnouncementTracker() {
  const [error] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<string>("")

  const { user } = useAuth()
  const staff_id = user?.staff?.staff_id

  const { data, isLoading } = useGetCreatedReceivedAnnouncements(staff_id || "")
  const createdAnnouncements = data?.created || []
  const receivedAnnouncements = data?.received || []

  const { mutate: deleteEntry } = useDeleteAnnouncement(staff_id || "")

  const handleDelete = (ann_id: number) => {
    deleteEntry(ann_id)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  // filtering, sorting, pagination... (unchanged)
  const filterAnnouncements = (arr: any[]) =>
    arr
      .filter((announcement) =>
        announcement.ann_title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((a) => {
        if (filter === "dateRecent") return true
        if (filter === "toSms") return a.ann_to_sms === true
        if (filter === "toEmail") return a.ann_to_email === true
        if (filter === "general") return a.ann_type === "general"
        if (filter === "public") return a.ann_type === "public"
        if (filter === "event") return a.ann_type === "event"
        return true
      })

  let filteredCreated = filterAnnouncements(createdAnnouncements)
  let filteredReceived = filterAnnouncements(receivedAnnouncements)

  if (filter === "dateRecent") {
    filteredCreated = [...filteredCreated].sort(
      (a, b) => new Date(b.ann_created_at).getTime() - new Date(a.ann_created_at).getTime()
    )
    filteredReceived = [...filteredReceived].sort(
      (a, b) => new Date(b.ann_created_at).getTime() - new Date(a.ann_created_at).getTime()
    )
  }

  const createdPaginatedData = filteredCreated.slice(
    (currentPage - 1) * Math.ceil(pageSize / 2),
    currentPage * Math.ceil(pageSize / 2)
  )
  const receivedPaginatedData = filteredReceived.slice(
    (currentPage - 1) * Math.ceil(pageSize / 2),
    currentPage * Math.ceil(pageSize / 2)
  )

  const totalCreated = filteredCreated.length
  const totalReceived = filteredReceived.length
  const totalPages = Math.ceil(
    Math.max(totalCreated, totalReceived) / Math.ceil(pageSize / 2)
  )

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "sms":
        return "default"
      case "email":
        return "secondary"
      case "general":
        return "outline"
      case "public":
        return "destructive"
      case "event":
        return "default"
      default:
        return "outline"
    }
  }

  const AnnouncementCard = ({ announcement }: { announcement: any }) => (
    <Card
      key={announcement.ann_id}
      className="w-full shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white flex flex-col"
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="mb-3 relative">
          {announcement.ann_type && (
            <Badge variant={getBadgeVariant(announcement.ann_type)} className="absolute top-0 right-0 text-xs">
              {announcement.ann_type.toUpperCase()}
            </Badge>
          )}
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 leading-tight pr-20">
            {announcement.ann_title}
          </h2>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            Created on {formatDate(announcement.ann_created_at)}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {announcement.ann_type === "event" ? (
              <>
                {announcement.ann_start_at && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Posted On</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{formatDate(announcement.ann_start_at)}</p>
                  </div>
                )}

                {(announcement.ann_event_start || announcement.ann_event_end) && (
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-3">
                      <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Event Period</h4>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                      {announcement.ann_event_start && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">Start At</span>
                            <p className="text-sm text-gray-900 font-medium">
                              {formatDate(announcement.ann_event_start)}
                            </p>
                          </div>
                        </div>
                      )}

                      {announcement.ann_event_end && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-600" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">End At</span>
                            <p className="text-sm text-gray-900 font-medium">
                              {formatDate(announcement.ann_event_end)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {announcement.ann_start_at && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Start At</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{formatDate(announcement.ann_start_at)}</p>
                  </div>
                )}

                {announcement.ann_end_at && (
                  <div>
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">End At</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{formatDate(announcement.ann_end_at)}</p>
                  </div>
                )}
              </>
            )}

            {(announcement.ann_to_sms || announcement.ann_to_email) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Status</h4>
                <div className="space-y-1">
                  {announcement.ann_to_sms && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-600">SMS</span>
                      </div>
                    </div>
                  )}

                  {announcement.ann_to_email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-600">Email</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto bg-gradient-to-r from-gray-50/50 to-transparent border-t border-gray-100 -mx-4 -mb-4">
          <div className="flex justify-start gap-3 p-3 lg:px-4">
            <Link to={`/announcement/${announcement.ann_id}`}>
              <TooltipLayout
                trigger={
                  <div className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow">
                    <Eye size={16} />
                    View Details
                  </div>
                }
                content="View announcement details"
              />
            </Link>

            <TooltipLayout
              trigger={
                <ConfirmationModal
                  trigger={
                    <div className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow">
                      <Trash size={16} />
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
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-80 opacity-30" />
          <Skeleton className="h-10 w-24 opacity-30" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full opacity-30" />
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
      <MainLayoutComponent
        title="Announcements "
        description="Manage and view announcement records"
      >
        <div className="bg-gray-50/80 min-h-screen p-6 -mx-6 -mb-6">
          {/* Wrapped search bar, filter, add announcement, and show per page together in white background */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col gap-6">
              {/* Top row: Search bar, filter, and add announcement button */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-2/3">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Search announcements..."
                      className="pl-11 bg-white border-gray-200 shadow-sm h-11 w-full focus:ring-2 focus:ring-blue-500/20"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                    />
                  </div>

                  <Select
                    value={filter}
                    onValueChange={(val) => {
                      setFilter(val)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[200px] h-11 bg-white border-gray-200 shadow-sm">
                      <Filter className="mr-2 h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateRecent">Date Created</SelectItem>
                      <SelectItem value="toSms">To SMS</SelectItem>
                      <SelectItem value="toEmail">To Email</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
                  <Link to="/announcement/create" className="w-full lg:w-auto">
                    <Button className="h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-sm w-full lg:w-auto text-base font-medium">
                      <Plus size={18} className="mr-2" /> Add Announcement
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Bottom row: Show per page */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Show</span>
                <Input
                  type="number"
                  className="w-20 h-9 text-center border-gray-200 shadow-sm"
                  value={pageSize}
                  onChange={(e) => {
                    const value = +e.target.value
                    setPageSize(value >= 1 ? value : 1)
                    setCurrentPage(1)
                  }}
                />
                <span className="text-sm text-gray-600 font-medium">per page</span>
              </div>
            </div>
          </div>

          {totalCreated === 0 && totalReceived === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No announcements found</h3>
              <p className="text-gray-500 text-base">
                {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first announcement."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Left Column - Created Announcements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">My Announcements</h2>
                    <Badge variant="outline" className="text-xs">
                      {totalCreated}
                    </Badge>
                  </div>

                  {createdPaginatedData.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No created announcements</h3>
                      <p className="text-gray-500 text-sm">You haven't created any announcements yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {createdPaginatedData.map((announcement) => (
                        <AnnouncementCard key={announcement.ann_id} announcement={announcement} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Received Announcements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Received Announcements</h2>
                    <Badge variant="outline" className="text-xs">
                      {totalReceived}
                    </Badge>
                  </div>

                  {receivedPaginatedData.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No received announcements</h3>
                      <p className="text-gray-500 text-sm">You haven't received any announcements yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {receivedPaginatedData.map((announcement) => (
                        <AnnouncementCard key={announcement.ann_id} announcement={announcement} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-200 bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-6">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, Math.max(totalCreated, totalReceived))}
                    </span>{" "}
                    of <span className="font-medium">{Math.max(totalCreated, totalReceived)}</span> announcements
                  </p>
                </div>

                {Math.max(totalCreated, totalReceived) > pageSize && (
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
      </MainLayoutComponent>
    </TooltipProvider>
  )
}

export default AnnouncementTracker