import{ useState } from "react";
import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectLayout } from "@/components/ui/select/select-layout";
import WasteIllegalDumpingDetails from "./waste-illegal-dumping-view-details";
import { useWasteReport, type WasteReport } from "./queries/waste-ReportGetQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function WasteIllegalDumping() {
  const { data: fetchedData = [], isLoading } = useWasteReport();
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'resolved'
  const [selectedFilterId, setSelectedFilterId] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const filterOptions = [
    { id: "0", name: "All Report Matter" },
    { id: "1", name: "Littering, Illegal dumping, Illegal disposal of garbage" },
    { id: "2", name: "Urinating, defecating, spitting in a public place" },
    { id: "3", name: "Dirty frontage and immediate surroundings for establishment owners" },
    { id: "4", name: "Improper and untimely stacking of garbage outside residences or establishment" },
    { id: "5", name: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
    { id: "6", name: "Dirty public utility vehicles, or no trash can or receptacle" },
    { id: "7", name: "Spilling, scattering, littering of wastes by public utility vehicles" },
    { id: "8", name: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
  ];

  // Filter data based on active tab, filter, and search query
  const filteredData = React.useMemo(() => {
    let result = fetchedData.filter(row => 
      activeTab === "pending" ? row.rep_status !== "resolved" : row.rep_status === "resolved"
    );

    if (selectedFilterId !== "0") {
      const selectedFilterName = filterOptions.find(option => option.id === selectedFilterId)?.name || "";
      result = result.filter(item => 
        item.rep_matter.trim().toLowerCase() === selectedFilterName.trim().toLowerCase()
      );
    }

    if (searchQuery) {
      result = result.filter(item =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [fetchedData, activeTab, selectedFilterId, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        <div className="capitalize">{row.getValue("rep_id")}</div>
      ),
    },
    {
      accessorKey: "rep_status",
      header: "Report Status",
    },
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
                <div className="px-2.5 py-1.5 border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px] cursor-pointer">
                  View
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
                    rep_violator={row.original.rep_violator}
                    rep_contact={row.original.rep_contact}
                    rep_status={row.original.rep_status}
                    rep_date={row.original.rep_date}
                    rep_date_resolved={row.original.rep_date_resolved}   
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
      <div className='w-full flex justify-between mb-4'>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-72 bg-white" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <SelectLayout
            className="bg-white"
            label=""
            placeholder="Filter"
            options={filterOptions}
            value={selectedFilterId}
            onChange={(value) => {
              setSelectedFilterId(value);
              setCurrentPage(1);
            }}
          />                             
        </div>
      </div>                    

      <div className="w-full bg-white border-none"> 
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input 
              type="number" 
              className="w-14 h-8" 
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                if (value >= 1) {
                  setPageSize(value);
                  setCurrentPage(1);
                }
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
            {/* Tabs for Pending/Resolved */}
            <div className="pt-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className='pl-5 pb-3'>
                  <TabsList className="grid w-full grid-cols-2 max-w-xs">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>
        </div>  

        <Tabs value={activeTab}>
          <TabsContent value="pending">
            <div className="border overflow-auto max-h-[400px]">
              <DataTable 
                columns={columns} 
                data={paginatedData.filter(row => row.rep_status !== "Resolved")} 
              />
            </div>
          </TabsContent>

          <TabsContent value="resolved">
            <div className="border overflow-auto max-h-[400px]">
              <DataTable 
                columns={columns} 
                data={paginatedData.filter(row => row.rep_status === "resolved")} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>   

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} rows
        </p>
        {filteredData.length > 0 && (
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>                                 
    </div>
  );
}

export default WasteIllegalDumping;