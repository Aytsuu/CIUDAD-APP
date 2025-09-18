// import { useState, useEffect } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Trash, Search, Plus, Eye, ArrowUpDown, History  } from "lucide-react";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { formatTime } from "@/helpers/timeFormatter";
// import UpdateWasteColSched from "./waste-col-UpdateSched";
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "./queries/wasteColFetchQueries";
// import WasteColSched from "./waste-col-sched";
// import { useArchiveWasteCol, useDeleteWasteCol } from "./queries/wasteColDeleteQueries";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// function WasteCollectionMain() {
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [activeTab, setActiveTab] = useState("active");
//     const [editingRowId, setEditingRowId] = useState<number | null>(null);
//     const [selectedSitio, setSelectedSitio] = useState<string>("0");

//     // FETCH MUTATIONS
//     const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

//     console.log("ALL DATA TSX: ", wasteCollectionData)
//     // ARCHIVE / RESTORE / DELETE MUTATIONS
//     const { mutate: archiveWasteSchedCol } = useArchiveWasteCol();
//     const { mutate: deleteWasteSchedCol } = useDeleteWasteCol();

//     useEffect(() => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Remove time

//         wasteCollectionData.forEach(item => {
//             const itemDate = new Date(item.wc_date);
//             itemDate.setHours(0, 0, 0, 0); // Remove time

//             if (itemDate < today && !item.wc_is_archive) {
//             archiveWasteSchedCol(item.wc_num);
//             }
//         });
//     }, [wasteCollectionData]);     

//     const handleDelete = (wc_num: number) => {
//         deleteWasteSchedCol(wc_num);
//     };

//     // Filter data based on selected sitio
//     const filteredData = wasteCollectionData.filter(item => {
//         if (selectedSitio === "0") return true; // Show all if "All Schedules" is selected
//         return item.sitio_name === selectedSitio;
//     });

//     // Common columns for both tabs
//     const commonColumns: ColumnDef<WasteCollectionSchedFull>[] = [
//         {
//             accessorKey: "wc_date",
//             header: ({ column }) => (
//                 <div
//                     className="flex w-full justify-center items-center gap-2 cursor-pointer"
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     Date
//                     <ArrowUpDown size={15} />
//                 </div>
//             ),
//             cell: ({ row }) => (
//                 <div className="capitalize">{row.getValue("wc_date")}</div>
//             ),
//         },
//         {
//             accessorKey: "wc_time",
//             header: "Time",
//             cell: ({ row }) => {
//                 const time = row.original.wc_time;
//                 return formatTime(time);
//             },
//         },
//         {
//             accessorKey: "sitio_name",
//             header: "Sitio",
//         },
//         {
//             accessorKey: "wc_add_info",
//             header: "Additional Details",
//         },
//     ];

//     // Columns for active schedules
//     const activeColumns: ColumnDef<WasteCollectionSchedFull>[] = [
//         ...commonColumns,
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => (
//                 <div className="flex justify-center gap-2">
//                     <TooltipLayout
//                         trigger={
//                             <DialogLayout
//                                 trigger={
//                                     <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
//                                         <Eye size={16} />
//                                     </div>
//                                 }
//                                 className="max-w-[50%] max-h-[90%] overflow-auto p-10"
//                                 title="Update Waste Collection"
//                                 description=""
//                                 mainContent={
//                                     <div className="flex flex-col">
//                                         <UpdateWasteColSched
//                                             wc_num={row.original.wc_num}
//                                             wc_date={row.original.wc_date}
//                                             wc_time={row.original.wc_time}
//                                             wc_add_info={row.original.wc_add_info}
//                                             wc_is_archive={row.original.wc_is_archive}
//                                             sitio_id={row.original.sitio}
//                                             driver_id={row.original.wstp}
//                                             truck_id={row.original.truck}
//                                             collector_ids={row.original.collectors_wstp_ids}
//                                             onSuccess={() => setEditingRowId(null)}    
//                                         />
//                                     </div>
//                                 }
//                                 isOpen={editingRowId === row.original.wc_num}
//                                 onOpenChange={(open) => setEditingRowId(open ? row.original.wc_num : null)}
//                             />
//                         }
//                         content="View"
//                     />
//                     <TooltipLayout
//                         trigger={
//                             <ConfirmationModal
//                                 trigger={
//                                     <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                                         <Trash size={16} />
//                                     </div>
//                                 }
//                                 title="Delete Schedule"
//                                 description="This schedule will be permanently deleted. Are you sure?"
//                                 actionLabel="Delete"
//                                 onClick={() => handleDelete(row.original.wc_num)}
//                             />
//                         }
//                         content="Delete"
//                     />
//                 </div>
//             ),
//         },
//     ];

//     // Columns for archived schedules
//     const archiveColumns: ColumnDef<WasteCollectionSchedFull>[] = [
//         ...commonColumns,
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => (
//                 <div className="flex justify-center gap-2">
//                     <TooltipLayout
//                         trigger={
//                             <ConfirmationModal
//                                 trigger={
//                                     <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                                         <Trash size={16} />
//                                     </div>
//                                 }
//                                 title="Delete Schedule"
//                                 description="This schedule will be permanently deleted. Are you sure?"
//                                 actionLabel="Delete"
//                                 onClick={() => handleDelete(row.original.wc_num)}
//                             />
//                         }
//                         content="Delete"
//                     />
//                 </div>
//             ),
//         },
//     ];

//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//                 <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//                 <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//                 <Skeleton className="h-10 w-full mb-4 opacity-30" />
//                 <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full">
//           <div className="mt-[25px] flex justify-end">
//               <DialogLayout
//                   isOpen={isDialogOpen}
//                   onOpenChange={setIsDialogOpen}
//                   trigger={
//                       <div className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded cursor-pointer flex items-center justify-center">
//                           <Plus size={16} className="mr-1" /> Create
//                       </div>
//                   }
//                   className="max-w-[55%] h-[540px] p-10 flex flex-col overflow-auto scrollbar-custom"
//                   title="Schedule Waste Collection"
//                   description="Schedule new waste collection"
//                   mainContent={<WasteColSched onSuccess={() => setIsDialogOpen(false)} />}
//               />
//           </div>

//             {/* Search and Filter */}
//             <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//                     <Input placeholder="Search..." className="pl-10 w-full bg-white" />
//                 </div>
//                 <div className="w-full md:w-[250px]">
//                     <SelectLayout
//                         className="w-full bg-white"
//                         placeholder="Filter by Sitio"
//                         options={[
//                             { id: "0", name: "All Sitio" },
//                             ...Array.from(new Set(wasteCollectionData.map(item => item.sitio_name)))
//                                 .filter(name => name)
//                                 .map((name) => ({ id: name, name })) // Use sitio_name as id
//                         ]}
//                         value={selectedSitio}
//                         label=""
//                         onChange={(value) => setSelectedSitio(value)}
//                     />
//                 </div>
//             </div>

//             {/* Tabs for Active/Archived Schedules */}
//             <div className="bg-white rounded-lg shadow">
//                 <Tabs value={activeTab} onValueChange={setActiveTab}>
//                     <div className="p-4">
//                         <TabsList className="grid w-full grid-cols-2 max-w-xs">
//                             <TabsTrigger value="active">Active Schedules</TabsTrigger>
//                             <TabsTrigger value="archived">
//                                 <div className="flex items-center gap-2">
//                                     <History size={16} /> Past Schedules
//                                 </div>
//                             </TabsTrigger>
//                         </TabsList>
//                     </div>

//                     <TabsContent value="active">
//                         <div className="p-4">
//                             <DataTable
//                                 columns={activeColumns}
//                                 data={filteredData.filter(item => !item.wc_is_archive)}
//                             />
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="archived">
//                         <div className="p-4">
//                             <DataTable
//                                 columns={archiveColumns}
//                                 data={filteredData.filter(item => item.wc_is_archive)}
//                             />
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//             </div>
//         </div>
//     );
// }

// export default WasteCollectionMain;

















// import { useState, useMemo } from "react";
// import { ColumnDef } from "@tanstack/react-table";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Trash, Search, Plus, Eye, History  } from "lucide-react";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { formatTime } from "@/helpers/timeFormatter";
// import UpdateWasteColSched from "./waste-col-UpdateSched";
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "./queries/wasteColFetchQueries";
// import WasteColSched from "./waste-col-sched";
// import { useArchiveWasteCol, useDeleteWasteCol } from "./queries/wasteColDeleteQueries";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { sortWasteCollectionData } from "@/helpers/wasteCollectionHelper";


// function WasteCollectionMain() {
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [activeTab, setActiveTab] = useState("active");
//     const [editingRowId, setEditingRowId] = useState<number | null>(null);
//     const [selectedSitio, setSelectedSitio] = useState<string>("0");

//     // FETCH MUTATIONS
//     const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

//     console.log("ALL DATA TSX: ", wasteCollectionData)
//     // ARCHIVE / RESTORE / DELETE MUTATIONS
//     const { mutate: archiveWasteSchedCol } = useArchiveWasteCol();
//     const { mutate: deleteWasteSchedCol } = useDeleteWasteCol();


//     const handleDelete = (wc_num: number) => {
//         deleteWasteSchedCol(wc_num);
//     };

//     //sort data by day and time
//     const sortedData = useMemo(() => 
//         sortWasteCollectionData(wasteCollectionData), 
//         [wasteCollectionData]
//     );    

//     // Filter data based on selected sitio
//     const filteredData = sortedData.filter(item => {
//         if (selectedSitio === "0") return true; // Show all if "All Schedules" is selected
//         return item.sitio_name === selectedSitio;
//     });


//     // Common columns for both tabs
//     const commonColumns: ColumnDef<WasteCollectionSchedFull>[] = [
//         {
//             accessorKey: "wc_day",
//             header: "Collection Day",
//         },
//         {
//             accessorKey: "wc_time",
//             header: "Collection Time",
//             cell: ({ row }) => {
//                 const time = row.original.wc_time;
//                 return formatTime(time);
//             },
//         },
//         {
//             accessorKey: "sitio_name",
//             header: "Sitio",
//         },
//         {
//             accessorKey: "wc_add_info",
//             header: "Additional Details",
//         },
//     ];

//     // Columns for active schedules
//     const activeColumns: ColumnDef<WasteCollectionSchedFull>[] = [
//         ...commonColumns,
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => (
//                 <div className="flex justify-center gap-2">
//                     <TooltipLayout
//                         trigger={
//                             <DialogLayout
//                                 trigger={
//                                     <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
//                                         <Eye size={16} />
//                                     </div>
//                                 }
//                                 className="max-w-[50%] max-h-[90%] overflow-auto p-10"
//                                 title="Update Waste Collection"
//                                 description=""
//                                 mainContent={
//                                     <div className="flex flex-col">
//                                         <UpdateWasteColSched
//                                             wc_num={row.original.wc_num}
//                                             wc_day={row.original.wc_day}
//                                             wc_time={row.original.wc_time}
//                                             wc_add_info={row.original.wc_add_info}
//                                             wc_is_archive={row.original.wc_is_archive}
//                                             sitio_id={row.original.sitio}
//                                             driver_id={row.original.wstp}
//                                             truck_id={row.original.truck}
//                                             collector_ids={row.original.collectors_wstp_ids}
//                                             onSuccess={() => setEditingRowId(null)}    
//                                         />
//                                     </div>
//                                 }
//                                 isOpen={editingRowId === row.original.wc_num}
//                                 onOpenChange={(open) => setEditingRowId(open ? row.original.wc_num : null)}
//                             />
//                         }
//                         content="View"
//                     />
//                     <TooltipLayout
//                         trigger={
//                             <ConfirmationModal
//                                 trigger={
//                                     <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                                         <Trash size={16} />
//                                     </div>
//                                 }
//                                 title="Delete Schedule"
//                                 description="This schedule will be permanently deleted. Are you sure?"
//                                 actionLabel="Delete"
//                                 onClick={() => handleDelete(row.original.wc_num)}
//                             />
//                         }
//                         content="Delete"
//                     />
//                 </div>
//             ),
//         },
//     ];

//     // Columns for archived schedules
//     const archiveColumns: ColumnDef<WasteCollectionSchedFull>[] = [
//         ...commonColumns,
//         {
//             accessorKey: "action",
//             header: "Action",
//             cell: ({ row }) => (
//                 <div className="flex justify-center gap-2">
//                     <TooltipLayout
//                         trigger={
//                             <ConfirmationModal
//                                 trigger={
//                                     <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                                         <Trash size={16} />
//                                     </div>
//                                 }
//                                 title="Delete Schedule"
//                                 description="This schedule will be permanently deleted. Are you sure?"
//                                 actionLabel="Delete"
//                                 onClick={() => handleDelete(row.original.wc_num)}
//                             />
//                         }
//                         content="Delete"
//                     />
//                 </div>
//             ),
//         },
//     ];

//     if (isLoading) {
//         return (
//             <div className="w-full h-full">
//                 <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
//                 <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
//                 <Skeleton className="h-10 w-full mb-4 opacity-30" />
//                 <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
//             </div>
//         );
//     }

//     return (
//         <div className="w-full h-full">
//           <div className="mt-[25px] flex justify-end">
//               <DialogLayout
//                   isOpen={isDialogOpen}
//                   onOpenChange={setIsDialogOpen}
//                   trigger={
//                       <div className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded cursor-pointer flex items-center justify-center">
//                           <Plus size={16} className="mr-1" /> Create
//                       </div>
//                   }
//                   className="max-w-[55%] h-[540px] p-10 flex flex-col overflow-auto scrollbar-custom"
//                   title="Schedule Waste Collection"
//                   description="Schedule new waste collection"
//                   mainContent={<WasteColSched onSuccess={() => setIsDialogOpen(false)} />}
//               />
//           </div>

//             {/* Search and Filter */}
//             <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//                     <Input placeholder="Search..." className="pl-10 w-full bg-white" />
//                 </div>
//                 <div className="w-full md:w-[250px]">
//                     <SelectLayout
//                         className="w-full bg-white"
//                         placeholder="Filter by Sitio"
//                         options={[
//                             { id: "0", name: "All Sitio" },
//                             ...Array.from(new Set(wasteCollectionData.map(item => item.sitio_name)))
//                                 .filter(name => name)
//                                 .map((name) => ({ id: name, name })) // Use sitio_name as id
//                         ]}
//                         value={selectedSitio}
//                         label=""
//                         onChange={(value) => setSelectedSitio(value)}
//                     />
//                 </div>
//             </div>

//             {/* Tabs for Active/Archived Schedules */}
//             <div className="bg-white rounded-lg shadow">
//                 <Tabs value={activeTab} onValueChange={setActiveTab}>
//                     <div className="p-4">
//                         <TabsList className="grid w-full grid-cols-2 max-w-xs">
//                             <TabsTrigger value="active">Active Schedules</TabsTrigger>
//                             <TabsTrigger value="archived">
//                                 <div className="flex items-center gap-2">
//                                     <History size={16} /> Past Schedules
//                                 </div>
//                             </TabsTrigger>
//                         </TabsList>
//                     </div>

//                     <TabsContent value="active">
//                         <div className="p-4">
//                             <DataTable
//                                 columns={activeColumns}
//                                 data={filteredData.filter(item => !item.wc_is_archive)}
//                             />
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="archived">
//                         <div className="p-4">
//                             <DataTable
//                                 columns={archiveColumns}
//                                 data={filteredData.filter(item => item.wc_is_archive)}
//                             />
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//             </div>
//         </div>
//     );
// }

// export default WasteCollectionMain;














import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Trash, Search, Plus, Eye, History  } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { formatTime } from "@/helpers/timeFormatter";
import UpdateWasteColSched from "./waste-col-UpdateSched";
import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "./queries/wasteColFetchQueries";
import WasteColSched from "./waste-col-sched";
import { useArchiveWasteCol, useDeleteWasteCol } from "./queries/wasteColDeleteQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { sortWasteCollectionData } from "@/helpers/wasteCollectionHelper";


const dayOptions = [
    { id: "0", name: "All Days" },
    { id: "Monday", name: "Monday" },
    { id: "Tuesday", name: "Tuesday" },
    { id: "Wednesday", name: "Wednesday" },
    { id: "Thursday", name: "Thursday" },
    { id: "Friday", name: "Friday" },
    { id: "Saturday", name: "Saturday" },
    { id: "Sunday", name: "Sunday" }
]



function WasteCollectionMain() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>("0");


    // FETCH MUTATIONS
    const { data: wasteCollectionData = [], isLoading } = useGetWasteCollectionSchedFull();

    // ARCHIVE / RESTORE / DELETE MUTATIONS
    const { mutate: archiveWasteSchedCol } = useArchiveWasteCol();
    const { mutate: deleteWasteSchedCol } = useDeleteWasteCol();


    const handleDelete = (wc_num: number) => {
        deleteWasteSchedCol(wc_num);
    };

    //sort data by day and time
    const sortedData = useMemo(() => 
        sortWasteCollectionData(wasteCollectionData), 
        [wasteCollectionData]
    );    

    // Filter data based on selected day
    const filteredData = sortedData.filter(item => {
        if (selectedDay === "0") return true; // Show all if "All Days" is selected
        return item.wc_day === selectedDay;
    });


    // Common columns for both tabs
    const commonColumns: ColumnDef<WasteCollectionSchedFull>[] = [
        {
            accessorKey: "wc_day",
            header: "Collection Day",
        },
        {
            accessorKey: "wc_time",
            header: "Collection Time",
            cell: ({ row }) => {
                const time = row.original.wc_time;
                return formatTime(time);
            },
        },
        {
            accessorKey: "sitio_name",
            header: "Sitio",
        },
        {
            accessorKey: "wc_add_info",
            header: "Additional Details",
        },
    ];

    // Columns for active schedules
    const activeColumns: ColumnDef<WasteCollectionSchedFull>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={
                                    <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                                        <Eye size={16} />
                                    </div>
                                }
                                className="max-w-[50%] max-h-[90%] overflow-auto p-10"
                                title="Update Waste Collection"
                                description=""
                                mainContent={
                                    <div className="flex flex-col">
                                        <UpdateWasteColSched
                                            wc_num={row.original.wc_num}
                                            wc_day={row.original.wc_day}
                                            wc_time={row.original.wc_time}
                                            wc_add_info={row.original.wc_add_info}
                                            wc_is_archive={row.original.wc_is_archive}
                                            sitio_id={row.original.sitio}
                                            driver_id={row.original.wstp}
                                            truck_id={row.original.truck}
                                            collector_ids={row.original.collectors_wstp_ids}
                                            onSuccess={() => setEditingRowId(null)}    
                                        />
                                    </div>
                                }
                                isOpen={editingRowId === row.original.wc_num}
                                onOpenChange={(open) => setEditingRowId(open ? row.original.wc_num : null)}
                            />
                        }
                        content="View"
                    />
                    <TooltipLayout
                        trigger={
                            <ConfirmationModal
                                trigger={
                                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                        <Trash size={16} />
                                    </div>
                                }
                                title="Delete Schedule"
                                description="This schedule will be permanently deleted. Are you sure?"
                                actionLabel="Delete"
                                onClick={() => handleDelete(row.original.wc_num)}
                            />
                        }
                        content="Delete"
                    />
                </div>
            ),
        },
    ];

    // Columns for archived schedules
    const archiveColumns: ColumnDef<WasteCollectionSchedFull>[] = [
        ...commonColumns,
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <TooltipLayout
                        trigger={
                            <ConfirmationModal
                                trigger={
                                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                                        <Trash size={16} />
                                    </div>
                                }
                                title="Delete Schedule"
                                description="This schedule will be permanently deleted. Are you sure?"
                                actionLabel="Delete"
                                onClick={() => handleDelete(row.original.wc_num)}
                            />
                        }
                        content="Delete"
                    />
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
                <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
                <Skeleton className="h-10 w-full mb-4 opacity-30" />
                <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
            </div>
        );
    }

    return (
        <div className="w-full h-full">
          <div className="mt-[25px] flex justify-end">
              <DialogLayout
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  trigger={
                      <div className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded cursor-pointer flex items-center justify-center">
                          <Plus size={16} className="mr-1" /> Create
                      </div>
                  }
                  className="max-w-[55%] h-[540px] p-10 flex flex-col overflow-auto scrollbar-custom"
                  title="Schedule Waste Collection"
                  description="Schedule new waste collection"
                  mainContent={<WasteColSched onSuccess={() => setIsDialogOpen(false)} />}
              />
          </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                    <Input placeholder="Search..." className="pl-10 w-full bg-white" />
                </div>
                <div className="w-full md:w-[250px]">
                    <SelectLayout
                        className="w-full bg-white"
                        placeholder="Filter by Sitio"
                        options={dayOptions}
                        value={selectedDay}
                        label=""
                        onChange={(value) => setSelectedDay(value)}
                    />
                </div>
            </div>

            {/* Tabs for Active/Archived Schedules */}
            <div className="bg-white rounded-lg shadow">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="p-4">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Schedules</TabsTrigger>
                            <TabsTrigger value="archived">
                                <div className="flex items-center gap-2">
                                    <History size={16} /> Past Schedules
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active">
                        <div className="p-4">
                            <DataTable
                                columns={activeColumns}
                                data={filteredData.filter(item => !item.wc_is_archive)}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="archived">
                        <div className="p-4">
                            <DataTable
                                columns={archiveColumns}
                                data={filteredData.filter(item => item.wc_is_archive)}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default WasteCollectionMain;