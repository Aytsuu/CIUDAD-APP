import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Search, FileInput, CheckCircle, AlertCircle, XCircle, Clock} from "lucide-react"
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";

type PickupRequest = {
    garb_id: string;
    garb_location: string;
    garb_requester: string;
    garb_waste_type: string;
    garb_pref_date: string;
    garb_pref_time: string;
    garb_req_status: string;
}

export const SampleData: PickupRequest[] = [
  {
    garb_id: "001",
    garb_requester: "Maria Mercedes",
    garb_location: "Sitio 2",
    garb_waste_type: "Household Waste",
    garb_pref_date: "Jun 5, 2025",
    garb_pref_time: "8:00am",
    garb_req_status: "Pending",
  },
  {
    garb_id: "002",
    garb_requester: "John Santos",
    garb_location: "Sitio 1",
    garb_waste_type: "Recyclable Waste",
    garb_pref_date: "Jun 6, 2025",
    garb_pref_time: "9:30am",
    garb_req_status: "Accepted",
  },
  {
    garb_id: "003",
    garb_requester: "Ana Reyes",
    garb_location: "Sitio 3",
    garb_waste_type: "Household Waste",
    garb_pref_date: "Jun 7, 2025",
    garb_pref_time: "10:00am",
    garb_req_status: "Completed",
  },
  {
    garb_id: "004",
    garb_requester: "Carlos Mendoza",
    garb_location: "Sitio 2",
    garb_waste_type: "Hazardous Waste",
    garb_pref_date: "Jun 8, 2025",
    garb_pref_time: "8:00am",
    garb_req_status: "Rejected",
  },
]

function GarbagePickupRequestMain(){

    const data = SampleData
    const filter = [
        { id: "All", name: "All" },
        { id: "Pending", name: "Pending" },
        { id: "Rejected", name: "Rejected" },
        { id: "Completed", name: "Completed" },
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name)

    const statusCounts = {
        pending: data.filter((item) => item.garb_req_status.toLowerCase() === "pending").length,
        accepted: data.filter((item) => item.garb_req_status.toLowerCase() === "accepted").length,
        completed: data.filter((item) => item.garb_req_status.toLowerCase() === "completed").length,
        rejected: data.filter((item) => item.garb_req_status.toLowerCase() === "rejected").length,
    }

    const columns: ColumnDef<PickupRequest>[]=[
        { accessorKey: "garb_id", header: "No."},
        { accessorKey: "garb_requester", header:"Requester"},
        { accessorKey: "garb_location", header: "Location"},
        { accessorKey: "garb_waste_type", header: "Waste Type"},
        { accessorKey: "garb_pref_date", header: "Preferred Date"},
        { accessorKey: "garb_pref_time", header: "Preferred Time"},
        { accessorKey: "garb_req_status", header: "Status", cell: ({ row }) => {
            const status = row.getValue("garb_req_status") as string;
                
                const getStatusVariant = (status: string) => {
                switch (status.toLowerCase()) {
                    case "pending":
                    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
                    case "rejected":
                    return "bg-red-100 text-red-800 hover:bg-red-100";
                    case "completed":
                    return "bg-green-100 text-green-800 hover:bg-green-100";
                    case "accepted":
                    return "bg-[#5B72CF]/40 text-blue-800 hover:bg-blue-100";
                    default:
                    return "bg-gray-100 text-gray-800 hover:bg-gray-100";
                }
            };

                return (
                    <div 
                        className={` py-1 rounded-full text-[12px] font-medium ${getStatusVariant(status)} border-0`}
                    >
                        {status}
                    </div>
                );
            }
        },
    ]

    return(
        <div className="w-full h-full">
             <div className="flex flex-col gap-3 mb-3">
                <div className='flex flex-row gap-4'>
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                     Garbage Pickup Request
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-darkGray">
                 Manage  garbage pickup requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

             {/* Status Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Pending Requests Card */}
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
                            <p className="text-2xl font-bold mt-1">{statusCounts.pending}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Accepted Requests Card */}
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#5B72CF]/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Accepted Requests</p>
                            <p className="text-2xl font-bold mt-1">{statusCounts.accepted}</p>
                        </div>
                        <div className="bg-[#5B72CF]/40 p-3 rounded-full">
                            <AlertCircle className="h-6 w-6 text-[#5B72CF]" />
                        </div>
                    </div>
                </div>

                {/* Completed Requests Card */}
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completed Requests</p>
                            <p className="text-2xl font-bold mt-1">{statusCounts.completed}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Rejected Requests Card */}
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Rejected Requests</p>
                            <p className="text-2xl font-bold mt-1">{statusCounts.rejected}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>


            {/* Search and Filter*/}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                {/* Search */}
                <div className="relative w-full sm:w-auto sm:flex-1 max-w-2xl">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={17}
                    />
                    <Input 
                        placeholder="Search..." 
                        className="pl-10 w-full bg-white text-sm" 
                    />
                </div>     

                {/* Filter */}
                <div className='flex flex-row items-center gap-4 w-full sm:w-auto'>
                    <Label className="whitespace-nowrap">Filter: </Label>
                    <SelectLayout className="bg-white w-full sm:w-[200px]" options={filter} placeholder="Filter" value={selectedFilter} label="Status" onChange={setSelectedFilter}/>
                </div>
            </div>

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
                </div>
                <DataTable columns={columns} data={data}/>
            </div>


        </div>
    )
}

export default GarbagePickupRequestMain
