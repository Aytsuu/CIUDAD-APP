import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ReceiptText, ArrowUpDown, Search, FileInput } from 'lucide-react';
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PersonalClearanceForm from "./treasurer-personalClearance-form";
import ReceiptForm from "./treasurer-create-receipt-form";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { format } from "date-fns";
import { getPersonalClearances } from "@/pages/record/treasurer/treasurer-clearance-requests/restful-api/personalClearanceGetAPI";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import { Skeleton } from "@/components/ui/skeleton";

const styles = {
    ViewFormLabelStyle: "font-semibold text-blue",
    ViewFormDataStyle: "font-medium text-darkGray"
};

type PersonalClearance = {
    cr_id: string;
    resident_details: {
        per_fname: string;
        per_lname: string;
    };
    cr_req_request_date: string;
    cr_req_claim_date: string;
    cr_req_payment_status: string;
    cr_req_status: string; 
    pr_id?: number;
    purpose?: {
        pr_purpose: string;
        pr_rate: string;
    };
    amount?: string;
};



function PersonalClearance() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState<"paid" | "unpaid">("unpaid");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: clearanceRequests, isLoading, error } = useQuery({
        queryKey: ["personalClearances", currentPage, pageSize],
        queryFn: () => getPersonalClearances(currentPage, pageSize)
    });

    useEffect(() => {
        if (clearanceRequests) {
            console.log("Personal clearances data:", clearanceRequests);
        }
    }, [clearanceRequests]);

    useEffect(() => {
        if (error) {
            console.error("Error fetching personal clearances:", error);
        }
    }, [error]);

    const filteredData = clearanceRequests?.results?.filter((item: PersonalClearance) => 
        activeTab === "paid" ? item.cr_req_payment_status === "Paid" : item.cr_req_payment_status !== "Paid"
    );

    // Apply pagination to filtered data
    const paginatedData = filteredData ? 
        filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : 
        [];

    const columns: ColumnDef<PersonalClearance>[] = [
        {
            accessorKey: "resident_details.per_fname",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Firstname
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({ row }) => <div>{row.original.resident_details.per_fname}</div>,
        },
        {
            accessorKey: "resident_details.per_lname",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Lastname
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({ row }) => <div>{row.original.resident_details.per_lname}</div>,
        },
        {
            accessorKey: "purpose.pr_purpose",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Purpose
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({ row }) => <div>{row.original.purpose?.pr_purpose || ""}</div>,
        },
        {
            accessorKey: "purpose.pr_rate",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({ getValue }) => {
                const value = Number(getValue());
                return (
                    <span className="text-green-600 font-semibold">
                        ₱{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                );
            },
        },
        { 
            accessorKey: "cr_req_request_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Requested
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="text-center">
                    {format(new Date(row.getValue("cr_req_request_date")), "MM-dd-yyyy")}
                </div>
            )
        },
        { 
            accessorKey: "cr_req_claim_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date to Claim
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="text-center">
                    {format(new Date(row.getValue("cr_req_claim_date")), "MM-dd-yyyy")}
                </div>
            )
        },
        { 
            accessorKey: "cr_req_payment_status",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Payment Status
                    <ArrowUpDown size={14}/>
                </div>
            ),
            cell: ({row}) => {
                const value = row.getValue("cr_req_payment_status") as string;
                let bg = "bg-[#ffeaea]";
                let text = "text-[#b91c1c]";
                let border = "border border-[#f3dada]";
                let label = value;

                if (value === "Paid") {
                    bg = "bg-[#eaffea]";
                    text = "text-[#15803d]";
                    border = "border border-[#b6e7c3]";
                    label = "Paid";
                } else if (value === "Pending") {
                    bg = "bg-[#fffbe6]";
                    text = "text-[#b59f00]";
                    border = "border border-[#f7e7b6]";
                    label = "Pending";
                }

                return (
                    <div className="text-center">
                        <span
                            className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
                            style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
                        >
                            {label}
                        </span>
                    </div>
                );
            }
        },

        
        { 
            accessorKey: "action", 
            header: "Action",
            cell: ({ row }) => {
                const data = row.original;
                
                return (
                    <div className="flex justify-center gap-1">
                        <TooltipLayout
                            trigger={
                                <DialogLayout
                                    trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                                    className="flex flex-col"
                                    title="Create Receipt"
                                    description="Enter the serial number to generate a receipt."
                                    mainContent={
                                        <ReceiptForm 
                                            // certificateRequest={{
                                            //     ...data,
                                            //     // req_type: data.purpose?.pr_purpose || 0 // Use req_purpose as primary, fallback to 0
                                            // }}
                                            // onSuccess={() => {}}
                                            // onCancel={() => {}}
                                            cr_id = {row.original.cr_id}
                                            purpose = {row.original.purpose?.pr_purpose}
                                            rate = {row.original.purpose?.pr_rate}
                                            firstname = {row.original.resident_details.per_fname}
                                            lastname = {row.original.resident_details.per_lname}
                                            pay_status = {row.original.cr_req_payment_status}
                                            pr_id = {row.original.pr_id}
                                            nat_col = "Certificate"
                                            onSuccess={() => setIsDialogOpen(false)}
                                        />
                                    } 
                                />
                            } 
                            content="Create Receipt"
                        />
                        <ConfirmationModal
                            trigger={
                                <Button variant="destructive" size="sm">
                                    Decline
                                </Button>
                            }
                            title="Decline Request"
                            description={`Are you sure you want to decline the request from ${data.resident_details.per_fname} ${data.resident_details.per_lname}?`}
                            actionLabel="Decline"
                            onClick={() => {
                                // Handle decline logic here
                                console.log("Declining request:", data.cr_id);
                            }}
                        />
                    </div>
                );
            }
        }
    ];

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    Personal Clearance Request
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Create, manage, and process personal clearance requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" />
                        </div>
                                                    
                    </div>
                    <div className="w-full sm:w-auto">
                        <DialogLayout
                            trigger={<Button className="w-full sm:w-auto">+ Create Request</Button>}
                            className=""
                            title="Create New Request"
                            description="Create a new request for personal clearance."
                            isOpen={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            mainContent={
                                <div className="w-full h-full">
                                    <PersonalClearanceForm onSuccess={() => setIsDialogOpen(false)} />
                                </div>
                            }
                        />
                    </div>
                </div>

                <div className="bg-white">
                                         <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
                         <div className="flex gap-x-4 items-center">
                             <div className="flex gap-x-2 items-center">
                                 <p className="text-xs sm:text-sm">Show</p>
                                 <Input 
                                     type="number" 
                                     className="w-14 h-8" 
                                     value={pageSize}
                                     onChange={(e) => setPageSize(Number(e.target.value))}
                                     min="1"
                                     max="100"
                                 />
                                 <p className="text-xs sm:text-sm">Entries</p>
                             </div>
                             
                             <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                                 <button
                                     onClick={() => setActiveTab("unpaid")}
                                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                                         activeTab === "unpaid"
                                             ? "bg-[#ffeaea] text-[#b91c1c] border-[#f3dada] shadow-sm"
                                             : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                     }`}
                                 >
                                     Unpaid
                                 </button>
                                 <button
                                     onClick={() => setActiveTab("paid")}
                                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                                         activeTab === "paid"
                                             ? "bg-[#eaffea] text-[#15803d] border-[#b6e7c3] shadow-sm"
                                             : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                     }`}
                                 >
                                     Paid
                                 </button>
                             </div>
                         </div>

                         <div>
                             <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                     <Button variant="outline">
                                         <FileInput className="mr-2" />
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

                    {isLoading ? (
                        <div className="rounded-md border">
                            <div className="p-6">
                                {/* Table header skeleton */}
                                <div className="grid grid-cols-6 gap-4 mb-4 pb-4 border-b">
                                    <Skeleton className="h-6 w-20 opacity-30" />
                                    <Skeleton className="h-6 w-20 opacity-30" />
                                    <Skeleton className="h-6 w-16 opacity-30" />
                                    <Skeleton className="h-6 w-24 opacity-30" />
                                    <Skeleton className="h-6 w-20 opacity-30" />
                                    <Skeleton className="h-6 w-16 opacity-30" />
                                </div>
                                
                                {/* Table rows skeleton */}
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="grid grid-cols-6 gap-4 items-center py-2">
                                            <Skeleton className="h-4 w-20 opacity-30" />
                                            <Skeleton className="h-4 w-20 opacity-30" />
                                            <Skeleton className="h-4 w-16 opacity-30" />
                                            <Skeleton className="h-4 w-20 opacity-30" />
                                            <Skeleton className="h-6 w-16 rounded-full opacity-30" />
                                            <div className="flex justify-center gap-1">
                                                <Skeleton className="h-8 w-8 rounded opacity-30" />
                                                <Skeleton className="h-8 w-8 rounded opacity-30" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                                         ) : (
                         <div className="rounded-md border">
                             <DataTable columns={columns} data={paginatedData || []} header={true} />
                         </div>
                     )}
                </div>

                                 <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                     <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                         Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredData?.length || 0)} of {filteredData?.length || 0} rows
                     </p>
 
                     <div className="w-full sm:w-auto flex justify-center">
                         <PaginationLayout
                             totalPages={Math.ceil((filteredData?.length || 0) / pageSize)}
                             currentPage={currentPage}
                             onPageChange={setCurrentPage}
                         />
                     </div>
                 </div>  
            </div>
        </div>
    );
}

export default PersonalClearance;