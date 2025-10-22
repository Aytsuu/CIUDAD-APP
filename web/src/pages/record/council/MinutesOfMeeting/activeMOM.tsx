import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Plus, Search, FileText, Tag, Pencil, Eye, FileInput, Calendar, User, Trash } from "lucide-react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import AddMinutesOfMeeting from "./addMinutesOfMeeting"
import { useGetActiveMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries"
import { useArchiveMinutesOfMeeting } from "./queries/MOMUpdateQueries"
import { Spinner } from "@/components/ui/spinner"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { TooltipProvider } from "@/components/ui/tooltip"
import EditMinutesOfMeeting from "./editMinutesOfMeeting"
import { formatDate } from "@/helpers/dateHelper"
import { getAreaFocusDisplayName, getAreaFocusColor } from "./MinutesOfMeetingPage"
import { Badge } from "@/components/ui/badge"

export default function ActiveMOM() {
  // ----------------- STATE --------------------
  const { showLoading, hideLoading } = useLoading()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [editingRowId, setEditingRowId] = useState<number | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)

  // ----------------- FETCH --------------------
  const { 
    data: activeMOMRecordsData, 
    isLoading: isLoadingActive,
  } = useGetActiveMinutesOfMeetingRecords(currentPage, debouncedPageSize, debouncedSearchQuery)

  const { mutate: archiveMOM } = useArchiveMinutesOfMeeting()
  const activeMOMRecords = activeMOMRecordsData?.results || []
  const activeTotalCount = activeMOMRecordsData?.count || 0
  const totalPages = Math.ceil(activeTotalCount / pageSize)

  // ----------------- LOADING MGMT --------------------
  useEffect(() => {
    if (isLoadingActive) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoadingActive, showLoading, hideLoading])

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  const handleConfirm = (mom_id: string) => {
    archiveMOM(mom_id)
  }

  // ----------------- MEETING CARD --------------------
  const MeetingCard = ({ record }: { record: MinutesOfMeetingRecords }) => (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-gray-900 leading-tight mb-2">{record.mom_title}</CardTitle>
            <div className="flex flex-row gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>{formatDate(record.mom_date, "long")}</span>
              </div>
              {record.staff_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <User size={14} />
                  <span>{record.staff_name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <TooltipProvider>
              <TooltipLayout
                trigger={
                  <a
                    href={record.mom_file.momf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-2.5 rounded-lg cursor-pointer flex items-center justify-center transition-colors"
                  >
                    <Eye size={18} />
                  </a>
                }
                content="Open Document"
              />
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 p-2.5 rounded-lg cursor-pointer transition-colors">
                        <Pencil size={18} />
                      </div>
                    }
                    title="Edit Minutes of Meeting"
                    description="Update meeting details, agenda, or attached documents"
                    mainContent={
                      <EditMinutesOfMeeting
                        mom_title={record.mom_title}
                        mom_agenda={record.mom_agenda}
                        mom_date={record.mom_date}
                        mom_id={Number(record.mom_id)}
                        momf_id={Number(record.mom_file.momf_id)}
                        momf_url={record.mom_file.momf_url}
                        areas_of_focus={record.mom_area_of_focus}
                        onSuccess={() => setEditingRowId(null)}
                      />
                    }
                    isOpen={editingRowId === Number(record.mom_id)}
                    onOpenChange={(open) => setEditingRowId(open ? Number(record.mom_id) : null)}
                  />
                }
                content="Edit"
              />
              <TooltipLayout
                trigger={
                  <ConfirmationModal
                    trigger={
                      <div className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-2.5 rounded-lg cursor-pointer transition-colors">
                        <Trash size={18} />
                      </div>
                    }
                    title="Archive Confirmation"
                    description="This record will be archived and removed from the active list. Do you wish to proceed?"
                    actionLabel="Confirm"
                    onClick={() => handleConfirm(record.mom_id)}
                  />
                }
                content="Archive"
              />
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-gray-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Meeting Agenda</p>
              <p className="text-gray-600 leading-relaxed">{record.mom_agenda}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Tag size={20} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Areas of Focus</p>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {record.mom_area_of_focus.map((focus: string, index: number) => (
              <Badge key={index} variant="secondary" className={`text-sm px-3 py-1 ${getAreaFocusColor(focus)}`}>
                {getAreaFocusDisplayName(focus)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          {record.supporting_docs && record.supporting_docs.length > 0 ? (
            <DialogLayout
              trigger={
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                  <FileInput size={16} />
                  View Supporting Documents
                  <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                    Available
                  </Badge>
                </Button>
              }
              className="max-w-md max-h-[60%] overflow-auto p-6 flex flex-col"
              title="Supporting Documents"
              description="These are files attached to this meeting record"
              mainContent={
                <div className="flex flex-col gap-4">
                  {record.supporting_docs.map((file) => (
                    <div key={file.momsp_id} className="border p-2 rounded-md">
                      <a 
                        href={file.momsp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-blue-800 flex items-center gap-2"
                      >
                        <span className="truncate max-w-[500px] block" title={file.momsp_name}>
                          {file.momsp_name}
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              }
            />
          ) : (
            <div className="text-gray-400 text-sm">No supporting documents</div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // ----------------- RENDER --------------------
  if (isLoadingActive) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-gray-600">Loading meeting records...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Search + Create */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by title, agenda, date, or staff name..."
              className="pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DialogLayout
            trigger={
              <Button className="px-4">
                <Plus size={16} className="mr-2" />
                Create Meeting
              </Button>
            }
            title="Create New Minutes of the Meeting"
            description="Fill out the form to document meeting details and upload supporting files"
            mainContent={<AddMinutesOfMeeting onSuccess={() => setIsDialogOpen(false)} />}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      </div>

      {/* Page Size */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Show</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => setPageSize(Number.parseInt(value))}
          >
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
          <span className="text-sm text-gray-600">entries</span>
        </div>
      </div>

      {/* Records */}
      {activeMOMRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No active records found" : "No active records yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? `No active records match "${searchQuery}". Try adjusting your search.`
              : "Get started by creating your first meeting record."}
          </p>
        </div>
      ) : (
        <div className="h-[600px] overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
            {activeMOMRecords.map((record: MinutesOfMeetingRecords) => (
              <MeetingCard key={record.mom_id} record={record} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {activeMOMRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 mb-2 sm:mb-0">
            Showing <span className="font-medium">{activeTotalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> -{" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, activeTotalCount)}</span> of{" "}
            <span className="font-medium">{activeTotalCount}</span> active records
          </p>

          {totalPages > 0 && (
            <PaginationLayout 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </div>
      )}
    </div>
  )
}
