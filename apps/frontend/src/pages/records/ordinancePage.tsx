// Dashboard.tsx
import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Button } from "@/components/ui/button"
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import AddEvent from '../AddEvent-Modal';



const headerProp = ["Ordinance No.", "Ordinance Title", "Actions" ];

const bodyProp = [
    ["001-24","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        (
            <div className="grid grid-cols-3 gap-1">
                <TooltipLayout 
                    trigger={
                        <DialogLayout
                            trigger={<Button variant={"outline"} className=""> <Eye/> </Button>}
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
                            trigger={<Button variant={"outline"} className=""> <Pencil/> </Button>}
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
                            trigger={<Button variant={"destructive"}> <Trash/> </Button>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />                           
                    } 
                    content="Delete"
                />                                             
            </div>
        )
    ]
]



function OrdinancePage() {

    return (
        <div>
            <div className="mx-4 mb-4 mt-10">
                <div className='flex justify-end mb-4'>
                    <div>
                        {/**FILTER (SELECT)*/}
                        <DialogLayout   
                            trigger={<Button className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer"> Add Event </Button>}
                            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                            title="Schedule Event"
                            description="Set an upcoming event."
                            mainContent={<AddEvent/>}
                        />                                              
                    </div>
                </div>
                
                <div className="bg-white border border-gray rounded-[5px] p-5">
                    <TableLayout header={headerProp} rows={bodyProp}/>
                </div>      

                <div>
                    <PaginationLayout />
                </div>
            </div>
        </div>
    );
}
export default OrdinancePage;