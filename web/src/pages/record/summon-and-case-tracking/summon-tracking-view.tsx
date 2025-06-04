import { DataTable } from "@/components/ui/table/data-table";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Check, AlertTriangle} from 'lucide-react'
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FileInput } from "lucide-react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import CreateNewSummon from "./summon-create";

type SummonRecord= {
    ca_id: string;
    ca_hearing_date: string;
    ca_reason: string;
    ca_issuance_date: string;
    file_id: string;
    sr_id: string;
    
}

export const SampleData: SummonRecord[] = [
    {
        ca_id: "1005",
        ca_hearing_date: "June 5, 2023 10:00am",
        ca_reason: "First Hearing",
        ca_issuance_date: "June 1, 2024 1:00pm",
        file_id: "View File",
        sr_id: "None"
    }
];

function SummonTrackingView(){
    const data = SampleData;
    const navigate = useNavigate();

    const columns: ColumnDef<SummonRecord>[] = [
        { accessorKey: "ca_hearing_date", header: "Hearing Date & Time"},
        { accessorKey: "ca_issuance_date", header: "Date of Issuance"},
        { accessorKey: "ca_reason", header: "Reason"},
         { 
            accessorKey: "file_id", 
            header: "File",
            cell: ({ row }) => (
                <Link 
                    to="/files/1005" // Replace with your actual file path
                    className="text-primary hover:text-blue-800 hover:underline"
                >
                    {row.getValue("file_id")}
                </Link>
            )
        }
    ]
    return(
        <div className='w-full h-full'>
            <div className="flex flex-col gap-3 mb-3">
                <div className='flex flex-row gap-4'>
                    <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}><ChevronLeft /></Button>
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                       No. 1005 
                    </h1>
                </div>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            {/* Card Display */}
            <div className='mt-3'> 
                 <Card className="w-full bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column - People */}
                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-sm text-gray-500 font-normal mb-2 block">Complainant</Label>
                                            <p className="text-lg font-medium text-gray-800">Anna Reyes</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm text-gray-500 font-normal mb-2 block">Accused</Label>
                                            <p className="text-lg font-medium text-gray-800">John Michael Cruz</p>
                                        </div>
                                    </div>

                                    {/* Right Column - Case Details */}
                                    <div className="space-y-6">
                                        <div>
                                            <Label className="text-sm text-gray-500 font-normal mb-2 block">Allegation</Label>
                                            <p className="text-gray-700 leading-relaxed">
                                            Accused punched the complainant during an argument outside a store.
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm text-gray-500 font-normal mb-2 block">Incident Type</Label>
                                            <p className="text-lg font-medium text-gray-800">Physical Assault</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        {/* Status Badge */}
                       <div className="bg-[#5B72CF]/40 border border-[#5B72CF] px-4 py-1 rounded-full text-sm font-medium flex items-center justify-center">
                            <span className="text-[#5B72CF] font-medium">Ongoing</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
                        <ConfirmationModal
                            trigger={ <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex items-center gap-2"><Check className="w-4 h-4" /> Mark as Resolved</Button>}
                            title="Confirm Resolution"
                            description="Are you sure you want to mark this case as resolved?"
                            actionLabel="Confirm"
                        />

                        <ConfirmationModal
                            trigger={<Button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Escalate</Button>}
                            title="Confirm Escalation"
                            description="Are you sure you want to escalate this case?"
                            actionLabel="Confirm"
                        />
                    </div>
                </Card>
            </div>

            <div className="mt-4">
                 <p className="font-semibold sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                       Case Activity
                 </p>
                 <div>
                    <div className="bg-white">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6 pt-6">
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
                                    <DialogLayout
                                        trigger={ <Button>+ Create New Schedule</Button>}
                                        title="Create New Schedule"
                                        description="Schedule a new summon."
                                        mainContent={
                                            <CreateNewSummon/>
                                        }
                                    />
                                </div>
                
                            <DataTable columns={columns} data={data} />
                        </div>
                 </div>
                
            </div>

        </div>
    )
}

export default SummonTrackingView