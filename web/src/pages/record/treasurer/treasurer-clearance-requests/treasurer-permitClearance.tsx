import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { ReceiptText, Search, Ban, Eye } from 'lucide-react';
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ArrowUpDown } from "lucide-react";
import PermitClearanceForm from "./treasurer-permitClearance-form";
import ReceiptForm from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-permit-create-receipt-form";
import { useGetPermitClearances,useGetAnnualGrossSalesForPermit,useGetPurposesAndRates } from "./queries/permitClearanceFetchQueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Spinner } from "@/components/ui/spinner";
import { DocumentViewer } from "./components/DocumentViewer";


const createColumns = (activeTab: "paid" | "unpaid" | "declined"): ColumnDef<PermitClearance>[] => [
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
  
    { 
        accessorKey: "grossSales", 
        header: "Gross Sales",
        cell: ({ row }) => {
            const agsId = row.original.ags_id;
            const grossSalesData = row.original.grossSalesData;
            
            if (grossSalesData && agsId) {
                return (
                    <div className="text-center">
                        ₱{parseFloat(grossSalesData.ags_minimum).toLocaleString()} - ₱{parseFloat(grossSalesData.ags_maximum).toLocaleString()}
                    </div>
                );
            }
            return <div className="text-center">Not Set</div>;
        }
    },
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => {
            const prId = row.original.pr_id;
            const purposeData = row.original.purposeData;
            
            if (purposeData && prId) {
                return (
                    <div className="text-center">
                        {purposeData.pr_purpose}
                    </div>
                );
            }
            return <div className="text-center">Not Set</div>;
        }
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
            // Use the ags_rate from grossSalesData
            const grossSalesData = row.original.grossSalesData;
            const amount = grossSalesData ? parseFloat(grossSalesData.ags_rate) : 0;
            
            return (
                <div className="text-center font-medium text-green-700">
                    ₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    ...(activeTab === "unpaid" ? [
        { accessorKey: "action", 
          header: "Action",
          cell: ({row}: {row: any}) =>(
            <div className="flex justify-center gap-0.5">
                {/* View Documents Icon - Only show if bpf_id exists */}
                {row.original.bpf_id && (
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={
                                    <div className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 px-4 py-2 rounded cursor-pointer">
                                        <Eye size={16}/>
                                    </div>
                                }
                                className="max-w-6xl"
                                title="Business Permit Documents"
                                description={`View documents for ${row.original.businessName}`}
                                mainContent={
                                    <DocumentViewer 
                                        bprId={row.original.bpr_id} 
                                        businessName={row.original.businessName}
                                    />
                                } 
                            />
                        } 
                        content="View Documents"
                    />
                )}
                
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
                                    req_purpose: row.original.purposeData ? row.original.purposeData.pr_purpose : "Business Permit", // Use actual purpose name
                                    resident_details: {
                                        per_fname: row.original.requestor || "Unknown",
                                        per_lname: ""
                                    },
                                    req_payment_status: row.original.req_payment_status || "Pending",
                                    pr_id: row.original.pr_id,
                                    business_name: row.original.businessName && row.original.businessName !== "No Business Linked" ? row.original.businessName : row.original.requestor || "Unknown Business",
                                    req_amount: row.original.grossSalesData ? parseFloat(row.original.grossSalesData.ags_rate) : 0, // Pass the ags_rate
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
                        console.log("Declining request:", row.original.bpr_id);
                    }}
                />
            </div>
          )}
        ]
    : []),
    ...(activeTab === "declined" ? [
        {
            accessorKey: "req_declined_reason",
            header: "Reason for Decline",
            cell: ({ row }: { row: any }) => (
                <div className="text-center">
                    {row.original.req_declined_reason || "No reason provided"}
                </div>
            ),
        }
    ] : []),
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
    bpf_id?: number | null, // Add bpf_id field for document viewing
    req_payment_status?: string,
    pr_id?: number,
    ags_id?: number,
    amount?: string, // Add amount field
    amount_to_pay?: number, // Add amount_to_pay field from backend
    req_amount?: number, // Add req_amount field from backend
    grossSalesData?: any, // Add gross sales data
    purposeData?: any // Add purpose data
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
    const [activeTab, setActiveTab] = useState<"paid" | "unpaid" | "declined">("unpaid");
    
    // Fetch data from backend using custom hooks
    const { data: permitClearances, isLoading, error } = useGetPermitClearances();
    const { data: annualGrossSalesResponse } = useGetAnnualGrossSalesForPermit();
    const { data: purposesResponse } = useGetPurposesAndRates();

    // Extract arrays from paginated responses (handle both paginated and direct array responses)
    const annualGrossSales = Array.isArray(annualGrossSalesResponse) 
        ? annualGrossSalesResponse 
        : (annualGrossSalesResponse as any)?.results || [];
    const purposes = Array.isArray(purposesResponse) 
        ? purposesResponse 
        : (purposesResponse as any)?.results || [];

    // Debug: Log the raw API response
    console.log("Raw permit clearances data:", permitClearances);
    console.log("Annual gross sales response:", annualGrossSalesResponse);
    console.log("Annual gross sales array:", annualGrossSales);
    console.log("Purposes response:", purposesResponse);
    console.log("Purposes array:", purposes);

    // Fetch purpose and rates data for amount calculation
    // const { data: purposes = [] } = useGetPurposeAndRate();

    const filteredData = (permitClearances || []).filter((item: any) => {
        if (activeTab === "declined") {
            // Show only declined requests
            return item.req_status === "Declined";
        } else {
            // Filter out declined requests for paid/unpaid tabs
            if (item.req_status === "Declined") {
                return false;
            }
            
            // Then filter by payment status
            return activeTab === "paid" 
                ? item.req_payment_status === "Paid" 
                : item.req_payment_status !== "Paid";
        }
    });

    // Map backend data to frontend columns
    const mappedData = (filteredData || []).map((item: any) => {
        // Calculate date to claim (7 days from request date)
        const requestDate = new Date(item.req_request_date);
        const claimDate = new Date(requestDate);
        claimDate.setDate(requestDate.getDate() + 7);
        
        // Find related data
        const grossSalesData = annualGrossSales.find((ags: any) => ags.ags_id === item.ags_id);
        const purposeData = purposes.find((purpose: any) => purpose.pr_id === item.pr_id);
        
        return {
            businessName: item.business_name || item.bus_permit_name || "No Business Linked",
            address: item.business_address || item.bus_permit_address || "No Address",
            grossSales: item.business_gross_sales || "Not Set", 
            purposes: item.purposes || [],
            requestor: item.requestor || "Unknown",
            reqDate: item.req_request_date,
            claimDate: claimDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            paymentStat: item.req_payment_status,
            req_sales_proof: item.business_gross_sales || "Not Set",
            amount: item.amount_to_pay || 0, // Use amount_to_pay for amount column
            req_amount: item.req_amount || 0, // Include req_amount field
            bpr_id: item.bpr_id || "", // Include bpr_id field
            bpf_id: item.bpf_id || null, // Include bpf_id field for document viewing
            req_declined_reason: item.req_declined_reason || "", // Include declined reason
            ags_id: item.ags_id, // Include ags_id
            pr_id: item.pr_id, // Include pr_id
            grossSalesData: grossSalesData, // Include gross sales data
            purposeData: purposeData, // Include purpose data
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
                                     <button
                                     onClick={() => setActiveTab("declined")}
                                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-1 ${
                                         activeTab === "declined"
                                             ? "bg-[#f3f3f3] text-[#6b7280] border-[#e5e7eb] shadow-sm"
                                             : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                     }`}
                                 >
                                     <Ban size={14} />
                                     Declined
                                 </button>
                                 </div>
                             </div>
                     </div>    

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                    ) : (
                        <DataTable columns={createColumns(activeTab)} data={mappedData} header={true}></DataTable>
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