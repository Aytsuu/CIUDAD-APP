import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { DataTable } from "@/components/ui/table/data-table"
import { HistoryTable } from "@/components/ui/table/history-table"
import { ColumnDef } from "@tanstack/react-table"
import { Pen, History, Search, ArrowUpDown } from 'lucide-react'
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetPurposeAndRate, type PurposeAndRate } from "./queries/RatesFetchQueries"
import RatesEditFormPage4 from "./edit-forms/rates-edit-form-4"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import React from "react"

function RatesPage4() {
    const [editingRowId, setEditingRowId] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState("active")

    const [searchQueryActive, setSearchQueryActive] = useState("")
    const [pageSizeActive, setPageSizeActive] = React.useState<number>(10)
    const [currentPageActive, setCurrentPageActive] = useState(1)

    const [searchQueryHistory, setSearchQueryHistory] = useState("")
    const [pageSizeHistory, setPageSizeHistory] = React.useState<number>(10)
    const [currentPageHistory, setCurrentPageHistory] = useState(1)

    const { data: fetchedData = [], isLoading } = useGetPurposeAndRate()
    const formatNumber = (value: string) =>
        `₱${Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`

    const filterAndPaginate = (rows: PurposeAndRate[], search: string, page: number, pageSize: number) => {
        const filtered = rows.filter(row => {
            const text = `${row.pr_purpose} ${row.pr_rate} ${formatTimestamp(row.pr_date)}`.toLowerCase()
            return text.includes(search.toLowerCase())
        })
        const total = filtered.length
        const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
        return { filtered, paginated, total }
    }

    const permitData = fetchedData.filter(row => row.pr_category === "Permit Clearance")

    const { filtered: _filteredActive, paginated: paginatedActive, total: totalActive } =
        filterAndPaginate(permitData.filter(row => !row.pr_is_archive), searchQueryActive, currentPageActive, pageSizeActive)

    const { filtered: _filteredHistory, paginated: paginatedHistory, total: totalHistory } =
        filterAndPaginate(permitData, searchQueryHistory, currentPageHistory, pageSizeHistory)

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
        }
    ]

    if (isLoading) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
                <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
                <Skeleton className="h-10 w-full mb-4 opacity-30" />
                <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
            </div>
        )
    }

    return (
        <div className='bg-snow w-full h-full'>
            <div className='bg-white drop-shadow rounded-lg'>
                <div className='p-7 flex flex-col justify-end gap-7'>
                    <div className="flex flex-row items-center">
                        <h2 className='font-bold w-3/4'>BARANGAY CLEARANCE FOR PERMITS:</h2>
                    
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Items</TabsTrigger>
                            <TabsTrigger value="all">
                                <div className="flex items-center gap-2">
                                    <History size={16} /> History
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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

                                <DataTable columns={activeColumns} data={paginatedActive} />

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
                            <div className="flex flex-col gap-4">
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

                                <HistoryTable columns={historyColumns} data={paginatedHistory} />

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
        </div>
    )
}

export default RatesPage4
