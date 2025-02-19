// // Dashboard.tsx
// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { Button } from "@/components/ui/button"
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
// import { Button } from "@/components/ui/button";
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




import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import AddEvent from '@/pages/AddEvent-Modal';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Resolution>[] = [
    {
        accessorKey: "resolutionNo",
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
            <div className="capitalize">{row.getValue("resolutionNo")}</div>
        )
    },
    {
        accessorKey: "resolutionTitle", // Key for location data
        header: "Resolution Title", // Column header
    },
    {
        accessorKey: "action", // Key for action data
        header: "Action", // Column header
        cell: ({row}) => ( // Add action button to all existing rows
            // DialogLayout component to show detailed report on click
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 pr-2 pl-2">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />
                    }
                    content="View"
                />
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />
                    }
                    content="Update"
                />
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />
                    }
                    content="Delete"
                />
            </div>
        ),
        enableSorting: false, // Disable sorting
        enableHiding: false, // Disable hiding
    },
]

type Resolution = {
    resolutionNo: string
    resolutionTitle: string
}

export const resolutionRecords: Resolution[] = [
    {
        resolutionNo: "001 - 24",
        resolutionTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        resolutionNo: "003 - 24",
        resolutionTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
        resolutionNo: "001 - 25",
        resolutionTitle: "Escucha las palabras de las brujas, los secretos escondidos en la noche, los antiguos dioses invocamos ahora la obra de la."
    },
]



function ResolutionPage() {

    const data = resolutionRecords;

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-center font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
                    <h1>RESOLUTION RECORDS</h1>
                </div>

                <div className="w-full bg-white border border-gray rounded-[5px]">
                    <div className='w-full flex justify-between mb-4 p-5'>
                        {/**FILTER (SELECT)*/}
                        <div className="flex gap-3">
                            <Input
                                placeholder="Filter by search..."
                                className="max-w-sm"
                            />

                            <SelectLayout
                                className = {''}
                                label=""
                                placeholder="Filter"
                                options={[
                                    { id: "Council", name: "Council" },
                                    { id: "Waste", name: "Waste" },
                                    { id: "GAD", name: "GAD" }
                                ]}
                                value=""
                                onChange={() => { }}
                            />                                
                        </div>
                        <div>
                            <DialogLayout
                                trigger={<div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor -pointer flex items-center"> Create <Plus className="ml-2" /></div>}
                                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="Schedule Event"
                                description="Set an upcoming event."
                                mainContent={<AddEvent />}
                            />
                        </div>
                    </div>                    

                    <DataTable columns={columns} data={data} />
                </div>                
            </div>
        </div>
    );
}
export default ResolutionPage;