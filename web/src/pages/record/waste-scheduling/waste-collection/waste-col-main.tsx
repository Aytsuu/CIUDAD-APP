import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Trash, Search, Plus, Eye, Archive, ArchiveRestore  } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { formatTime } from "@/helpers/timeFormatter";
import UpdateWasteColSched from "./waste-col-UpdateSched";
import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "./queries/wasteColFetchQueries";
import WasteColSched from "./waste-col-sched";
import { useArchiveWasteCol, useRestoreWasteCol, useDeleteWasteCol } from "./queries/wasteColDeleteQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCreateCollectionReminders } from "./queries/wasteColAddQueries";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext"; 





const dayOptions = [
    { id: "0", name: "All Days" },
    { id: "Monday", name: "Monday" },
    { id: "Tuesday", name: "Tuesday" },
    { id: "Wednesday", name: "Wednesday" },
    { id: "Thursday", name: "Thursday" },
    { id: "Friday", name: "Friday" },
    { id: "Saturday", name: "Saturday" },
    { id: "Sunday", name: "Sunday" }
]



function WasteCollectionMain() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>("0");
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [activeCurrentPage, setActiveCurrentPage] = useState(1);
    const [archiveCurrentPage, setArchiveCurrentPage] = useState(1);    
    const { showLoading, hideLoading } = useLoading();

    const currentPage = activeTab === "active" ? activeCurrentPage : archiveCurrentPage;
    const isArchive = activeTab === "archived";    

    // Add debouncing for search
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // FETCH MUTATIONS - Updated to include search and filter parameters
    const { data: wasteCollectionData = { results: [], count: 0 }, isLoading } = useGetWasteCollectionSchedFull(
        currentPage,
        pageSize,
        debouncedSearchQuery,
        selectedDay,
        isArchive
    );

    //POST MUTATIONs (announcement)
    const { mutate: createReminders } = useCreateCollectionReminders();

    // Extract data from paginated response
    const fetchedData = wasteCollectionData.results || [];
    const totalCount = wasteCollectionData.count || 0;    

    // Calculate total pages for current tab
    const activeTotalPages = activeTab === "active" ? Math.ceil(totalCount / pageSize) : 0;
    const archiveTotalPages = activeTab === "archived" ? Math.ceil(totalCount / pageSize) : 0;    

    // useEffect(() => {
    //     if (isLoading || wasteCollectionData.length === 0) return;

    //     const today = new Date().toDateString();
    //     const lastChecked = localStorage.getItem('lastReminderCheck');

    //     // Only run once per day
    //     if (lastChecked === today) return;

    //     const tomorrow = new Date();
    //     tomorrow.setDate(tomorrow.getDate() + 1);
    //     const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

    //     const hasTomorrowCollection = wasteCollectionData.some(
    //         schedule => schedule.wc_day?.toLowerCase() === tomorrowDayName.toLowerCase() && !schedule.wc_is_archive
    //     );

    //     if (hasTomorrowCollection) {
    //         createReminders();
    //         localStorage.setItem('lastReminderCheck', today);
    //     }
    // }, [wasteCollectionData, isLoading, createReminders]);     
    
    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);   


    useEffect(() => {
        if (isLoading || fetchedData.length === 0) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if any schedule is for tomorrow
        const hasTomorrowCollection = fetchedData.some(
            schedule => schedule.wc_day?.toLowerCase() === tomorrowDayName.toLowerCase() && !schedule.wc_is_archive
        );

        if (hasTomorrowCollection) {
            createReminders();
        }
    }, [fetchedData, isLoading, createReminders]);


    // ARCHIVE / RESTORE / DELETE MUTATIONS
    const { mutate: archiveWasteSchedCol } = useArchiveWasteCol();
    const { mutate: restoreWasteSchedCol } = useRestoreWasteCol();
    const { mutate: deleteWasteSchedCol } = useDeleteWasteCol();


    const handleDelete = (wc_num: number) => {
        deleteWasteSchedCol(wc_num);
    };

    const handleArchive = (wc_num: number) => {
        archiveWasteSchedCol(wc_num);
    };

    const handleRestore = (wc_num: number) => {
        restoreWasteSchedCol(wc_num);
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Handle day filter change
    const handleDayChange = (value: string) => {
        setSelectedDay(value);
    };

    // Handle tab change - reset to page 1 when switching tabs
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === "active") {
            setActiveCurrentPage(1);
        } else {
            setArchiveCurrentPage(1);
        }
    };    



    // Common columns for both tabs
    const commonColumns: ColumnDef<WasteCollectionSchedFull>[] = [
        {
            accessorKey: "wc_day",
            header: "Collection Day",
        },
        {
            accessorKey: "wc_time",
            header: "Collection Time",
            cell: ({ row }) => {
                const time = row.original.wc_time;
                return formatTime(time);
            },
        },
        {
            accessorKey: "sitio_name",
            header: "Sitio",
        },
        {
            accessorKey: "wc_add_info",
            header: "Additional Details",
        },
    ];

    // Columns for active schedules
    const activeColumns: ColumnDef<WasteCollectionSchedFull>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={
                                    <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                                        <Eye size={16} />
                                    </div>
                                }
                                className="max-w-[50%] max-h-[90%] overflow-auto p-10"
                                title="Update Waste Collection"
                                description=""
                                mainContent={
                                    <div className="flex flex-col">
                                        <UpdateWasteColSched
                                            wc_num={row.original.wc_num}
                                            wc_day={row.original.wc_day}
                                            wc_time={row.original.wc_time}
                                            wc_add_info={row.original.wc_add_info}
                                            wc_is_archive={row.original.wc_is_archive}
                                            sitio_id={row.original.sitio}
                                            driver_id={row.original.wstp}
                                            truck_id={row.original.truck}
                                            collector_ids={row.original.collectors_wstp_ids}
                                            onSuccess={() => setEditingRowId(null)}    
                                        />
                                    </div>
                                }
                                isOpen={editingRowId === row.original.wc_num}
                                onOpenChange={(open) => setEditingRowId(open ? row.original.wc_num : null)}
                            />
                        }
                        content="View"
                    />

                    <TooltipLayout
                        trigger={
                            <ConfirmationModal
                                trigger={
                                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                        <Archive size={16} />
                                    </div>
                                }
                                title="Archive Schedule"
                                description="This schedule will be archive. Are you sure?"
                                actionLabel="Archive"
                                onClick={() => handleArchive(row.original.wc_num)}
                            />
                        }
                        content="Archive"
                    />
                </div>
            ),
        },
    ];

    // Columns for archived schedules
    const archiveColumns: ColumnDef<WasteCollectionSchedFull>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <ConfirmationModal
                                trigger={ <div className="bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded cursor-pointer"><ArchiveRestore size={16}/></div>}
                                title="Restore Archived Schedule"
                                description="Would you like to restore this schedule from the archive and make it active again?"
                                actionLabel="Restore"
                                onClick={() => handleRestore(row.original.wc_num)}
                            />
                        }
                        content="Restore"
                    />

                    <TooltipLayout
                        trigger={
                            <ConfirmationModal
                                trigger={
                                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                        <Trash size={16} />
                                    </div>
                                }
                                title="Delete Schedule"
                                description="This schedule will be permanently deleted. Are you sure?"
                                actionLabel="Delete"
                                onClick={() => handleDelete(row.original.wc_num)}
                            />
                        }
                        content="Delete"
                    />
                </div>
            ),
        },
    ];


    return (
        <div className="w-full h-full">
          <div className="mt-[25px] flex justify-end">
              <DialogLayout
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  trigger={
                      <div className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded cursor-pointer flex items-center justify-center">
                          <Plus size={16} className="mr-1" /> Create
                      </div>
                  }
                  className="max-w-[55%] h-[540px] p-10 flex flex-col overflow-auto scrollbar-custom"
                  title="Schedule Waste Collection"
                  description="Schedule new waste collection"
                  mainContent={<WasteColSched onSuccess={() => setIsDialogOpen(false)} />}
              />
          </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                    <Input 
                        placeholder="Search..." 
                        className="pl-10 w-full bg-white" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="w-full md:w-[250px]">
                    <SelectLayout
                        className="w-full bg-white"
                        placeholder="Filter by Day"
                        options={dayOptions}
                        value={selectedDay}
                        label=""
                        onChange={handleDayChange}
                    />
                </div>
            </div>

            {/* Tabs for Active/Archived Schedules */}
            <div className="bg-white rounded-lg shadow">

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Select 
                            value={pageSize.toString()} 
                            onValueChange={(value) => {
                                const newPageSize = Number.parseInt(value);
                                setPageSize(newPageSize);
                                // Reset both pagination states to page 1
                                setActiveCurrentPage(1);
                                setArchiveCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-20 h-8 bg-white border-gray-200">
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
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <div className="p-4">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Schedules</TabsTrigger>
                            <TabsTrigger value="archived">
                                <div className="flex items-center gap-2">
                                    <ArchiveRestore size={16} /> Archive Schedule
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active">
                        <div className="p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="lg" />
                                    <span className="ml-2 text-gray-600">Loading...</span>
                                </div>
                            ) : (
                                <DataTable
                                    columns={activeColumns}
                                    data={fetchedData} 
                                />
                            )}                            
                        </div>

                        {/* Active Tab Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                                Showing {(activeCurrentPage - 1) * pageSize + 1}-
                                {Math.min(activeCurrentPage * pageSize, totalCount)} of{" "}
                                {totalCount} rows
                            </p>
                            {totalCount > 0 && (
                                <PaginationLayout
                                    currentPage={activeCurrentPage}
                                    totalPages={activeTotalPages}
                                    onPageChange={setActiveCurrentPage}
                                />
                            )}
                        </div>                        
                    </TabsContent>

                    <TabsContent value="archived">
                        <div className="p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="lg" />
                                    <span className="ml-2 text-gray-600">Loading...</span>
                                </div>
                            ) : (
                                <DataTable
                                    columns={archiveColumns}
                                    data={fetchedData} 
                                />
                            )}                               
                        </div>

                        {/* Archive Tab Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                                Showing {(archiveCurrentPage - 1) * pageSize + 1}-
                                {Math.min(archiveCurrentPage * pageSize, totalCount)} of{" "}
                                {totalCount} rows
                            </p>
                            {totalCount > 0 && (
                                <PaginationLayout
                                    currentPage={archiveCurrentPage}
                                    totalPages={archiveTotalPages}
                                    onPageChange={setArchiveCurrentPage}
                                />
                            )}
                        </div>                        
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default WasteCollectionMain;