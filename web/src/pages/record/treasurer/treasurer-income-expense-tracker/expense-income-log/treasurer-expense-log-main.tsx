// import React, { useState } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Input } from "@/components/ui/input";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, Search, FileInput, CircleAlert } from 'lucide-react';
// import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
// import { Skeleton } from "@/components/ui/skeleton";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { useIncomeExpense, type IncomeExpense } from "../queries/treasurerIncomeExpenseFetchQueries";
// import { useIncomeExpenseMainCard } from "../queries/treasurerIncomeExpenseFetchQueries";
// import { useLocation } from "react-router-dom";
// import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// function ExpenseLogMain() {
//     const [searchQuery, setSearchQuery] = useState("");
//     const [pageSize, setPageSize] = useState(10);
//     const [currentPage, setCurrentPage] = useState(1);


//     // Month filter options
//     const monthOptions = [
//         { id: "All", name: "All" },
//         { id: "01", name: "January" },
//         { id: "02", name: "February" },
//         { id: "03", name: "March" },
//         { id: "04", name: "April" },
//         { id: "05", name: "May" },
//         { id: "06", name: "June" },
//         { id: "07", name: "July" },
//         { id: "08", name: "August" },
//         { id: "09", name: "September" },
//         { id: "10", name: "October" },
//         { id: "11", name: "November" },
//         { id: "12", name: "December" }
//     ];
//     const [selectedMonth, setSelectedMonth] = useState("All");

//     // Fetch data
//     const location = useLocation();
//     const year = location.state?.LogYear;
//     const { data: fetchedData = [], isLoading } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());
//     const { data: _fetchIncData = [] } = useIncomeExpenseMainCard();



//     // Filter data - only show non-archived entries
//     const filteredData = React.useMemo(() => {
//         let result = fetchedData.filter(row => 
//             row.iet_is_archive === false && 
//             Number(row.iet_amount) > Number(row.iet_actual_amount) &&
//             Number(row.iet_actual_amount) !== 0
//         );
    
//         if (selectedMonth !== "All") {
//             result = result.filter(item => {
//                 const month = item.iet_datetime?.slice(5, 7);
//                 return month === selectedMonth;
//             });
//         }
    
//         if (searchQuery) {
//             result = result.filter(item =>
//                 Object.values(item)
//                     .join(" ")
//                     .toLowerCase()
//                     .includes(searchQuery.toLowerCase())
//             );
//         }
//         return result;
//     }, [fetchedData, selectedMonth, searchQuery]);

//     // Pagination
//     const totalPages = Math.ceil(filteredData.length / pageSize);
//     const paginatedData = filteredData.slice(
//         (currentPage - 1) * pageSize,
//         currentPage * pageSize
//     );

//     // Columns definition
//     const columns: ColumnDef<IncomeExpense>[] = [
//         { 
//             accessorKey: "iet_datetime",
//             header: ({ column }) => (
//                 <div
//                     className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     Date
//                     <ArrowUpDown size={14}/>
//                 </div>
//             ),
//             cell: ({ row }) => (
//                 <div className="text-center">
//                     {new Date(row.getValue("iet_datetime")).toLocaleString("en-US", {
//                         timeZone: "UTC",
//                         dateStyle: "medium",
//                         timeStyle: "short"
//                     })}
//                 </div>
//             )
//         },
//         { 
//             accessorKey: "exp_budget_item", 
//             header: "Particulars",
//             cell: ({row}) => (
//                 <div>{row.getValue("exp_budget_item")}</div>
//             )
//         },
//         { 
//             accessorKey: "iet_amount", 
//             header: "Proposed Budget" ,
//             cell: ({row}) => (
//                 <div>₱{row.getValue("iet_amount")}</div>
//             )
//         },
//         { 
//             accessorKey: "iet_actual_amount", 
//             header: "Actual Expense" ,
//             cell: ({row}) => (
//                 <div>₱{row.getValue("iet_actual_amount")}</div>
//             )
//         },              
//         { 
//             accessorKey: "iet_amount", 
//             header: "Return Amount" ,
//             cell: ({row}) => {
//                 const amount = Number(row.original.iet_amount);
//                 const actualAmount = Number(row.original.iet_actual_amount);
//                 const difference = amount - actualAmount;
                
//                 return (
//                     <div>₱{difference.toFixed(2)}</div>
//                 );
//             }
//         },    
//         {
//             accessorKey: "staff_name",
//             header: "Assigned Staff",
//         },   
//         {
//             accessorKey: "files",
//             header: "Supporting Documents",
//             cell: ({row}) => {
//                 const files = row.original.files;
//                 const hasFiles = files && files.length > 0;
                
//                 return (
//                     <div className="flex justify-center">
//                         {hasFiles ? (
//                             <DialogLayout
//                                 trigger={<div className="bg-white hover:bg-[#f3f2f2] cursor-pointer text-[#1273B8] text-[12px] underline"> 
//                                     View ({files.length})
//                                 </div>}
//                                 className="max-w-md max-h-[60%] overflow-auto p-6 flex flex-col"
//                                 title="Attached Files"
//                                 description="Files associated with this entry."
//                                 mainContent={
//                                     <div className="flex flex-col gap-4 p-5">
//                                         {files.map((file) => (
//                                             <div key={file.ief_id} className="border p-3 rounded-md">
//                                                 <a 
//                                                     href={file.ief_url}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
//                                                 >
//                                                     <FileInput size={16} />
//                                                     Image {file.ief_name}
//                                                 </a>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 }
//                             />
//                         ) : (
//                             <div className="text-red-500 flex items-center gap-1">
//                                 <CircleAlert size={16} />
//                                 <span className="text-xs">no document</span>
//                             </div>
//                         )}
//                     </div>
//                 );
//             }
//         },
//     ];

//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//             <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//             <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//             <Skeleton className="h-10 w-full mb-4 opacity-30" />
//             <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         );
//     }

//     return (
//         <LayoutWithBack
//             title="Expense Log"
//             description="View expense log records."
//         >
//             <div className="w-full h-full">

//                 <div className="mb-[1rem] flex flex-col justify-between gap-4">
//                     <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//                         <div className="relative flex-1">
//                             <Search
//                                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                                 size={17}
//                             />
//                             <Input 
//                                 placeholder="Search..." 
//                                 className="pl-10 w-full bg-white text-sm" 
//                                 value={searchQuery}
//                                 onChange={(e) => {
//                                     setSearchQuery(e.target.value);
//                                     setCurrentPage(1);
//                                 }}
//                             />
//                         </div>
//                         <div className="flex flex-row gap-2 justify-center items-center">
//                             <SelectLayout
//                                 className="bg-white" 
//                                 placeholder="Month"
//                                 value={selectedMonth} 
//                                 options={monthOptions}
//                                 onChange={(value) => {
//                                     setSelectedMonth(value);
//                                     setCurrentPage(1);
//                                 }}
//                             />
//                         </div>                            
//                     </div>
//                 </div>

//                 <div className="bg-white">
//                     <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
//                         <div className="flex gap-x-2 items-center">
//                             <p className="text-xs sm:text-sm">Show</p>
//                             <Input 
//                                 type="number" 
//                                 className="w-14 h-8" 
//                                 value={pageSize}
//                                 onChange={(e) => {
//                                     const value = +e.target.value;
//                                     if (value >= 1) {
//                                         setPageSize(value);
//                                         setCurrentPage(1);
//                                     }
//                                 }}
//                             />
//                             <p className="text-xs sm:text-sm">Entries</p>
//                         </div>
//                     </div>

//                     <div className="border overflow-auto max-h-[400px]">
//                         <DataTable 
//                             columns={columns} 
//                             data={paginatedData} 
//                         />
//                     </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//                     <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//                         Showing {(currentPage - 1) * pageSize + 1}-
//                         {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//                         {filteredData.length} rows
//                     </p>
//                     {filteredData.length > 0 && (
//                         <PaginationLayout
//                             currentPage={currentPage}
//                             totalPages={totalPages}
//                             onPageChange={setCurrentPage}
//                         />
//                     )}
//                 </div>  
//             </div>
//         </LayoutWithBack>            
//     );
// }

// export default ExpenseLogMain;












import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useExpenseLog, type ExpenseLog} from "../queries/treasurerIncomeExpenseFetchQueries";
import { useLocation } from "react-router-dom";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

function ExpenseLogMain() {
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

    // Fetch data
    const location = useLocation();
    const year = location.state?.LogYear;
    const { data: fetchedData = [], isLoading } = useExpenseLog(year ? parseInt(year) : new Date().getFullYear());

    console.log("Fetched Expense log:", fetchedData);
    const formatDate = (dateString: string) => 
        new Date(dateString).toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true
        });



    // Filter data - only show non-archived entries
    const filteredData = React.useMemo(() => {
        let result = fetchedData.filter(row => row.el_is_archive === false);
    
        if (selectedMonth !== "All") {
            result = result.filter(item => {
                const month = item.el_datetime?.slice(5, 7);
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

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

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
                    </div>

                    <div className="border overflow-auto max-h-[400px]">
                        <DataTable 
                            columns={columns} 
                            data={paginatedData} 
                        />
                    </div>
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
        </LayoutWithBack>            
    );
}

export default ExpenseLogMain;