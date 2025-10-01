import { Button } from "@/components/ui/button/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage1 from "./forms/rates-form-page1"
import { DataTable } from "@/components/ui/table/data-table"
import { HistoryTable } from "@/components/ui/table/history-table"
import { ColumnDef } from "@tanstack/react-table"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Pen, Trash, History, Search, ArrowUpDown, Archive } from 'lucide-react'
import { useState, useEffect } from "react"
import { useGetAnnualGrossSalesActive, useGetAllAnnualGrossSales, type AnnualGrossSales } from "./queries/RatesFetchQueries"
import { useDeleteAnnualGrossSales } from "./queries/RatesDeleteQueries"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import RatesEditFormPage1 from "./edit-forms/rates-edit-form-1"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { Spinner } from "@/components/ui/spinner"

function RatesPage1() {
    const { showLoading, hideLoading } = useLoading();
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRowId, setEditingRowId] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState("active")

    // Search + Pagination for Active Tab
    const [searchQueryActive, setSearchQueryActive] = useState("")
    const [pageSizeActive, setPageSizeActive] = useState(10)
    const [currentPageActive, setCurrentPageActive] = useState(1)
    const debouncedSearchQueryActive = useDebounce(searchQueryActive, 300)

    // Search + Pagination for History Tab
    const [searchQueryHistory, setSearchQueryHistory] = useState("")
    const [pageSizeHistory, setPageSizeHistory] = useState(10)
    const [currentPageHistory, setCurrentPageHistory] = useState(1)
    const debouncedSearchQueryHistory = useDebounce(searchQueryHistory, 300)

    // Fetch data for active tab
    const { 
        data: activeData = { results: [], count: 0 }, 
        isLoading: isLoadingActive 
    } = useGetAnnualGrossSalesActive(
        currentPageActive, 
        pageSizeActive, 
        debouncedSearchQueryActive
    )

    // Fetch data for history tab
    const { 
        data: historyData = { results: [], count: 0 }, 
        isLoading: isLoadingHistory 
    } = useGetAllAnnualGrossSales(
        currentPageHistory, 
        pageSizeHistory, 
        debouncedSearchQueryHistory
    )

    const { mutate: deleteAnnualGrossSales } = useDeleteAnnualGrossSales()

    const handleDelete = (agsId: number) => deleteAnnualGrossSales(agsId)

    const activePlans = activeData.results || []
    const activeTotalCount = activeData.count || 0

    const historyPlans = historyData.results || []
    const historyTotalCount = historyData.count || 0

    // Loading management
    useEffect(() => {
        if ((activeTab === "active" && isLoadingActive) || (activeTab === "all" && isLoadingHistory)) {
            showLoading()
        } else {
            hideLoading()
        }
    }, [isLoadingActive, isLoadingHistory, activeTab, showLoading, hideLoading])

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPageActive(1)
    }, [debouncedSearchQueryActive, pageSizeActive])

    useEffect(() => {
        setCurrentPageHistory(1)
    }, [debouncedSearchQueryHistory, pageSizeHistory])

    const formatNumber = (value: string) => `₱${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`

    const getLastMaxRange = () => {
        if (activePlans.length === 0) return "0"
        const sorted = [...activePlans].sort((a, b) => b.ags_maximum - a.ags_maximum)
        return sorted[0].ags_maximum
    }

    const lastMaxRange = getLastMaxRange()

    const sharedColumns: ColumnDef<AnnualGrossSales>[] = [
        {
            accessorKey: "rangeOfGrossSales",
            header: "Range of Annual Gross Sales",
            cell: ({ row }) => {
                const min = row.original.ags_minimum
                const max = row.original.ags_maximum
                return `${formatNumber(min.toString())} - ${formatNumber(max.toString())}`
            }
        },
        {
            accessorKey: "ags_rate",
            header: "Amount",
            cell: ({ row }) => formatNumber(row.original.ags_rate.toString())
        },
        {
            accessorKey: "ags_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Created
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{formatTimestamp(row.getValue("ags_date"))} </div>            
            )
        }
    ]

    const activeColumns: ColumnDef<AnnualGrossSales>[] = [
        ...sharedColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const agsId = row.original.ags_id
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <div>
                                    <DialogLayout
                                        trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Pen size={16} /></div>}
                                        title="Edit Annual Gross Sales"
                                        description="Update annual gross sales to keep records accurate."
                                        mainContent={
                                            <RatesEditFormPage1
                                                ags_id={agsId}
                                                ags_maximum={row.original.ags_maximum}
                                                ags_minimum={row.original.ags_minimum}
                                                ags_rate={row.original.ags_rate}
                                                onSuccess={() => setEditingRowId(null)}
                                            />
                                        }
                                        isOpen={editingRowId === Number(agsId)}
                                        onOpenChange={(open) => setEditingRowId(open ? Number(agsId) : null)}
                                    />
                                </div>
                            }
                            content="Edit"
                        />

                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer" > <Trash size={16} /></div>}
                                        title="Confirm Delete"
                                        description="Are you sure you want to delete this record?"
                                        actionLabel="Confirm"
                                        onClick={() => handleDelete(Number(agsId))}
                                    />
                                </div>
                              }
                            content="Delete"
                        />
                    </div>
                )
            }
        }
    ]

    const historyColumns: ColumnDef<AnnualGrossSales>[] = [
        ...sharedColumns,
        {
            accessorKey: "ags_is_archive",
            header: "Status",
            cell: ({ row }) => {
                const archived = row.original.ags_is_archive
                return (
                    <div className="flex items-center justify-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${archived ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span>{archived ? 'Inactive' : 'Active'}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "staff_name",
            header: "Created By"
        }
    ]

    // Loading state for initial load
    if ((activeTab === "active" && isLoadingActive && activePlans.length === 0) || 
        (activeTab === "all" && isLoadingHistory && historyPlans.length === 0)) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
                <span className="ml-2 text-gray-600">
                    {activeTab === "active" ? "Loading active annual gross sales..." : "Loading history..."}
                </span>
            </div>
        )
    }

    return (
        <div className='bg-snow w-full h-full'>
            <div className='bg-white drop-shadow rounded-lg'>
                <div className='p-7 flex flex-col justify-end gap-7'>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Items</TabsTrigger>
                            <TabsTrigger value="all">
                                <div className="flex items-center gap-2">
                                    <History size={16} /> History
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        {/* ACTIVE TAB - Keeping exact same layout as before */}
                        <TabsContent value="active">
                            <div className="flex flex-col gap-4">
                                {/* Search & Size - Same layout as before */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                            <Input
                                                placeholder="Search..."
                                                className="pl-10 bg-white"
                                                value={searchQueryActive}
                                                onChange={(e) => {
                                                    setSearchQueryActive(e.target.value)
                                                    setCurrentPageActive(1)
                                                }}
                                            />
                                        </div>
                                        <DialogLayout
                                            trigger={<Button>+ Add</Button>}
                                            title='Add New Range and Fee for Business Permit'
                                            description="Set a new annual gross sales range and its associated fee for business permits."
                                            mainContent={
                                                <RatesFormPage1
                                                    lastMaxRange={lastMaxRange}
                                                    onSuccess={() => setIsDialogOpen(false)}
                                                />
                                            }
                                            isOpen={isDialogOpen}
                                            onOpenChange={setIsDialogOpen}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Show</span>
                                        <Select value={pageSizeActive.toString()} onValueChange={(value) => {
                                            setPageSizeActive(Number.parseInt(value))
                                            setCurrentPageActive(1)
                                        }}>
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
                                </div>

                                {/* Content */}
                                {activePlans.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchQueryActive ? "No active annual gross sales found" : "No active annual gross sales yet"}
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            {searchQueryActive
                                                ? `No active annual gross sales match "${searchQueryActive}". Try adjusting your search.`
                                                : "Active annual gross sales will appear here once created."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <DataTable columns={activeColumns} data={activePlans} />

                                        <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
                                            <p className="text-gray-600">
                                                Showing {(currentPageActive - 1) * pageSizeActive + 1}-
                                                {Math.min(currentPageActive * pageSizeActive, activeTotalCount)} of {activeTotalCount} rows
                                            </p>
                                            {activeTotalCount > 0 && (
                                                <PaginationLayout
                                                    currentPage={currentPageActive}
                                                    totalPages={Math.ceil(activeTotalCount / pageSizeActive)}
                                                    onPageChange={setCurrentPageActive}
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        {/* HISTORY TAB - Keeping exact same layout as before */}
                        <TabsContent value="all">
                            <div className="flex flex-col gap-4">
                                {/* Search & Size - Same layout as before */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                        <Input
                                            placeholder="Search..."
                                            className="pl-10 bg-white"
                                            value={searchQueryHistory}
                                            onChange={(e) => {
                                                setSearchQueryHistory(e.target.value)
                                                setCurrentPageHistory(1)
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Show</span>
                                        <Select value={pageSizeHistory.toString()} onValueChange={(value) => {
                                            setPageSizeHistory(Number.parseInt(value))
                                            setCurrentPageHistory(1)
                                        }}>
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
                                </div>

                                {/* Content */}
                                {historyPlans.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchQueryHistory ? "No history found" : "No history yet"}
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            {searchQueryHistory
                                                ? `No history matches "${searchQueryHistory}". Try adjusting your search.`
                                                : "History will appear here once records are created."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <HistoryTable columns={historyColumns} data={historyPlans} />

                                        <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
                                            <p className="text-gray-600">
                                                Showing {(currentPageHistory - 1) * pageSizeHistory + 1}-
                                                {Math.min(currentPageHistory * pageSizeHistory, historyTotalCount)} of {historyTotalCount} rows
                                            </p>
                                            {historyTotalCount > 0 && (
                                                <PaginationLayout
                                                    currentPage={currentPageHistory}
                                                    totalPages={Math.ceil(historyTotalCount / pageSizeHistory)}
                                                    onPageChange={setCurrentPageHistory}
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default RatesPage1