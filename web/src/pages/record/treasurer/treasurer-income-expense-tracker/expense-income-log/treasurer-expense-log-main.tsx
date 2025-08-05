// import React, { useState } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Input } from "@/components/ui/input";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, Trash, Eye, Search, FileInput, Archive, ArchiveRestore, CircleAlert   } from 'lucide-react';
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import IncomeandExpenseEditForm from "../treasurer-expense-tracker-edit";
// import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { Skeleton } from "@/components/ui/skeleton";
// import { HistoryTable } from "@/components/ui/table/history-table";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { useIncomeExpense, type IncomeExpense } from "../queries/treasurerIncomeExpenseFetchQueries";
// import { useIncomeExpenseMainCard } from "../queries/treasurerIncomeExpenseFetchQueries";
// import { useDeleteIncomeExpense } from "../queries/treasurerIncomeExpenseDeleteQueries";
// import { useArchiveOrRestoreExpense } from "../queries/treasurerIncomeExpenseDeleteQueries";
// import { useBudgetItems, type BudgetItem } from "../queries/treasurerIncomeExpenseFetchQueries";
// import { NavLink } from 'react-router-dom';
// import { Link } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { useParams } from 'react-router-dom';



// function ExpenseLogMain() {
//     const [editingRowId, setEditingRowId] = useState<number | null>(null);
//     const [activeTab, setActiveTab] = useState("active")
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

//     // Fetch data from the backend
//     const location = useLocation();
//     const year = location.state?.budYear
//     const totInc = location.state?.totalInc;


//     const { data: fetchedData = [], isLoading } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());

//     const { data: budgetItems = [] } = useBudgetItems(year);

//     const {  data: fetchIncData = [] } = useIncomeExpenseMainCard();

//     const matchedYearData = fetchIncData.find(item => Number(item.ie_main_year) === Number(year));
//     const totBud = matchedYearData?.ie_remaining_bal ?? 0;
//     const totExp = matchedYearData?.ie_main_exp ?? 0;  

//     console.log("REMAIN BAL: ", totBud)
    
//     // Filter the data based on the selected month and search query
//     const filteredData = React.useMemo(() => {
//         let result = fetchedData.filter(row => 
//             activeTab === "active" ? row.iet_is_archive === false : row.iet_is_archive === true
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
//     }, [fetchedData, activeTab, selectedMonth, searchQuery]);

//     // Calculate total pages for pagination
//     const totalPages = Math.ceil(filteredData.length / pageSize);

//     // Slice the data for the current page
//     const paginatedData = filteredData.slice(
//         (currentPage - 1) * pageSize,
//         currentPage * pageSize
//     );


//     const { mutate: deleteEntry } = useDeleteIncomeExpense();
//     const { mutate: archiveRestore } = useArchiveOrRestoreExpense();


//     const handleDelete = (iet_num: number) => {
//         deleteEntry(iet_num);
//     };


//     const handleArchive = (
//         iet_num: number,
//         iet_amount: number,
//         iet_actual_amount: number,
//         exp_id: number
//     ) => {

//         const matchingBudgetItem = budgetItems.find(item => item.id === exp_id.toString());
//         let totalBudget = 0.00;
//         let totalExpense = 0.00;
//         let proposedBud = 0.00;

//         const amount = Number(iet_amount)
//         const actual_amount = Number(iet_actual_amount)

//         const propBudget = matchingBudgetItem?.proposedBudget || 0;
//         const totEXP = Number(totExp);
//         const totBUDGET = Number(totBud);   
        
//         if(!actual_amount){
//             totalBudget = totBUDGET + amount;
//             totalExpense = totEXP - amount;
//             proposedBud = propBudget + amount;
//         }
//         else{
//             totalBudget = totBUDGET + actual_amount;
//             totalExpense = totEXP - actual_amount;
//             proposedBud = propBudget + actual_amount;            
//         }


//         const allValues = {
//             iet_num: iet_num,
//             iet_is_archive: true,
//             exp_id: exp_id,
//             year,
//             totalBudget, 
//             totalExpense, 
//             proposedBud    
//         }
//         archiveRestore(allValues);
//         console.log("ARCHIVE EXP: ", allValues)
//     };



//     const handleRestoreArchive = (
//         iet_num: number,
//         iet_amount: number,
//         iet_actual_amount: number,
//         exp_id: number
//     ) => {
        
//         const matchingBudgetItem = budgetItems.find(item => item.id === exp_id.toString());
//         let totalBudget = 0.00;
//         let totalExpense = 0.00;
//         let proposedBud = 0.00;

//         const amount = Number(iet_amount)
//         const actual_amount = Number(iet_actual_amount)

//         const propBudget = matchingBudgetItem?.proposedBudget || 0;
//         const totEXP = Number(totExp);
//         const totBUDGET = Number(totBud);   
        
//         if(!actual_amount){
//             totalBudget = totBUDGET - amount;
//             totalExpense = totEXP + amount;
//             proposedBud = propBudget - amount;
//         }
//         else{
//             totalBudget = totBUDGET - actual_amount;
//             totalExpense = totEXP + actual_amount;
//             proposedBud = propBudget - actual_amount;            
//         }


//         const allValues = {
//             iet_num: iet_num,
//             iet_is_archive: false,
//             exp_id: exp_id,
//             year,
//             totalBudget, 
//             totalExpense, 
//             proposedBud    
//         }

//         archiveRestore(allValues);
//         console.log("RESTORE EXP: ", allValues)
//     };



//     const commonColumns: ColumnDef<IncomeExpense>[] = [
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
//             header: "Amount" ,
//             cell: ({row}) => (
//                 <div>₱{row.getValue("iet_amount")}</div>
//             )
//         },
//         { 
//             accessorKey: "iet_actual_amount", 
//             header: "Actual Amount" ,
//             cell: ({row}) => (
//                 <div>₱{row.getValue("iet_actual_amount")}</div>
//             )
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
//                                 <CircleAlert  size={16} />
//                                 <span className="text-xs">no document</span>
//                             </div>
//                         )}
//                     </div>
//                 );
//             }
//         }        
//     ];


//     const activeColumns: ColumnDef<IncomeExpense>[] = [
//         ...commonColumns,
//         { 
//             accessorKey: "actions", 
//             header: "Action", 
//             cell: ({row}) => (
//                 <div className="flex justify-center gap-2">
//                     <TooltipLayout
//                         trigger={
//                             <DialogLayout
//                                 trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
//                                 className="max-w-[45%] max-h-[90%] overflow-auto p-10 verflow-y-auto"
//                                 title="Edit Entry"
//                                 description="Update expense details to keep records accurate."
//                                 mainContent={
//                                     <div className="flex flex-col">
//                                         <IncomeandExpenseEditForm 
//                                             iet_num={row.original.iet_num} 
//                                             iet_serial_num={row.original.iet_serial_num}
//                                             iet_datetime={row.original.iet_datetime}
//                                             iet_entryType={row.original.iet_entryType}
//                                             iet_amount={String(row.original.iet_amount)}
//                                             iet_actual_amount={String(row.original.iet_actual_amount)}
//                                             iet_particular_id={row.original.exp_id}
//                                             iet_particulars_name={row.original.exp_budget_item}
//                                             iet_additional_notes={row.original.iet_additional_notes}
//                                             iet_receipt_image={row.original.iet_receipt_image}
//                                             inv_num={row.original.inv_num}
//                                             totBud={String(totBud)}
//                                             totExp={String(totExp)}
//                                             year={year || new Date().getFullYear().toString()}  
//                                             files={row.original.files}  
//                                             onSuccess={() => setEditingRowId(null)}                                        
//                                         />
//                                     </div>
//                                 }
//                                 isOpen={editingRowId === row.original.iet_num}
//                                 onOpenChange={(open) => setEditingRowId(open ? row.original.iet_num : null)}
//                             />
//                         }  
//                         content="View"
//                     />
//                     <TooltipLayout 
//                         trigger={
//                             <div className="flex items-center h-8">
//                                 <ConfirmationModal
//                                     trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center" > <Archive size={16}/></div>}
//                                     title="Archive entry"
//                                     description="This entry will be archived and removed from the active list. Do you wish to proceed?"
//                                     actionLabel="Confirm"
//                                     onClick={() => handleArchive(
//                                         row.original.iet_num,
//                                         row.original.iet_amount,
//                                         row.original.iet_actual_amount,
//                                         row.original.exp_id,
//                                     )} 
//                                 />                    
//                             </div>                   
//                         }  
//                         content="Archive"
//                     />
//                 </div>
//             )
//         }        

//     ];


//     const archiveColumns: ColumnDef<IncomeExpense>[] = [
//         ...commonColumns,
//  {
//             accessorKey: "action", 
//             header: "Action",
//             cell: ({ row }) => {
//                 return (
//                     <div className="flex justify-center gap-2">
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <ConfirmationModal
//                                         trigger={ <div className="bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded cursor-pointer"><ArchiveRestore size={16}/></div>}
//                                         title="Restore Archived Entry"
//                                         description="Would you like to restore this schedule from the archive and make it active again?"
//                                         actionLabel="confirm"
//                                         onClick={() => handleRestoreArchive(
//                                             row.original.iet_num,
//                                             row.original.iet_amount,
//                                             row.original.iet_actual_amount,
//                                             row.original.exp_id,
//                                         )}
//                                     />
//                                 </div>
//                             }
//                             content="Restore"
//                         />
//                         <TooltipLayout
//                             trigger={
//                                 <div>
//                                     <ConfirmationModal
//                                         trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16}/></div>}
//                                         title="Confirm Delete"
//                                         description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
//                                         actionLabel="confirm"
//                                         onClick={() => handleDelete(row.original.iet_num)}
//                                     />
//                                 </div>
//                             }
//                             content="Delete"
//                         />
//                     </div>
//                 )
//             }
//         }        
//     ];



//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//               <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//               <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//               <Skeleton className="h-10 w-full mb-4 opacity-30" />
//               <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//           );
//     }

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col gap-4 mb-4">
//                 <div className="flex items-center gap-4">
//                     <div>
//                         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2 pt-2">
//                             {/* <div className="rounded-full border-2 border-solid border-darkBlue2 p-3 flex items-center">
//                                 <Calendar />
//                             </div>
//                             <div>{year}</div> */}
//                             <div>Expense Log</div>
//                         </h1>
//                         <p className="text-xs sm:text-sm text-darkGray pt-2">
//                             View expense log records for this year.
//                         </p>
//                     </div>
//                 </div>  
//             </div>
//             <hr className="border-gray mb-7 sm:mb-9" /> 

           

//             <div className="mb-[1rem] flex flex-col justify-between gap-4">
//                 <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//                     <div className="relative flex-1">
//                         <Search
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                             size={17}
//                         />
//                         <Input 
//                             placeholder="Search..." 
//                             className="pl-10 w-full bg-white text-sm" 
//                             value={searchQuery}
//                             onChange={(e) => {
//                                 setSearchQuery(e.target.value);
//                                 setCurrentPage(1);
//                             }}
//                         />
//                     </div>
//                     <div className="flex flex-row gap-2 justify-center items-center">
//                         <SelectLayout
//                             className="bg-white" 
//                             placeholder="Month"
//                             value={selectedMonth} 
//                             options={monthOptions}
//                             onChange={(value) => {
//                                 setSelectedMonth(value);
//                                 setCurrentPage(1);
//                             }}
//                         />
//                     </div>                            
//                 </div>
//             </div>

//             <div className="bg-white">
//                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
//                     <div className="flex gap-x-2 items-center">
//                         <p className="text-xs sm:text-sm">Show</p>
//                         <Input 
//                             type="number" 
//                             className="w-14 h-8" 
//                             value={pageSize}
//                             onChange={(e) => {
//                                 const value = +e.target.value;
//                                 if (value >= 1) {
//                                     setPageSize(value);
//                                     setCurrentPage(1);
//                                 }
//                             }}
//                         />
//                         <p className="text-xs sm:text-sm">Entries</p>
//                     </div>

//                     <div>
//                         <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                                 <Button variant="outline">
//                                     <FileInput />
//                                     Export
//                                 </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent>
//                                 <DropdownMenuItem>Export as CSV</DropdownMenuItem>
//                                 <DropdownMenuItem>Export as Excel</DropdownMenuItem>
//                                 <DropdownMenuItem>Export as PDF</DropdownMenuItem>
//                             </DropdownMenuContent>
//                         </DropdownMenu>                    
//                     </div>
//                 </div>

//                 <Tabs value={activeTab} onValueChange={setActiveTab}>
//                     <div className='pl-5 pb-3'>
//                         <TabsList className="grid w-full grid-cols-2 max-w-xs">
//                             <TabsTrigger value="active">Active Entries</TabsTrigger>
//                             <TabsTrigger value="all">
//                                 <div className="flex items-center gap-2">
//                                     <Archive size={16} /> Archive
//                                 </div>
//                             </TabsTrigger>
//                         </TabsList>
//                     </div>

//                     <TabsContent value="active">
//                         <div className="border overflow-auto max-h-[400px]">
//                             <DataTable 
//                                 columns={activeColumns} 
//                                 data={paginatedData.filter(row => row.iet_is_archive === false)} 
//                             />
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="all">
//                         <div className="border overflow-auto max-h-[400px]">
//                             <HistoryTable columns={archiveColumns} data={paginatedData.filter(row => row.iet_is_archive == true)} />
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//             </div>

//             <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//                 <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//                     Showing {(currentPage - 1) * pageSize + 1}-
//                     {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//                     {filteredData.length} rows
//                 </p>
//                 {filteredData.length > 0 && (
//                     <PaginationLayout
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={setCurrentPage}
//                     />
//                 )}
//             </div>  
//         </div>
//     );
// }

// export default ExpenseLogMain;





    import React, { useState } from "react";
    import { DataTable } from "@/components/ui/table/data-table";
    import { Input } from "@/components/ui/input";
    import DialogLayout from "@/components/ui/dialog/dialog-layout";
    import { SelectLayout } from "@/components/ui/select/select-layout";
    import { Button } from "@/components/ui/button/button";
    import { ColumnDef } from "@tanstack/react-table";
    import { ArrowUpDown, Eye, Search, FileInput, CircleAlert } from 'lucide-react';
    import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
    import IncomeandExpenseEditForm from "../treasurer-expense-tracker-edit";
    import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
    import { Skeleton } from "@/components/ui/skeleton";
    import PaginationLayout from "@/components/ui/pagination/pagination-layout";
    import { useIncomeExpense, type IncomeExpense } from "../queries/treasurerIncomeExpenseFetchQueries";
    import { useIncomeExpenseMainCard } from "../queries/treasurerIncomeExpenseFetchQueries";
    import { useBudgetItems, type BudgetItem } from "../queries/treasurerIncomeExpenseFetchQueries";
    import { useLocation } from "react-router-dom";

    function ExpenseLogMain() {
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

        // Fetch data
        const location = useLocation();
        const year = location.state?.budYear;
        const { data: fetchedData = [], isLoading } = useIncomeExpense(year ? parseInt(year) : new Date().getFullYear());
        const { data: budgetItems = [] } = useBudgetItems(year);
        const { data: fetchIncData = [] } = useIncomeExpenseMainCard();

        const matchedYearData = fetchIncData.find(item => Number(item.ie_main_year) === Number(year));


        // Filter data - only show non-archived entries
        const filteredData = React.useMemo(() => {
            let result = fetchedData.filter(row => 
                row.iet_is_archive === false && 
                Number(row.iet_amount) > Number(row.iet_actual_amount) &&
                Number(row.iet_actual_amount) !== 0
            );
        
            if (selectedMonth !== "All") {
                result = result.filter(item => {
                    const month = item.iet_datetime?.slice(5, 7);
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
        const columns: ColumnDef<IncomeExpense>[] = [
            { 
                accessorKey: "iet_datetime",
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
                        {new Date(row.getValue("iet_datetime")).toLocaleString("en-US", {
                            timeZone: "UTC",
                            dateStyle: "medium",
                            timeStyle: "short"
                        })}
                    </div>
                )
            },
            { 
                accessorKey: "exp_budget_item", 
                header: "Particulars",
                cell: ({row}) => (
                    <div>{row.getValue("exp_budget_item")}</div>
                )
            },
            { 
                accessorKey: "iet_amount", 
                header: "Proposed Budget" ,
                cell: ({row}) => (
                    <div>₱{row.getValue("iet_amount")}</div>
                )
            },
            { 
                accessorKey: "iet_actual_amount", 
                header: "Actual Expense" ,
                cell: ({row}) => (
                    <div>₱{row.getValue("iet_actual_amount")}</div>
                )
            },              
            { 
                accessorKey: "iet_amount", 
                header: "Return Amount" ,
                cell: ({row}) => {
                    const amount = Number(row.original.iet_amount);
                    const actualAmount = Number(row.original.iet_actual_amount);
                    const difference = amount - actualAmount;
                    
                    return (
                        <div>₱{difference.toFixed(2)}</div>
                    );
                }
            },       
            {
                accessorKey: "files",
                header: "Supporting Documents",
                cell: ({row}) => {
                    const files = row.original.files;
                    const hasFiles = files && files.length > 0;
                    
                    return (
                        <div className="flex justify-center">
                            {hasFiles ? (
                                <DialogLayout
                                    trigger={<div className="bg-white hover:bg-[#f3f2f2] cursor-pointer text-[#1273B8] text-[12px] underline"> 
                                        View ({files.length})
                                    </div>}
                                    className="max-w-md max-h-[60%] overflow-auto p-6 flex flex-col"
                                    title="Attached Files"
                                    description="Files associated with this entry."
                                    mainContent={
                                        <div className="flex flex-col gap-4 p-5">
                                            {files.map((file) => (
                                                <div key={file.ief_id} className="border p-3 rounded-md">
                                                    <a 
                                                        href={file.ief_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                                    >
                                                        <FileInput size={16} />
                                                        Image {file.ief_name}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                />
                            ) : (
                                <div className="text-red-500 flex items-center gap-1">
                                    <CircleAlert size={16} />
                                    <span className="text-xs">no document</span>
                                </div>
                            )}
                        </div>
                    );
                }
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
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2 pt-2">
                                <div>Expense Log</div>
                            </h1>
                            <p className="text-xs sm:text-sm text-darkGray pt-2">
                                View expense log records for this year.
                            </p>
                        </div>
                    </div>  
                </div>
                <hr className="border-gray mb-7 sm:mb-9" /> 

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
        );
    }

    export default ExpenseLogMain;