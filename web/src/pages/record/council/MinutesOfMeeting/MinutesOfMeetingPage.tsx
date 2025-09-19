import { useState } from "react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Button } from "@/components/ui/button/button"
import { Pencil, Trash, Eye, Plus, Search, Archive, ArchiveRestore, FileInput, Calendar, FileText ,Tag, User} from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import AddMinutesOfMeeting from "./addMinutesOfMeeting"
import { useGetMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRestoreMinutesOfMeeting, useArchiveMinutesOfMeeting } from "./queries/MOMUpdateQueries"
import { useDeleteMinutesofMeeting } from "./queries/MOMDeleteQueries"
import EditMinutesOfMeeting from "./editMinutesOfMeeting"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/helpers/dateHelper"

function MinutesOfMeetingPage() {
  const [filter, _setFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState<number | null>(null)
  const { data: momRecords = [], isLoading } = useGetMinutesOfMeetingRecords()
  const { mutate: restoreMOM } = useRestoreMinutesOfMeeting()
  const { mutate: archiveMOM } = useArchiveMinutesOfMeeting()
  const { mutate: deleteMOM } = useDeleteMinutesofMeeting()
  const [activeSubTab, setActiveSubTab] = useState("active")
  const [searchQuery, setSearchQuery] = useState("")

  const getAreaFocusDisplayName = (focus: string): string => {
    switch (focus) {
      case "gad":
        return "GAD"
      case "finance":
        return "Finance"
      case "council":
        return "Council"
      case "waste":
        return "Waste"
      default:
        return focus
    }
  }

  const getAreaFocusColor = (focus: string): string => {
    switch (focus) {
      case "gad":
        return "bg-primary/10 text-primary"
      case "finance":
        return "bg-green-100 text-green-800"
      case "council":
        return "bg-purple-100 text-purple-800"
      case "waste":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // First filter by archive status
  const activeData = momRecords.filter((row) => row.mom_is_archive === false)
  const archivedData = momRecords.filter((row) => row.mom_is_archive === true)

  // Then apply search and area filter to each subset
  const filteredActiveData = activeData.filter((record) => {
    const matchesFilter = filter === "all" || record.mom_area_of_focus.includes(filter)
    const matchesSearch =
      `${record.mom_title} ${record.mom_agenda} ${record.mom_date} ${record.staff_name} ${record.mom_area_of_focus.join(" ")}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const filteredArchivedData = archivedData.filter((record) => {
    const matchesFilter = filter === "all" || record.mom_area_of_focus.includes(filter)
    const matchesSearch =
      `${record.mom_title} ${record.mom_agenda} ${record.mom_date} ${record.staff_name} ${record.mom_area_of_focus.join(" ")}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Get the appropriate dataset based on active tab
  const currentData = activeSubTab === "active" ? filteredActiveData : filteredArchivedData

  const handleConfirm = (mom_id: string) => {
    archiveMOM(mom_id)
  }

  const handleRestore = (mom_id: string) => {
    restoreMOM(mom_id)
  }

  const handleDelete = (mom_id: string) => {
    deleteMOM(mom_id)
  }

  // CARD LAYOUT
  const MeetingCard = ({ record, isArchived = false }: { record: MinutesOfMeetingRecords; isArchived?: boolean }) => (
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
              <div>
                {record.staff_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                     <User size={14} />
                     {/* <span className="font-medium">Created by:</span> */}
                     <span>{record.staff_name}</span>
                  </div>
                )}
              </div>
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
              {!isArchived ? (
                <>
                  <TooltipLayout
                    trigger={
                      <div>
                        <DialogLayout
                          trigger={
                            <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 p-2.5 rounded-lg cursor-pointer flex items-center transition-colors">
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
                      </div>
                    }
                    content="Edit"
                  />
                  <TooltipLayout
                    trigger={
                      <div>
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
                      </div>
                    }
                    content="Archive"
                  />
                </>
              ) : (
                <>
                  <TooltipLayout
                    trigger={
                      <div>
                        <ConfirmationModal
                          trigger={
                            <div className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-2.5 rounded-lg cursor-pointer transition-colors">
                              <ArchiveRestore size={18} />
                            </div>
                          }
                          title="Restore Archived Record"
                          description="Would you like to restore this record from the archive and make it active again?"
                          actionLabel="Confirm"
                          onClick={() => handleRestore(record.mom_id)}
                        />
                      </div>
                    }
                    content="Restore"
                  />
                  <TooltipLayout
                    trigger={
                      <div>
                        <ConfirmationModal
                          trigger={
                            <div className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-2.5 rounded-lg cursor-pointer transition-colors">
                              <Trash size={18} />
                            </div>
                          }
                          title="Permanent Deletion Confirmation"
                          description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                          actionLabel="Confirm"
                          onClick={() => handleDelete(record.mom_id)}
                        />
                      </div>
                    }
                    content="Delete Permanently"
                  />
                </>
              )}
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
                      {record.supporting_docs && (
                        <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                          Available
                        </Badge>
                      )} 
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
                            Image {file.momsp_name}
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

  // LOADING SCREEN
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Minutes Of Meeting</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view documentation information</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="rounded-lg">
        {/* Header with Search and Create Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-800">
              {activeSubTab === "active" ? "Active Records" : "Inactive Records"} (
              {activeSubTab === "active" ? filteredActiveData.length : filteredArchivedData.length})
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <Input placeholder="Search..." className="pl-10 w-full bg-white" value={searchQuery} 
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                }}
              />
            </div>

            {activeSubTab === "active" && (
              <div className="w-full sm:w-auto">
                <DialogLayout
                  trigger={
                    <Button className="w-full sm:w-auto">
                      Create <Plus className="ml-2" />
                    </Button>
                  }
                  title="Create New Minutes of the Meeting"
                  description="Fill out the form to document meeting details and upload supporting files"
                  mainContent={<AddMinutesOfMeeting onSuccess={() => setIsDialogOpen(false)} />}
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sub Tabs for Active/Archive */}
        <Tabs value={activeSubTab} onValueChange={(value) => { setActiveSubTab(value) }}>
          <div className="ml-5">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="active">Records</TabsTrigger>
              <TabsTrigger value="all">
                <div className="flex items-center gap-2">
                  <Archive size={16} /> Inactive
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active">
            <div className="h-[600px] overflow-y-auto px-6 pb-6">
              {currentData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                  {currentData.map((record) => (
                    <MeetingCard key={record.mom_id} record={record} isArchived={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? "Try adjusting your search terms." : "Get started by creating a new meeting record."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="h-[600px] overflow-y-auto px-6 pb-6">
              {currentData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                  {currentData.map((record) => (
                    <MeetingCard key={record.mom_id} record={record} isArchived={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Archive className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No inactive records</h3>
                  <p className="mt-1 text-sm text-gray-500">Inactive records will appear here.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center items-center p-3 border-t">
          <p className="text-sm text-gray-600">{currentData.length === 0 ? "No records to display" : ""}</p>
        </div>
      </div>
    </div>
  )
}

export default MinutesOfMeetingPage

