// // Dashboard.tsx
// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { Button } from "@/components/ui/button/button"
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import { SelectLayout } from '@/components/ui/select/select-layout';
// import AddEvent from '@/pages/AddEvent-Modal';



// const headerProp = ["Resolution No.", "Resolution Title", "Actions" ];

// const bodyProp = [
//     ["001-24","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//         (
//             <div className="grid grid-cols-3 gap-1">
//                 <TooltipLayout 
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><Eye size={16}/></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//                         />                        
//                     } 
//                     content="View"
//                 />
//                 <TooltipLayout 
//                     trigger={ 
//                         <DialogLayout
//                             trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16}/></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//                         />                      
//                     } 
//                     content="Update"
//                 />
//                 <TooltipLayout 
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16}/></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//                         />                           
//                     } 
//                     content="Delete"
//                 />                                             
//             </div>
//         )
//     ]
// ]



// function ResolutionPage() {

//     return (
//         <div>
//             <div className="mx-4 mb-4 mt-10">
//                 <div className="text-center font-bold text-[#394360] text-[30px]">
//                     <h1>RESOLUTION RECORDS</h1>
//                 </div>                 
//                 <div className='flex justify-end mb-4 gap-3'>
//                     {/**FILTER (SELECT)*/}                         
//                     <div>
//                         <SelectLayout
//                             label=""
//                             placeholder="Filter"
//                             options={[
//                                 {id: "Council", name: "Council"},
//                                 {id: "Waste", name: "Waste"},  
//                                 {id: "GAD", name: "GAD"}                                                                                    
//                             ]}
//                             value=""
//                             onChange={()=>{}}
//                         />
//                     </div>                                    
//                     <div>                      
//                         <DialogLayout   
//                             trigger={<div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer flex items-center"> Create <Plus className="ml-2"/></div>}
//                             className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
//                             title="Schedule Event"
//                             description="Set an upcoming event."
//                             mainContent={<AddEvent/>}
//                         />                                          
//                     </div>
//                 </div>
                
//                 <div className="bg-white border border-gray rounded-[5px] p-5">
//                     <TableLayout header={headerProp} rows={bodyProp}/>
//                 </div>      

//                 <div>
//                     <PaginationLayout />
//                 </div>
//             </div>
//         </div>
//     );
// }
// export default ResolutionPage;




// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/AddEvent-Modal';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';

// const headerProp = ["Resolution No.", "Resolution Title", "Actions"];

// const bodyProp = [
//     ["001-24", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//         (
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//                         />
//                     }
//                     content="View"
//                 />
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16} /></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//                         />
//                     }
//                     content="Update"
//                 />
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
//                         />
//                     }
//                     content="Delete"
//                 />
//             </div>
//         )
//     ]
// ];

// function ResolutionPage() {
//     return (
//         <div className="w-full h-full px-4 md:px-8 lg:px-16">
//             <div className="mb-4 mt-10">
//                 <div className="text-center font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
//                     <h1>RESOLUTION RECORDS</h1>
//                 </div>
//                 <div className='flex mb-4'>
//                     {/**FILTER (SELECT)*/}
//                     <div className="flex-1">
//                         <SelectLayout
//                             className =""
//                             label=""
//                             placeholder="Filter"
//                             options={[
//                                 { id: "Council", name: "Council" },
//                                 { id: "Waste", name: "Waste" },
//                                 { id: "GAD", name: "GAD" }
//                             ]}
//                             value=""
//                             onChange={() => { }}
//                         />
//                     </div>
//                     <div className="flex-shrink-0">
//                         <DialogLayout
//                             trigger={<div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor -pointer flex items-center"> Create <Plus className="ml-2" /></div>}
//                             className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
//                             title="Schedule Event"
//                             description="Set an upcoming event."
//                             mainContent={<AddEvent />}
//                         />
//                     </div>
//                 </div>

//                 <div className="bg-white border border-gray rounded-[5px] p-5">
//                     <TableLayout header={headerProp} rows={bodyProp} />
//                 </div>

//                 <div className="mt-4">
//                     <PaginationLayout />
//                 </div>
//             </div>
//         </div>
//     );
// }
// export default ResolutionPage;




// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus, Search } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/record/council/Calendar/SchedEventForm';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Link } from 'react-router';
// import { DataTable } from "@/components/ui/table/data-table"
// import { ArrowUpDown } from "lucide-react"
// import { ColumnDef } from "@tanstack/react-table"
// import AddResolution from './addResolution';


// export const columns: ColumnDef<Resolution>[] = [
//     {
//         accessorKey: "res_num",
//         header: ({ column }) => (
//               <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"    
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//               >
//                 Resolution No.
//                 <ArrowUpDown size={15}/>
//               </div>
//         ),
//         cell: ({row}) => (
//             <div className="flex w-full justify-center items-center">{row.getValue("res_num")}</div>
//         )
//     },
//     {
//         accessorKey: "res_date_approved",
//         header: ({ column }) => (
//               <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"    
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//               >
//                 Date
//                 <ArrowUpDown size={15}/>
//               </div>
//         ),
//         cell: ({row}) => (
//             <div className="flex w-full justify-center items-center capitalize">{row.getValue("res_date_approved")}</div>
//         )
//     },
//     {
//         accessorKey: "res_title", // Key for location data
//         header: "Resolution Title", // Column header
//     },
//     {
//         accessorKey: "res_area_of_focus",
//         header: "Area of Focus",
//         cell: ({ row }) => (
//             <div className="text-center max-w-[200px]"> {/* Add text-left and space-y-1 for spacing */}
//                 {row.original.res_area_of_focus.join("\n").split("\n").map((line, index) => (
//                     <div key={index} className="text-sm">{line}</div>
//                 ))}
//             </div>
//         )
//     },    
//     {
//         accessorKey: "action", 
//         header: "Action", 
//         cell: ({row}) => ( 
//             <div className="flex justify-between gap-2 pr-3">
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
//                                     <Eye size={16} />
//                                 </div>
//                             }
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
//                         />
//                     }
//                     content="View"
//                 />
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
//                                     <Pencil size={16} />
//                                 </div>
//                             }
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
//                         />
//                     }
//                     content="Update"
//                 />
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
//                                     <Trash size={16} />
//                                 </div>
//                             }
//                             className="max-w-[50%] h-2/3 flex flex-col"
//                             title="Image Details"
//                             description="Here is the image related to the report."
//                             mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
//                         />
//                     }
//                     content="Delete"
//                 />
//             </div>
//         ),
//         enableSorting: false, // Disable sorting
//         enableHiding: false, // Disable hiding
//     },
// ]

// type Resolution = {
//     res_num: string
//     res_date_approved: string
//     res_title: string
//     res_area_of_focus: string[];
// }

// export const resolutionRecords: Resolution[] = [
//     {
//         res_num: "001 - 24",
//         res_date_approved: "6/10/2025",
//         res_title: "Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit ametLorem ipsum dolor sit amet Lorem ipsum dolor sit amet",
//         res_area_of_focus: ["GAD", "Council"]
//     },
//     {
//         res_num: "003 - 24",
//         res_date_approved: "6/12/2025",
//         res_title: "Lorem ipsum dolor sit.",
//         res_area_of_focus: ["Waste Committee", "Council"]
//     },
//     {
//         res_num: "001 - 25",
//         res_date_approved: "6/15/2025",
//         res_title: "Escucha las palabras.",
//         res_area_of_focus: ["GAD", "Finance"]
//     },
// ]



// function ResolutionPage() {

//     const [isDialogOpen, setIsDialogOpen] = useState(false); 

//     const filterOptions = [
//             { id: "all", name: "All" }, // Use "all" instead of an empty string
//             { id: "Council", name: "Council" },
//             { id: "Waste Committee", name: "Waste Committee" },
//             { id: "GAD", name: "GAD" },
//             {id: "Finance", name: "Finance"}
//         ];
    
//         const [filter, setFilter] = useState<string>("all"); // Default to "all"
    
//         const filteredData = filter === "all"
//             ? resolutionRecords
//             : resolutionRecords.filter(record => record.res_area_of_focus.includes(filter));


//     return (
//         <div className="w-full h-full">
//             <div className="flex-col items-center mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//                     Resolution Record
//                 </h1>
//                 <p className="text-xs sm:text-sm text-darkGray">
//                     Manage and view resolution information
//                 </p>
//             </div>
//             <hr className="border-gray mb-6 sm:mb-10" />        

//             <div className='w-full flex justify-between mb-4'>
//                 {/**FILTER (SELECT)*/}
//                 <div className="flex gap-3">
//                     <div className="relative flex-1">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//                         <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
//                     </div>

//                     <SelectLayout
//                         className="bg-white"
//                         label=""
//                         placeholder="Filter"
//                         options={filterOptions}
//                         value={filter}
//                         onChange={(value) => setFilter(value)} // Update the filter state
//                     />                             
//                 </div>
//                 <div>
//                     <DialogLayout
//                         trigger={
//                             <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                     <Plus className="mr-2" size={16}/>Create
//                             </div>
//                         }
//                         className="max-w-md max-h-[530px] overflow-auto p-10"
//                         title="Resolution Details"
//                         description="Add details."
//                         mainContent={
//                             <AddResolution onSuccess={() => setIsDialogOpen(false)}/>
//                         }   
//                         isOpen={isDialogOpen}
//                         onOpenChange={setIsDialogOpen}
//                     />                 
//                 </div>
//             </div>                    

//             <div className="w-full bg-white border-none"> 
//                 <div className="flex gap-x-2 items-center p-4">
//                     <p className="text-xs sm:text-sm">Show</p>
//                     <Input type="number" className="w-14 h-8" defaultValue="10" />
//                     <p className="text-xs sm:text-sm">Entries</p>
//                 </div>  

//                 <DataTable columns={columns} data={filteredData} />
//             </div>   

//             <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//                 {/* Showing Rows Info */}
//                 <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//                     Showing 1-10 of 150 rows
//                 </p>

//                 {/* Pagination */}
//                 <div className="w-full sm:w-auto flex justify-center">
//                     {/* <PaginationLayout className="" /> */}
//                 </div>
//             </div>                                 
//         </div>
//     );
// }
// export default ResolutionPage;







// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus, Search } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/record/council/Calendar/SchedEventForm';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Link } from 'react-router';
// import { DataTable } from "@/components/ui/table/data-table"
// import { ConfirmationModal } from '@/components/ui/confirmation-modal';
// import { ArrowUpDown } from "lucide-react"
// import { ColumnDef } from "@tanstack/react-table"
// import AddResolution from './addResolution';
// import EditResolution from './editResolution';
// import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
// import { useDeleteResolution } from './queries/resolution-delete-queries';



// function ResolutionPage() {
//     const [isDialogOpen, setIsDialogOpen] = useState(false); 
//     const [editingRowId, setEditingRowId] = useState<number | null>(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10); // Default page size

//     // Use the resolution query
//     const { data: resolutionData, isLoading, isError } = useResolution();

//     const { mutate: deleteRes } = useDeleteResolution();

//     const handleDelete = (res_num: number) => {
//         deleteRes(res_num);
//     };

//     const columns: ColumnDef<ResolutionData>[] = 
//     [
//         {
//             accessorKey: "res_num",
//             header: ({ column }) => (
//                 <div
//                     className="flex w-full justify-center items-center gap-2 cursor-pointer"    
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     Resolution No.
//                     <ArrowUpDown size={15}/>
//                 </div>
//             ),
//             cell: ({row}) => (
//                 <div className="flex w-full justify-center items-center">{row.getValue("res_num")}</div>
//             )
//         },
//         {
//             accessorKey: "res_date_approved",
//             header: ({ column }) => (
//                 <div
//                     className="flex w-full justify-center items-center gap-2 cursor-pointer"    
//                     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//                 >
//                     Date
//                     <ArrowUpDown size={15}/>
//                 </div>
//             ),
//             cell: ({row}) => (
//                 <div className="flex w-full justify-center items-center capitalize">{row.getValue("res_date_approved")}</div>
//             )
//         },
//         {
//             accessorKey: "res_title", 
//             header: "Resolution Title", 
//         },
//         {
//             accessorKey: "res_area_of_focus",
//             header: "Area of Focus",
//             cell: ({ row }) => (
//                 <div className="text-center max-w-[200px]"> {/* Add text-left and space-y-1 for spacing */}
//                     {row.original.res_area_of_focus.join("\n").split("\n").map((line, index) => (
//                         <div key={index} className="text-sm">{line}</div>
//                     ))}
//                 </div>
//             )
//         },   
//         {
//             accessorKey: "action", 
//             header: "Action", 
//             cell: ({row}) => ( 
//                 <div className="flex justify-center items-center gap-2 pr-3 max-full">
//                     <TooltipLayout
//                         trigger={
//                             <a
//                                 href={row.original.resolution_files[0].rf_url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
//                             >
//                                 <Eye size={16} />
//                             </a>
//                         }
//                         content="View"
//                     />
//                     <TooltipLayout
//                         trigger={
//                             <DialogLayout
//                                 trigger={
//                                     <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
//                                         <Pencil size={16} />
//                                     </div>
//                                 }
//                                 className="max-w-md max-h-[530px] overflow-auto p-10"
//                                 title="Update Resolution"
//                                 description="Update the resolution details."
//                                 mainContent={
//                                     <EditResolution
//                                         res_num={row.original.res_num}
//                                         res_title={row.original.res_title}
//                                         res_date_approved={row.original.res_date_approved}
//                                         res_area_of_focus={row.original.res_area_of_focus} 
//                                         resolution_files={row.original.resolution_files}        
//                                         onSuccess={() => setEditingRowId(null)}  
//                                     />
//                                 }
//                                 isOpen={editingRowId === row.original.res_num}
//                                 onOpenChange={(open) => setEditingRowId(open ? row.original.res_num: null)}
//                             />
//                         }
//                         content="Update"
//                     />
//                     <TooltipLayout
//                         trigger={
//                             <div>
//                                 <ConfirmationModal
//                                     trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"><Trash size={16}/></div>}
//                                     title="Confirm Delete"
//                                     description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
//                                     actionLabel="confirm"
//                                     onClick={() => handleDelete(row.original.res_num)}
//                                 />
//                             </div>
//                         }
//                         content="Delete"
//                     />
//                 </div>
//             )
//         },
//     ]


//     const filterOptions = [
//         { id: "all", name: "All" },
//         { id: "council", name: "Council" },
//         { id: "waste", name: "Waste Committee" },
//         { id: "gad", name: "GAD" },
//         {id: "finance", name: "Finance"}
//     ];

//     const [filter, setFilter] = useState<string>("all"); // Default to "all"

//     // Use the actual data from the query
//     const filteredData = filter === "all"
//         ? resolutionData || []
//         : (resolutionData || []).filter(record => record.res_area_of_focus.includes(filter));

//     const totalPages = Math.ceil(filteredData.length / pageSize);

//     // Get paginated data
//     const paginatedData = filteredData.slice(
//         (currentPage - 1) * pageSize,
//         currentPage * pageSize
//     );

//     if (isLoading) {
//         return <div>Loading resolutions...</div>;
//     }

//     if (isError) {
//         return <div>Error loading resolutions</div>;
//     }

//     return (
//         <div className="w-full h-full">
//             <div className="flex-col items-center mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//                     Resolution Record
//                 </h1>
//                 <p className="text-xs sm:text-sm text-darkGray">
//                     Manage and view resolution information
//                 </p>
//             </div>
//             <hr className="border-gray mb-6 sm:mb-10" />        

//             <div className='w-full flex justify-between mb-4'>
//                 {/**FILTER (SELECT)*/}
//                 <div className="flex gap-3">
//                     <div className="relative flex-1">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//                         <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
//                     </div>

//                     <SelectLayout
//                         className="bg-white"
//                         label=""
//                         placeholder="Filter"
//                         options={filterOptions}
//                         value={filter}
//                         onChange={(value) => setFilter(value)}
//                     />                             
//                 </div>
//                 <div>
//                     <DialogLayout
//                         trigger={
//                             <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
//                                     <Plus className="mr-2" size={16}/>Create
//                             </div>
//                         }
//                         className="max-w-md max-h-[530px] overflow-auto p-10"
//                         title="Resolution Details"
//                         description="Add details."
//                         mainContent={
//                             <AddResolution onSuccess={() => setIsDialogOpen(false)}/>
//                         }   
//                         isOpen={isDialogOpen}
//                         onOpenChange={setIsDialogOpen}
//                     />                 
//                 </div>
//             </div>                    

//             <div className="w-full bg-white border-none"> 
//                 <div className="flex gap-x-2 items-center p-4">
//                     <p className="text-xs sm:text-sm">Show</p>
//                         <Input 
//                             type="number" 
//                             className="w-14 h-8" 
//                             value={pageSize}
//                             onChange={(e) => {
//                                 const value = +e.target.value;
//                                 if (value >= 1) {
//                                     setPageSize(value);
//                                     setCurrentPage(1);
//                                 }
//                             }}
//                         />
//                     <p className="text-xs sm:text-sm">Entries</p>
//                 </div>  

//                 <DataTable columns={columns} data={paginatedData} />
//             </div>   

//             <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//                 <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//                     Showing {(currentPage - 1) * pageSize + 1}-
//                     {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//                     {filteredData.length} rows
//                 </p>
//                 {filteredData.length > 0 && (
//                     <PaginationLayout
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={setCurrentPage}
//                     />
//                 )}
//             </div>                                 
//         </div>
//     );
// }

// export default ResolutionPage;






import { useState } from 'react';
import React from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button/button";
import { Pencil, Trash, Eye, Plus, Search, Archive, ArchiveRestore, FileInput, CircleAlert } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';
import { DataTable } from "@/components/ui/table/data-table"
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import AddResolution from './addResolution';
import EditResolution from './editResolution';
import { useResolution, type ResolutionData } from './queries/resolution-fetch-queries';
import { useDeleteResolution } from './queries/resolution-delete-queries';
// import { useArchiveOrRestoreResolution } from './queries/resolution-archive-queries';
import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';


function ResolutionPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("active");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch mutation
    const { data: resolutionData = [], isLoading, isError } = useResolution();

    // Delete mutation
    const { mutate: deleteRes } = useDeleteResolution();

    // Archive / Restore mutation
    const { mutate: archiveRestore } = useArchiveOrRestoreResolution();


    const filterOptions = [
        { id: "all", name: "All" },
        { id: "council", name: "Council" },
        { id: "waste", name: "Waste Committee" },
        { id: "gad", name: "GAD" },
        { id: "finance", name: "Finance" }
    ];
    const [filter, setFilter] = useState<string>("all");

    // Filter data based on active/archive tab, search query, and filter
    const filteredData = React.useMemo(() => {
        let result = resolutionData.filter(row => 
            activeTab === "active" ? row.res_is_archive === false : row.res_is_archive === true
        );

        if (filter !== "all") {
            result = result.filter(record => record.res_area_of_focus.includes(filter));
        }

        if (searchQuery) {
            result = result.filter(item =>
                Object.values(item)
                    .join(" ")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
        }

        return result;
    }, [resolutionData, activeTab, filter, searchQuery]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleDelete = (res_num: number) => {
        deleteRes(res_num);
    };

    const handleArchive = (res_num: number) => {
        archiveRestore({
            res_num,
            res_is_archive: true
        });
    };

    const handleRestore = (res_num: number) => {
        archiveRestore({
            res_num,
            res_is_archive: false
        });
    };

    const commonColumns: ColumnDef<ResolutionData>[] = [
        {
            accessorKey: "res_num",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"    
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Resolution No.
                    <ArrowUpDown size={15}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="flex w-full justify-center items-center">{row.getValue("res_num")}</div>
            )
        },
        {
            accessorKey: "res_date_approved",
            header: ({ column }) => (
                <div
                    className="flex w-full justify-center items-center gap-2 cursor-pointer"    
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown size={15}/>
                </div>
            ),
            cell: ({row}) => (
                <div className="flex w-full justify-center items-center capitalize">{row.getValue("res_date_approved")}</div>
            )
        },
        {
            accessorKey: "res_title", 
            header: "Resolution Title", 
        },
        {
            accessorKey: "res_area_of_focus",
            header: "Area of Focus",
            cell: ({ row }) => (
                <div className="text-center max-w-[200px]">
                    {row.original.res_area_of_focus.join("\n").split("\n").map((line, index) => (
                        <div key={index} className="text-sm">{line}</div>
                    ))}
                </div>
            )
        },
        {
            accessorKey: "resolution_supp",
            header: "Supporting Documents",
            cell: ({row}) => {
                const files = row.original.resolution_supp;
                const hasFiles = files && files.length > 0;
                
                return (
                    <div className="flex justify-center">
                        {hasFiles ? (
                            <DialogLayout
                                trigger={<div className="bg-white hover:bg-[#f3f2f2] cursor-pointer text-[#1273B8] text-[12px] underline"> 
                                    View ({files.length})
                                </div>}
                                className="max-w-md max-h-[60%] overflow-auto p-6 flex flex-col"
                                title="Attached Documents"
                                description="Documents associated with this resolution."
                                mainContent={
                                    <div className="flex flex-col gap-4 p-5">
                                        {files.map((file) => (
                                            <div key={file.rsd_id} className="border p-3 rounded-md">
                                                <a 
                                                    href={file.rsd_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                                >
                                                    <FileInput size={16} />
                                                    Image {file.rsd_name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                }
                            />
                        ) : (
                            <div className="text-red-500 flex items-center gap-1">
                                <CircleAlert  size={16} />
                                <span className="text-xs">no document</span>
                            </div>
                        )}
                    </div>
                );
            }
        }      
    ];

    const activeColumns: ColumnDef<ResolutionData>[] = [
        ...commonColumns,
        {
            accessorKey: "action", 
            header: "Action", 
            cell: ({row}) => ( 
                <div className="flex justify-center items-center gap-2 pr-3 max-full">
                    <TooltipLayout
                        trigger={
                            <a
                                href={row.original.resolution_files[0]?.rf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
                            >
                                <Eye size={16} />
                            </a>
                        }
                        content="View"
                    />
                    <TooltipLayout
                        trigger={
                            <DialogLayout
                                trigger={
                                    <div className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                                        <Pencil size={16} />
                                    </div>
                                }
                                className="max-w-md max-h-[530px] overflow-auto p-10"
                                title="Update Resolution"
                                description="Update the resolution details."
                                mainContent={
                                    <EditResolution
                                        res_num={row.original.res_num}
                                        res_title={row.original.res_title}
                                        res_date_approved={row.original.res_date_approved}
                                        res_area_of_focus={row.original.res_area_of_focus} 
                                        resolution_files={row.original.resolution_files}        
                                        onSuccess={() => setEditingRowId(null)}  
                                    />
                                }
                                isOpen={editingRowId === row.original.res_num}
                                onOpenChange={(open) => setEditingRowId(open ? row.original.res_num: null)}
                            />
                        }
                        content="Update"
                    />
                    <TooltipLayout
                        trigger={
                            <div className="flex items-center h-8">
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white border px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5  " > <Archive size={16}/></div>}
                                    title="Archive Resolution"
                                    description="This resolution will be archived and removed from the active list. Do you wish to proceed?"
                                    actionLabel="Confirm"
                                    onClick={() => handleArchive(row.original.res_num)}
                                />
                            </div>
                        }
                        content="Archive"
                    />
                </div>
            )
        }
    ];

    const archiveColumns: ColumnDef<ResolutionData>[] = [
        ...commonColumns,
        {
            accessorKey: "action", 
            header: "Action", 
            cell: ({row}) => ( 
                <div className="flex justify-center items-center gap-2 pr-3 max-full">
                    <TooltipLayout
                        trigger={
                            <a
                                href={row.original.resolution_files[0]?.rf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-[#f3f2f2] border text-black px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"
                            >
                                <Eye size={16} />
                            </a>
                        }
                        content="View"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={<div className="bg-[#10b981] hover:bg-[#34d399] text-white border px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"><ArchiveRestore size={16}/></div>}
                                    title="Restore Archived Resolution"
                                    description="Would you like to restore this resolution from the archive and make it active again?"
                                    actionLabel="confirm"
                                    onClick={() => handleRestore(row.original.res_num)}
                                />
                            </div>
                        }
                        content="Restore"
                    />
                    <TooltipLayout
                        trigger={
                            <div>
                                <ConfirmationModal
                                    trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white border px-3 py-2 rounded cursor-pointer flex items-center justify-center h-8.5"><Trash size={16}/></div>}
                                    title="Confirm Delete"
                                    description="This record will be permanently deleted and cannot be recovered. Do you wish to proceed?"
                                    actionLabel="confirm"
                                    onClick={() => handleDelete(row.original.res_num)}
                                />
                            </div>
                        }
                        content="Delete"
                    />
                </div>
            )
        }
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

    if (isError) {
        return <div>Error loading resolutions</div>;
    }

    return (
        <div className="w-full h-full">
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Resolution Record
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view resolution information
                </p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />        

            <div className='w-full flex justify-between mb-4'>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input 
                            placeholder="Search..." 
                            className="pl-10 w-72 bg-white" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <SelectLayout
                        className="bg-white"
                        label=""
                        placeholder="Filter"
                        options={filterOptions}
                        value={filter}
                        onChange={(value) => {
                            setFilter(value);
                            setCurrentPage(1);
                        }}
                    />                             
                </div>
                <div>
                    <DialogLayout
                        trigger={
                            <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
                                    <Plus className="mr-2" size={16}/>Create
                            </div>
                        }
                        className="max-w-md max-h-[530px] overflow-auto p-10"
                        title="Resolution Details"
                        description="Add details."
                        mainContent={
                            <AddResolution onSuccess={() => setIsDialogOpen(false)}/>
                        }   
                        isOpen={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                    />                 
                </div>
            </div>                    

            <div className="w-full bg-white border-none"> 
                <div className="flex justify-between items-center p-4">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input 
                            type="number" 
                            className="w-14 h-8" 
                            value={pageSize}
                            onChange={(e) => {
                                const value = +e.target.value;
                                if (value >= 1) {
                                    setPageSize(value);
                                    setCurrentPage(1);
                                }
                            }}
                        />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>  

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className='pl-5 pb-3'>
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="active">Active Resolutions</TabsTrigger>
                            <TabsTrigger value="archive">
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
                                data={paginatedData.filter(row => row.res_is_archive === false)} 
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="archive">
                        <div className="border overflow-auto max-h-[400px]">
                            <DataTable 
                                columns={archiveColumns} 
                                data={paginatedData.filter(row => row.res_is_archive === true)} 
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>   

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                    {filteredData.length} rows
                </p>
                {filteredData.length > 0 && (
                    <PaginationLayout
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>                                 
        </div>
    );
}

export default ResolutionPage;