

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash, Eye, Search,  Plus, ChevronLeft, Calendar, Archive, ArchiveRestore } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import IncomeCreateForm from "./treasurer-income-tracker-create";
import IncomeEditForm from "./treasurer-income-tracker-edit";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { HistoryTable } from "@/components/ui/table/history-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useIncomeData, type Income } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useDeleteIncome, useArchiveOrRestoreIncome } from "./queries/treasurerIncomeExpenseDeleteQueries";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from "./queries/treasurerIncomeExpenseFetchQueries";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext";


function IncomeTracking() {
    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [pageSize, setPageSize] = useState(10);
    const [activeCurrentPage, setActiveCurrentPage] = useState(1);
    const [archiveCurrentPage, setArchiveCurrentPage] = useState(1);
    const { showLoading, hideLoading } = useLoading();
    
    // Add debouncing for search
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Month filter options
    const monthOptions = [
        { id: "All", name: "All" },
        { id: "01", name: "January" },
        { id: "02", name: "February" },
        { id: "03", name: "March" },
        { id: "04", name: "April" },
        { id: "05", name: "May" },
        { id: "06", name: "June" },
        { id: "07", name: "July" },
        { id: "08", name: "August" },
        { id: "09", name: "September" },
        { id: "10", name: "October" },
        { id: "11", name: "November" },
        { id: "12", name: "December" }
    ];

    // Fetch data from the backend with search and filter parameters
    const location = useLocation();
    const year = location.state?.budYear;

    const currentPage = activeTab === "active" ? activeCurrentPage : archiveCurrentPage;
    const isArchive = activeTab === "archive"; // Convert tab to boolean


    const { data: incomeData = { results: [], count: 0 },  isLoading } = useIncomeData(
        currentPage,
        pageSize,
        year ? parseInt(year) : new Date().getFullYear(),
        debouncedSearchQuery,
        selectedMonth,
        isArchive
    );


    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);   
    
    const { data: fetchIncData = { results: [], count: 0 } } = useIncomeExpenseMainCard();

    const matchedYearData = fetchIncData.results.find((item: IncomeExpenseCard) => Number(item.ie_main_year) === Number(year));
    const totInc = matchedYearData?.ie_main_inc ?? 0;

    // Get data from paginated response
    const fetchedData = incomeData.results || [];
    const totalCount = incomeData.count || 0;    
 
    // Calculate total pages for current tab
    const activeTotalPages = activeTab === "active" ? Math.ceil(totalCount / pageSize) : 0;
    const archiveTotalPages = activeTab === "archive" ? Math.ceil(totalCount / pageSize) : 0;

    // Handle tab change - reset to page 1 when switching tabs
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === "active") {
            setActiveCurrentPage(1);
        } else {
            setArchiveCurrentPage(1);
        }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setActiveCurrentPage(1);
        setArchiveCurrentPage(1);
    };

    // Handle month change
    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        setActiveCurrentPage(1);
        setArchiveCurrentPage(1);
    };

    // Mutation hooks
    const { mutate: deleteIncome } = useDeleteIncome();
    const { mutate: archiveRestore } = useArchiveOrRestoreIncome();

    const handleDelete = (inc_num: number) => {
        deleteIncome(inc_num);
    };

    const handleArchive = (inc_num: number, inc_amount: number) => {
        let totalIncome = 0;

        const totINC = Number(totInc);

        totalIncome = totINC - Number(inc_amount);

        const allValues = {
            inc_num: inc_num,
            inc_is_archive: true,
            totalIncome,
            year
        };

        archiveRestore(allValues);
        console.log("ARCHIVE INC: ", allValues)
    };

    const handleRestore = (inc_num: number, inc_amount: number) => {
        let totalIncome = 0;

        const totINC = Number(totInc);

        totalIncome = totINC + Number(inc_amount);        

        const allValues = {
            inc_num: inc_num,
            inc_is_archive: false,
            totalIncome,
            year
        };

        archiveRestore(allValues);
        console.log("RESTORE INC: ", allValues)
    };

    // Common columns for both tabs (rest of your columns remain the same)
    const commonColumns: ColumnDef<Income>[] = [
        { 
            accessorKey: "inc_datetime",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    {new Date(row.getValue("inc_datetime")).toLocaleString("en-US", {
                        timeZone: "UTC",
                        dateStyle: "medium",
                        timeStyle: "short"  
                    })}
                </div>
            )
        },        
        { 
            accessorKey: "incp_item", 
            header: "Particulars",
        },
        { 
            accessorKey: "inc_amount", 
            header: "Amount" },
        { 
            accessorKey: "inc_additional_notes", 
            header: "Additional Notes",
        },
        {
            accessorKey: "staff_name",
            header: "Assigned Staff",
        },        
    ];

    // Active tab columns (rest of your columns remain the same)
    const activeColumns: ColumnDef<Income>[] = [
        ...commonColumns,
        { 
            accessorKey: "actions", 
            header: "Action", 
            cell: ({row}) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                                className="max-w-[45%] max-h-[90%] overflow-auto p-10"
                                title="Edit Entry"
                                description="Update income details to keep records accurate."
                                mainContent={
                                    <div className="flex flex-col">
                                        <IncomeEditForm
                                            inc_num={row.original.inc_num}
                                            inc_datetime={row.original.inc_datetime}
                                            inc_serial_num={row.original.inc_serial_num}
                                            inc_transac_num={row.original.inc_transac_num}
                                            incp_id={row.original.incp_id}
                                            inc_particulars={row.original.incp_item} 
                                            inc_amount={String(row.original.inc_amount)}
                                            inc_additional_notes={row.original.inc_additional_notes}
                                            inc_receipt_image={row.original.inc_receipt_image}                                
                                            year={year}
                                            totInc={totInc}
                                            onSuccess={() => setEditingRowId(null)}  
                                        />
                                    </div>
                                }
                                isOpen={editingRowId === row.original.inc_num}
                                onOpenChange={(open) => setEditingRowId(open ? row.original.inc_num : null)}
                            />
                        }  
                        content="View"
                    />
                    <TooltipLayout 
                        trigger={
                            <div className="flex items-center h-8">
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"><Archive size={16}/></div>}
                                    title="Archive Entry"
                                    description="This entry will be moved to archive. Are you sure?"
                                    actionLabel="Archive"
                                    onClick={() => handleArchive(
                                        row.original.inc_num,
                                        row.original.inc_amount
                                    )} 
                                />                    
                            </div>                   
                        }  
                        content="Archive"
                    />
                </div>
            )
        }
    ];

    // Archive tab columns (rest of your columns remain the same)
    const archiveColumns: ColumnDef<Income>[] = [
        ...commonColumns,
        { 
            accessorKey: "actions", 
            header: "Action", 
            cell: ({row}) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={<div className="bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded cursor-pointer"><ArchiveRestore size={16}/></div>}
                                    title="Restore Entry"
                                    description="Would you like to restore this entry from archive?"
                                    actionLabel="Restore"
                                    onClick={() => handleRestore(
                                        row.original.inc_num,
                                        row.original.inc_amount
                                    )}
                                />
                            </div>
                        }
                        content="Restore"
                    />
                    <TooltipLayout 
                        trigger={
                            <div className="flex items-center h-8">
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"><Trash size={16}/></div>}
                                    title="Permanently Delete"
                                    description="This will permanently delete the entry. Continue?"
                                    actionLabel="Delete"
                                    onClick={() => handleDelete(row.original.inc_num)} 
                                />                    
                            </div>                   
                        }  
                        content="Delete"
                    />
                </div>
            )
        }
    ];


    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <Link to="/treasurer-income-expense-main"> 
                        <Button className="text-black hover:bg-gray-100 p-2" variant="outline"> 
                            <ChevronLeft size={20} /> 
                        </Button> 
                    </Link>
                    <div>
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2 pt-2">
                            <div className="rounded-full border-2 border-solid border-darkBlue2 p-3 flex items-center">
                                <Calendar />
                            </div>
                            <div>{year}</div>
                        </h1>
                        <p className="text-xs sm:text-sm text-darkGray pt-2">
                            Manage and view income records for this year.
                        </p>
                    </div>
                </div>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="flex justify-center mb-9">
                <div className="inline-flex items-center justify-center bg-white rounded-full p-1 shadow-md">
                    <NavLink 
                        to={`/treasurer-income-and-expense-tracking`}
                        state={{
                            type: "viewing", 
                            budYear: year,
                            totIncome: totInc,
                        }}
                        className={({ isActive }) => 
                            `px-5 py-2 rounded-full text-sm font-medium transition-all ${
                            isActive 
                                ? "bg-primary text-white shadow" 
                                : "text-gray-700 hover:bg-white"
                            }`
                        }
                        >
                        Expense Tracking
                    </NavLink>
                    <NavLink 
                        to={`/treasurer-income-tracking`}
                        state={{
                            type: "viewing", 
                            budYear: year,
                            totIncome: totInc,
                        }}
                        className={({ isActive }) => 
                            `px-5 py-2 rounded-full text-sm font-medium transition-all ${
                            isActive 
                                ? "bg-primary text-white shadow" 
                                : "text-gray-700 hover:bg-white"
                            }`
                        }
                        >
                        Income Tracking
                    </NavLink>
                </div>
            </div>

            <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full"> {/* Changed from w-full md:w-auto to w-full */}
                    <div className="relative flex-1 min-w-[200px]"> {/* Added min-width */}
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-full bg-white text-sm" 
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center min-w-[180px]"> {/* Added min-width */}
                        <SelectLayout
                            className="bg-white w-full" 
                            placeholder="Month"
                            value={selectedMonth} 
                            options={monthOptions}
                            onChange={handleMonthChange}
                        />
                    </div>                            
                </div>                
                <DialogLayout
                    trigger={
                    <div className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer whitespace-nowrap shrink-0">
                        <Plus size={15} strokeWidth={3} />
                        New Entry
                    </div>
                    }
                    className="max-w-md max-h-[530px] overflow-auto p-10"
                    title="Add New Entry"
                    description="Fill in the details for your entry."
                    mainContent={
                    <div className="w-full h-full">
                        <IncomeCreateForm 
                        onSuccess={() => setIsDialogOpen(false)}
                        year={year}
                        totInc={totInc}
                        />
                    </div>
                    }
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </div>

            {/* Rest of your JSX remains the same */}
            <div className="bg-white">
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
                            <TabsTrigger value="active">Active Entries</TabsTrigger>
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
                                    <span className="ml-2 text-gray-600">Loading income entries...</span>
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

                    <TabsContent value="archive">
                        <div className="border overflow-auto max-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="lg" />
                                    <span className="ml-2 text-gray-600">Loading archived entries...</span>
                                </div>
                            ) : (
                                <HistoryTable 
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

export default IncomeTracking;