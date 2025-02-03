// import {
//     Table,
//     TableHeader,
//     TableBody,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableCaption,
// } from '@/components/ui/table/table'

// import PaginationLayout from '@/components/ui/pagination/pagination-layout'

// const tableContent = "whitespace-wrap max-w-xs text-center"
// const tableHead = "whitespace-wrap max-w-xs text-center text-white"

// function WasteIllegalDumping() {
//     return (
//         <div className="mx-4 mb-4 mt-10">
//             <div className='flex justify-end mb-4'>
//             <div className="relative w-1/3 mb-4">
//                 <label className="sr-only">Search</label>
//                 <input
//                     type="text"
//                     id="Search"
//                     placeholder="Search"
//                     className="rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm w-full" 
//                 />
//                 <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
//                     <button type="button" className="text-gray-600 hover:text-gray-700">
//                         <span className="sr-only">Search</span>
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             strokeWidth="1.5"
//                             stroke="currentColor"
//                             className="size-4"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
//                             />
//                         </svg>
//                     </button>
//                 </span>
//             </div>
//             </div>

//             {/* Table for Report Details */}
//             <Table className="text-sm border rounded-[10px]">                        
//                 <TableHeader className='bg-[#263D67]'>
//                     <TableRow>
//                         <TableHead className={tableHead}>Report No.</TableHead>
//                         <TableHead className={tableHead}>Report Matter</TableHead>
//                         <TableHead className={tableHead}>Location</TableHead>
//                         <TableHead className={tableHead}>Report Details</TableHead>
//                         <TableHead className={tableHead}>Violator</TableHead>
//                         <TableHead className={tableHead}>Reported By</TableHead>
//                         <TableHead className={tableHead}>Contact No.</TableHead>
//                         <TableHead className={tableHead}>Date and Time</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     <TableRow>
//                         <TableCell className={tableContent}>0001</TableCell>
//                         <TableCell className={tableContent}>Lorem Ipsum</TableCell>
//                         <TableCell className={tableContent}>Sitio 1</TableCell>
//                         <TableCell className={tableContent}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</TableCell>
//                         <TableCell className={tableContent}>Unknown</TableCell>
//                         <TableCell className={tableContent}>Anonymous</TableCell>
//                         <TableCell className={tableContent}>09xxxxxxxx</TableCell>
//                         <TableCell className={tableContent}>01/11/25 05:00PM</TableCell>
//                     </TableRow>
//                 </TableBody>    
//                 <TableCaption>TOTAL NUMBER OF REPORTS: xx</TableCaption>
//             </Table>              

//             <div>
//                 <PaginationLayout></PaginationLayout>
//             </div>
//         </div>
//     );
// }

// export default WasteIllegalDumping;

import TableLayout from "@/components/ui/table/table-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Trash } from "lucide-react";

const headerProp = [
    { head: "Report No." },
    { head: "Report Matter" },
    { head: "Location" },
    { head: "Report Details" },
    { head: "Violator" },
    { head: "Reported By" },
    { head: "Contact No." },
    { head: "Date and Time" },
    { head: "Image" },
    { head: "Action" }
];

const bodyProp = [
    {cell: "0001"},
    {cell: "Lorem Ipsum"},
    {cell: "Sitio 1"},
    {cell: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},
    {cell: "Unknown"},
    {cell: "Anonymous"},
    {cell: "09xxxxxxxx"},
    {cell: "01/11/25 05:00PM"},
    {cell: (<DialogLayout
            trigger={<Button variant={"outline"} className=""> View </Button>}
            className="max-w-[50%] h-2/3 flex flex-col"
            title="Image Details"
            description="Here is the image related to the report."
            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
        />
        )
    },
    {cell: (<Button variant={"destructive"} className=""> <Trash/> </Button>)}
];

function WasteIllegalDumping() {
    return (
        <div className="mx-4 mb-4 mt-10">
            {/* <div className='flex justify-end mb-4'>
                <div className="relative w-1/3 mb-4">
                    <label className="sr-only">Search</label>
                    <input
                        type="text"
                        id="Search"
                        placeholder="Search"
                        className="rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm w-full" 
                    />
                    <span className="absolute inset-y-0 right-0 grid w-10 place-content-center">
                        <button type="button" className="text-gray-600 hover:text-gray-700">
                            <span className="sr-only">Search</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                        </button>
                    </span>
                </div>
            </div> */}

            {/* Table for Report Details */}
            <div className="bg-white border border-gray rounded-[5px] p-5">
                <TableLayout header={headerProp} body={bodyProp} />
            </div>

            <div>
                <PaginationLayout />
            </div>
        </div>
    );
}

export default WasteIllegalDumping;