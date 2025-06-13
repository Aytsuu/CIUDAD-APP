import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Pencil, Trash, Eye, Plus, Search, Archive, ArchiveRestore, FileInput} from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import AddMinutesOfMeeting from "./addMinutesOfMeeting";
import { useGetMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries";
import { useArchiveMinutesOfMeeting } from "./queries/MOMDeleteQueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryTable } from "@/components/ui/history-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"



function MinutesOfMeetingPage() {
    const [filter, setFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRowId, setEditingRowId] = useState<number | null> (null)
    const {data: momRecords = [], isLoading} = useGetMinutesOfMeetingRecords();
    const {mutate: archiveMOM} = useArchiveMinutesOfMeeting();
    const [activeTab, setActiveTab] = useState("active")
    const getAreaFocusDisplayName = (focus: string): string => {
        switch (focus) {
            case 'gad': return 'GAD';
            case 'finance': return 'Finance';
            case 'council': return 'Council';
            case 'waste': return 'Waste Committee';
            default: return focus;
        }
    };

    const handleConfirm = (mom_id: string) => {
        archiveMOM(mom_id);
    }

    const commonColumns: ColumnDef<MinutesOfMeetingRecords>[] = [
        {
            accessorKey: "mom_date",
            header: "Date",
            cell: ({ row }) => (
                <div className="w-[110px]">{row.getValue("mom_date")}</div>
            ),
        },
        {
            accessorKey: "mom_agenda",
            header: "Meeting Agenda",
        },
        {
            accessorKey: "mom_title",
            header: "Meeting Title",
            cell: ({ row }) => (
                <div className="max-w-[300px]">{row.getValue("mom_title")}</div>
            ),
        },
        {
            accessorKey: "areas_of_focus",
            header: "Area of Focus",
            cell: ({ row }) => (
            <div className="text-center max-w-[200px]">
                    {row.original.areas_of_focus.map((focus: string, index: number) => (
                        <div key={index} className="text-sm">
                        {getAreaFocusDisplayName(focus)}
                        </div>
                    ))}
                </div>
            ),
        },
    ]

    const activeColumns: ColumnDef<MinutesOfMeetingRecords>[] = [
        ...commonColumns,
       {
        accessorKey: "action",
        header: "Action",
        cell: ({row}) => (
                <div className="flex flex-grid justify-center gap-1">
                <TooltipLayout
                        trigger={
                            <a 
                            href={row.original.file_url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white hover:bg-gray-200 border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8"
                            >
                            <Eye size={16} />
                            </a>
                        }
                        content="Open Document"
                    />
                    <TooltipLayout
                        trigger={
                            <Link to="/update-mom">
                                <div className="bg-white hover:bg-gray-200 border text-black h-[32px] px-4 py-2 rounded cursor-pointer shadow-none flex items-center">
                                    <Pencil size={16} />
                                </div>
                            </Link>
                        }
                        content="Update"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={ <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16}/></div>}
                                    title="Delete Confirmation"
                                    description="This record will be archived and removed from the active list. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onClick={() => handleConfirm(row.original.mom_id)}
                                />
                            </div>
                        }
                        content="Delete"
                    />
                </div>
            ),
        },
    ];


    const archiveColumns: ColumnDef<MinutesOfMeetingRecords>[] = [
        ...commonColumns,
        {
            accessorKey: "action", 
            header: "Action",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-2">
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={ <div className="bg-[#10b981] hover:bg-[#34d399] text-white px-4 py-2 rounded cursor-pointer"><ArchiveRestore size={16}/></div>}
                                        title="Restore Archived Schedule"
                                        description="Would you like to restore this schedule from the archive and make it active again?"
                                        actionLabel="confirm"
                                        // onClick={() => handleRestore(row.original.wh_num)}
                                    />
                                </div>
                            }
                            content="Restore"
                        />
                        <TooltipLayout
                            trigger={
                                <div>
                                    <ConfirmationModal
                                        trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16}/></div>}
                                        title="Permanent Deletion Confirmation"
                                        description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                        actionLabel="confirm"
                                        // onClick={() => handleDelete(row.original.wh_num)}
                                    />
                                </div>
                            }
                            content="Delete"
                        />
                    </div>
                )
            }
        }
    ];


    const filterOptions = [
        { id: "all", name: "All" },
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" },
        { id: "Finance", name: "Finance" },
    ];

    const filteredData =filter === "all"? momRecords: momRecords.filter((record) =>record.areas_of_focus.includes(filter));

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

    //   <SelectLayout
    //                     className="min-w-[150px] bg-white"
    //                     label=""
    //                     placeholder="Filter"
    //                     options={filterOptions}
    //                     value={filter}
    //                     onChange={(value) => setFilter(value)}
    //                 />

       {/* <Link to="/add-mom">
                        <Button className="w-full md:w-auto">
                            Create <Plus className="ml-2" />
                        </Button>
                    </Link> */}

                    //  <DialogLayout
                    //     trigger={<Button className="w-full md:w-auto">Create <Plus className="ml-2" /></Button>}
                    //     title="Create New Minutes of the Meeting"
                    //     description=""
                    //     mainContent={
                    //         <AddMinutesOfMeeting
                    //          onSuccess={() => setIsDialogOpen(false)}
                    //         />
                    //     }
                    //     isOpen={isDialogOpen}
                    //     onOpenChange={setIsDialogOpen}
                    // />
    return (
        <div className="w-full h-full">
            <div className="flex flex-col mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Minutes Of Meeting</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view documentation information</p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />

            <div className="flex flex-col gap-5 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-1"> 
                            <Search  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17}/>
                            <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                        </div>
                            <div className="w-full md:w-auto flex justify-end">
                               <DialogLayout
                                trigger={<Button className="w-full md:w-auto">Create <Plus className="ml-2" /></Button>}
                                title="Create New Minutes of the Meeting"
                                description=""
                                mainContent={
                                    <AddMinutesOfMeeting
                                    onSuccess={() => setIsDialogOpen(false)}
                                    />
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
                                <TabsTrigger value="active">Records</TabsTrigger>
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
                                    data={momRecords.filter(row => row.mom_is_archive === false)} 
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="all">
                            <div className="border overflow-auto max-h-[400px]">
                                <HistoryTable columns={archiveColumns} data={momRecords.filter(row => row.mom_is_archive == true)} />
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </div>
        </div>
    );
}
 
export default MinutesOfMeetingPage;



