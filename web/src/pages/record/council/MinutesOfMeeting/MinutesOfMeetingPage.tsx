import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Pencil, Trash, Eye, Plus, Search} from "lucide-react";
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

function MinutesOfMeetingPage() {
    const [filter, setFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRowId, setEditingRowId] = useState<number | null> (null)
    const {data: momRecords = [], isLoading} = useGetMinutesOfMeetingRecords();
    const {mutate: archiveMOM} = useArchiveMinutesOfMeeting();
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

    const columns: ColumnDef<MinutesOfMeetingRecords>[] = [
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
        enableSorting: false,
        enableHiding: false,
    },
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

    return (
        <div className="w-full h-full">
            <div className="flex flex-col mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Minutes Of Meeting</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view documentation information</p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />

            {/* Filter & Search */}
            <div className="w-full flex flex-wrap gap-3 justify-between items-center mb-4">
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input placeholder="Search..." className="pl-10 w-full md:w-72 bg-white" />
                    </div>

                    <SelectLayout
                        className="min-w-[150px] bg-white"
                        label=""
                        placeholder="Filter"
                        options={filterOptions}
                        value={filter}
                        onChange={(value) => setFilter(value)}
                    />
                </div>

                <div className="w-full md:w-auto">
                    {/* <Link to="/add-mom">
                        <Button className="w-full md:w-auto">
                            Create <Plus className="ml-2" />
                        </Button>
                    </Link> */}
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

            {/* Table */}
            <div className="w-full bg-white border border-none"> 
                <div className="flex gap-x-2 items-center p-4">
                    <p className="text-xs sm:text-sm">Show</p>
                    <Input type="number" className="w-14 h-8" defaultValue="10" />
                    <p className="text-xs sm:text-sm">Entries</p>
                </div>                              

                <DataTable columns={columns} data={filteredData.filter(row => row.mom_is_archive == false)} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                {/* Showing Rows Info */}
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing 1-10 of 150 rows
                </p>

                {/* Pagination */}
                <div className="w-full sm:w-auto flex justify-center">
                    {/* <PaginationLayout className="" /> */}
                </div>
            </div>                    
        </div>
    );
}
 
export default MinutesOfMeetingPage;



