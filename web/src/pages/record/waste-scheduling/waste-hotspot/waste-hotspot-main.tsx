import { DataTable } from "@/components/ui/table/data-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Search, Plus, Trash, Pen, History, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import WasteHotSched from "./waste-hotspot-sched";
import WasteHotSchedEdit from "./waste-hotspot-sched-edit";
import { useState } from "react";
import { useGetHotspotRecords, type Hotspot } from "./queries/hotspotFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryTable } from "@/components/ui/table/history-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteHotspot } from "./queries/hotspotDeleteQueries";
import { formatTime } from "@/helpers/timeFormatter";
import { SelectLayout } from "@/components/ui/select/select-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import React from "react";

function WasteHotspotMain() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("active");
    const [selectedSitio, setSelectedSitio] = useState<string>("0");
    
    // Search and pagination for active tab
    const [searchQueryActive, setSearchQueryActive] = useState("");
    const [pageSizeActive, setPageSizeActive] = React.useState<number>(10);
    const [currentPageActive, setCurrentPageActive] = useState(1);
    
    // Search and pagination for history tab
    const [searchQueryHistory, setSearchQueryHistory] = useState("");
    const [pageSizeHistory, setPageSizeHistory] = React.useState<number>(10);
    const [currentPageHistory, setCurrentPageHistory] = useState(1);

    const { data: fetchedData = [], isLoading } = useGetHotspotRecords();
    const { mutate: deleteHotspot } = useDeleteHotspot();

    const handleDelete = (wh_num: string) => {
        deleteHotspot(wh_num);
    };

    // Filter and paginate function
    const filterAndPaginate = (rows: Hotspot[], search: string, page: number, pageSize: number) => {
        const filtered = rows.filter(item => {
            const matchesSitio = selectedSitio === "0" || item.sitio === selectedSitio;
            const matchesSearch = search === "" || 
                item.watchman.toLowerCase().includes(search.toLowerCase()) ||
                item.sitio.toLowerCase().includes(search.toLowerCase()) ||
                (item.wh_add_info && item.wh_add_info.toLowerCase().includes(search.toLowerCase()));
            return matchesSitio && matchesSearch;
        });
        
        const total = filtered.length;
        const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
        return { filtered, paginated, total };
    };

    // Active data
    const { filtered: filteredActive, paginated: paginatedActive, total: totalActive} = filterAndPaginate(
        fetchedData.filter(row => !row.wh_is_archive), 
        searchQueryActive, 
        currentPageActive, 
        pageSizeActive
    );

    // History data
    const { filtered: filteredHistory, paginated: paginatedHistory, total: totalHistory } = filterAndPaginate(
        fetchedData.filter(row => row.wh_is_archive), 
        searchQueryHistory, 
        currentPageHistory, 
        pageSizeHistory
    );

    const commonColumns: ColumnDef<Hotspot>[] = [
        { 
            accessorKey: "watchman", 
            header: "Watchman",
            cell: ({ row }) => <div className="capitalize">{row.getValue("watchman")}</div>
        },
        { 
            accessorKey: "wh_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Assignment Date
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("wh_date")} </div>            
            )
        },
        { 
            accessorKey: "wh_start_time", 
            header: "Start Time",
            cell: ({ row }) => {
                const time = row.original.wh_start_time;
                return <div className="text-center">{formatTime(time)}</div>;
            }
        },
        { 
            accessorKey: "wh_end_time", 
            header: "End Time",
            cell: ({ row }) => {
                const time = row.original.wh_end_time;
                return <div className="text-center">{formatTime(time)}</div>;
            }
        },
        { 
            accessorKey: "sitio", 
            header: "Sitio",
            cell: ({ row }) => <div className="capitalize">{row.getValue("sitio")}</div>
        },
        { 
            accessorKey: "wh_add_info", 
            header: "Additional Info",
            cell: ({ row }) => <div>{row.getValue("wh_add_info") || "None"}</div>
        }
    ];

    const activeColumns: ColumnDef<Hotspot>[] = [
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
                                        <Pen size={16}/>
                                    </div>
                                }
                                title="Edit Hotspot Assignment and Schedule"
                                description="Update the assignment and schedule details for this hotspot."
                                mainContent={
                                    <WasteHotSchedEdit
                                        wh_num={row.original.wh_num}
                                        wh_start_time={row.original.wh_start_time}
                                        wh_end_time={row.original.wh_end_time}
                                        wh_date={row.original.wh_date}
                                        wh_add_info={row.original.wh_add_info}
                                        sitio_id={row.original.sitio_id}
                                        wstp_id={row.original.wstp_id}
                                        onSuccess={() => setEditingRowId(null)}
                                    />
                                }
                                isOpen={editingRowId === Number(row.original.wh_num)}
                                onOpenChange={(open) => setEditingRowId(open ? Number(row.original.wh_num) : null)}
                            />
                        }
                        content="Edit"
                    />
                    <TooltipLayout
                        trigger={
                            <ConfirmationModal
                                trigger={
                                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                        <Trash size={16}/>
                                    </div>
                                }
                                title="Delete Confirmation"
                                description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                actionLabel="Confirm"
                                onClick={() => handleDelete(row.original.wh_num)}
                            />
                        }
                        content="Delete"
                    />
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
                <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
                <Skeleton className="h-10 w-full mb-4 opacity-30" />
                <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="mt-[25px]">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Waste Hotspot Assignment & Schedule
                </h1>
            </div>
            
            {/* Search, Filter, and Create Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 mb-4">
                <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                    <div className="relative flex-1 max-w-[500px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full bg-white text-sm"
                            value={activeTab === "active" ? searchQueryActive : searchQueryHistory}
                            onChange={(e) => {
                                if (activeTab === "active") {
                                    setSearchQueryActive(e.target.value);
                                    setCurrentPageActive(1);
                                } else {
                                    setSearchQueryHistory(e.target.value);
                                    setCurrentPageHistory(1);
                                }
                            }}
                        />
                    </div>
                    
                    <div className="w-full sm:w-[250px]">
                        <SelectLayout
                            className="w-full bg-white"
                            placeholder="Filter by Sitio"
                            options={[
                                { id: "0", name: "All Sitio" },
                                ...Array.from(new Set(fetchedData.map(item => item.sitio)))
                                    .filter(name => name)
                                    .map((name) => ({ id: name, name }))
                            ]}
                            value={selectedSitio}
                            label=""
                            onChange={(value) => {
                                setSelectedSitio(value);
                                setCurrentPageActive(1);
                                setCurrentPageHistory(1);
                            }}
                        />
                    </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                    <DialogLayout
                        trigger={<Button><Plus className="h-4 w-4" />Create</Button>}
                        title="Create New Assignment and Schedule"
                        description="Assign a watchman to a hotspot location with the right schedule."
                        mainContent={
                            <WasteHotSched onSuccess={() => setIsDialogOpen(false)} />
                        }
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                    />
                </div>
            </div>

            {/* Tabs for Active/Archived Schedules */}
            <div className="bg-white rounded-lg shadow">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="pt-4 pl-4">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Watchlist</TabsTrigger>
                            <TabsTrigger value="all">
                                <div className="flex items-center gap-2">
                                    <History size={16} /> Past Schedules
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active">
                        <div className="p-4 flex flex-col gap-4">
                            {/* Page Size Selector */}
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm">Show</span>
                                <Select 
                                    value={pageSizeActive.toString()} 
                                    onValueChange={(value) => {
                                        setPageSizeActive(Number.parseInt(value));
                                        setCurrentPageActive(1);
                                    }}
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
                                <span className="text-sm">entries</span>
                            </div>

                            <DataTable
                                columns={activeColumns}
                                data={paginatedActive}
                            />

                            <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
                                <p className="text-gray-600">
                                    Showing {(currentPageActive - 1) * pageSizeActive + 1}-
                                    {Math.min(currentPageActive * pageSizeActive, totalActive)} of {totalActive} rows
                                </p>
                                {totalActive > 0 && (
                                    <PaginationLayout
                                        currentPage={currentPageActive}
                                        totalPages={Math.ceil(totalActive / pageSizeActive)}
                                        onPageChange={setCurrentPageActive}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="all">
                        <div className="p-4 flex flex-col gap-4">
                            {/* Page Size Selector */}
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm">Show</span>
                                <Select 
                                    value={pageSizeHistory.toString()} 
                                    onValueChange={(value) => {
                                        setPageSizeHistory(Number.parseInt(value));
                                        setCurrentPageHistory(1);
                                    }}
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
                                <span className="text-sm">entries</span>
                            </div>

                            <HistoryTable 
                                columns={commonColumns} 
                                data={paginatedHistory} 
                            />

                            <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
                                <p className="text-gray-600">
                                    Showing {(currentPageHistory - 1) * pageSizeHistory + 1}-
                                    {Math.min(currentPageHistory * pageSizeHistory, totalHistory)} of {totalHistory} rows
                                </p>
                                {totalHistory > 0 && (
                                    <PaginationLayout
                                        currentPage={currentPageHistory}
                                        totalPages={Math.ceil(totalHistory / pageSizeHistory)}
                                        onPageChange={setCurrentPageHistory}
                                    />
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default WasteHotspotMain;