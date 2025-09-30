// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { DataTable } from "@/components/ui/table/data-table"
// import { HistoryTable } from "@/components/ui/table/history-table"
// import { ColumnDef } from "@tanstack/react-table"
// import { Pen, History, Search, ArrowUpDown } from 'lucide-react'
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
// import { useState } from "react"
// import { Skeleton } from "@/components/ui/skeleton"
// import { useGetPurposeAndRateBusinessPermit, type PurposeAndRate } from "./queries/RatesFetchQueries"
// import RatesEditFormPage4 from "./edit-forms/rates-edit-form-4"
// import { formatTimestamp } from "@/helpers/timestampformatter"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
// import { Input } from "@/components/ui/input"
// import PaginationLayout from "@/components/ui/pagination/pagination-layout"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
// import React from "react"
// import RatesFormPage4 from "./forms/rates-form-page4"
// import { Button } from "@/components/ui/button/button"


// function RatesPage4() {
//     const [editingRowId, setEditingRowId] = useState<number | null>(null)
//     const [activeTab, setActiveTab] = useState("active")
//     const [isDialogOpen, setIsDialogOpen] = useState(false)

//     const [searchQueryActive, setSearchQueryActive] = useState("")
//     const [pageSizeActive, setPageSizeActive] = React.useState<number>(10)
//     const [currentPageActive, setCurrentPageActive] = useState(1)

//     const [searchQueryHistory, setSearchQueryHistory] = useState("")
//     const [pageSizeHistory, setPageSizeHistory] = React.useState<number>(10)
//     const [currentPageHistory, setCurrentPageHistory] = useState(1)

//     const { data: fetchedData = [], isLoading } = useGetPurposeAndRateBusinessPermit()
//     const formatNumber = (value: string) =>
//         `₱${Number(value).toLocaleString(undefined, {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         })}`

//     const filterAndPaginate = (rows: PurposeAndRate[], search: string, page: number, pageSize: number) => {
//         const filtered = rows.filter(row => {
//             const text = `${row.pr_purpose} ${row.pr_rate} ${formatTimestamp(row.pr_date)}`.toLowerCase()
//             return text.includes(search.toLowerCase())
//         })
//         const total = filtered.length
//         const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
//         return { filtered, paginated, total }
//     }

//     const permitData = fetchedData.filter(row => row.pr_category === "Business Permit")

//     const { filtered: _filteredActive, paginated: paginatedActive, total: totalActive } =
//         filterAndPaginate(permitData.filter(row => !row.pr_is_archive), searchQueryActive, currentPageActive, pageSizeActive)

//     const { filtered: _filteredHistory, paginated: paginatedHistory, total: totalHistory } =
//         filterAndPaginate(permitData, searchQueryHistory, currentPageHistory, pageSizeHistory)

//     const activeColumns: ColumnDef<PurposeAndRate>[] = [
//         { accessorKey: 'pr_purpose', header: "Purpose" },
//         {
//             accessorKey: 'pr_rate',
//             header: 'Amount',
//             cell: ({ row }) => formatNumber(row.original.pr_rate.toString())
//         },
//         {
//             accessorKey: "pr_date",
//             header: ({ column }) => (
//                 <div
//                     className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     Date Updated
//                     <ArrowUpDown size={14} />
//                 </div>
//             ),
//             cell: ({ row }) => (
//                 <div className="text-center">{formatTimestamp(row.getValue("pr_date"))} </div>            
//             )
//         },
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => {
//                 const prId = row.original.pr_id
//                 return (
//                     <div className="flex justify-center gap-2">
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <DialogLayout
//                                         trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Pen size={16} /></div>}
//                                         title="Edit Purpose And Rate"
//                                         description="Update purpose and rates to keep records accurate."
//                                         mainContent={<RatesEditFormPage4
//                                             pr_id={row.original.pr_id}
//                                             pr_purpose={row.original.pr_purpose}
//                                             pr_rate={row.original.pr_rate}
//                                             onSuccess={() => setEditingRowId(null)}
//                                         />}
//                                         isOpen={editingRowId === Number(prId)}
//                                         onOpenChange={(open) => setEditingRowId(open ? Number(prId) : null)}
//                                     />
//                                 </div>
//                             }
//                             content="Edit"
//                         />
                    
//                     </div>
//                 )
//             }
//         }
//     ]

//     const historyColumns: ColumnDef<PurposeAndRate>[] = [
//         { accessorKey: 'pr_purpose', header: "Purpose" },
//         {
//             accessorKey: 'pr_rate',
//             header: 'Amount',
//             cell: ({ row }) => formatNumber(row.original.pr_rate.toString())
//         },
//         {
//             accessorKey: "pr_is_archive",
//             header: "Status",
//             cell: ({ row }) => {
//                 const isArchived = row.original.pr_is_archive
//                 return (
//                     <div className="flex items-center justify-center gap-2">
//                         <span className={`inline-block h-3 w-3 rounded-full ${isArchived ? 'bg-red-500' : 'bg-green-500'}`} />
//                         <span>{isArchived ? 'Inactive' : 'Active'}</span>
//                     </div>
//                 )
//             }
//         },
//         {
//             accessorKey: "pr_date",
//             header: "Date Added/Updated",
//             cell: ({ row }) => formatTimestamp(row.original.pr_date)
//         },
//         {
//             accessorKey: "staff_name",
//             header: "Updated By"
//         }
//     ]

//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//                 <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//                 <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//                 <Skeleton className="h-10 w-full mb-4 opacity-30" />
//                 <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         )
//     }

//     return (
//         <div className='bg-snow w-full h-full'>
//             <div className='bg-white drop-shadow rounded-lg'>
//                 <div className='p-7 flex flex-col justify-end gap-7'>

//                     <Tabs value={activeTab} onValueChange={setActiveTab}>
//                         <TabsList className="grid w-full grid-cols-2 max-w-xs">
//                             <TabsTrigger value="active">Active Items</TabsTrigger>
//                             <TabsTrigger value="all">
//                                 <div className="flex items-center gap-2">
//                                     <History size={16} /> History
//                                 </div>
//                             </TabsTrigger>
//                         </TabsList>

//                         <TabsContent value="active">
//                             <div className="flex flex-col gap-4">
//                                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                                     <div className="relative w-full sm:w-64">
//                                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
//                                         <Input
//                                             placeholder="Search..."
//                                             className="pl-10 bg-white"
//                                             value={searchQueryActive}
//                                             onChange={(e) => {
//                                                 setSearchQueryActive(e.target.value)
//                                                 setCurrentPageActive(1)
//                                             }}
//                                         />
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-sm">Show</span>
//                                             <Select value={pageSizeActive.toString()} onValueChange={(value) => {
//                                                 setPageSizeActive(Number.parseInt(value))
//                                                 setCurrentPageActive(1)
//                                             }}>
//                                             <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
//                                             <SelectValue />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="5">5</SelectItem>
//                                                 <SelectItem value="10">10</SelectItem>
//                                                 <SelectItem value="25">25</SelectItem>
//                                                 <SelectItem value="50">50</SelectItem>
//                                                 <SelectItem value="100">100</SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         <span className="text-sm">entries</span>
//                                     </div>

//                                     {/* <DialogLayout
//                                         trigger={<Button>+ Add</Button>}
//                                         title='Add New Range and Fee for Business Permit'
//                                         description="Set a new annual gross sales range and its associated fee for business permits."
//                                         mainContent={
//                                             <RatesFormPage4
//                                                 onSuccess={() => setIsDialogOpen(false)}
//                                             />
//                                         }
//                                         isOpen={isDialogOpen}
//                                         onOpenChange={setIsDialogOpen}
//                                     /> */}
//                                 </div>

//                                 <DataTable columns={activeColumns} data={paginatedActive} />

//                                 <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
//                                     <p className="text-gray-600">
//                                         Showing {(currentPageActive - 1) * pageSizeActive + 1}-
//                                         {Math.min(currentPageActive * pageSizeActive, totalActive)} of {totalActive} rows
//                                     </p>
//                                     {totalActive > 0 && (
//                                         <PaginationLayout
//                                             currentPage={currentPageActive}
//                                             totalPages={Math.ceil(totalActive / pageSizeActive)}
//                                             onPageChange={setCurrentPageActive}
//                                         />
//                                     )}
//                                 </div>
//                             </div>
//                         </TabsContent>

//                         <TabsContent value="all">
//                             <div className="flex flex-col gap-4">
//                                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                                     <div className="relative w-full sm:w-64">
//                                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
//                                         <Input
//                                             placeholder="Search..."
//                                             className="pl-10 bg-white"
//                                             value={searchQueryHistory}
//                                             onChange={(e) => {
//                                                 setSearchQueryHistory(e.target.value)
//                                                 setCurrentPageHistory(1)
//                                             }}
//                                         />
//                                     </div>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-sm">Show</span>
//                                             <Select value={pageSizeHistory.toString()} onValueChange={(value) => {
//                                                 setPageSizeHistory(Number.parseInt(value))
//                                                 setCurrentPageHistory(1)
//                                             }}>
//                                             <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
//                                             <SelectValue />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="5">5</SelectItem>
//                                                 <SelectItem value="10">10</SelectItem>
//                                                 <SelectItem value="25">25</SelectItem>
//                                                 <SelectItem value="50">50</SelectItem>
//                                                 <SelectItem value="100">100</SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         <span className="text-sm">entries</span>
//                                     </div>
//                                 </div>

//                                 <HistoryTable columns={historyColumns} data={paginatedHistory} />

//                                 <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
//                                     <p className="text-gray-600">
//                                         Showing {(currentPageHistory - 1) * pageSizeHistory + 1}-
//                                         {Math.min(currentPageHistory * pageSizeHistory, totalHistory)} of {totalHistory} rows
//                                     </p>
//                                     {totalHistory > 0 && (
//                                         <PaginationLayout
//                                             currentPage={currentPageHistory}
//                                             totalPages={Math.ceil(totalHistory / pageSizeHistory)}
//                                             onPageChange={setCurrentPageHistory}
//                                         />
//                                     )}
//                                 </div>
//                             </div>
//                         </TabsContent>
//                     </Tabs>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default RatesPage4

import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { DataTable } from "@/components/ui/table/data-table"
import { HistoryTable } from "@/components/ui/table/history-table"
import { ColumnDef } from "@tanstack/react-table"
import { Pen, History, Search, ArrowUpDown, Archive } from 'lucide-react'
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetPurposeAndRateBusinessPermit, type PurposeAndRate } from "./queries/RatesFetchQueries"
import RatesEditFormPage4 from "./edit-forms/rates-edit-form-4"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { Spinner } from "@/components/ui/spinner"
import RatesFormPage4 from "./forms/rates-form-page4"
import { Button } from "@/components/ui/button/button"


function RatesPage4() {
    const { showLoading, hideLoading } = useLoading();
    const [editingRowId, setEditingRowId] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState("active")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Search + Pagination - Active Tab
    const [searchQueryActive, setSearchQueryActive] = useState("")
    const [pageSizeActive, setPageSizeActive] = useState(10)
    const [currentPageActive, setCurrentPageActive] = useState(1)
    const debouncedSearchQueryActive = useDebounce(searchQueryActive, 300)

    // Search + Pagination - History Tab
    const [searchQueryHistory, setSearchQueryHistory] = useState("")
    const [pageSizeHistory, setPageSizeHistory] = useState(10)
    const [currentPageHistory, setCurrentPageHistory] = useState(1)
    const debouncedSearchQueryHistory = useDebounce(searchQueryHistory, 300)

    // Fetch data for active tab
    const { 
        data: activeData = { results: [], count: 0 }, 
        isLoading: isLoadingActive 
    } = useGetPurposeAndRateBusinessPermit(
        currentPageActive, 
        pageSizeActive, 
        debouncedSearchQueryActive
    )

    // Fetch data for history tab
    const { 
        data: historyData = { results: [], count: 0 }, 
        isLoading: isLoadingHistory 
    } = useGetPurposeAndRateBusinessPermit(
        currentPageHistory, 
        pageSizeHistory, 
        debouncedSearchQueryHistory
    )

    const activePlans = activeData.results || []
    const activeTotalCount = activeData.count || 0
    const activeTotalPages = Math.ceil(activeTotalCount / pageSizeActive)

    const historyPlans = historyData.results || []
    const historyTotalCount = historyData.count || 0
    const historyTotalPages = Math.ceil(historyTotalCount / pageSizeHistory)

    // Loading management
    useEffect(() => {
        if (isLoadingActive || isLoadingHistory) {
            showLoading()
        } else {
            hideLoading()
        }
    }, [isLoadingActive, isLoadingHistory, showLoading, hideLoading])

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPageActive(1)
    }, [debouncedSearchQueryActive, pageSizeActive])

    useEffect(() => {
        setCurrentPageHistory(1)
    }, [debouncedSearchQueryHistory, pageSizeHistory])

    const formatNumber = (value: string) =>
        `₱${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`

    const activeColumns: ColumnDef<PurposeAndRate>[] = [
        { accessorKey: 'pr_purpose', header: "Purpose" },
        {
            accessorKey: 'pr_rate',
            header: 'Amount',
            cell: ({ row }) => formatNumber(row.original.pr_rate.toString())
        },
        {
            accessorKey: "pr_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Updated
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">{formatTimestamp(row.getValue("pr_date"))} </div>            
            )
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const prId = row.original.pr_id
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <div>
                                    <DialogLayout
                                        trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Pen size={16} /></div>}
                                        title="Edit Purpose And Rate"
                                        description="Update purpose and rates to keep records accurate."
                                        mainContent={<RatesEditFormPage4
                                            pr_id={row.original.pr_id}
                                            pr_purpose={row.original.pr_purpose}
                                            pr_rate={row.original.pr_rate}
                                            onSuccess={() => setEditingRowId(null)}
                                        />}
                                        isOpen={editingRowId === Number(prId)}
                                        onOpenChange={(open) => setEditingRowId(open ? Number(prId) : null)}
                                    />
                                </div>
                            }
                            content="Edit"
                        />
                    
                    </div>
                )
            }
        }
    ]

    const historyColumns: ColumnDef<PurposeAndRate>[] = [
        { accessorKey: 'pr_purpose', header: "Purpose" },
        {
            accessorKey: 'pr_rate',
            header: 'Amount',
            cell: ({ row }) => formatNumber(row.original.pr_rate.toString())
        },
        {
            accessorKey: "pr_is_archive",
            header: "Status",
            cell: ({ row }) => {
                const isArchived = row.original.pr_is_archive
                return (
                    <div className="flex items-center justify-center gap-2">
                        <span className={`inline-block h-3 w-3 rounded-full ${isArchived ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span>{isArchived ? 'Inactive' : 'Active'}</span>
                    </div>
                )
            }
        },
        {
            accessorKey: "pr_date",
            header: "Date Added/Updated",
            cell: ({ row }) => formatTimestamp(row.original.pr_date)
        },
        {
            accessorKey: "staff_name",
            header: "Updated By"
        }
    ]

    // Loading state
    if (isLoadingActive && activeTab === "active") {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
                <span className="ml-2 text-gray-600">Loading active business permits...</span>
            </div>
        )
    }

    if (isLoadingHistory && activeTab === "all") {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
                <span className="ml-2 text-gray-600">Loading history...</span>
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

                        {/* ACTIVE TAB */}
                        <TabsContent value="active">
                            <div className="flex flex-col gap-4">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    {/* Search Bar */}
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                        <Input
                                            placeholder="Search active business permits..."
                                            className="pl-10 bg-white"
                                            value={searchQueryActive}
                                            onChange={(e) => setSearchQueryActive(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Show Entries */}
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

                                        {/* Add Button */}
                                        <DialogLayout
                                            trigger={<Button>+ Add</Button>}
                                            title='Add New Range and Fee for Business Permit'
                                            description="Set a new annual gross sales range and its associated fee for business permits."
                                            mainContent={
                                                <RatesFormPage4
                                                    onSuccess={() => setIsDialogOpen(false)}
                                                />
                                            }
                                            isOpen={isDialogOpen}
                                            onOpenChange={setIsDialogOpen}
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                {activePlans.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {searchQueryActive ? "No active business permits found" : "No active business permits yet"}
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            {searchQueryActive
                                                ? `No active business permits match "${searchQueryActive}". Try adjusting your search.`
                                                : "Active business permits will appear here once created."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Table */}
                                        <DataTable columns={activeColumns} data={activePlans} />

                                        {/* Pagination */}
                                        {activePlans.length > 0 && (
                                            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
                                                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                                                    Showing{" "}
                                                    <span className="font-medium">
                                                        {activeTotalCount > 0 ? (currentPageActive - 1) * pageSizeActive + 1 : 0}
                                                    </span>{" "}
                                                    -{" "}
                                                    <span className="font-medium">
                                                        {Math.min(currentPageActive * pageSizeActive, activeTotalCount)}
                                                    </span>{" "}
                                                    of <span className="font-medium">{activeTotalCount}</span> active business permits
                                                </p>

                                                {activeTotalPages > 0 && (
                                                    <PaginationLayout
                                                        currentPage={currentPageActive}
                                                        totalPages={activeTotalPages}
                                                        onPageChange={setCurrentPageActive}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        {/* HISTORY TAB */}
                        <TabsContent value="all">
                            <div className="flex flex-col gap-4">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    {/* Search Bar */}
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                                        <Input
                                            placeholder="Search history..."
                                            className="pl-10 bg-white"
                                            value={searchQueryHistory}
                                            onChange={(e) => setSearchQueryHistory(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Show Entries */}
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
                                        {/* Table */}
                                        <HistoryTable columns={historyColumns} data={historyPlans} />

                                        {/* Pagination */}
                                        {historyPlans.length > 0 && (
                                            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
                                                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                                                    Showing{" "}
                                                    <span className="font-medium">
                                                        {historyTotalCount > 0 ? (currentPageHistory - 1) * pageSizeHistory + 1 : 0}
                                                    </span>{" "}
                                                    -{" "}
                                                    <span className="font-medium">
                                                        {Math.min(currentPageHistory * pageSizeHistory, historyTotalCount)}
                                                    </span>{" "}
                                                    of <span className="font-medium">{historyTotalCount}</span> history records
                                                </p>

                                                {historyTotalPages > 0 && (
                                                    <PaginationLayout
                                                        currentPage={currentPageHistory}
                                                        totalPages={historyTotalPages}
                                                        onPageChange={setCurrentPageHistory}
                                                    />
                                                )}
                                            </div>
                                        )}
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

export default RatesPage4
