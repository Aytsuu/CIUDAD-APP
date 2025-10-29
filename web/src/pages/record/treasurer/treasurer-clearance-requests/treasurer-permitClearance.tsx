import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { ReceiptText, Search, Ban, Eye, Clock, CheckCircle } from 'lucide-react';
import React, { useState,  useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ArrowUpDown } from "lucide-react";
import PermitClearanceForm from "./treasurer-permitClearance-form";
import ReceiptForm from "@/pages/record/treasurer/treasurer-clearance-requests/treasurer-permit-create-receipt-form";
import { useGetPermitClearances,useGetAnnualGrossSalesForPermit,useGetPurposesAndRates } from "./queries/permitClearanceFetchQueries";
import { Spinner } from "@/components/ui/spinner";
import { DocumentViewer } from "@/components/ui/document-viewer";
import { getBusinessPermitFiles } from "./restful-api/permitClearanceGetAPI";
import { useLoading } from "@/context/LoadingContext";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DeclineRequestForm from "./declineForm";


const BusinessPermitDocumentViewer = ({ bprId, businessName }: { bprId: string; businessName: string }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getBusinessPermitFiles(bprId);
        setFiles(response.files || []);
      } catch (err: any) {
        console.error("Error fetching files:", err);
        setError(err.message || "Failed to load documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [bprId]);

  const handleRetry = () => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getBusinessPermitFiles(bprId);
        setFiles(response.files || []);
      } catch (err: any) {
        console.error("Error fetching files:", err);
        setError(err.message || "Failed to load documents");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  };

  return (
    <DocumentViewer
      files={files.map(file => ({
        id: file.bpf_id,
        type: file.bpf_type,
        url: file.bpf_url
      }))}
      title={businessName}
      subtitle={`Business Permit ID: ${bprId}`}
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
    />
  );
};

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
            const businessGrossSales = row.original.businessGrossSales;
            const inputtedGrossSales = row.original.bus_clearance_gross_sales;
            
            // Priority 1: Show inputted gross sales (for new businesses with barangay clearance)
            if (inputtedGrossSales && agsId) {
                return (
                    <div className="text-center">
                        ₱{parseFloat(inputtedGrossSales.toString()).toLocaleString()}
                    </div>
                );
            }
            // Priority 2: Show business gross sales if available (for existing businesses)
            else if (businessGrossSales) {
                return (
                    <div className="text-center">
                        ₱{parseFloat(businessGrossSales.toString()).toLocaleString()}
                    </div>
                );
            }
            // Priority 3: Show annual gross sales range as fallback (for barangay clearance without inputted value)
            else if (grossSalesData && agsId) {
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
            const grossSalesData = row.original.grossSalesData;
            const purposeData = row.original.purposeData;
            const agsId = row.original.ags_id;
            
            let amount = 0;
            
            // If ags_id exists, it's a barangay clearance - use ags_rate
            if (agsId && grossSalesData) {
                amount = parseFloat(grossSalesData.ags_rate);
            } 
            // If no ags_id but has purposeData, it's a permit - use pr_rate
            else if (purposeData && !agsId) {
                amount = parseFloat(purposeData.pr_rate);
            }
            // Fallback to req_amount from backend
            else {
                amount = row.original.req_amount || 0;
            }
            
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
        const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
        let bg = "bg-[#eaf4ff]";
        let text = "text-[#2563eb]";
        let border = "border border-[#b6d6f7]";
        
        if (capitalizedValue === "Pending") {
            bg = "bg-[#fffbe6]";
            text = "text-[#b59f00]";
            border = "border border-[#f7e7b6]";
        } else if (capitalizedValue === "Paid") {
            bg = "bg-[#e6f7e6]";
            text = "text-[#16a34a]";
            border = "border border-[#d1f2d1]";
        } else if (capitalizedValue === "Declined") {
            bg = "bg-[#ffeaea]";
            text = "text-[#b91c1c]";
            border = "border border-[#f3dada]";
        } else {
            bg = "bg-[#f3f2f2]";
            text = "text-black";
            border = "border border-[#e5e7eb]";
        }

        return (
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
            style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
          >
            {capitalizedValue}
          </span>
        );
      }
    },
    ...(activeTab === "unpaid" ? [
        { accessorKey: "action", 
          header: "Action",
          cell: ({row}: {row: any}) =>(
            <div className="flex justify-center gap-0.5">
                {/* View Documents Icon - Always reserve space, show placeholder if no files */}
                {row.original.has_files ? (
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
                                mainContent={
                                    <BusinessPermitDocumentViewer 
                                        bprId={row.original.bpr_id} 
                                        businessName={row.original.businessName}
                                    />
                                } 
                            />
                        } 
                        content="View Documents"
                    />
                ) : (
                    <div className="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-2 rounded cursor-not-allowed">
                        <Eye size={16}/>
                    </div>
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
                                cr_id: row.original.bpr_id || "", // Keep for backward compatibility
                                bpr_id: row.original.bpr_id || "", // Add bpr_id field
                                req_type: "Permit Clearance",
                                req_purpose: row.original.purposeData ? row.original.purposeData.pr_purpose : "Business Permit", // Use actual purpose name
                                resident_details: {
                                    per_fname: row.original.requestor || "Unknown",
                                    per_lname: ""
                                },
                                req_payment_status: row.original.req_payment_status || "Pending",
                                pr_id: row.original.pr_id,
                                business_name: row.original.businessName && row.original.businessName !== "No Business Linked" ? row.original.businessName : row.original.requestor || "Unknown Business",
                                req_amount: (() => {
                                    const grossSalesData = row.original.grossSalesData;
                                    const purposeData = row.original.purposeData;
                                    const agsId = row.original.ags_id;
                                    
                                    // If ags_id exists, it's a barangay clearance - use ags_rate
                                    if (agsId && grossSalesData) {
                                        return parseFloat(grossSalesData.ags_rate);
                                    } 
                                    // If no ags_id but has purposeData, it's a permit - use pr_rate
                                    else if (purposeData && !agsId) {
                                        return parseFloat(purposeData.pr_rate);
                                    }
                                    // Fallback to req_amount from backend
                                    else {
                                        return row.original.req_amount || 0;
                                    }
                                })(),
                                // req_sales_proof field removed
                            }}
                            onSuccess={() => {}}
                        />
                    } 
                  />
              } content="Create Receipt"/>
                <DialogLayout
                    trigger={
                        <Button variant="destructive" size="sm">
                            Decline
                        </Button>
                    }
                    title="Decline Request"
                    description="Add a reason for declining."
                    mainContent={
                        <DeclineRequestForm
                            id={row.original.bpr_id}
                            isResident={false}
                            isPermitClearance={true}
                            onSuccess={() => {
                                // Data will be refreshed automatically by the mutation
                            }}
                        />
                    }
                />
            </div>
          )}
        ]
    : []),
    ...(activeTab === "declined" ? [
        {
            accessorKey: "bus_reason",
            header: "Reason for Decline",
            cell: ({ row }: { row: any }) => (
                <div className="text-center">
                    {row.original.bus_reason || "No reason provided"}
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
    // req_sales_proof field removed
    req_purpose?: string,
    cr_id?: string,
    bpr_id?: string, // Add bpr_id field
    has_files?: boolean, // Add has_files field to check if files exist
    req_payment_status?: string,
    pr_id?: number,
    ags_id?: number,
    amount?: string, // Add amount field
    amount_to_pay?: number, // Add amount_to_pay field from backend
    req_amount?: number, // Add req_amount field from backend
    grossSalesData?: any, // Add gross sales data
    purposeData?: any, // Add purpose data
    businessGrossSales?: number, // Add business gross sales for existing businesses
    bus_clearance_gross_sales?: number // Add inputted gross sales for new businesses
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
    const { showLoading, hideLoading } = useLoading();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"paid" | "unpaid" | "declined">("unpaid");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Fetch data from backend using custom hooks
    const { data: permitClearances, isLoading, error } = useGetPermitClearances(
        currentPage, 
        pageSize, 
        searchTerm, 
        '', 
        activeTab === "paid" ? "Paid" : activeTab === "unpaid" ? "Unpaid" : ""
    );
    const { data: annualGrossSalesResponse, isLoading: grossSalesLoading } = useGetAnnualGrossSalesForPermit();
    const { data: purposesResponse, isLoading: purposesLoading } = useGetPurposesAndRates();

    // Handle loading state
    React.useEffect(() => {
        if (isLoading || grossSalesLoading || purposesLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, grossSalesLoading, purposesLoading, showLoading, hideLoading]);

    // Extract arrays from paginated responses (handle both paginated and direct array responses)
    const annualGrossSales = Array.isArray(annualGrossSalesResponse) 
        ? annualGrossSalesResponse 
        : (annualGrossSalesResponse as any)?.results || [];
    const purposes = Array.isArray(purposesResponse) 
        ? purposesResponse 
        : (purposesResponse as any)?.results || [];


    // Handle paginated response
    const permitClearancesData = Array.isArray(permitClearances) 
        ? permitClearances 
        : (permitClearances as any)?.results || [];
    
    
    const totalCount = Array.isArray(permitClearances) 
        ? permitClearances.length 
        : (permitClearances as any)?.count || 0;
    
    const totalPages = Array.isArray(permitClearances) 
        ? 1 
        : Math.ceil(((permitClearances as any)?.count || 0) / pageSize);

    // Reset to page 1 when tab changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const filteredData = permitClearancesData.filter((item: any) => {
        if (activeTab === "declined") {
            // Show only declined/cancelled requests
            return item.req_status === "Declined" || item.req_status === "Cancelled";
        } else {
            // Filter out declined/cancelled requests for paid/unpaid tabs
            if (item.req_status === "Declined" || item.req_status === "Cancelled") {
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
            // req_sales_proof field removed
            amount: item.amount_to_pay || 0, // Use amount_to_pay for amount column
            req_amount: item.req_amount || 0, // Include req_amount field
            bpr_id: item.bpr_id || "", // Include bpr_id field
            has_files: item.has_files || false, // Include has_files field from API
            bus_reason: item.bus_reason || "", // Include declined reason
            ags_id: item.ags_id, // Include ags_id
            pr_id: item.pr_id, // Include pr_id
            grossSalesData: grossSalesData, // Include gross sales data
            purposeData: purposeData, // Include purpose data
            businessGrossSales: item.business_gross_sales || item.gross_sales, // Include business gross sales for existing businesses
            bus_clearance_gross_sales: item.bus_clearance_gross_sales, // Include inputted gross sales for new businesses
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
                            <Input 
                                placeholder="Search..." 
                                className="pl-10 w-full bg-white text-sm" 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page when searching
                                }}
                            /> {/* Adjust padding and text size */}
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
                                     <Input 
                                         type="number" 
                                         className="w-14 h-8" 
                                         value={pageSize}
                                         onChange={(e) => {
                                             setPageSize(parseInt(e.target.value) || 10);
                                             setCurrentPage(1); // Reset to first page when changing page size
                                         }}
                                     />
                                     <p className="text-xs sm:text-sm">Entries</p>
                                 </div>
                                 
                                 <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                                     <button
                                         onClick={() => setActiveTab("unpaid")}
                                         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                             activeTab === "unpaid"
                                                 ? "bg-[#fffbe6] text-[#b59f00] border-[#f7e7b6] shadow-sm"
                                                 : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                         }`}
                                     >
                                         <Clock size={14} />
                                         Unpaid
                                     </button>
                                     <button
                                         onClick={() => setActiveTab("paid")}
                                         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                             activeTab === "paid"
                                                 ? "bg-[#e6f7e6] text-[#16a34a] border-[#d1f2d1] shadow-sm"
                                                 : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                         }`}
                                     >
                                         <CheckCircle size={14} />
                                         Paid
                                     </button>
                                     <button
                                     onClick={() => setActiveTab("declined")}
                                     className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                         activeTab === "declined"
                                             ? "bg-[#ffeaea] text-[#b91c1c] border-[#f3dada] shadow-sm"
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
                        Showing {totalCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-
                        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
                    </p>

                    <div className="w-full sm:w-auto flex justify-center">
                        {totalCount > 0 && (
                            <PaginationLayout 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>  
            </div>
        </div>
    )
}

export default PermitClearance