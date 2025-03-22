import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash, Eye, Search, FileInput, Plus } from 'lucide-react';
import { Label } from "@/components/ui/label";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import IncomeandExpenseCreateForm from "./treasurer-income-expense-tracker-create";
import IncomeandExpenseEditForm from "./treasurer-income-expense-tracker-edit";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { getIncomeExpense } from "./request/income-ExpenseTrackingGetRequest"; 
import { deleteIncomeExpense } from "./request/income-ExpenseTrackingDeleteRequest";

// Define the type for the data
type IncomeExpense = {
    iet_num: number;
    iet_serial_num: string;
    iet_date: string;
    iet_particulars: string;
    iet_amount: number;
    iet_entryType: "Income" | "Expense";
    iet_receiver: string;
    iet_additional_notes: string;
    iet_receipt_image: string;
};



function IncomeandExpenseTracking() {
    const [data, setData] = useState<IncomeExpense[]>([]); // Initialize with an empty array
    const [loading, setLoading] = useState(true); // Add a loading state
    const [error, setError] = useState<string | null>(null);// Add an error state


    // Fetch data from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getIncomeExpense();
                setData(result); // Store the fetched data in state
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Please try again."); // Set error message
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleDelete = async (iet_num: number) => {
        try {
            await deleteIncomeExpense(iet_num);
            setData((prevData) => prevData.filter((item) => item.iet_num !== iet_num)); // Remove the deleted row
        } catch (err) {
            console.error("Failed to delete entry:", err);
        }
    };

    // Define the columns for the table
    const columns: ColumnDef<IncomeExpense>[] = [
        { 
            accessorKey: "iet_serial_num",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Serial No.
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="text-center">{row.getValue("iet_serial_num")}</div>
            )
        },
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
        { accessorKey: "iet_particulars", header: "Particulars" },
        { accessorKey: "iet_amount", header: "Amount" },
        { accessorKey: "iet_entryType", header: "Entry Type" },
        { accessorKey: "iet_receiver", header: "Receiver" },
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
                            <div className="max-h-[80vh] flex flex-col">
                                <img
                                    src={row.getValue("iet_receipt_image")}
                                    alt="Receipt"
                                    className="w-full h-auto"
                                />
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
                                description="Update income or expense details to keep records accurate."
                                mainContent={
                                    <div className="flex flex-col">
                                        <IncomeandExpenseEditForm 
                                            iet_num={row.original.iet_num} 
                                            iet_serial_num={row.original.iet_serial_num}
                                            iet_entryType={row.original.iet_entryType}
                                            iet_amount={String(row.original.iet_amount)}
                                            iet_particulars={row.original.iet_particulars}
                                            iet_receiver={row.original.iet_receiver}
                                            iet_additional_notes={row.original.iet_additional_notes}
                                        />
                                    </div>
                                }
                            />
                        }  
                        content="View"
                    />
                    <TooltipLayout 
                        trigger={
                            <div className="flex items-center h-8">
                                <div 
                                    className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"
                                    onClick={() => handleDelete(row.original.iet_num)} 
                                >
                                    <Trash size={16} />
                                </div>
                            </div>                   
                        }  
                        content="Delete"
                    />
                </div>
            )
        }
    ];


    // Filter options
    const filter = [
        { id: "All", name: "All" },
        { id: "Income", name: "Income" },
        { id: "Expense", name: "Expense" }
    ];
    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

    // Filter the data based on the selected filter
    const filteredData = selectedFilter === "All" 
        ? data 
        : data.filter((item) => item.iet_entryType === selectedFilter);

    // Show loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Show error state
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Income and Expense Tracking</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Gain clear insights into your finances by tracking income and expenses in real time.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="mb-[1rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <Label>Filter: </Label>
                        <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="Entry Type" onChange={setSelectedFilter}></SelectLayout>
                    </div>                            
                </div>
                <DialogLayout
                    trigger={<div className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-4 py-2 rounded cursor-pointer"><Plus size={15} strokeWidth={3}></Plus>New Entry </div>}
                    className="max-w-md max-h-[530px] overflow-auto p-10"
                    title="Add New Entry"
                    description="Fill in the details for your entry."
                    mainContent={
                        <div className="w-full h-full">
                            <IncomeandExpenseCreateForm/>
                        </div>
                    }
                />
            </div>

            <div className="bg-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
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

                <DataTable columns={columns} data={filteredData}></DataTable>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing 1-10 of {data.length} rows
                </p>
                <div className="w-full sm:w-auto flex justify-center">
                    {/* <PaginationLayout className="" /> */}
                </div>
            </div>  
        </div>
    );
}

export default IncomeandExpenseTracking;