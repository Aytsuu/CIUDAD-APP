import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Eye, ReceiptText, Trash, ArrowUpDown, Search, FileInput } from 'lucide-react';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import PersonalClearanceForm from "./treasurer-personalClearance-form";
import ReceiptForm from "./treasurer-create-receipt-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { format } from "date-fns";
import { getPersonalClearances } from "./restful-api/personalClearanceGetAPI";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

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
    req_type: string;
    req_request_date: string;
    req_claim_date: string;
    req_payment_status: string;
    req_pay_method: string;
    req_transac_id: string;
};

export const columns: ColumnDef<PersonalClearance>[] = [
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
        accessorKey: "req_type",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Purpose
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("req_type")}</div>,
    },
    { 
        accessorKey: "req_request_date",
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
                {format(new Date(row.getValue("req_request_date")), "MM-dd-yyyy")}
            </div>
        )
    },
    { 
        accessorKey: "req_claim_date",
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
                {format(new Date(row.getValue("req_claim_date")), "MM-dd-yyyy")}
            </div>
        )
    },
    {
        accessorKey: "req_pay_method",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Payment Method
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("req_pay_method")}</div>,
    },
    { 
        accessorKey: "req_payment_status",
        header: "Payment Status",
        cell: ({ row }) => {
            const paymentStatus = row.original.req_payment_status as string;
            let bg = "bg-[#ffeaea]";
            let text = "text-[#b91c1c]";
            let border = "border border-[#f3dada]";
            let label = paymentStatus;

            if (paymentStatus === "Paid") {
                bg = "bg-[#eaffea]";
                text = "text-[#15803d]";
                border = "border border-[#b6e7c3]";
                label = "Paid";
            } else if (paymentStatus === "Pending") {
                bg = "bg-[#ffeaea]";
                text = "text-[#b91c1c]";
                border = "border border-[#f3dada]";
                label = "Pending";
            } else if (paymentStatus === "Failed") {
                bg = "bg-[#ffeaea]";
                text = "text-[#b91c1c]";
                border = "border border-[#f3dada]";
                label = "Failed";
            }

            return (
                <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
                    style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
                >
                    {label}
                </span>
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
                                trigger={
                                    <Button asChild variant="outline" size="icon" className="bg-white hover:bg-[#f3f2f2] border text-black">
                                        <div><Eye size={16} /></div>
                                    </Button>
                                }
                                className="max-w-[50%] h-2/3 flex flex-col"
                                title="Request Details"
                                description="Detailed overview of the request."
                                mainContent={
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-3">
                                            <Label className={styles.ViewFormLabelStyle}>Requestor:</Label>
                                            <Label className={styles.ViewFormDataStyle}>
                                                {`${data.resident_details.per_fname} ${data.resident_details.per_lname}`}
                                            </Label>

                                            <Label className={styles.ViewFormLabelStyle}>Purpose:</Label>
                                            <Label className={styles.ViewFormDataStyle}>{data.req_type}</Label>

                                            <Label className={styles.ViewFormLabelStyle}>Date Requested:</Label>
                                            <Label className={styles.ViewFormDataStyle}>
                                                {format(new Date(data.req_request_date), "MMMM dd, yyyy")}
                                            </Label>

                                            <Label className={styles.ViewFormLabelStyle}>Date to Claim:</Label>
                                            <Label className={styles.ViewFormDataStyle}>
                                                {format(new Date(data.req_claim_date), "MMMM dd, yyyy")}
                                            </Label>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <Label className={styles.ViewFormLabelStyle}>Payment Method:</Label>
                                            <Label className={styles.ViewFormDataStyle}>{data.req_pay_method}</Label>

                                            <Label className={styles.ViewFormLabelStyle}>Payment Status:</Label>
                                            <Label className={styles.ViewFormDataStyle}>{data.req_payment_status}</Label>
                                        </div>
                                    </div>
                                }
                            />
                        } 
                        content="View"
                    />
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={
                                    <Button asChild variant="outline" size="icon" className="bg-white hover:bg-[#f3f2f2] border text-black">
                                        <div><ReceiptText size={16}/></div>
                                    </Button>
                                }
                                className="flex flex-col"
                                title="Create Receipt"
                                description="Enter the serial number to generate a receipt."
                                mainContent={<ReceiptForm/>} 
                            />
                        } 
                        content="Create Receipt"
                    />
                    <TooltipLayout 
                        trigger={
                            <DialogLayout
                                trigger={
                                    <Button asChild variant="destructive" size="icon">
                                        <div><Trash size={16} /></div>
                                    </Button>
                                }
                                className="max-w-[50%] h-2/3 flex flex-col"
                                title="Delete Request"
                                description="Are you sure you want to delete this request?"
                                mainContent={
                                    <div className="flex flex-col gap-4">
                                        <p>This action cannot be undone.</p>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline">Cancel</Button>
                                            <Button variant="destructive">Delete</Button>
                                        </div>
                                    </div>
                                }
                            />
                        }  
                        content="Delete"
                    />
                </div>
            );
        }
    }
];

function PersonalClearance() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState("All");

    const { data: clearanceRequests, isLoading, error } = useQuery({
        queryKey: ["personalClearances"],
        queryFn: getPersonalClearances
    });

    const filterOptions = [
        { id: "All", name: "All" },
        { id: "Pending", name: "Pending" },
        { id: "Paid", name: "Paid" },
        { id: "Failed", name: "Failed" }
    ];

    const filteredData = selectedFilter === "All" 
        ? clearanceRequests 
        : clearanceRequests?.filter((item: PersonalClearance) => 
            item.req_payment_status === selectedFilter
        );

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
                        <div className="flex flex-row gap-2 justify-center items-center">
                            <Label>Filter: </Label>
                            <SelectLayout 
                                className="bg-white" 
                                options={filterOptions}
                                placeholder="Filter" 
                                value={selectedFilter} 
                                label="Payment Status" 
                                onChange={setSelectedFilter}
                            />
                        </div>                            
                    </div>
                    <div className="w-full sm:w-auto">
                        <DialogLayout
                            trigger={<Button className="w-full sm:w-auto">+ Create Request</Button>}
                            className=""
                            title="Create New Request"
                            description="Create a new request for personal clearance."
                            mainContent={
                                <div className="w-full h-full">
                                    <PersonalClearanceForm/>
                                </div>
                            }
                        />
                    </div>
                </div>

                <div className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
                        <div className="flex gap-x-2 items-center">
                            <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" defaultValue="10" />
                            <p className="text-xs sm:text-sm">Entries</p>
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
                        <div className="text-center py-4">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                    ) : (
                        <div className="rounded-md border">
                            <DataTable columns={columns} data={filteredData || []} header={true} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, filteredData?.length || 0)} of {filteredData?.length || 0} rows
                    </p>

                    <div className="w-full sm:w-auto flex justify-center">
                        <PaginationLayout
                            totalPages={Math.ceil((filteredData?.length || 0) / 10)}
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