import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { ReceiptText, Search, FileInput } from 'lucide-react';
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ArrowUpDown } from "lucide-react";
import PermitClearanceForm from "./treasurer-permitClearance-form";
import ReceiptForm from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-permit-create-receipt-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import { getPermitClearances } from "./restful-api/permitClearanceGetAPI";
import { useQuery } from "@tanstack/react-query";
import { useGetPurposeAndRate } from "../Rates/queries/RatesFetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";


//table header
const createColumns = (purposes: any[]): ColumnDef<PermitClearance>[] => [
    { accessorKey: "businessName",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Business Name
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("businessName")}</div>
        )},
  
    { accessorKey: "grossSales", header: "Gross Sales"},
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => "Business Permit" 
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Amount
                <ArrowUpDown size={14}/>
            </div>
        ),
        cell: ({ row }) => {
            // Use the req_amount field from the backend
            const amount = row.original.req_amount || 0;
            
            return (
                <div className="text-center font-medium text-green-700">
                    ₱{amount.toLocaleString()}
                </div>
            );
        },
    },
   
    { accessorKey: "reqDate",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >Date Requested
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("reqDate")}</div>
        )
    },
    // {  accessorKey: "claimDate",
    //     header: ({ column }) => (
    //           <div
    //             className="flex w-full justify-center items-center gap-2 cursor-pointer"
    //             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //           >Date to Claim
    //             <ArrowUpDown size={14}/>
    //           </div>
    //     ),
    //     cell: ({row}) => (
    //         <div className="">{row.getValue("claimDate")}</div>
    //     )
    // },
    { accessorKey: "paymentStat", 
      header: "Payment Status",
      cell: ({ row }) => {
        const value = row.getValue("paymentStat") as string;
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
          bg = "bg-[#ffeaea]";
          text = "text-[#b91c1c]";
          border = "border border-[#f3dada]";
          label = "Pending";
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
    { accessorKey: "action", 
      header: "Action",
      cell: ({row}) =>(
        <div className="flex justify-center gap-0.5">
            <TooltipLayout
            trigger={
                <DialogLayout
                    trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                    className="flex flex-col"
                    title="Create Receipt"
                    description="Enter the serial number to generate a receipt."
                    mainContent={
                        <ReceiptForm 
                            certificateRequest={{
                                cr_id: row.original.bpr_id || "", // Use bpr_id instead of cr_id
                                req_type: "Permit Clearance",
                                req_purpose: "Business Permit", // Set fixed purpose for business clearance
                                resident_details: {
                                    per_fname: row.original.requestor || "",
                                    per_lname: ""
                                },
                                req_payment_status: row.original.req_payment_status || "Pending",
                                pr_id: row.original.pr_id,
                                business_name: row.original.businessName || "",
                                req_amount: row.original.req_amount || 0, // Pass the req_amount
                                req_sales_proof: row.original.req_sales_proof || "" // Pass the gross sales range
                            }}
                            onSuccess={() => {}}
                        />
                    } 
                />
            } content="Create Receipt"/>
            <ConfirmationModal
                trigger={
                    <Button variant="destructive" size="sm">
                        Decline
                    </Button>
                }
                title="Decline Request"
                description={`Are you sure you want to decline the request for ${row.original.businessName}?`}
                actionLabel="Decline"
                onClick={() => {
                    //decline
                    console.log("Declining request:", row.original.cr_id);
                }}
            />
        </div>
      )},
];


type PermitClearance = {
    businessName: string,
    address: string,
    grossSales: string,
    purposes: string[],
    requestor: string,
    reqDate: string,
    claimDate: string,
    paymentStat: "Paid" | "Pending",
    req_sales_proof?: string,
    req_purpose?: string,
    cr_id?: string,
    bpr_id?: string, // Add bpr_id field
    req_payment_status?: string,
    pr_id?: number,
    amount?: string, // Add amount field
    amount_to_pay?: number, // Add amount_to_pay field from backend
    req_amount?: number // Add req_amount field from backend
}

export const PermitClearanceRecords: PermitClearance[] = [
    {
        businessName: "Business Name",
        address: "Address",
        grossSales: "0.00",
        purposes: ["Lorem Ipsum"], 
        requestor: "Requestor",
        reqDate: "MM-DD-YYYY",
        claimDate: "MM-DD-YYYY",
        paymentStat: "Pending"
    },

]


function PermitClearance(){
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"paid" | "unpaid">("unpaid");
    
    // Fetch data from backend
    const { data: permitClearances, isLoading, error } = useQuery<any[]>({
        queryKey: ["permitClearances"],
        queryFn: getPermitClearances
    });

    // Fetch purpose and rates data for amount calculation
    const { data: purposes = [] } = useGetPurposeAndRate();

    const filteredData = (permitClearances || []).filter((item: any) => 
        activeTab === "paid" ? item.req_payment_status === "Paid" : item.req_payment_status !== "Paid"
    );

    // Map backend data to frontend columns
    const mappedData = (filteredData || []).map((item: any) => {
        // Calculate date to claim (7 days from request date)
        const requestDate = new Date(item.req_request_date);
        const claimDate = new Date(requestDate);
        claimDate.setDate(requestDate.getDate() + 7);
        
        return {
            businessName: item.business_name || "",
            address: item.business_address || "",
            grossSales: item.req_sales_proof || "", // Use req_sales_proof instead of business_gross_sales
            purposes: item.purposes || [],
            requestor: item.requestor || "",
            reqDate: item.req_request_date,
            claimDate: claimDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            paymentStat: item.req_payment_status,
            req_sales_proof: item.req_sales_proof,
            amount: item.amount_to_pay || 0, // Use amount_to_pay for amount column
            req_amount: item.req_amount || 0, // Include req_amount field
            bpr_id: item.bpr_id || "", // Include bpr_id field
            ...item
        };
    });

    return(
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Permit Clearance Requests</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Create, manage, and process permit clearance requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1"> {/* Increased max-width */}
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                                size={17}
                            />
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                        </div>
                                                    
                    </div>
                    <div className="w-full sm:w-auto">
                        <DialogLayout
                            trigger={<Button className="w-full sm:w-auto">+ Create Request</Button>}
                            className=""
                            title="Create New Request"
                            description="Create a new request for permit clearance."
                            isOpen={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            mainContent={
                                <div className="w-full h-full">
                                    <PermitClearanceForm onSuccess={() => setIsDialogOpen(false)} />
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
                                     <Input type="number" className="w-14 h-8" defaultValue="10" />
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

                    {isLoading ? (
                        <div className="space-y-4">
                            {/* Header skeleton */}
                            <div className="flex flex-col gap-3 mb-3">
                                <Skeleton className="h-8 w-1/4 opacity-30" />
                                <Skeleton className="h-5 w-2/3 opacity-30" />
                            </div>
                            <Skeleton className="h-[1px] w-full mb-5 opacity-30" />
                            
                            {/* Controls skeleton */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <Skeleton className="h-10 w-full sm:w-64 opacity-30" />
                                    <div className="flex flex-row gap-2 justify-center items-center">
                                        <Skeleton className="h-5 w-12 opacity-30" />
                                        <Skeleton className="h-10 w-32 opacity-30" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-48 opacity-30" />
                            </div>
                            
                            {/* Table skeleton */}
                            <div className="bg-white rounded-lg shadow-sm">
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {[...Array(5)].map((_, index) => (
                                            <div key={index} className="flex items-center space-x-4">
                                                <Skeleton className="h-4 w-32 opacity-30" />
                                                <Skeleton className="h-4 w-24 opacity-30" />
                                                <Skeleton className="h-4 w-20 opacity-30" />
                                                <Skeleton className="h-4 w-24 opacity-30" />
                                                <Skeleton className="h-4 w-16 opacity-30" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-8 w-20 rounded opacity-30" />
                                                    <Skeleton className="h-8 w-20 rounded opacity-30" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                    ) : (
                        <DataTable columns={createColumns(purposes)} data={mappedData} header={true}></DataTable>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing 1-10 of 150 rows
                    </p>

                    <div className="w-full sm:w-auto flex justify-center">
                        {/* <PaginationLayout className="" /> */}
                    </div>
                </div>  
            </div>
        </div>
    )
}

export default PermitClearance