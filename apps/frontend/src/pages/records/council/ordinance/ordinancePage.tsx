// // Dashboard.tsx
// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { Button } from "@/components/ui/button"
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/AddEvent-Modal';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';



// const headerProp = ["Ordinance No.", "Ordinance Title", "Actions"];

// const bodyProp = [
//     ["001-24","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//         (
//             <div className="grid grid-cols-3 gap-1">
//                 <TooltipLayout 
//                     trigger={
//                         <DialogLayout
//                             trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16}/></div>}
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



// function OrdinancePage() {

//     return (
//         <div className="w-full h-full">
//             <div className="mx-4 mb-4 mt-10">
//                 <div className="text-center font-bold text-[#394360] text-[30px]">
//                     <h1>ORDINANCE RECORDS</h1>
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
// export default OrdinancePage;



// // Dashboard.tsx
// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/AddEvent-Modal';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';


// const headerProp = ["Ordinance No.", "Ordinance Title", "Actions"];

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

// function OrdinancePage() {
//     return (
//         <div className="w-full h-full px-4 md:px-8 lg:px-16">
//             <div className="mb-4 mt-10">
//                 <div className="text-center font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
//                     <h1>ORDINANCE RECORDS</h1>
//                 </div>
//                 <div className='flex mb-4'>
//                     {/**FILTER (SELECT)*/}
//                     <div className="flex-1">
//                         <SelectLayout
//                             className = {''}
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
// export default OrdinancePage;




// Dashboard.tsx

// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Pencil, Trash, Eye, Plus } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Input } from '@/components/ui/input';

// import { DataTable } from "@/components/ui/table/data-table"
// import { ArrowUpDown } from "lucide-react"
// import { ColumnDef } from "@tanstack/react-table"

// import { Link } from 'react-router';


// export const columns: ColumnDef<Ordinance>[] = [
//     {
//         accessorKey: "ordNo",
//         header: ({ column }) => (
//               <div
//                 className="flex w-full justify-center items-center gap-2 cursor-pointer"    
//                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//               >
//                 Ordinance No.
//                 <ArrowUpDown size={15}/>
//               </div>
//         ),
//         cell: ({row}) => (
//             <div className="capitalize">{row.getValue("ordNo")}</div>
//         )
//     },
//     {
//         accessorKey: "ordTitle", // Key for location data
//         header: "Ordinance Title", // Column header
//     },
//     {
//         accessorKey: "ordAreaOfFocus",
//         header: "Area of Focus",
//         cell: ({ row }) => row.original.ordAreaOfFocus.join("\n") // Convert array to string
//     },
//     {
//         accessorKey: "action", // Key for action data
//         header: "Action", // Column header
//         cell: ({}) => ( // Add action button to all existing rows
//             // DialogLayout component to show detailed report on click
//             <div className="flex justify-between gap-2">
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
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
//                         <div className="flex items-center h-10">
//                             <Link to="/update-ord">
//                                 <Button className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer shadow-none h-full flex items-center">
//                                     <Pencil size={16} />
//                                 </Button>
//                             </Link>
//                         </div>
//                     }
//                     content="Update"
//                 />
//                 <TooltipLayout
//                     trigger={
//                         <DialogLayout
//                             trigger={
//                                 <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
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

// type Ordinance = {
//     ordNo: string
//     ordTitle: string
//     ordAreaOfFocus: string[]
// }

// export const ordinanceRecords: Ordinance[] = [
//     {
//         ordNo: "001 - 24",
//         ordTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//         ordAreaOfFocus: ["GAD", "Council"]
//     },
//     {
//         ordNo: "003 - 24",
//         ordTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//         ordAreaOfFocus: ["Council", "Waste"]
//     },
//     {
//         ordNo: "001 - 25",
//         ordTitle: "Escucha las palabras de las brujas, los secretos escondidos en la noche, los antiguos dioses invocamos ahora la obra de la.",
//         ordAreaOfFocus: ["Waste"]
//     },
// ]

// function OrdinancePage() {

//     const filterOptions = [
//         { id: "all", name: "All" }, // Use "all" instead of an empty string
//         { id: "Council", name: "Council" },
//         { id: "Waste", name: "Waste" },
//         { id: "GAD", name: "GAD" }
//     ];

//     const [filter, setFilter] = useState<string>("all"); // Default to "all"

//     const filteredData = filter === "all"
//         ? ordinanceRecords 
//         : ordinanceRecords.filter(record => record.ordAreaOfFocus.includes(filter)); // Filter based on the selected value



//     return (
//         <div className="w-full h-full px-4 md:px-8 lg:px-16">
//             <div className="mb-4 mt-10">
//                 <div className="text-lg font-semibold leading-non tracking-tight pb-3 text-[#394360]">
//                     <h1>Ordinance Records</h1>
//                 </div>

//                 <div className="w-full bg-white border border-gray rounded-[5px]">
//                     <div className='w-full flex justify-between mb-4 p-5 gap-2'>
//                         {/**FILTER (SELECT)*/}
//                         <div className="flex gap-3">
//                             <Input
//                                 placeholder="Search"
//                                 className="max-w-sm"
//                             />

//                             <SelectLayout
//                                 className={''}
//                                 label=""
//                                 placeholder="Filter"
//                                 options={filterOptions}
//                                 value={filter}
//                                 onChange={(value) => setFilter(value)} // Update the filter state
//                             />

//                         </div>
//                         <div>
//                             <Link to="/add-ord"><Button><Plus/>Create</Button></Link>
//                         </div>
//                     </div>                    

//                     <DataTable columns={columns} data={filteredData} />
//                 </div>                
//             </div>
//         </div>
//     );
// }
// export default OrdinancePage;


import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Eye, Plus, Search } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { Link } from 'react-router';


export const columns: ColumnDef<Ordinance>[] = [
    {
        accessorKey: "ordNo",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Ordinance No.
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="capitalize w-[140px]">{row.getValue("ordNo")}</div>
        )
    },
    {
        accessorKey: "ordTitle",
        header: "Ordinance Title",
    },
    {
        accessorKey: "ordAreaOfFocus",
        header: "Area of Focus",
        cell: ({ row }) => (
            <div className="text-center space-y-1 w-[150px]"> {/* Add text-left and space-y-1 for spacing */}
                {row.original.ordAreaOfFocus.join("\n").split("\n").map((line, index) => (
                    <div key={index} className="text-sm">{line}</div>
                ))}
            </div>
        )
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({}) => (
            <div className="flex justify-between gap-2 pr-3">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={
                                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                                    <Eye size={16} />
                                </div>
                            }
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
                        />
                    }
                    content="View"
                />
                <TooltipLayout
                    trigger={
                        <div className="flex items-center h-10">
                            <Link to="/update-ord">
                                <Button className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer shadow-none h-full flex items-center">
                                    <Pencil size={16} />
                                </Button>
                            </Link>
                        </div>
                    }
                    content="Update"
                />
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={
                                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                                    <Trash size={16} />
                                </div>
                            }
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
                        />
                    }
                    content="Delete"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

type Ordinance = {
    ordNo: string
    ordTitle: string
    ordAreaOfFocus: string[]
}

export const ordinanceRecords: Ordinance[] = [
    {
        ordNo: "001 - 24",
        ordTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        ordAreaOfFocus: ["GAD", "Council"]
    },
    {
        ordNo: "003 - 24",
        ordTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        ordAreaOfFocus: ["Council", "Waste Committee"]
    },
    {
        ordNo: "001 - 25",
        ordTitle: "Escucha las palabras de las brujas, los secretos escondidos en la noche, los antiguos dioses invocamos ahora la obra de la.",
        ordAreaOfFocus: ["Waste Committee"]
    },
]

function OrdinancePage() {
    const filterOptions = [
        { id: "all", name: "All" }, // Use "all" instead of an empty string
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" }
    ];

    const [filter, setFilter] = useState<string>("all"); // Default to "all"

    const filteredData = filter === "all"
        ? ordinanceRecords
        : ordinanceRecords.filter(record => record.ordAreaOfFocus.includes(filter)); // Filter based on the selected value

    return (

        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">


                <div className="flex-col items-center mb-4">
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                        Ordinance Record
                    </h1>
                    <p className="text-xs sm:text-sm text-darkGray">
                        Manage and view ordinance information
                    </p>
                </div>
                <hr className="border-gray mb-6 sm:mb-10" />        

                <div className='w-full flex justify-between mb-4 gap-2'>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                            <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
                        </div>

                        <SelectLayout
                            className={''}
                            label=""
                            placeholder="Filter"
                            options={filterOptions}
                            value={filter}
                            onChange={(value) => setFilter(value)} // Update the filter state
                        />
                    </div>
                    <div>
                        <Link to="/add-ord"><Button><Plus />Create</Button></Link>
                    </div>
                </div>                    

                {/*TABLE*/}
                <div className="w-full border-none bg-white">
                    <div className="flex gap-x-2 items-center p-4">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>

                    <DataTable columns={columns} data={filteredData} />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                    {/* Showing Rows Info */}
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing 1-10 of 150 rows
                    </p>

                    {/* Pagination */}
                    <div className="w-full sm:w-auto flex justify-center">
                        <PaginationLayout className="" />
                    </div>
                </div>                
            </div>
        </div>
    );
}
export default OrdinancePage;