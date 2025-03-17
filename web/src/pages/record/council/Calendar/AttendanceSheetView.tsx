

// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus, Stamp, Search } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/record/council/Calendar/AddEvent-Modal';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { DataTable } from "@/components/ui/table/data-table"
// import { ArrowUpDown } from "lucide-react"
// import { ColumnDef } from "@tanstack/react-table"





// import { Link } from "react-router"
// import { ChevronLeft } from "lucide-react"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { cn } from "@/lib/utils"
// import DataTableViewing from "@/components/ui/table/data-table-viewing"
// import { Checkbox } from "@/components/ui/checkbox"


// import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";





// // columns and data for postpartum table
// const attendanceColumns= [
//     {
//         accessorKey: "Number",
//         header: "No.",     
//     },
//     {
//         accessorKey: "nameOfAttendee",
//         header: "Name",     
//     },
//     {
//         accessorKey: "designation",
//         header: "Designation / Organization",
//     },
//     {
//         accessorKey: "Sign",
//         header: "Signature",
//     },
// ]

// const attendanceData = [
//     { 
//         Number: "1",
//         nameOfAttendee: "HON. VIRGIANA N. ABENOJA", 
//         designation: "PUNONG BARANGAY", 
//         Sign: ""
//     },
//     {
//         Number: "2",
//         nameOfAttendee: "HON. ARIEL R. CORTES", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "3",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "4",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "5",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "6",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "7",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "8",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "9",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "10",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     },
//     {
//         Number: "11",
//         nameOfAttendee: "HON. JAIME P ALCANTARA", 
//         designation: "SANGGUNIANG BARANGAY", 
//         Sign: ""        
//     }
// ]


// let activity = "REGULAR SESSION"
// let place = "SAN ROQUE (CIUDAD) HALL"
// let date = "August 5, 2024"
// let time = "2:00 PM"




// function AttendanceSheetView() {

//     return (
//         <div className="w-full flex items-center justify-center p-[50px]">  
//             <div className="w-[816px] h-[1248px] bg-white p-[96px] flex flex-col items-center border border-black-20">

//                 <img src={sanRoqueLogo} alt="Barangay Logo" className="w-40 h-30" />

//                 <div className="flex flex-col w-full items-center pt-5 p-5 gap-2">
//                     <Label className="text-[16px]">Republic of the Philippines</Label>
//                     <Label className="text-[16px]">Cebu City | <Label className="font-bold text-[16px]">Barangay San Roque Ciudad</Label></Label>
//                     <hr className="border-black w-[350px]" />       
//                 </div>

//                 <div className="flex flex-col w-full items-center pb-10">
//                     <Label className="font-bold text-[18px]">Office of the Barangay Captain</Label>
//                     <Label className="text-[16px]">Arellano Boulevard, San Roque, Cebu City</Label>
//                     <Label className="text-[16px]">Barangaysanroquecebu@gmail.com</Label>
//                     <Label className="text-[18px]">(032) 231 - 3699</Label>                    
//                 </div>

//                 <div className="flex flex-col w-full items-center pb-8">
//                     <Label className="text-[16px]">Activity: <Label className="font-bold text-[16px]">{activity}</Label></Label>
//                     <Label className="text-[16px]">Place/Room: <Label className="font-bold text-[16px]">{place}</Label></Label>          
//                     <Label className="text-[16px]">Date: <Label className="font-bold text-[16px]">{date}</Label></Label>          
//                     <Label className="text-[16px]">Time: <Label className="font-bold text-[16px]">{time}</Label></Label>                      
//                 </div>

//                 <Label className="font-bold text-[20px]">ATTENDANCE SHEET</Label>
//                 <DataTableViewing columns={attendanceColumns} data={attendanceData}/>
//             </div>                               
//         </div>  
//     );
// }
// export default AttendanceSheetView;








// import { useState } from 'react';
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
// import { Pencil, Trash, Eye, Plus, Stamp, Search } from 'lucide-react';
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
// import AddEvent from '@/pages/record/council/Calendar/AddEvent-Modal';
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { DataTable } from "@/components/ui/table/data-table"
// import { ArrowUpDown } from "lucide-react"
// import { ColumnDef } from "@tanstack/react-table"





// import { Link } from "react-router"
// import { ChevronLeft } from "lucide-react"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { cn } from "@/lib/utils"
// import DataTableViewing from "@/components/ui/table/data-table-viewing"
// import { Checkbox } from "@/components/ui/checkbox"


// import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";

// import html2pdf from 'html2pdf.js';


// interface AttendanceSheetViewProps {
//     selectedAttendees: string[]; // Assuming selectedAttendees is an array of strings
//     activity: string;
//     date: string;
//     time: string;
//     place: string;
// }


// // columns and data for postpartum table
// const attendanceColumns= [
//     {
//         accessorKey: "Number",
//         header: "No.",     
//     },
//     {
//         accessorKey: "nameOfAttendee",
//         header: "Name",     
//     },
//     {
//         accessorKey: "designation",
//         header: "Designation / Organization",
//     },
//     {
//         accessorKey: "Sign",
//         header: "Signature",
//     },
// ]





// function formatTimeTo12Hour(time: string) {
//     const [hours, minutes] = time.split(':');
//     const formattedHours = (parseInt(hours) % 12) || 12; // Convert to 12-hour format
//     const ampm = parseInt(hours) < 12 ? 'AM' : 'PM';
//     return `${formattedHours}:${minutes} ${ampm}`;
// }


// function AttendanceSheetView({ selectedAttendees, activity, date, time, place }: AttendanceSheetViewProps) {

//     const formattedTime = formatTimeTo12Hour(time);

//     const attendanceData = selectedAttendees.map((attendee, index) => ({
//         Number: (index + 1).toString(),
//         nameOfAttendee: attendee,
//         designation: "Designation Here", // Modify as needed
//         Sign: ""
//     }));

//     // async function handleOnclick(){
//     //     const element = document.querySelector('#converted');
//     //     html2pdf(element);
//     // }

//     async function handleOnclick() {
//         const element = document.querySelector('#converted') as HTMLElement | null;
//         if (element) {
//             const options = {
//                 html2canvas: { scale: 5 },
//                 image: { type: 'png' },
//                 margin: 0,
//                 jsPDF: { 
//                     unit: 'mm', // Use millimeters
//                     format: [215.9, 330.2], // Long Bond Paper size (8.5 x 13 inches in mm)
//                     orientation: 'portrait', // Portrait orientation
//                 },
//             };
    
//             (html2pdf() as any).from(element).set(options).save();
//         }
//     }


//     return (
//         <div className="w-full flex flex-col items-center justify-center p-[50px]">  
//             <div className="w-[816px] h-[1248px] bg-white p-[96px] flex flex-col items-center border border-black-20" id="converted">

//                 <img src={sanRoqueLogo} alt="Barangay Logo" className="w-40 h-30" />

//                 <div className="flex flex-col w-full items-center pt-5 p-5 gap-2">
//                     <Label className="text-[16px]">Republic of the Philippines</Label>
//                     <Label className="text-[16px]">Cebu City | <Label className="font-bold text-[16px]">Barangay San Roque Ciudad</Label></Label>
//                     <hr className="border-black w-[350px]" />       
//                 </div>

//                 <div className="flex flex-col w-full items-center pb-10">
//                     <Label className="font-bold text-[18px]">Office of the Barangay Captain</Label>
//                     <Label className="text-[16px]">Arellano Boulevard, San Roque, Cebu City</Label>
//                     <Label className="text-[16px]">Barangaysanroquecebu@gmail.com</Label>
//                     <Label className="text-[18px]">(032) 231 - 3699</Label>                    
//                 </div>

//                 <div className="flex flex-col w-full items-center pb-8">
//                     <Label className="text-[16px]">Activity: <Label className="font-bold text-[16px]">{activity.toUpperCase()}</Label></Label>
//                     <Label className="text-[16px]">Place/Room: <Label className="font-bold text-[16px]">{place.toUpperCase()}</Label></Label>          
//                     <Label className="text-[16px]">Date: <Label className="font-bold text-[16px]">{date}</Label></Label>          
//                     <Label className="text-[16px]">Time: <Label className="font-bold text-[16px]">{formattedTime}</Label></Label>                      
//                 </div>

//                 <Label className="font-bold text-[20px]">ATTENDANCE SHEET</Label>
//                 <DataTableViewing columns={attendanceColumns} data={attendanceData}/>
//             </div>
//             <div className="p-10">
//                 <Button onClick={handleOnclick}>
//                     Download
//                 </Button>
//             </div>                          
//         </div>  
//     );
// }
// export default AttendanceSheetView;








import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';

import DataTableViewing from "@/components/ui/table/data-table-viewing"



import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";

import html2pdf from 'html2pdf.js';


interface AttendanceSheetViewProps {
    selectedAttendees: string[]; // Assuming selectedAttendees is an array of strings
    activity: string;
    date: string;
    time: string;
    place: string;
    category: string;
}


// columns and data for postpartum table
const attendanceColumns= [
    {
        accessorKey: "Number",
        header: "No.",     
    },
    {
        accessorKey: "nameOfAttendee",
        header: "Name",     
    },
    {
        accessorKey: "designation",
        header: "Designation / Organization",
    },
    {
        accessorKey: "Sign",
        header: "Signature",
    },
]





function formatTimeTo12Hour(time: string) {
    const [hours, minutes] = time.split(':');
    const formattedHours = (parseInt(hours) % 12) || 12; // Convert to 12-hour format
    const ampm = parseInt(hours) < 12 ? 'AM' : 'PM';
    return `${formattedHours}:${minutes} ${ampm}`;
}


function splitDataIntoChunks(data: any[], chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
}


function AttendanceSheetView({ selectedAttendees, activity, date, time, place, category }: AttendanceSheetViewProps) {

    const formattedTime = formatTimeTo12Hour(time); // formatted time w/ AM & PM

    const attendanceData = selectedAttendees.map((attendee, index) => ({
        Number: (index + 1).toString(),
        nameOfAttendee: attendee,
        designation: "Designation Here", // Modify as needed
        Sign: ""
    }));

    // Split the data into chunks
    const maxRowsPerContainer = 10; // Adjust based on your layout
    const dataChunks = splitDataIntoChunks(attendanceData, maxRowsPerContainer);


    const uploadPdfToDatabase = async (
        pdfBlob: Blob,
        activity: string,
        place: string,
        date: string,
        attendees: string[],
        category: string,
        time: string // Add attendees as a parameter
    ) => {
        // Create a FormData object to send the file and additional data
        const formData = new FormData();
        formData.append('file', pdfBlob, 'attendance_sheet.pdf'); // Append the PDF file
        formData.append('activity', activity); // Append activity
        formData.append('place', place); // Append place
        formData.append('date', date); // Append date
        formData.append('time', time);    
        formData.append('category', category);         
        formData.append('attendees', JSON.stringify(attendees)); // Append attendees as JSON


        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
            if (key === 'file') {
                console.log(`${key}:`, value); // Log the file object
            } else {
                console.log(`${key}:`, value); // Log other fields
            }
        }


        // Log the PDF Blob
        console.log('PDF Blob:', pdfBlob);

        // try {
        //     // Make an API call to upload the file and metadata
        //     const response = await fetch('https://your-api-endpoint/upload', {
        //         method: 'POST',
        //         body: formData,
        //     });
    
        //     if (response.ok) {
        //         console.log('PDF and metadata uploaded successfully!');
        //     } else {
        //         console.error('Failed to upload PDF and metadata:', response.statusText);
        //     }
        // } catch (error) {
        //     console.error('Error uploading PDF and metadata:', error);
        // }
    };


    const handleOnclick = async () => {
        const element = document.querySelector('#converted') as HTMLElement | null;
        if (element) {
            const options = {
                image: { type: 'jpeg', quality: 1 }, // JPEG with high quality
                html2canvas: { scale: 7 }, // Adjust scale as needed
                margin: 0,
                jsPDF: { 
                    unit: 'mm',
                    format: [215.9, 332], // Long Bond Paper size
                    orientation: 'portrait',
                },
            };
    
            const pdfBlob = await (html2pdf() as any)
                .from(element)
                .set(options)
                .output('blob');
    
            // Pass the attendees data to the upload function
            uploadPdfToDatabase(pdfBlob, activity, place, date, selectedAttendees, category, formattedTime);
        }
    };


    return (
        <div className="w-full flex flex-col items-center justify-center p-[50px]">
            <div id="converted">
                {dataChunks.map((chunk, index) => (
                    <div key={index} className="w-[816px] h-[1248px] bg-white p-[96px] flex flex-col items-center border border-black mb-2">
                        {/* Conditionally render the header content only for the first container */}
                        {index === 0 && (
                            <>
                                <img src={sanRoqueLogo} alt="Barangay Logo" className="w-40 h-30" />

                                <div className="flex flex-col w-full items-center pt-5 p-5 gap-2">
                                    <Label className="text-[16px]">Republic of the Philippines</Label>
                                    <Label className="text-[16px]">Cebu City | <Label className="font-bold text-[16px]">Barangay San Roque Ciudad</Label></Label>
                                    <hr className="border-black w-[350px]" />       
                                </div>

                                <div className="flex flex-col w-full items-center pb-10">
                                    <Label className="font-bold text-[18px]">Office of the Barangay Captain</Label>
                                    <Label className="text-[16px]">Arellano Boulevard, San Roque, Cebu City</Label>
                                    <Label className="text-[16px]">Barangaysanroquecebu@gmail.com</Label>
                                    <Label className="text-[18px]">(032) 231 - 3699</Label>                    
                                </div>

                                <div className="flex flex-col w-full items-center pb-8">
                                    <Label className="text-[16px]">Activity: <Label className="font-bold text-[16px]">{activity.toUpperCase()}</Label></Label>
                                    <Label className="text-[16px]">Place/Room: <Label className="font-bold text-[16px]">{place.toUpperCase()}</Label></Label>          
                                    <Label className="text-[16px]">Date: <Label className="font-bold text-[16px]">{date}</Label></Label>          
                                    <Label className="text-[16px]">Time: <Label className="font-bold text-[16px]">{formattedTime}</Label></Label>                      
                                </div>

                                <Label className="font-bold text-[20px]">ATTENDANCE SHEET</Label>
                            </>
                        )}

                        {/* Always render the table */}
                        <DataTableViewing columns={attendanceColumns} data={chunk}/>
                    </div>
                ))}
            </div>
            <div className="flex w-full pt-10  justify-end">
                <Button onClick={handleOnclick}>
                    Submit
                </Button>
            </div>                          
        </div>
    );
}
export default AttendanceSheetView;









