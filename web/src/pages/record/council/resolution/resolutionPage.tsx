import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Pencil, Trash, Eye, Plus, Search, Archive, ArchiveRestore, CircleAlert } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Input } from '@/components/ui/input';
import { DataTable } from "@/components/ui/table/data-table"
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import AddResolution from './addResolution';
import EditResolution from './editResolution';
import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
import { useDeleteResolution } from './queries/resolution-delete-queries';
import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";



export const getAreaFocusDisplayName = (focus: string): string => {
  switch (focus) {
    case "gad":
      return "GAD"
    case "finance":
      return "Finance"
    case "council":
      return "Council"
    case "waste":
      return "Waste"
    default:
      return focus
  }
}

export const getAreaFocusColor = (focus: string): string => {
  switch (focus) {
    case "gad":
      return "bg-purple-100 text-purple-800"
    case "finance":
      return "bg-orange-100 text-orange-800"
    case "council":
      return "bg-primary/10 text-primary"
    case "waste":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}




function ResolutionPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("active");
    const [activeCurrentPage, setActiveCurrentPage] = useState(1);
    const [archiveCurrentPage, setArchiveCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<string>("all");
    const [yearFilter, setYearFilter] = useState<string>("all");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const { showLoading, hideLoading } = useLoading();

    const currentPage = activeTab === "active" ? activeCurrentPage : archiveCurrentPage;
    const isArchive = activeTab === "archive";     
  

    // Fetch mutation
    const { data: resolutionData = { results: [], count: 0 }, isLoading, isError } = useResolution
    (
        currentPage,
        pageSize,
        debouncedSearchQuery, 
        filter, 
        yearFilter,
        isArchive
    );

    // Delete mutation
    const { mutate: deleteRes } = useDeleteResolution();

    // Archive / Restore mutation
    const { mutate: archiveRestore } = useArchiveOrRestoreResolution();

    // Extract data from paginated response
    const fetchedData = resolutionData.results || [];
    const totalCount = resolutionData.count || 0;    

    useEffect(() => {
        if (isLoading) {
        showLoading();
        } else {
        hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);      

    // Calculate total pages for current tab
    const activeTotalPages = activeTab === "active" ? Math.ceil(totalCount / pageSize) : 0;
    const archiveTotalPages = activeTab === "archive" ? Math.ceil(totalCount / pageSize) : 0;    


    const filterOptions = [
        { id: "all", name: "All" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" },
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" }
    ];


    // Extract unique years from resolution data
    const yearOptions = useMemo(() => {
        const years = new Set<number>();
        
        fetchedData.forEach(record => {
            if (record.res_date_approved) {
                try {
                    const date = new Date(record.res_date_approved);
                    if (!isNaN(date.getTime())) {
                        years.add(date.getFullYear());
                    }
                } catch (error) {
                    console.error('Error parsing date:', record.res_date_approved, error);
                }
            }
        });

        const sortedYears = Array.from(years).sort((a, b) => b - a);
        
        const options = [{ id: "all", name: "All Years" }];
        
        sortedYears.forEach(year => {
            options.push({ id: year.toString(), name: year.toString() });
        });

        return options;
    }, [fetchedData]);


    // Handle tab change - reset to page 1 when switching tabs
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === "active") {
            setActiveCurrentPage(1);
        } else {
            setArchiveCurrentPage(1);
        }
    };    



    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setActiveCurrentPage(1);
        setArchiveCurrentPage(1);
    };

    const handleFilterChange = (value: string) => {
        setFilter(value);
        setActiveCurrentPage(1);
        setArchiveCurrentPage(1);
    };

    const handleYearFilterChange = (value: string) => {
        setYearFilter(value);
        setActiveCurrentPage(1);
        setArchiveCurrentPage(1);
    };        

    const handleDelete = (res_num: number) => {
        deleteRes(String(res_num));
    };

    const handleArchive = (res_num: number) => {
        archiveRestore({
            res_num: String(res_num),
            res_is_archive: true
        });
    };

    const handleRestore = (res_num: number) => {
        archiveRestore({
            res_num: String(res_num),
            res_is_archive: false
        });
    };

    const commonColumns: ColumnDef<ResolutionData>[] = [
        {
            accessorKey: "res_num",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"    
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Resolution No.
                    <ArrowUpDown size={15}/>
                </div>
            ),
            cell: ({row}) => (
                // <div className="flex w-full justify-center items-center">{row.getValue("res_num")}</div>
                <div className="bg-blue-100 px-3 py-1 rounded-sm inline-block shadow-sm">
                    <p className="text-primary text-[13px] font-bold tracking-wider uppercase">
                        {row.getValue("res_num")}
                    </p>
                </div>                 
            )
        },
        {
            accessorKey: "res_date_approved",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"    
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown size={15}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="flex w-full justify-center items-center capitalize">{row.getValue("res_date_approved")}</div>
            )
        },
        {
            accessorKey: "res_title", 
            header: "Resolution Title", 
        },
        {
        accessorKey: "res_area_of_focus",
        header: "Area of Focus",
        cell: ({ row }) => (
            <div className="flex flex-wrap justify-center gap-2">
            {row.original.res_area_of_focus?.map((focus: string, index: number) => (
                <div
                key={index}
                className={`text-xs px-3 py-1 rounded-full font-medium ${getAreaFocusColor(focus)}`}
                >
                {getAreaFocusDisplayName(focus)}
                </div>
            ))}
            </div>
        ),
        },
        {
            accessorKey: "resolution_supp",
            header: "Supporting Documents",
            cell: ({row}) => {
                const files = row.original.resolution_supp;
                const hasFiles = files && files.length > 0;
                
                return (
                    <div className="flex justify-center">
                        {hasFiles ? (
                            <DialogLayout
                                trigger={<div className="bg-white hover:bg-[#f3f2f2] cursor-pointer text-[#1273B8] text-[12px] underline"> 
                                    View ({files.length})
                                </div>}
                                className="max-w-md max-h-[60%] overflow-auto p-6 flex flex-col"
                                title="Attached Documents"
                                description="Documents associated with this resolution."
                                mainContent={
                                    <div className="flex flex-col gap-4 p-5">
                                        {files.map((file) => (
                                            <div key={file.rsd_id} className="border p-2 rounded-md">
                                                <a 
                                                    href={file.rsd_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:text-blue-800 flex items-center gap-2"
                                                >
                                                    <span className="truncate max-w-[500px] block" title={file.rsd_name}>
                                                        {file.rsd_name}
                                                    </span>
                                                </a>
                                            </div>                                            
                                        ))}
                                    </div>
                                }
                            />
                        ) : (
                            <div className="text-red-500 flex items-center gap-1">
                                <CircleAlert  size={16} />
                                <span className="text-xs">no document</span>
                            </div>
                        )}
                    </div>
                );
            }
        }      
    ];

    const activeColumns: ColumnDef<ResolutionData>[] = [
        ...commonColumns,
        {
            accessorKey: "action", 
            header: "Action", 
            cell: ({row}) => ( 
                <div className="flex justify-center items-center gap-2 pr-3 max-full">
                    <TooltipLayout
                        trigger={
                            <a
                                href={row.original.resolution_files[0]?.rf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
                            >
                                <Eye size={16} />
                            </a>
                        }
                        content="View"
                    />
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={
                                    <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                                        <Pencil size={16} />
                                    </div>
                                }
                                className="max-w-md max-h-[530px] overflow-auto p-10"
                                title="Update Resolution"
                                description="Update the resolution details."
                                mainContent={
                                    <EditResolution
                                        res_num={String(row.original.res_num)}
                                        res_title={row.original.res_title}
                                        res_date_approved={row.original.res_date_approved}
                                        res_area_of_focus={row.original.res_area_of_focus} 
                                        resolution_files={row.original.resolution_files}     
                                        gpr_id={row.original.gpr_id}   
                                        onSuccess={() => setEditingRowId(null)}  
                                    />
                                }
                                isOpen={editingRowId === row.original.res_num}
                                onOpenChange={(open) => setEditingRowId(open ? row.original.res_num: null)}
                            />
                        }
                        content="Update"
                    />
                    <TooltipLayout
                        trigger={
                            <div className="flex items-center h-8">
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white border px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5  " > <Archive size={16}/></div>}
                                    title="Archive Resolution"
                                    description="This resolution will be archived and removed from the active list. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onClick={() => handleArchive(row.original.res_num)}
                                />
                            </div>
                        }
                        content="Archive"
                    />
                </div>
            )
        }
    ];

    const archiveColumns: ColumnDef<ResolutionData>[] = [
        ...commonColumns,
        {
            accessorKey: "action", 
            header: "Action", 
            cell: ({row}) => ( 
                <div className="flex justify-center items-center gap-2 pr-3 max-full">
                    <TooltipLayout
                        trigger={
                            <a
                                href={row.original.resolution_files[0]?.rf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
                            >
                                <Eye size={16} />
                            </a>
                        }
                        content="View"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={<div className="bg-[#10b981] hover:bg-[#34d399] text-white border px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"><ArchiveRestore size={16}/></div>}
                                    title="Restore Archived Resolution"
                                    description="Would you like to restore this resolution from the archive and make it active again?"
                                    actionLabel="Confirm"
                                    onClick={() => handleRestore(row.original.res_num)}
                                />
                            </div>
                        }
                        content="Restore"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white border px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"><Trash size={16}/></div>}
                                    title="Confirm Delete"
                                    description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onClick={() => handleDelete(row.original.res_num)}
                                />
                            </div>
                        }
                        content="Delete"
                    />
                </div>
            )
        }
    ];

    if (isError) {
        return <div>Error loading resolutions</div>;
    }

    return (
        <div className="w-full h-full">
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Resolution Record
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view resolution information
                </p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />        

            <div className='w-full flex justify-between mb-4'>
                <div className="flex gap-3 flex-1 mr-4">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full bg-white" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <SelectLayout
                        className="bg-white w-40"
                        label=""
                        placeholder="Area Filter"
                        options={filterOptions}
                        value={filter}
                        valueLabel="Area"
                        onChange={handleFilterChange}
                    />

                    <SelectLayout
                        className="bg-white w-40"
                        label=""
                        placeholder="Year Filter"
                        options={yearOptions}
                        value={yearFilter}
                        valueLabel="Year"
                        onChange={handleYearFilterChange}
                    />                              
                </div>
                <div className="flex-shrink-0">
                    <DialogLayout
                        trigger={
                            <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
                                <Plus className="mr-2" size={16}/>Create
                            </div>
                        }
                        className="max-w-md max-h-[530px] overflow-auto p-10"
                        title="Resolution Details"
                        description="Add details."
                        mainContent={
                            <AddResolution onSuccess={() => setIsDialogOpen(false)}/>
                        }   
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                    />                 
                </div>
            </div>                    

            <div className="w-full bg-white border-none"> 
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
                    <div className='pl-5 pb-3'>
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Resolutions</TabsTrigger>
                            <TabsTrigger value="archive">
                                <div className="flex items-center gap-2">
                                    <Archive size={16} /> Archive
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active">
                        <div className="border overflow-auto max-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="lg" />
                                    <span className="ml-2 text-gray-600">Loading resolution records...</span>
                                </div>
                            ) : (
                                <DataTable 
                                    columns={activeColumns} 
                                    data={fetchedData}  // No filtering needed - backend already sent active records
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

                    <TabsContent value="archive">
                        <div className="border overflow-auto max-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="lg" />
                                    <span className="ml-2 text-gray-600">Loading resolution records...</span>
                                </div>
                            ) : (
                                <DataTable 
                                    columns={archiveColumns} 
                                    data={fetchedData}  // No filtering needed - backend already sent archived records
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

export default ResolutionPage;