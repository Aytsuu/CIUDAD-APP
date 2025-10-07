import { useState, useEffect } from "react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { CheckCircle, XCircle, Search, ArrowUpDown, ChevronRight } from "lucide-react"
import AcceptPickupRequest from "../assignment-form"
import RejectPickupForm from "../reject-request-form"
import { useGetGarbagePendingRequest, type GarbageRequestPending } from "../queries/GarbageRequestFetchQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import ViewGarbageRequestDetails from "./view-details"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { Spinner } from "@/components/ui/spinner"

export default function PendingCards() {
  const { showLoading, hideLoading } = useLoading();
  const [viewDetailsRowId, setViewDetailsRowId] = useState<string | null>(null)
  const [acceptedRowId, setAcceptedRowId] = useState<string | null>(null)
  const [rejectedRowId, setRejectedRowId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSitio, setSelectedSitio] = useState("0")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: pendingReqData = { results: [], count: 0 },  isLoading: isLoadingPending } = useGetGarbagePendingRequest(  currentPage,  pageSize,  debouncedSearchQuery, selectedSitio)

  const pendingRequests = pendingReqData.results || []
  const totalItems = pendingReqData.count || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  // ----------------- LOADING MGMT --------------------
  useEffect(() => {
    if (isLoadingPending) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoadingPending, showLoading, hideLoading])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedSitio, pageSize])

  // Get sitio options from the fetched data
  const sitioOptions = [
    { id: "0", name: "All Sitios" },
    ...Array.from(new Set(pendingRequests.map((item: GarbageRequestPending) => item.sitio_name)))
      .filter(Boolean)
      .map((name) => ({ id: name as string, name: name as string }))
  ]

  // Function to handle successful accept/reject and close both dialogs
  const handleActionSuccess = () => {
    setAcceptedRowId(null)
    setRejectedRowId(null)
    setViewDetailsRowId(null) // Close the parent dialog
  }

  const columns: ColumnDef<GarbageRequestPending>[] = [
    {
      accessorKey: "garb_id",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Request No.
          <ArrowUpDown size={14} />
        </div>
      ),
      cell: ({ row }) => (
        <div>
          <div className="bg-blue-100 border-2 border-blue-300 px-3 py-2 rounded-lg inline-block shadow-sm">
            <p className="text-sm font-mono font-bold text-blue-800 tracking-wider uppercase">
              {row.original.garb_id}
            </p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "garb_created_at",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Requested
          <ArrowUpDown size={14} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{formatTimestamp(row.getValue("garb_created_at"))}</div>
      )
    },
    {
      accessorKey: "garb_requester",
      header: "Requester",
    },
    {
      accessorKey: "sitio_name",
      header: "Sitio"
    },
    {
      accessorKey: "garb_waste_type",
      header: "Waste Type"
    },
    {
      accessorKey: "",
      header: "   ",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <DialogLayout
                className="w-[90vw] h-[80vh] max-w-[900px] max-h-[1000px]"
                trigger={
                  <Button className="flex items-center gap-2 text-primary bg-white shadow-none hover:bg-white group">
                    <span className="text-sm font-medium group-hover:text-primary">View</span>
                    <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ChevronRight className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
                    </div>
                  </Button>
                }
                title={`Garbage Pickup Request No. ${row.original.garb_id}`}
                description="Full details of the request filed."
                mainContent={
                  <div className="flex flex-col h-full overflow-y-hidden">
                    <div className="overflow-y-auto flex-1 pr-2 max-h-[calc(90vh-100px)]">
                      <ViewGarbageRequestDetails
                        garb_requester={row.original.garb_requester}
                        garb_location={row.original.garb_location}
                        garb_created_at={row.original.garb_created_at}
                        garb_pref_date={row.original.garb_pref_date}
                        garb_pref_time={row.original.garb_pref_time}
                        garb_additional_notes={row.original.garb_additional_notes}
                        file_url={row.original.file_url}
                        sitio_name={row.original.sitio_name}
                        garb_waste_type={row.original.garb_waste_type}
                      />
                    </div>

                    <div className="flex flex-cols-2 gap-4 justify-end mt-3">
                      <TooltipLayout
                        trigger={
                          <div>
                            <DialogLayout
                              trigger={
                                <div className="bg-green-600 flex p-3 items-center gap-2 justify-center hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors">
                                  <CheckCircle size={20} /> Accept 
                                </div>
                              }
                              title="Schedule & Assign for Pickup"
                              description="Set date, time, team and vehicle for garbage pickup."
                              mainContent={
                                <AcceptPickupRequest
                                  garb_id={row.original.garb_id}
                                  pref_date={row.original.garb_pref_date}
                                  pref_time={row.original.garb_pref_time}
                                  onSuccess={handleActionSuccess}
                                />
                              }
                              isOpen={acceptedRowId === row.original.garb_id}
                              onOpenChange={(open) => setAcceptedRowId(open ? row.original.garb_id : null)}
                            />
                          </div>
                        }
                        content="Accept"
                      />

                      <TooltipLayout
                        trigger={
                          <div>
                            <DialogLayout
                              trigger={
                                <div className="bg-red-600 hover:bg-red-700 p-3 flex items-center gap-2 justify-center text-white rounded-lg cursor-pointer transition-colors">
                                  <XCircle size={20} /> Reject
                                </div>
                              }
                              title="Confirm Rejection"
                              description="Reject the selected garbage pickup request. A reason is required before confirming this action."
                              mainContent={
                                <RejectPickupForm
                                  garb_id={row.original.garb_id}
                                  onSuccess={handleActionSuccess}
                                />
                              }
                              isOpen={rejectedRowId === row.original.garb_id}
                              onOpenChange={(open) => setRejectedRowId(open ? row.original.garb_id : null)}
                            />
                          </div>
                        }
                        content="Reject"
                      />
                  </div>
                </div>
              }
              isOpen={viewDetailsRowId === row.original.garb_id}
              onOpenChange={(open) => setViewDetailsRowId(open ? row.original.garb_id : null)}
            />
          </div>  
        );
      },
    }
  ];

  if (isLoadingPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
        <span className="ml-2 text-gray-600">Loading pending requests...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Count, Search, and Filters */}
      <div className="flex flex-col gap-4 p-6">
        {/* Title and Count */}
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-800">Pending Requests ({totalItems})</h2>
        </div>  

        {/* Filters Row - Modified layout */}
        <div className="flex flex-col md:flex-row justify-between gap-4 w-full">
          {/* Left Group - Search and Sitio Filter */}
          <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-3xl">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[500px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <Input
                placeholder="Search..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sitio Filter */}
            <div className="w-full md:w-[250px]">
              <SelectLayout
                className="w-full bg-white"
                placeholder="Filter by Sitio"
                options={sitioOptions}
                value={selectedSitio}
                label=""
                onChange={(value) => setSelectedSitio(value)}
              />
            </div>
          </div>

          {/* Right Group - Page Size Control */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-sm whitespace-nowrap">Show</span>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                setPageSize(Number.parseInt(value))
                setCurrentPage(1)
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
            <span className="text-sm whitespace-nowrap">entries</span>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="p-6 pt-0">
        {totalItems === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pending requests found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <DataTable columns={columns} data={pendingRequests}/>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4 mt-6">
              <p className="text-gray-600">
                Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
              </p>
              {totalItems > 0 && (
                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}