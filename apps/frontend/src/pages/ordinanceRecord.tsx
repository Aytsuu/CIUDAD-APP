// Dashboard.tsx
import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import CalendarComp from '../components/ui/event-calendar.tsx';
import AddEvent from './AddEvent-Modal.tsx';
import { Button } from "@/components/ui/button"
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { SelectLayout } from "@/components/ui/select/select-layout";
    import { Pencil, Trash, Eye } from 'lucide-react';


const headerProp = [
    { head: "Ordinance No." },
    { head: "Ordinance Title" },
    { head: "Actions" } // New header for the image view
];

const bodyProp = [
    {
        cell: "001-24"
    },
    {
        cell: (
            <div className=" max-w-[600px] truncate">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
        )
    },
    {
        cell: (
            <div className="grid grid-cols-3 gap-1">
                <DialogLayout
                    trigger={<Button variant={"outline"} className=""> <Eye/> </Button>}
                    className="max-w-[50%] h-2/3 flex flex-col"
                    title="Image Details"
                    description="Here is the image related to the report."
                    mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                />
                <DialogLayout
                    trigger={<Button variant={"outline"} className=""> <Pencil/> </Button>}
                    className="max-w-[50%] h-2/3 flex flex-col"
                    title="Image Details"
                    description="Here is the image related to the report."
                    mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                />
                <DialogLayout
                    trigger={<Button variant={"destructive"}> <Trash/> </Button>}
                    className="max-w-[50%] h-2/3 flex flex-col"
                    title="Image Details"
                    description="Here is the image related to the report."
                    mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                />                                 
            </div>
        )
    }
];



function OrdinancePage() {

    return (
        <div>

            <div className="mx-4 mb-4 mt-10">
                <div className='flex justify-end mb-4'>
                    <div>
                        {/**FILTER (SELECT)*/}                  
                    </div>
                </div>
                
                <div className="bg-white border border-gray rounded-[5px] p-5">
                    <TableLayout header={headerProp} body={bodyProp} />
                </div>

                <div>
                    <PaginationLayout />
                </div>
            </div>
        </div>
    );
}
export default OrdinancePage;