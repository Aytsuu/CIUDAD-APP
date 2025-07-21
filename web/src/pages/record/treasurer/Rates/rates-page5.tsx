import { Button } from "@/components/ui/button/button"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import RatesFormPage5 from "./forms/rates-form-page5"
import { DataTable } from "@/components/ui/table/data-table"
import { HistoryTable } from "@/components/ui/table/history-table"
import { ColumnDef } from "@tanstack/react-table"
import { Pen, Trash, History, Search } from 'lucide-react'
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetPurposeAndRate, type PurposeAndRate } from "./queries/RatesFetchQueries"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useDeletePurposeAndRate } from "./queries/RatesDeleteQueries"
import RatesEditFormPage5 from "./edit-forms/rates-edit-form-5"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"

function RatesPage5({ onPrevious4 }: { onPrevious4: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRowId, setEditingRowId] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState("active")

    const [searchQueryActive, setSearchQueryActive] = useState("")
    const [pageSizeActive, setPageSizeActive] = useState(10)
    const [currentPageActive, setCurrentPageActive] = useState(1)

    const [searchQueryHistory, setSearchQueryHistory] = useState("")
    const [pageSizeHistory, setPageSizeHistory] = useState(10)
    const [currentPageHistory, setCurrentPageHistory] = useState(1)

    const { data: fetchedData = [], isLoading } = useGetPurposeAndRate()
    const { mutate: deleteBarangayService } = useDeletePurposeAndRate()

    const handleDelete = (prId: number) => deleteBarangayService(prId)

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

    const barangayData = fetchedData.filter(row => row.pr_category === "Barangay Service")

    const { filtered: filteredActive, paginated: paginatedActive, total: totalActive } =
        filterAndPaginate(barangayData.filter(row => !row.pr_is_archive), searchQueryActive, currentPageActive, pageSizeActive)

    const { filtered: filteredHistory, paginated: paginatedHistory, total: totalHistory } =
        filterAndPaginate(barangayData, searchQueryHistory, currentPageHistory, pageSizeHistory)

    const activeColumns: ColumnDef<PurposeAndRate>[] = [
        { accessorKey: 'pr_purpose', header: "Purpose" },
        {
            accessorKey: 'pr_rate',
            header: 'Amount',
            cell: ({ row }) => formatNumber(row.original.pr_rate.toString())
        },
        {
            accessorKey: "pr_date",
            header: "Date Added/Updated",
            cell: ({ row }) => formatTimestamp(row.original.pr_date)
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const prId = row.original.pr_id
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={<DialogLayout
                                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Pen size={16} /></div>}
                                title="Edit Purpose And Rate"
                                description="Update purpose and rates to keep records accurate."
                                mainContent={<RatesEditFormPage5
                                    pr_id={row.original.pr_id}
                                    pr_purpose={row.original.pr_purpose}
                                    pr_rate={row.original.pr_rate}
                                    onSuccess={() => setEditingRowId(null)}
                                />}
                                isOpen={editingRowId === Number(prId)}
                                onOpenChange={(open) => setEditingRowId(open ? Number(prId) : null)}
                            />}
                            content="Edit"
                        />
                        <ConfirmationModal
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16} /></div>}
                            title="Confirm Delete"
                            description="Are you sure you want to delete this record?"
                            actionLabel="Confirm"
                            onClick={() => handleDelete(Number(prId))}
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
            <div className='bg-white p-4 drop-shadow rounded-lg'>
                <div className='p-7 flex flex-col justify-end gap-7'>
                    <div className="flex flex-row items-center">
                        <h2 className='font-bold w-3/4'>BARANGAY FEES AND CHARGES:</h2>
                        <div className='flex justify-end w-[32rem]'>
                            <DialogLayout
                                trigger={<Button>+ Add</Button>}
                                title='Add New Purpose and Fee for Barangay Fees and Charges'
                                description="Define a new purpose and its corresponding fee for barangay fees and charges."
                                mainContent={<RatesFormPage5 onSuccess={() => setIsDialogOpen(false)} />}
                                isOpen={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            />
                        </div>
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
                                        <Input
                                            type="number"
                                            className="w-14 h-8"
                                            min="1"
                                            value={pageSizeActive}
                                            onChange={(e) => {
                                                const value = +e.target.value
                                                setPageSizeActive(value >= 1 ? value : 1)
                                                setCurrentPageActive(1)
                                            }}
                                        />
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
                                        <Input
                                            type="number"
                                            className="w-14 h-8"
                                            min="1"
                                            value={pageSizeHistory}
                                            onChange={(e) => {
                                                const value = +e.target.value
                                                setPageSizeHistory(value >= 1 ? value : 1)
                                                setCurrentPageHistory(1)
                                            }}
                                        />
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

            <div className="flex justify-start mt-5">
                <Button type="button" onClick={onPrevious4} className="w-[100px]">
                    Previous
                </Button>
            </div>
        </div>
    )
}

export default RatesPage5
