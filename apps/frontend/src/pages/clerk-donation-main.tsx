import DialogLayout from "@/components/ui/dialog/dialog-layout"
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import ClerkDonateCreate from './clerk-donation-create';
import ClerkDonateDeleteConf from "./clerk-donation-delete-conf";



const headerProp = ["Ref No.", "Item Name", "Action"];

const bodyProp = [
    ["0001","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor inc.",
        (
            <div className="grid grid-cols-2 gap-0">
                <TooltipLayout 
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16}/></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />                        
                    } 
                    content="View"
                />
                {/* <TooltipLayout 
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16}/></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />                      
                    } 
                    content="Update"
                /> */}
                <TooltipLayout 
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16}/></div>}
                            className="max-w-[30%] h-1/3 flex flex-col"
                            title="Delete Record"
                            description=""
                            mainContent={<ClerkDonateDeleteConf/>}
                        />                           
                    } 
                    content="Delete"
                />                                             
            </div>
        )
    ]
]



function DonationTracker() {

    return (
        <div className="w-full h-full">
            <div className="mx-4 mb-4 mt-10">
                <div className="text-center font-bold text-[#394360] text-[30px]">
                    <h1>DONATIONS</h1>
                </div>
                <div className='flex justify-end mb-4 gap-3'>
                    {/**FILTER (SELECT)*/}
                    <div>
                        <SelectLayout
                            label=""
                            placeholder="Filter"
                            options={[
                                {id: "Council", name: "Council"},
                                {id: "Waste", name: "Waste"},  
                                {id: "GAD", name: "GAD"}                                                                                    
                            ]}
                            value=""
                            onChange={()=>{}}
                        />
                    </div>
                    <div>
                        <DialogLayout   
                            trigger={<div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer flex items-center"> Create <Plus className="ml-2"/></div>}
                            className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                            title="Schedule Event"
                            description="Set an upcoming event."
                            mainContent={<ClerkDonateCreate/>}
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
export default DonationTracker;