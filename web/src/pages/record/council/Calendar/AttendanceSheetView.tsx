import { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Label } from '@/components/ui/label';
import { DataTableViewing } from '@/components/ui/table/data-table-viewing';
import sanRoqueLogo from "@/assets/images/sanRoqueLogo.svg";
// import html2pdf from 'html2pdf.js';

interface AttendanceSheetViewProps {
  ce_id: number | null;
  selectedAttendees: string[];
  activity: string;
  date: string;
  time: string;
  place: string;
  category: "meeting" | "activity";
  description: string;
  onConfirm: () => void;
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


function AttendanceSheetView({ selectedAttendees, activity, date, time, place, category, description}: AttendanceSheetViewProps) {

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        time: string, // Add attendees as a parameter
        description: string
    ) => {
        // Create a FormData object to send the file and additional data
        const formData = new FormData();
        formData.append('file', pdfBlob, `${activity}.pdf`); // Append the PDF file
        formData.append('activity', activity); // Append activity
        formData.append('place', place); // Append place
        formData.append('date', date); // Append date
        formData.append('time', time);    
        formData.append('category', category);         
        formData.append('description', description);   
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
        setIsGeneratingPDF(true);
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
    
            // const pdfBlob = await (html2pdf() as any)
            //     .from(element)
            //     .set(options)
            //     .output('blob');
    
            // Pass the attendees data to the upload function
            // uploadPdfToDatabase(pdfBlob, activity, place, date, selectedAttendees, category, formattedTime, description);
            // setIsGeneratingPDF(false);
        }
    };


    return (
        <div className="w-full flex flex-col items-center justify-center p-[50px]">
            <div id="converted">
                {dataChunks.map((chunk, index) => (
                    <div key={index} className={`w-[816px] h-[1248px] bg-white p-[96px] flex flex-col items-center ${!isGeneratingPDF ? 'border border-black' : ''} mb-[2px]`}>
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







