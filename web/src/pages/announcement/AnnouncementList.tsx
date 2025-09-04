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
import { useGetAnnouncement } from "./queries/announcementFetchQueries"
import { Button } from "@/components/ui/button/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"

function AnnouncementTracker() {
  const [error] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<string>("")

  const { data: announcements = [], isLoading } = useGetAnnouncement()
  const { mutate: deleteEntry } = useDeleteAnnouncement()

  const handleDelete = async (ann_id: number) => {
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

  // ✅ Apply search ONLY on announcement title
  let filteredData = announcements.filter((announcement) => {
    return announcement.ann_title?.toLowerCase().includes(searchQuery.toLowerCase())
  })
  // ✅ Apply filters
  if (filter === "dateRecent") {
    filteredData = [...filteredData].sort(
      (a, b) => new Date(b.ann_created_at).getTime() - new Date(a.ann_created_at).getTime(),
    )
  } else if (filter === "a-z") {
    filteredData = [...filteredData].sort((a, b) => a.ann_title.localeCompare(b.ann_title))
  } else if (filter === "z-a") {
    filteredData = [...filteredData].sort((a, b) => b.ann_title.localeCompare(a.ann_title))
  } else if (filter === "toSms") {
    filteredData = filteredData.filter((a) => a.ann_to_sms === true)
  } else if (filter === "toEmail") {
    filteredData = filteredData.filter((a) => a.ann_to_email === true)
  }

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
      <div className="w-full h-full p-6 bg-gray-50/50">
        <div className="flex-col items-center mb-6">
          <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Announcement Records</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and view announcement records</p>
        </div>
        <hr className="border-gray-200 mb-8" />

        <div className="flex justify-between items-center mb-8 w-full">
          <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="relative flex-1">
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
                <SelectItem value="a-z">A–Z</SelectItem>
                <SelectItem value="z-a">Z–A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Link to="/announcement/create">
            <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus size={18} className="mr-2" /> Add Announcement
            </Button>
          </Link>
        </div>

        {paginatedData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No announcements found</h3>
            <p className="text-gray-500 text-base">
              {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first announcement."}
            </p>
          </div>
        ) : (
          <>
            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {paginatedData.map((announcement) => (
                  <Card
                    key={announcement.ann_id}
                    className="w-full shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white flex flex-col"
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="flex flex-col lg:flex-row flex-1">
                        <div className="flex-1 p-4 lg:p-6">
                          <div className="mb-3">
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">
                              {announcement.ann_title}
                            </h2>
                            <div className="flex items-center text-base text-gray-500 mb-2">
                              <Calendar className="w-4 h-4 mr-2" />
                              Posted on {formatDate(announcement.ann_created_at)}
                            </div>
                          </div>
                          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                            {announcement.ann_details}
                          </p>
                        </div>

                        <div className="w-full lg:w-80 bg-gray-50/80 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-5">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center mb-1">
                                  <Clock className="w-4 h-4 text-green-600 mr-2" />
                                  <span className="text-base font-medium text-gray-700">Start At</span>
                                </div>
                                <p className="text-base text-gray-900 font-medium">
                                  {formatDate(announcement.ann_start_at)}
                                </p>
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center mb-1">
                                  <Clock className="w-4 h-4 text-red-600 mr-2" />
                                  <span className="text-base font-medium text-gray-700">End At</span>
                                </div>
                                <p className="text-base text-gray-900 font-medium">
                                  {formatDate(announcement.ann_end_at)}
                                </p>
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center mb-2">
                                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                  <span className="text-base font-medium text-gray-700">Event Period</span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Start:</span>{" "}
                                    {formatDate(announcement.ann_event_start)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">End:</span> {formatDate(announcement.ann_event_end)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                              <h4 className="text-base font-medium text-gray-700 mb-2">Notification Status</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <MessageSquare className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-base text-gray-600">SMS</span>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      announcement.ann_to_sms
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {announcement.ann_to_sms ? "Enabled" : "Disabled"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-base text-gray-600">Email</span>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      announcement.ann_to_email
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {announcement.ann_to_email ? "Enabled" : "Disabled"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto bg-gradient-to-r from-gray-50/50 to-transparent border-t border-gray-100">
                        <div className="flex justify-start gap-3 p-4 lg:px-6">
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
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-200 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-6">
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
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredData.length}</span> announcements
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
