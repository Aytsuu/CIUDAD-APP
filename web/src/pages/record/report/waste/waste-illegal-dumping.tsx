import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button"
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import WasteIllegalDumpingDetails from "./waste-illegal-dumping-view-details";
import { useWasteReport, type WasteReport } from "./queries/waste-ReportGetQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";


function WasteIllegalDumping() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedFilterId, setSelectedFilterId] = useState("0");
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [resolvedCurrentPage, setResolvedCurrentPage] = useState(1);
  const [cancelledCurrentPage, setCancelledCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { showLoading, hideLoading } = useLoading();

  // Get current page based on active tab
  const currentPage = 
    activeTab === "pending" ? pendingCurrentPage :
    activeTab === "resolved" ? resolvedCurrentPage :
    cancelledCurrentPage;

  // Map tab to status value for backend
  const getStatusParam = (tab: string) => {
    if (tab === "pending") return "pending";
    if (tab === "resolved") return "resolved";
    if (tab === "cancelled") return "cancelled";
    return "";
  };

  // Fetch data with backend filtering and pagination
  const { data: wasteReportData = { results: [], count: 0 }, isLoading } = useWasteReport(
    currentPage,
    pageSize,
    debouncedSearchQuery, 
    selectedFilterId,
    getStatusParam(activeTab)
  );

  // Extract data from paginated response
  const fetchedData = wasteReportData.results || [];
  const totalCount = wasteReportData.count || 0;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Calculate total pages for current tab
  const pendingTotalPages = activeTab === "pending" ? Math.ceil(totalCount / pageSize) : 0;
  const resolvedTotalPages = activeTab === "resolved" ? Math.ceil(totalCount / pageSize) : 0;
  const cancelledTotalPages = activeTab === "cancelled" ? Math.ceil(totalCount / pageSize) : 0;

  const filterOptions = [
    { id: "0", name: "All Report Matter" },
    { id: "Littering, Illegal dumping, Illegal disposal of garbage", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
    { id: "Urinating, defecating, spitting in a public place", name: "Urinating, defecating, spitting in a public place" },
    { id: "Dirty frontage and immediate surroundings for establishment owners", name: "Dirty frontage and immediate surroundings for establishment owners" },
    { id: "Improper and untimely stacking of garbage outside residences or establishmen", name: "Improper and untimely stacking of garbage outside residences or establishment" },
    { id: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
    { id: "Dirty public utility vehicles, or no trash can or receptacle", name: "Dirty public utility vehicles, or no trash can or receptacle" },
    { id: "Spilling, scattering, littering of wastes by public utility vehicles", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
    { id: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset all pages to 1
    setPendingCurrentPage(1);
    setResolvedCurrentPage(1);
    setCancelledCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
    // Reset all pages to 1
    setPendingCurrentPage(1);
    setResolvedCurrentPage(1);
    setCancelledCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const columns: ColumnDef<WasteReport>[] = [
    {
      accessorKey: "rep_id",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Report No.
          <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="bg-blue-100 px-3 py-1 rounded-sm inline-block shadow-sm">
            <p className="text-primary text-xs font-bold tracking-wider uppercase">
                {row.getValue("rep_id")}
            </p>
        </div>             
      ),
    },
    // {
    //   accessorKey: "rep_status",
    //   header: "Report Status",
    //   cell: ({row}) => (
    //     <div className="flex justify-center">
    //       {row.getValue("rep_status") === "resolved" ? (
    //         <div className="flex-row items-center bg-green-50 px-2 py-1 rounded-full border border-green-600">
    //           <div className="text-green-600 text-sm font-medium ml-1">Resolved</div>
    //         </div>
    //       ) : row.getValue("rep_status") === "cancelled" ? (
    //         <div className="flex-row items-center bg-red-50 px-2 py-1 rounded-full border border-red-600">
    //           <div className="text-red-600 text-sm font-medium ml-1">Cancelled</div>
    //         </div>
    //       ) : (
    //         <div className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full border border-primary">
    //           <div className="text-primary text-sm font-medium">In progress</div>
    //         </div>
    //       )}               
    //     </div>
    //   )
    // },
    {
      accessorKey: "rep_matter",
      header: "Report Matter",
    },
    {
      accessorKey: "sitio_name",
      header: "Sitio",
    },    
    {
      accessorKey: "rep_location",
      header: "Location",
    },
    {
      accessorKey: "rep_violator",
      header: "Violator",
    },
    {
      accessorKey: "rep_complainant",
      header: "Complainant",
      cell: ({ row }) => {
        const isAnonymous = row.original.rep_anonymous;
        return <div>{isAnonymous ? "Anonymous" : row.original.rep_complainant}</div>;
      },
    },
    {
      accessorKey: "rep_contact",
      header: "Contact No.",
    },
    {
      accessorKey: "rep_image",
      header: "Details",
      cell: ({row}) => (
        <TooltipLayout
          trigger={
            <DialogLayout
              trigger={
                <div className="flex justify-center">
                  <Button className="flex items-center text-primary bg-white shadow-none hover:bg-white group">
                    <span className="text-sm font-medium group-hover:text-primary">View</span>
                    <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ChevronRight className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
                    </div>
                  </Button>
                </div>
              }
              className="max-w-[60%] max-h-[80%] overflow-auto p-7 verflow-y-auto"
              title={`Report No. ${String(row.getValue("rep_id"))}`}
              description=""
              mainContent={
                <div className="flex flex-col">
                  <WasteIllegalDumpingDetails
                    rep_id={row.original.rep_id}
                    rep_matter={row.original.rep_matter}
                    rep_location={row.original.rep_location}
                    rep_add_details={row.original.rep_add_details}
                    rep_complainant={row.original.rep_complainant}
                    rep_violator={row.original.rep_violator}
                    rep_contact={row.original.rep_contact}
                    rep_status={row.original.rep_status}
                    rep_date={row.original.rep_date}
                    rep_date_resolved={row.original.rep_date_resolved}   
                    rep_date_cancelled={row.original.rep_date_cancelled}
                    sitio_id={row.original.sitio_id}
                    sitio_name={row.original.sitio_name}
                    waste_report_file={row.original.waste_report_file}   
                    waste_report_rslv_file={row.original.waste_report_rslv_file}       
                  />
                </div>
              }
            />       
          }
          content="View Details"   
        />
      ),
    },
  ];

  return (
    <div className="w-full h-full">
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Illegal Dumping Reports
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view illegal dumping reports
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Filter and Search Section */}
      <div className='w-full flex flex-col sm:flex-row gap-4 mb-4'>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
          <Input 
            placeholder="Search..." 
            className="pl-10 w-full bg-white" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <SelectLayout
          className="bg-white w-full sm:w-[250px]"
          label=""
          placeholder="Filter"
          options={filterOptions}
          value={selectedFilterId}
          valueLabel="Matter"
          onChange={handleFilterChange}
        />                             
      </div>             

      <div className="w-full bg-white border-none"> 
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                const newPageSize = Number.parseInt(value);
                setPageSize(newPageSize);
                // Reset all pages to 1
                setPendingCurrentPage(1);
                setResolvedCurrentPage(1);
                setCancelledCurrentPage(1);
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
          {/* Tabs for Pending/Resolved/Cancelled */}
          <div className="pt-3">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className='pl-5 pb-3'>
                <TabsList className="grid w-full grid-cols-3 max-w-xs">
                  <TabsTrigger value="pending">In progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
        </div>  

        <Tabs value={activeTab}>
          <TabsContent value="pending">
            <div className="border overflow-auto max-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={fetchedData}
                />                
              )}              
            </div>

            {/* Pending Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
              <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                Showing {(pendingCurrentPage - 1) * pageSize + 1}-
                {Math.min(pendingCurrentPage * pageSize, totalCount)} of{" "}
                {totalCount} rows
              </p>
              {totalCount > 0 && (
                <PaginationLayout
                  currentPage={pendingCurrentPage}
                  totalPages={pendingTotalPages}
                  onPageChange={setPendingCurrentPage}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="resolved">
            <div className="border overflow-auto max-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={fetchedData}
                />                
              )}                
            </div>

            {/* Resolved Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
              <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                Showing {(resolvedCurrentPage - 1) * pageSize + 1}-
                {Math.min(resolvedCurrentPage * pageSize, totalCount)} of{" "}
                {totalCount} rows
              </p>
              {totalCount > 0 && (
                <PaginationLayout
                  currentPage={resolvedCurrentPage}
                  totalPages={resolvedTotalPages}
                  onPageChange={setResolvedCurrentPage}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="border overflow-auto max-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={fetchedData}
                />                
              )}                
            </div>

            {/* Cancelled Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
              <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                Showing {(cancelledCurrentPage - 1) * pageSize + 1}-
                {Math.min(cancelledCurrentPage * pageSize, totalCount)} of{" "}
                {totalCount} rows
              </p>
              {totalCount > 0 && (
                <PaginationLayout
                  currentPage={cancelledCurrentPage}
                  totalPages={cancelledTotalPages}
                  onPageChange={setCancelledCurrentPage}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>                                 
    </div>
  );
}

export default WasteIllegalDumping;