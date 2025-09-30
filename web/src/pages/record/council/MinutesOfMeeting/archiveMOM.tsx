    import { DataTable } from "@/components/ui/table/data-table";
    import PaginationLayout from "@/components/ui/pagination/pagination-layout";
    import { useGetInactiveMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries";
    import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
    import { ColumnDef } from "@tanstack/react-table";
    import { useEffect, useState } from "react";
    import { useLoading } from "@/context/LoadingContext";
    import { useDeleteMinutesofMeeting } from "./queries/MOMDeleteQueries";
    import { useRestoreMinutesOfMeeting } from "./queries/MOMUpdateQueries";
    import { useDebounce } from "@/hooks/use-debounce";
    import { Button } from "@/components/ui/button/button";
    import { Input } from "@/components/ui/input";
    import { Search, ArchiveRestore, Trash, Eye, FileText, Calendar, User, Tag, FileInput } from "lucide-react";
    import { Badge } from "@/components/ui/badge";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { formatDate } from "@/helpers/dateHelper";
    import { Skeleton } from "@/components/ui/skeleton";
    import { Spinner } from "@/components/ui/spinner";
    import { ConfirmationModal } from "@/components/ui/confirmation-modal";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
    import { TooltipProvider } from "@/components/ui/tooltip";
    import DialogLayout from "@/components/ui/dialog/dialog-layout";

    export default function ArchiveMOM() {
        const { showLoading, hideLoading } = useLoading();
        const [searchQuery, setSearchQuery] = useState("")
        const [pageSize, setPageSize] = useState<number>(10)
        const [currentPage, setCurrentPage] = useState<number>(1)
        const debouncedSearchQuery = useDebounce(searchQuery, 300)
        const debouncedPageSize = useDebounce(pageSize, 100)
        
        const { data: inactiveMOMRecordsData, isLoading: isLoadingInactive,  refetch: refetchInactive } = useGetInactiveMinutesOfMeetingRecords(currentPage, debouncedPageSize, debouncedSearchQuery)
        
        const { mutate: deleteMOM } = useDeleteMinutesofMeeting()
        const { mutate: restoreMOM } = useRestoreMinutesOfMeeting()

        const inactiveMOMRecords = inactiveMOMRecordsData?.results || []
        const inactiveTotalCount = inactiveMOMRecordsData?.count || 0
        const totalPages = Math.ceil(inactiveTotalCount / pageSize)

        const handleRestore = (mom_id: string) => {
            restoreMOM(mom_id)
        }

        const handleDelete = (mom_id: string) => {
            deleteMOM(mom_id)
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

        // Reset to page 1 when search query changes
        useEffect(() => {
            setCurrentPage(1);
        }, [debouncedSearchQuery]);

        useEffect(() => {
            if (isLoadingInactive) {
                showLoading()
            } else {
                hideLoading()
            }
        }, [isLoadingInactive, showLoading, hideLoading])

        // Meeting Card Component
        const MeetingCard = ({ record }: { record: MinutesOfMeetingRecords }) => (
            <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-xl font-semibold text-gray-900 leading-tight mb-2">
                                {record.mom_title}
                            </CardTitle>
                            <div className="flex flex-row gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar size={16} />
                                    <span>{formatDate(record.mom_date, "long")}</span>
                                </div>
                                <div>
                                    {record.staff_name && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <User size={14} />
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
                                <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className={`text-sm px-3 py-1 ${getAreaFocusColor(focus)}`}
                                >
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

        // Loading State
        if (isLoadingInactive) {
            return (
                <div className="w-full h-full">
                    <Skeleton className="h-10 w-1/6 mb-3" />
                    <Skeleton className="h-7 w-1/4 mb-6" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-4/5 w-full mb-4" />
                </div>
            )
        }

        return (
            <div className="w-full">
                {/* Search and Controls */}
                <div className="bg-white rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search archived records by title, agenda, date, or staff name..."
                                className="pl-11"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                </div>

                {/* Loading State */}
                {isLoadingInactive && (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                        <span className="ml-2 text-gray-600">Loading archived records...</span>
                    </div>
                )}

                {/* Content */}
                {isLoadingInactive ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                        <span className="ml-2 text-gray-600">Loading archived records...</span>
                    </div>
                ) : inactiveMOMRecords.length === 0 ? (
                    <div className="text-center py-12">
                        <ArchiveRestore className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? "No archived records found" : "No archived records yet"}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery
                                ? `No archived records match "${searchQuery}". Try adjusting your search.`
                                : "Archived records will appear here once you archive them from the active list."}
                        </p>
                    </div>
                ) : (
                    <div className="h-[600px] overflow-y-auto px-6 pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                            {inactiveMOMRecords.map((record) => (
                                <MeetingCard key={record.mom_id} record={record} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!isLoadingInactive && inactiveMOMRecords.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                            Showing <span className="font-medium">{inactiveTotalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> -{" "}
                            <span className="font-medium">{Math.min(currentPage * pageSize, inactiveTotalCount)}</span> of{" "}
                            <span className="font-medium">{inactiveTotalCount}</span> archived records
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