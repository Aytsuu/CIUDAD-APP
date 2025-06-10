import { DataTable } from "@/components/ui/table/data-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { FileInput, Search, Plus, Trash, Pen, Archive, ArchiveRestore} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import WasteHotSched from "./waste-hotspot-sched";
import { useState } from "react";
import { useGetHotspotRecords, type Hotspot } from "./queries/hotspotFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryTable } from "@/components/ui/table/history-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function WasteHotspotMain() {
    const [ isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("active")
    const { data: fetchedData = [], isLoading} = useGetHotspotRecords()

     const commonColumns: ColumnDef<Hotspot>[] = [
        { accessorKey: "watchman", header: "Watchman" },
        { accessorKey: "wh_date", header: "Assignment Date" },
        { accessorKey: "wh_time", header: "Assignment Time" },
        { accessorKey: "sitio", header: "Sitio" },
        { accessorKey: "wh_add_info", header: "Additional Info" }
    ];

    // Columns for active tab
    const activeColumns: ColumnDef<Hotspot>[] = [
        ...commonColumns,
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
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16}/></div>}
                            content="Delete"
                        />
                    </div>
                )
            }
        }
    ];

    // Columns for archive tab
    const archiveColumns: ColumnDef<Hotspot>[] = [
        ...commonColumns,
        {
            accessorKey: "action", 
            header: "Action",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={<div className="bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded cursor-pointer"><ArchiveRestore size={16}/></div>}
                            content="Restore"
                        />
                        <TooltipLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16}/></div>}
                            content="Delete"
                        />
                    </div>
                )
            }
        }
    ];

    if (isLoading){
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

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
                    
                     <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className='ml-5'>
                            <TabsList className="grid w-full grid-cols-2 max-w-xs">
                                <TabsTrigger value="active">Active  Watchlist</TabsTrigger>
                                <TabsTrigger value="all">
                                    <div className="flex items-center gap-2">
                                        <Archive size={16} /> Archive
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="active">
                            <div className="border overflow-auto max-h-[400px]">
                                <DataTable 
                                    columns={activeColumns} 
                                    data={fetchedData.filter(row => row.wh_is_archive === false)} 
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="all">
                            <div className="border overflow-auto max-h-[400px]">
                                <HistoryTable columns={archiveColumns} data={fetchedData.filter(row => row.wh_is_archive == true)} />
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </div>
    );
}

export default WasteHotspotMain;