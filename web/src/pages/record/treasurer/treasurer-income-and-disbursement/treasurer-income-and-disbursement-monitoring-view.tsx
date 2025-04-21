// import { Input } from "@/components/ui/input";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { useState } from "react";
// import { Label } from "@/components/ui/label";
// import { Search } from 'lucide-react';

// function IncomeandDisbursementView() {
//     const filter = [
//         { id: "All Supporting Documents", name: "All Supporting Documents" },
//         { id: "Income Supporting Documents", name: "Income Supporting Documents" },
//         { id: "Disbursement Supporting Documents", name: "Disbursement Supporting Documents" }
//     ];

//     const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

//     return (
//         <div className="w-full h-full">
//             <div className="flex flex-col gap-3 mb-4">
//                 <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
//                     <div>Income & Disbursement Monitoring</div>
//                 </h1>
//                 <p className="text-xs sm:text-sm text-darkGray">
//                     Keep track of your income and disbursements to ensure effective budgeting and financial stability.
//                 </p>
//             </div>
//             <hr className="border-gray mb-7 sm:mb-9" /> 

//             <div className="mb-[1rem] flex flex-col gap-4">
//                 <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//                     <div className="relative flex-1 max-w-[20rem]"> {/* Increased max-width */}
//                         <Search
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                             size={17}
//                         />
//                         <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
//                     </div>
//                     <div className="flex flex-row gap-2 justify-center items-center">
//                         <Label>Filter: </Label>
//                         <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
//                     </div>                            
//                 </div>

//                 <div>
//                     <div className="bg-white border border-gray-300 rounded-[5px] p-5 h-[20rem] flex items-center justify-center">
//                         <h2 className="flex justify-center font-semibold text-lg text-darkGray items-center">No Files Uploaded.</h2>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default IncomeandDisbursementView;


import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Search } from 'lucide-react';
import { api } from "@/api/api";


interface FileData {
    id: number; // or string, depending on your data
    name: string;
}

function IncomeandDisbursementView() {
    const filter = [
        { id: "All Supporting Documents", name: "All Supporting Documents" },
        { id: "Income Supporting Documents", name: "Income Supporting Documents" },
        { id: "Disbursement Supporting Documents", name: "Disbursement Supporting Documents" }
    ];

    const [selectedFilter, setSelectedFilter] = useState(filter[0].name);
    const [files, setFiles] = useState<FileData[]>([]); 
    const fetchFiles = async () => {
        try {
            const response = await api.get('treasurer/income-disbursement-files/'); // Adjust the endpoint as necessary
            setFiles(response.data); // Assuming the response contains the files in the data property
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };
    
    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Income & Disbursement Monitoring</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Keep track of your income and disbursements to ensure effective budgeting and financial stability.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-9" /> 

            <div className="mb-[1rem] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 max-w-[20rem]"> {/* Increased max-width */}
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <Label>Filter: </Label>
                        <SelectLayout className="bg-white" options={filter} placeholder="Filter" value={selectedFilter} label="" onChange={setSelectedFilter}></SelectLayout>
                    </div>                            
                </div>

                <div>
                    <div className="bg-white border border-gray-300 rounded-[5px] p-5 h-[20rem] flex items-center justify-center">
                    {files.length === 0 ? (
                            <h2 className="flex justify-center font-semibold text-lg text-darkGray items-center">No Files Uploaded.</h2>
                        ) : (
                            <ul>
                                {files.map((file) => (
                                    <li key={file.id} className="text-darkGray">{file.name}</li> // Adjust according to your file structure
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );<s></s>
}

export default IncomeandDisbursementView;