


import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash, Eye, Search, FileInput, Plus, Calendar, ChevronLeft  } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import IncomeandExpenseCreateForm from "./treasurer-expense-tracker-create";
import IncomeandExpenseEditForm from "./treasurer-expense-tracker-edit";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useIncomeExpense, type IncomeExpense } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useDeleteIncomeExpense } from "./queries/treasurerIncomeExpenseDeleteQueries";
import { NavLink } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useParams } from 'react-router-dom';

function IncomeandExpenseTracking() {
    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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
    const [selectedMonth, setSelectedMonth] = useState("All");

    // Fetch data from the backend
    // const { year } = useParams<{ year: string }>();
    const location = useLocation();
    const year = location.state?.budYear
    const { data: fetchedData = [], isLoading } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());

    // Filter the data based on the selected month and search query
    const filteredData = React.useMemo(() => {
        let result = fetchedData;
      
        if (selectedMonth !== "All") {
            result = result.filter(item => {
                const month = item.iet_date?.slice(5, 7); // "YYYY-MM-DD" → MM
                return month === selectedMonth;
            });
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
    }, [fetchedData, selectedMonth, searchQuery]);

    // Calculate total pages for pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Slice the data for the current page
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const { mutate: deleteEntry } = useDeleteIncomeExpense();

    const handleDelete = (iet_num: number) => {
        deleteEntry(iet_num);
    };

    const columns: ColumnDef<IncomeExpense>[] = [
        { 
            accessorKey: "iet_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="text-center">{row.getValue("iet_date")}</div>
            )
        },
        { 
            accessorKey: "dtl_budget_item", 
            header: "Particulars",
            cell: ({row}) => (
                <div>{row.getValue("dtl_budget_item")}</div>
            )
        },
        { accessorKey: "iet_amount", header: "Amount" },
        { 
            accessorKey: "iet_receipt_image", 
            header: "Receipt",
            cell: ({row}) => (
                <div className="flex justify-center"> 
                    <DialogLayout
                        trigger={<div className="bg-white hover:bg-[#f3f2f2] cursor-pointer text-[#1273B8] text-[12px] underline"> View Receipt</div>}
                        className="max-w-[50%] h-2/3 flex flex-col"
                        title="Receipt"
                        description="Here are the details of receipt."
                        mainContent={
                            <div className="flex flex-col gap-4 border p-5 rounded-md">
                                <div>
                                    <img src={row.getValue("iet_receipt_image")} className="w-52 h-52 border shadow-sm"/>
                                </div>
                            </div>
                        }
                    />
                </div>
            ) 
        },
        { 
            accessorKey: "actions", 
            header: "Action", 
            cell: ({row}) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                                className="max-w-[45%] max-h-[90%] overflow-auto p-10 verflow-y-auto"
                                title="Edit Entry"
                                description="Update expense details to keep records accurate."
                                mainContent={
                                    <div className="flex flex-col">
                                        <IncomeandExpenseEditForm 
                                            iet_num={row.original.iet_num} 
                                            iet_serial_num={row.original.iet_serial_num}
                                            iet_entryType={row.original.iet_entryType}
                                            iet_amount={String(row.original.iet_amount)}
                                            iet_particular_id={row.original.dtl_id}
                                            iet_particulars_name={row.original.dtl_budget_item}
                                            iet_additional_notes={row.original.iet_additional_notes}
                                            iet_receipt_image={row.original.iet_receipt_image}
                                            inv_num={row.original.inv_num}
                                            year={year || new Date().getFullYear().toString()}    
                                            onSuccess={() => setEditingRowId(null)}                                        
                                        />
                                    </div>
                                }
                                isOpen={editingRowId === row.original.iet_num}
                                onOpenChange={(open) => setEditingRowId(open ? row.original.iet_num : null)}
                            />
                        }  
                        content="View"
                    />
                    <TooltipLayout 
                        trigger={
                            <div className="flex items-center h-8">
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center" > <Trash size={16} /></div>}
                                    title="Confirm Delete"
                                    description="Are you sure you want to delete this entry?"
                                    actionLabel="Confirm"
                                    onClick={() => handleDelete(row.original.iet_num)} 
                                />                    
                            </div>                   
                        }  
                        content="Delete"
                    />
                </div>
            )
        }
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
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <Link to="/treasurer-income-expense-main"> <Button className="text-black hover:bg-gray-100 p-2" variant="outline"> <ChevronLeft size={20} /> </Button> </Link>
                    <div>
                        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2 pt-2">
                            <div className="rounded-full border-2 border-solid border-darkBlue2 p-3 flex items-center">
                                <Calendar />
                            </div>
                            <div>{year}</div>
                        </h1>
                        <p className="text-xs sm:text-sm text-darkGray pt-2">
                            Manage and view income and expense records for this year.
                        </p>
                    </div>
                </div>  
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="flex justify-center mb-9">
                <div className="inline-flex items-center justify-center bg-white rounded-full p-1 shadow-md">
                    <NavLink 
                        to={`/treasurer-income-and-expense-tracking`}
                        state={{type: "viewing", budYear: year}}
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
                        state={{type: "viewing", budYear: year}}
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
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <SelectLayout
                            className="bg-white" 
                            placeholder="Month"
                            value={selectedMonth} 
                            options={monthOptions}
                            onChange={(value) => {
                                setSelectedMonth(value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>                            
                </div>
                <DialogLayout
                    trigger={<div className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer"><Plus size={15} strokeWidth={3}></Plus>New Entry </div>}
                    className="max-w-md max-h-[530px] overflow-auto p-10"
                    title="Add New Entry"
                    description="Fill in the details for your entry."
                    mainContent={
                        <div className="w-full h-full">
                            <IncomeandExpenseCreateForm 
                                onSuccess={() => setIsDialogOpen(false)}
                                year={year || new Date().getFullYear().toString()}
                            />
                        </div>
                    }
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </div>

            <div className="bg-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
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

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <FileInput />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>                    
                    </div>
                </div>

                <DataTable columns={columns} data={paginatedData} />
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

export default IncomeandExpenseTracking;








