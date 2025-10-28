

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search } from 'lucide-react';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useExpenseLog, type ExpenseLog} from "../queries/treasurerIncomeExpenseFetchQueries";
import { useLocation } from "react-router-dom";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext";


function ExpenseLogMain() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState("All");
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

    // Fetch data with search and filter parameters
    const location = useLocation();
    const year = location.state?.LogYear;

    //fetch mutation
    const { 
        data: expenseLogData = { results: [], count: 0 }, 
        isLoading 
    } = useExpenseLog(
        currentPage,
        pageSize,
        year ? parseInt(year) : new Date().getFullYear(),
        debouncedSearchQuery,
        selectedMonth
    );

    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);   

    
    const formatDate = (dateString: string) => 
        new Date(dateString).toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true
        });
    
    // Get data from paginated response
    const fetchedData = expenseLogData.results || [];
    const totalCount = expenseLogData.count || 0;

    // Filter data - only show non-archived entries
    const filteredData = React.useMemo(() => {
        return fetchedData.filter(row => row.el_is_archive === false);
    }, [fetchedData]);

    // Pagination
    const totalPages = Math.ceil(totalCount / pageSize);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // Handle month change
    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        setCurrentPage(1);
    };

    // Columns definition
    const columns: ColumnDef<ExpenseLog>[] = [
        { 
            accessorKey: "el_datetime",
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
                    {formatDate(row.getValue("el_datetime"))}
                </div>
            )
        },
        { 
            accessorKey: "el_particular", 
            header: "Particulars",
            cell: ({row}) => (
                <div>{row.getValue("el_particular")}</div>
            )
        },
        { 
            accessorKey: "el_proposed_budget", 
            header: "Proposed Budget" ,
            cell: ({row}) => (
                <div>₱{row.getValue("el_proposed_budget")}</div>
            )
        },
        { 
            accessorKey: "el_actual_expense", 
            header: "Actual Expense" ,
            cell: ({row}) => (
                <div>₱{row.getValue("el_actual_expense")}</div>
            )
        },              
        { 
            accessorKey: "el_return_amount", 
            header: "Return/Excess",
            cell: ({ row }) => (
                <div className={
                    parseFloat(row.getValue("el_proposed_budget")) > parseFloat(row.getValue("el_actual_expense"))
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                }>
                    {parseFloat(row.getValue("el_proposed_budget")) > parseFloat(row.getValue("el_actual_expense"))
                        ? `+ ₱${row.getValue("el_return_amount")}`
                        : `- ₱${row.getValue("el_return_amount")}`}
                </div>
            )
        },  
        {
            accessorKey: "staff_name",
            header: "Assigned Staff",
        },   
    ];


    return (
        <LayoutWithBack
            title="Expense Log"
            description="View expense log records."
        >
            <div className="w-full h-full">
                <div className="mb-[1rem] flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1">
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
                        <div className="flex flex-row gap-2 justify-center items-center min-w-[180px]">
                            <SelectLayout
                                className="bg-white w-full" 
                                placeholder="Month"
                                value={selectedMonth} 
                                valueLabel="Month"
                                options={monthOptions}
                                onChange={handleMonthChange}
                            />
                        </div>                            
                    </div>
                </div>

                <div className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
                        <div className="flex gap-x-2 items-center">
                            <p className="text-xs sm:text-sm">Show</p>
                            <Select 
                                value={pageSize.toString()} 
                                onValueChange={(value) => {
                                    const newPageSize = Number.parseInt(value);
                                    setPageSize(newPageSize);
                                    setCurrentPage(1); // Reset to page 1 when page size changes
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

                    <div className="border overflow-auto max-h-[400px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Spinner size="lg" />
                                <span className="ml-2 text-gray-600">Loading expense log records...</span>
                            </div>
                        ) : (
                            <DataTable 
                                columns={columns} 
                                data={filteredData} 
                            />
                        )}                        
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing {(currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, totalCount)} of{" "}
                        {totalCount} rows
                    </p>
                    {totalCount > 0 && (
                        <PaginationLayout
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>  
            </div>
        </LayoutWithBack>            
    );
}

export default ExpenseLogMain;