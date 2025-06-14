import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Pencil, Trash, Eye, Plus, Search, Archive, ArchiveRestore, FileInput, FileText } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import AddMinutesOfMeeting from "./addMinutesOfMeeting";
import { useGetMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryTable } from "@/components/ui/history-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRestoreMinutesOfMeeting, useArchiveMinutesOfMeeting } from "./queries/MOMUpdateQueries";
import { useDeleteMinutesofMeeting } from "./queries/MOMDeleteQueries";
import EditMinutesOfMeeting from "./editMinutesOfMeeting";
import { Label } from "@/components/ui/label";

function MinutesOfMeetingPage() {
    const [filter, setFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const { data: momRecords = [], isLoading } = useGetMinutesOfMeetingRecords();
    const { mutate: restoreMOM } = useRestoreMinutesOfMeeting();
    const { mutate: archiveMOM } = useArchiveMinutesOfMeeting();
    const { mutate: deleteMOM } = useDeleteMinutesofMeeting();
    const [activeTab, setActiveTab] = useState("minutes");
    const [activeSubTab, setActiveSubTab] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const getAreaFocusDisplayName = (focus: string): string => {
        switch (focus) {
            case 'gad': return 'GAD';
            case 'finance': return 'Finance';
            case 'council': return 'Council';
            case 'waste': return 'Waste Committee';
            default: return focus;
        }
    };

    // Filter data based on search query and active filter
    const filteredData = momRecords.filter((record) => {
        const matchesFilter = filter === "all" || record.areas_of_focus.includes(filter);
        const matchesSearch = `${record.mom_title} ${record.mom_agenda} ${record.mom_date} ${record.areas_of_focus.join(' ')}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleConfirm = (mom_id: string) => {
        archiveMOM(mom_id);
    };

    const handleRestore = (mom_id: string) => {
        restoreMOM(mom_id);
    };

    const handleDelete = (mom_id: string) => {
        deleteMOM(mom_id);
    };

    const commonColumns: ColumnDef<MinutesOfMeetingRecords>[] = [
        {
            accessorKey: "mom_date",
            header: "Date",
            cell: ({ row }) => (
                <div className="w-[110px]">{row.getValue("mom_date")}</div>
            ),
        },
        {
            accessorKey: "mom_agenda",
            header: "Meeting Agenda",
        },
        {
            accessorKey: "mom_title",
            header: "Meeting Title",
            cell: ({ row }) => (
                <div className="max-w-[300px]">{row.getValue("mom_title")}</div>
            ),
        },
        {
            accessorKey: "areas_of_focus",
            header: "Area of Focus",
            cell: ({ row }) => (
                <div className="text-center max-w-[200px]">
                    {row.original.areas_of_focus.map((focus: string, index: number) => (
                        <div key={index} className="text-sm">
                            {getAreaFocusDisplayName(focus)}
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    const activeColumns: ColumnDef<MinutesOfMeetingRecords>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <div className="flex flex-grid justify-center gap-1">
                    <TooltipLayout
                        trigger={
                            <a
                                href={row.original.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-gray-200 border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8"
                            >
                                <Eye size={16} />
                            </a>
                        }
                        content="Open Document"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <DialogLayout
                                    trigger={<div className="bg-white hover:bg-gray-200 border text-black h-[32px] px-4 py-2 rounded cursor-pointer shadow-none flex items-center"><Pencil size={16} /></div>}
                                    title="Edit Minutes of Meeting"
                                    description="Update meeting details, agenda, or attached documents"
                                    mainContent={
                                        <EditMinutesOfMeeting
                                            mom_title={row.original.mom_title}
                                            mom_agenda={row.original.mom_agenda}
                                            mom_date={row.original.mom_date}
                                            mom_id={Number(row.original.mom_id)}
                                            file_id={Number(row.original.file_id)}
                                            file_url={row.original.file_url}
                                            areas_of_focus={row.original.areas_of_focus}
                                            onSuccess={() => setEditingRowId(null)}
                                        />
                                    }
                                    isOpen={editingRowId === Number(row.original.mom_id)}
                                    onOpenChange={(open) => setEditingRowId(open ? Number(row.original.mom_id) : null)}
                                />
                            </div>
                        }
                        content="Update"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16} /></div>}
                                    title="Delete Confirmation"
                                    description="This record will be archived and removed from the active list. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onClick={() => handleConfirm(row.original.mom_id)}
                                />
                            </div>
                        }
                        content="Delete"
                    />
                </div>
            ),
        },
    ];

    const archiveColumns: ColumnDef<MinutesOfMeetingRecords>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <a
                                    href={row.original.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white hover:bg-gray-200 border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8"
                                >
                                    <Eye size={16} />
                                </a>
                            }
                            content="Open Document"
                        />
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={<div className="bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded cursor-pointer"><ArchiveRestore size={16} /></div>}
                                        title="Restore Archived Record"
                                        description="Would you like to restore this record from the archive and make it active again?"
                                        actionLabel="confirm"
                                        onClick={() => handleRestore(row.original.mom_id)}
                                    />
                                </div>
                            }
                            content="Restore"
                        />
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16} /></div>}
                                        title="Permanent Deletion Confirmation"
                                        description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                        actionLabel="confirm"
                                        onClick={() => handleDelete(row.original.mom_id)}
                                    />
                                </div>
                            }
                            content="Delete"
                        />
                    </div>
                );
            },
        },
    ];

    const filterOptions = [
        { id: "all", name: "All" },
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" },
        { id: "Finance", name: "Finance" },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="flex flex-col mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Minutes Of Meeting</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view documentation information</p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="minutes">
                        <FileText className="mr-2 h-4 w-4" />
                        Minutes of Meeting
                    </TabsTrigger>
                    <TabsTrigger value="supporting">
                        <FileInput className="mr-2 h-4 w-4" />
                        Supporting Documents
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Minutes of Meeting Tab Content */}
            {activeTab === "minutes" && (
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header with Search and Create Button */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-medium text-gray-800">
                                {activeSubTab === "active" ? "Active Records" : "Archived Records"} (
                                {activeSubTab === "active" 
                                    ? momRecords.filter(row => row.mom_is_archive === false).length
                                    : momRecords.filter(row => row.mom_is_archive === true).length
                                })
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={17}
                                />
                                <Input
                                    placeholder="Search..."
                                    className="pl-10 bg-white w-full"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            {activeSubTab === "active" && (
                                <div className="w-full sm:w-auto">
                                    <DialogLayout
                                        trigger={<Button className="w-full sm:w-auto">Create <Plus className="ml-2" /></Button>}
                                        title="Create New Minutes of the Meeting"
                                        description="Fill out the form to document meeting details and upload supporting files"
                                        mainContent={
                                            <AddMinutesOfMeeting
                                                onSuccess={() => setIsDialogOpen(false)}
                                            />
                                        }
                                        isOpen={isDialogOpen}
                                        onOpenChange={setIsDialogOpen}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Entries per page selector */}
                    <div className="flex justify-between p-3 border-t">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs sm:text-sm">Show</Label>
                            <Input
                                type="number"
                                className="w-14 h-8"
                                min="1"
                                value={pageSize}
                                onChange={(e) => {
                                    const value = +e.target.value;
                                    setPageSize(value >= 1 ? value : 1);
                                    setCurrentPage(1);
                                }}
                            />
                            <Label className="text-xs sm:text-sm">Entries</Label>
                        </div>

                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <FileInput size={16} />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                                    <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Sub Tabs for Active/Archive */}
                    <Tabs value={activeSubTab} onValueChange={(value) => {
                        setActiveSubTab(value);
                        setCurrentPage(1);
                    }}>
                        <div className='ml-5'>
                            <TabsList className="grid w-full grid-cols-2 max-w-xs">
                                <TabsTrigger value="active">Records</TabsTrigger>
                                <TabsTrigger value="all">
                                    <div className="flex items-center gap-2">
                                        <Archive size={16} /> Archive
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="active">
                            <div className="border overflow-auto max-h-[400px]">
                                <DataTable
                                    columns={activeColumns}
                                    data={paginatedData.filter(row => row.mom_is_archive === false)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="all">
                            <div className="border overflow-auto max-h-[400px]">
                                <HistoryTable
                                    columns={archiveColumns}
                                    data={paginatedData.filter(row => row.mom_is_archive === true)}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Pagination Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
                        <p className="text-xs sm:text-sm text-gray-600">
                            Showing {(currentPage - 1) * pageSize + 1}-
                            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                            {filteredData.length} rows
                        </p>
                        {filteredData.length > 0 && (
                            <PaginationLayout
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Supporting Documents Tab Content */}
            {activeTab === "supporting" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col items-center justify-center py-12">
                        <FileInput className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Supporting Documents</h3>
                        <p className="text-sm text-gray-500 mb-6">This section will contain all supporting documents</p>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Supporting Document
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MinutesOfMeetingPage;