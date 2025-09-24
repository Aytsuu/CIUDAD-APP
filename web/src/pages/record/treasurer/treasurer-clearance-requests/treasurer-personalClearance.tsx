import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ReceiptText, ArrowUpDown, Search, User, Users, CircleCheck, Ban } from 'lucide-react';
import { useState, useEffect } from "react";
import PersonalClearanceForm from "./treasurer-personalClearance-form";
import ReceiptForm from "./treasurer-create-receipt-form";
import DiscountAuthorizationForm from "./treasurer-discount-form";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetNonResidentCertReq, type NonResidentReq, usegetResidentCertReq, type ResidentReq } from "./queries/CertClearanceFetchQueries";
import DeclineRequestForm from "./declineForm";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

function PersonalClearance() {
    // const { user } = useAuth();

    const [currentPage, setCurrentPage] = useState(1); 
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState<"paid" | "unpaid" | "declined">("unpaid");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [residentType, setResidentType] = useState<"resident" | "non-resident">("resident");
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [appliedDiscountAmount, setAppliedDiscountAmount] = useState<string | undefined>(undefined);
    const [appliedDiscountReason, setAppliedDiscountReason] = useState<string | undefined>(undefined);
    const [currentReceipt, setCurrentReceipt] = useState<{ 
        id: string;
        purpose: string | undefined;
        rate: string | undefined;
        requester: string;
        pay_status: string;
        nat_col: string;
        is_resident: boolean;
        voter_id?: number | string | null;
        isSeniorEligible?: boolean;
        hasDisabilityEligible?: boolean;
    } | null>(null);

    const {data: nonResidentClearanceRequests = [], isLoading: nonResidentLoading, error: nonResidentError} = useGetNonResidentCertReq();
    const {data: residentClearanceRequests = [], isLoading: residentLoading, error: residentError} = usegetResidentCertReq();

    console.log('resident', residentClearanceRequests)
    
    // Select data based on resident type
    const clearanceRequests = residentType === "non-resident" ? nonResidentClearanceRequests : residentClearanceRequests;
    const isLoading = residentType === "non-resident" ? nonResidentLoading : residentLoading;
    const error = residentType === "non-resident" ? nonResidentError : residentError;

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

    const filteredData = clearanceRequests?.filter((item: NonResidentReq | ResidentReq) => {
        if (activeTab === "declined") {
            // Show only declined requests
            return residentType === "non-resident" 
                ? (item as NonResidentReq).nrc_req_status === "Declined"
                : (item as ResidentReq).cr_req_status === "Declined";
        } else {
            // Filter out declined requests for paid/unpaid tabs
            const isDeclined = residentType === "non-resident" 
                ? (item as NonResidentReq).nrc_req_status === "Declined"
                : (item as ResidentReq).cr_req_status === "Declined";
            
            if (isDeclined) {
                return false;
            }
            
            // Then filter by payment status
            const paymentStatus = residentType === "non-resident" 
                ? (item as NonResidentReq).nrc_req_payment_status 
                : (item as ResidentReq).cr_req_payment_status;
                
            return activeTab === "paid" 
                ? paymentStatus === "Paid" 
                : paymentStatus !== "Paid";
        }
    });

    // Apply pagination to filtered data
    const paginatedData = filteredData ? 
        filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : 
        [];

    // Non-Resident Columns
    const nonResidentColumns: ColumnDef<NonResidentReq>[] = [
        {
            accessorKey: "nrc_requester",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Requester
                    <ArrowUpDown size={14} />
                </div>
            ),
        },
        {
            accessorKey: "purpose.pr_purpose",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Purpose
                    <ArrowUpDown size={14} />
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
                    <ArrowUpDown size={14} />
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
            accessorKey: "nrc_req_date",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date Requested
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    {format(new Date(row.getValue("nrc_req_date")), "MM-dd-yyyy")}
                </div>
            ),
        },
        ...(activeTab === "unpaid" ? [
            {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }: { row: Row<NonResidentReq> }) => (
                    <div className="flex justify-center gap-1">
                        <TooltipLayout
                            trigger={
                                <div
                                    className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"
                                    onClick={() => {
                                        setCurrentReceipt({
                                            id: row.original.nrc_id,
                                            purpose: row.original.purpose?.pr_purpose,
                                            rate: row.original.purpose?.pr_rate,
                                            requester: row.original.nrc_requester,
                                            pay_status: row.original.nrc_req_payment_status,
                                            nat_col: String(((row.original as any)?.pr_id) ?? (row.original as any)?.purpose?.pr_id ?? ''),
                                            is_resident: false
                                        });
                                        // Ensure discount modal is closed when opening receipt
                                        setIsDiscountModalOpen(false);
                                        setAppliedDiscountAmount(undefined);
                                        setIsReceiptModalOpen(true);
                                    }}
                                >
                                    <ReceiptText size={16} />
                                </div>
                            }
                            content="Create Receipt"
                        />
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
                                    id = {row.original.nrc_id}
                                    isResident = {false}
                                    onSuccess={() => setIsDialogOpen(false)}
                                />
                            }
                        />
                    </div>
                ),
            }
        ] : []),
        ...(activeTab === "declined" ? [
            {
                accessorKey: "nrc_req_declined_reason",
                header: "Reason for Decline",
                cell: ({ row }: { row: Row<NonResidentReq> }) => (
                    <div className="text-center">
                        {row.original.nrc_reason || "No reason provided"}
                    </div>
                ),
            }
        ] : []),
    ];

    // Resident Columns
    const residentColumns: ColumnDef<ResidentReq>[] = [
        {
            accessorKey: "resident_details",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Requester
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div>{`${row.original.resident_details.per_fname} ${row.original.resident_details.per_lname}`}</div>
            ),
        },
        {
            accessorKey: "purpose.pr_purpose",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Purpose
                    <ArrowUpDown size={14} />
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
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => {
                const isFree = Boolean((row.original as any)?.resident_details?.voter_id);
                const raw = row.original.purpose ? Number(row.original.purpose.pr_rate) : 0;
                const value = isFree ? 0 : raw;
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
                    <ArrowUpDown size={14} />
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center">
                    {format(new Date(row.original.cr_req_request_date), "MM-dd-yyyy")}
                </div>
            ),
        },
        ...(activeTab === "unpaid" ? [
            {
                accessorKey: "action",
                header: "Action",
                cell: ({ row }: { row: Row<ResidentReq> }) => {
                    const isFree = Boolean((row.original as any)?.resident_details?.voter_id);
                    return (
                        <div className="flex justify-center gap-1">
                            {isFree ? (
                                <TooltipLayout
                                    trigger={
                                        <div 
                                            className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"
                                            onClick={() => {
                                                const dobStr = (row.original as any)?.resident_details?.per_dob ? String((row.original as any)?.resident_details?.per_dob) : '';
                                                let isSenior = false;
                                                if (dobStr) {
                                                    try {
                                                        const dob = new Date(dobStr);
                                                        if (!isNaN(dob.getTime())) {
                                                            const today = new Date();
                                                            let age = today.getFullYear() - dob.getFullYear();
                                                            const m = today.getMonth() - dob.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                                                            isSenior = age >= 60;
                                                        }
                                                    } catch {}
                                                }
                                                const disabilityRaw = (row.original as any)?.resident_details?.per_disability;
                                                const hasDisability = disabilityRaw !== null && disabilityRaw !== undefined && String(disabilityRaw).trim() !== '';
                                                setCurrentReceipt({
                                                    id: row.original.cr_id,
                                                    purpose: row.original.purpose?.pr_purpose,
                                                    rate: "0",
                                                    requester: `${row.original.resident_details.per_fname} ${row.original.resident_details.per_lname}`,
                                                    pay_status: row.original.cr_req_payment_status,
                                                    nat_col: String(((row.original as any)?.pr_id) ?? (row.original as any)?.purpose?.pr_id ?? ''),
                                                    is_resident: true,
                                                    voter_id: (row.original as any)?.resident_details?.voter_id ?? null,
                                                    isSeniorEligible: isSenior,
                                                    hasDisabilityEligible: hasDisability
                                                });
                                                setIsDiscountModalOpen(false);
                                                setAppliedDiscountAmount(undefined);
                                                setIsReceiptModalOpen(true);
                                            }}
                                        >
                                            <CircleCheck size={16} color="green"/>
                                        </div>
                                    }
                                    content="Accept (Free)"
                                />
                            ) : (
                                <TooltipLayout
                                    trigger={
                                        <div 
                                            className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"
                                            onClick={() => {
                                                const dobStr = (row.original as any)?.resident_details?.per_dob ? String((row.original as any)?.resident_details?.per_dob) : '';
                                                let isSenior = false;
                                                if (dobStr) {
                                                    try {
                                                        const dob = new Date(dobStr);
                                                        if (!isNaN(dob.getTime())) {
                                                            const today = new Date();
                                                            let age = today.getFullYear() - dob.getFullYear();
                                                            const m = today.getMonth() - dob.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                                                            isSenior = age >= 60;
                                                        }
                                                    } catch {}
                                                }
                                                const disabilityRaw = (row.original as any)?.resident_details?.per_disability;
                                                const hasDisability = disabilityRaw !== null && disabilityRaw !== undefined && String(disabilityRaw).trim() !== '';
                                                setCurrentReceipt({
                                                    id: row.original.cr_id,
                                                    purpose: row.original.purpose?.pr_purpose,
                                                    rate: row.original.purpose?.pr_rate,
                                                    requester: `${row.original.resident_details.per_fname} ${row.original.resident_details.per_lname}`,
                                                    pay_status: row.original.cr_req_payment_status,
                                                    nat_col: String(((row.original as any)?.pr_id) ?? (row.original as any)?.purpose?.pr_id ?? ''),
                                                    // Paid resident without voter_id should still be treated as resident
                                                    is_resident: true,
                                                    voter_id: (row.original as any)?.resident_details?.voter_id ?? null,
                                                    isSeniorEligible: isSenior,
                                                    hasDisabilityEligible: hasDisability
                                                });
                                                setIsDiscountModalOpen(false);
                                                setAppliedDiscountAmount(undefined);
                                                setIsReceiptModalOpen(true);
                                            }}
                                        >
                                            <ReceiptText size={16} />
                                        </div>
                                    }
                                    content="Create Receipt"
                                />
                            )}

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
                                        id = {row.original.cr_id}
                                        isResident={true}
                                        onSuccess={() => setIsDialogOpen(false)}
                                    />
                                }
                            />
                        </div>
                    );
                },
            }
        ] : []),
        ...(activeTab === "declined" ? [
            {
                accessorKey: "cr_req_declined_reason",
                header: "Reason for Decline",
                cell: ({ row }: { row: Row<ResidentReq> }) => (
                    <div className="text-center">
                        {row.original.cr_reason || "No reason provided"}
                    </div>
                ),
            }
        ] : []),
    ];

    // Select the appropriate columns based on resident type
    const columns = residentType === "non-resident" 
        ? nonResidentColumns 
        : residentColumns;

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
                        
                        {/* Toggle Button between Resident and Non-Resident */}
                        <div className="flex bg-white rounded-lg p-1 border border-gray-300">
                            <button
                                onClick={() => setResidentType("resident")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                    residentType === "resident"
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                }`}
                            >
                                <User size={16} />
                                Resident
                            </button>

                            <button
                                onClick={() => setResidentType("non-resident")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                    residentType === "non-resident"
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                }`}
                            >
                                <Users size={16} />
                                Non-Resident
                            </button>
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
                                    <PersonalClearanceForm 
                                        onSuccess={() => setIsDialogOpen(false)} 
                                    />
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
                        <div className="rounded-md border">
                            <div className="p-6">
                                {/* Table header skeleton */}
                                <div className={`grid ${activeTab === "unpaid" ? "grid-cols-6" : activeTab === "paid" ? "grid-cols-5" : "grid-cols-5"} gap-4 mb-4 pb-4 border-b`}>
                                    <Skeleton className="h-6 w-20 opacity-30" />
                                    <Skeleton className="h-6 w-20 opacity-30" />
                                    <Skeleton className="h-6 w-16 opacity-30" />
                                    <Skeleton className="h-6 w-24 opacity-30" />
                                    {activeTab !== "declined" && <Skeleton className="h-6 w-20 opacity-30" />}
                                    {activeTab === "unpaid" && <Skeleton className="h-6 w-16 opacity-30" />}
                                    {activeTab === "declined" && <Skeleton className="h-6 w-24 opacity-30" />}
                                </div>
                                
                                {/* Table rows skeleton */}
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className={`grid ${activeTab === "unpaid" ? "grid-cols-6" : activeTab === "paid" ? "grid-cols-5" : "grid-cols-5"} gap-4 items-center py-2`}>
                                            <Skeleton className="h-4 w-20 opacity-30" />
                                            <Skeleton className="h-4 w-20 opacity-30" />
                                            <Skeleton className="h-4 w-16 opacity-30" />
                                            <Skeleton className="h-4 w-20 opacity-30" />
                                            {activeTab !== "declined" && <Skeleton className="h-6 w-16 rounded-full opacity-30" />}
                                            {activeTab === "unpaid" && (
                                                <div className="flex justify-center gap-1">
                                                    <Skeleton className="h-8 w-8 rounded opacity-30" />
                                                    <Skeleton className="h-8 w-8 rounded opacity-30" />
                                                </div>
                                            )}
                                            {activeTab === "declined" && <Skeleton className="h-4 w-32 opacity-30" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                    ) : (
                         <div className="rounded-md border">
                             <DataTable 
                                 columns={columns} 
                                 data={paginatedData as any[]} 
                                 header={true} 
                             /> 
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

            {/* Receipt Modal */}
            <DialogLayout
                trigger={<></>}
                isOpen={isReceiptModalOpen}
                onOpenChange={setIsReceiptModalOpen}
                title="Create Receipt"
                description="Enter the serial number to generate a receipt."
                className="flex flex-col"
                mainContent={
                    currentReceipt && (
                        <ReceiptForm
                            {...currentReceipt}
                            discountedAmount={appliedDiscountAmount}
                            discountReason={appliedDiscountReason}
                            onComplete={() => {
                                
                                setIsReceiptModalOpen(false);
                            }}
                            onRequestDiscount={() => {
                                setIsReceiptModalOpen(false);
                                setIsDiscountModalOpen(true);
                            }}
                        />
                    )
                }
            />

            {/* Discount Modal */}
            <DialogLayout
                trigger={<></>}
                isOpen={isDiscountModalOpen}
                onOpenChange={(open) => {
                    console.log('Discount modal onOpenChange:', open);
                    setIsDiscountModalOpen(open);
                    // Note: Receipt form opening is now handled directly in onAuthorize and onCancel handlers
                }}
                title="Authorize Discount"
                description="Enter authorization code to apply a discount"
                mainContent={
                    currentReceipt && (
                        <DiscountAuthorizationForm
                            originalAmount={currentReceipt.rate}
                            onAuthorize={(amount: string, reason: string) => {
                                console.log('Discounted amount applied:', amount);
                                console.log('Discount reason:', reason);
                                setAppliedDiscountAmount(amount);
                                setAppliedDiscountReason(reason);
                                console.log('Setting discount amount and showing receipt form');
                                setIsDiscountModalOpen(false);
                                // Use setTimeout to ensure the discount modal closes before opening receipt modal
                                setTimeout(() => {
                                    setIsReceiptModalOpen(true);
                                }, 100);
                            }}
                            onCancel={() => {
                                console.log('Discount cancelled, showing receipt form');
                                setAppliedDiscountAmount(undefined);
                                setAppliedDiscountReason(undefined);
                                setIsDiscountModalOpen(false);
                                setTimeout(() => {
                                    setIsReceiptModalOpen(true);
                                }, 100);
                            }}
                        />
                    )
                }
            />

        </div>
    );
}

export default PersonalClearance;