    import { DataTable } from "@/components/ui/table/data-table";
    import DialogLayout from "@/components/ui/dialog/dialog-layout";
    import { Label } from "@/components/ui/label";
    import { ColumnDef } from "@tanstack/react-table";
    import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
    import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
    import { FileInput, Search, Plus, Trash, Pen} from "lucide-react";
    import { Button } from "@/components/ui/button/button";
    import { Input } from "@/components/ui/input";
    import WasteHotSched from "./waste-hotspot-sched";
    import { useState } from "react";

    type WasteHotspot = {
        wh_num: string;
        wh_date: string;
        wh_time: string;
        wh_location: string;
        wh_watchman: string;
        wh_additional_info: string;
    }

function WasteHotspotMain() {
    const [ isDialogOpen, setIsDialogOpen] = useState(false);
    // Sample data
    const sampleData: WasteHotspot[] = [
        {
            wh_num: "1",
            wh_date: "2023-05-15",
            wh_time: "08:30",
            wh_location: "Sitio A",
            wh_watchman: "John Doe",
            wh_additional_info: "Near the marketplace"
        },
        {
            wh_num: "2",
            wh_date: "2023-05-16",
            wh_time: "09:15",
            wh_location: "Sitio B",
            wh_watchman: "Jane Smith",
            wh_additional_info: "Behind the school building"
        },
        {
            wh_num: "3",
            wh_date: "2023-05-17",
            wh_time: "10:00",
            wh_location: "Sitio C",
            wh_watchman: "Robert Johnson",
            wh_additional_info: "Main road intersection"
        },
        {
            wh_num: "4",
            wh_date: "2023-05-18",
            wh_time: "14:30",
            wh_location: "Sitio D",
            wh_watchman: "Maria Garcia",
            wh_additional_info: "Near the basketball court"
        },
        {
            wh_num: "5",
            wh_date: "2023-05-19",
            wh_time: "15:45",
            wh_location: "Sitio E",
            wh_watchman: "Michael Brown",
            wh_additional_info: "Close to the riverbank"
        }
    ];

    const columns: ColumnDef<WasteHotspot>[] = [
        { accessorKey: "wh_watchman", header: "Watchman" },
        { accessorKey: "wh_date", header: "Assignment Date" },
        { accessorKey: "wh_time", header: "Assignment Time" },
        { accessorKey: "wh_location", header: "Sitio" },
        { accessorKey: "wh_additional_info", header: "Additional Info" },
        {
            accessorKey: "action", 
            header: "Action",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Pen size={16}/></div>}
                            content="Edit"
                        />
                        <TooltipLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer" > <Trash size={16} /></div>}
                            content = "Delete"
                            />
                    </div>
                )
            }
        }
    ];

    return (
        <div className='w-full h-full'>
            <div className="mt-[25px]">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Waste Hotspot Assignment & Schedule
                </h1>
            </div>
            
            <div className="flex flex-col gap-5 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1"> {/* Increased max-width */}
                            <Search  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17}/>
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                        </div>
                            <div className="w-full md:w-auto flex justify-end">
                            <DialogLayout
                                trigger={<Button><Plus className="h-4 w-4" />Create</Button>}
                                title="Create New Assignment and Schedule"
                                description="Assign a watchman to a hotspot location with the right schedule."
                                mainContent={
                                    <WasteHotSched
                                    onSuccess={() => setIsDialogOpen(false)}/>
                                }
                                isOpen={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            />
                        </div>                            
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
                        <DataTable columns={columns} data={sampleData}></DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WasteHotspotMain;