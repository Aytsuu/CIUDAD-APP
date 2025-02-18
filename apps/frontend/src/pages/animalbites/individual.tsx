import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { DropdownMenu } from "@/components/ui/dropdown-menu";

// Types
type Patient = {
  id: number;
  fname: string;
  lname: string;
  age: string;
  gender: string;
  date: string;
  exposure: string;
  siteOfExposure: string;
  bitingAnimal: string;
  actions: string;
}

// interface ReferralFormData {
//   to: string;
//   from: string;
//   lastName: string;
//   firstName: string;
//   middleName: string;
//   address: string;
//   age: string;
//   exposure: string;
//   siteOfExposure: string;
//   bitingAnimal: string;
//   laboratoryExam: string;
//   actionsDesired: string;
//   referredBy: string;
// }


export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "lname", // Key for last name data
    header: ({ column }) => (
      <div
        className="w-full h-full flex gap-2 justify-center items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <TooltipLayout
          trigger={<ArrowUpDown size={14} />}
          content="Sort"
        />
      </div>
    ), // Column header
  },
  {
    accessorKey: "fname", // Key for first name data
    header: ({ column }) => (
      <div
        className="w-full h-full flex gap-2 justify-center items-center cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <TooltipLayout
          trigger={<ArrowUpDown size={14} />}
          content="Sort"
        />
      </div>
    ), // Column header
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "exposure",
    header: "Exposure",
  },
  {
    accessorKey: "siteOfExposure",
    header: "Site of Exposure",
  },
  {
    accessorKey: "bitingAnimal",
    header: "Biting Animal",
  },
  {
    accessorKey: "actions",
    header: "Actions",
  }
]
const samplePatients: Patient[] = [
  {
    id: 1,
    fname: "Jane",
    lname: "Bil",
    age: "25",
    gender: "Female",
    date: "2024-02-06",
    exposure: "Scratch",
    siteOfExposure: "Feet",
    bitingAnimal: "Cat",
    actions: "Wound Cleaned, Vaccine Given",
  },
  {
    id: 2,
    fname: "Bane",
    lname: "Gil",
    age: "25",
    gender: "Female",
    date: "2024-02-06",
    exposure: "Scratch",
    siteOfExposure: "Feet",
    bitingAnimal: "Cat",
    actions: "Wound Cleaned, Vaccine Given",
  },
];


// const [searchTerm, setSearchTerm] = useState('');
//  const [isModalOpen, setIsModalOpen] = useState(false);
// const [filterBy, setFilterBy] = useState('All');

// const handleAddRecord = () => {
//   setIsModalOpen(true);
// };


function AnimalBites() {
  const [patients] = useState<Patient[]>(samplePatients);
  // const [isModalOpen, setIsModalOpen] = useState(false); // Ensure this is declared here

  // const handleAddRecord = () => {
  //   setIsModalOpen(true);
  // };
  
  return (
    <div className="w-screen h-screen bg-snow flex flex-col justify-center items-center">
      <div className="w-[80%] h-4/5 flex flex-col">
        <div className="w-full h-full bg-white border border-gray rounded-[5px] p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Animal Bites</h1>
            <Button className="bg-green-600 hover:bg-green-800 text-white text-sm font-medium">
              New Record
            </Button>
          </div>
          {/* Filtering & Searching */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <select className="w-full sm:w-40 rounded-lg border-gray-300 text-sm">
              <option value="All">Filter By: All</option>
              <option value="Patient">Patient</option>
              <option value="Date">Date</option>
              <option value="Exposure">Exposure</option>
            </select>
          </div>
          {/* Data Table */}
          <DataTable columns={columns} data={patients} />
        </div>
      </div>
      {/* Pagination Layout moved outside */}
      <PaginationLayout  />
    </div>
  );
}


// {/* <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
//         <Table className="min-w-full divide-y divide-gray-200 text-sm">
//           <TableHeader className="bg-green-50">
//             <TableRow>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">#</TableCell>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">PATIENT</TableCell>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">DATE</TableCell>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">EXPOSURE</TableCell>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">SITE OF EXPOSURE</TableCell>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">BITING ANIMAL</TableCell>
//               <TableCell className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">ACTIONS</TableCell>
              
//             </TableRow>
//           </TableHeader>

//           <TableHeader className="divide-y divide-gray-200">
//             {patients.map((patient, index) => (
//               <TableRow key={patient.id}>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-900">{index + 1}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-900">{patient.name}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-700">{patient.date}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-700">{patient.exposure}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-700">{patient.siteOfExposure}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-700">{patient.bitingAnimal}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2 text-gray-700">{patient.actions}</TableCell>
//                 <TableCell className="whitespace-nowrap px-4 py-2"></TableCell>
//                   <Button className="inline-block rounded-lg bg-green-600 hover:bg-green-800 text-sm font-medium text-white">
                  
//                     View details
//                   </Button> 
//               </TableRow>
                
//             ))}
//             </TableHeader>
//         </Table> */}


  {/* Modal for adding a new record */}
  // {isModalOpen && (
  //   <div className="fixed inset-0 z-50 bg-gray-500/50 flex items-center justify-center p-4">
  //     <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
  //       <div className="p-6">
  //         <div className="flex justify-between items-center mb-6">
  //           <h2 className="text-xl font-bold">Animal Bites Referral Form</h2>
  //           <Button className="p-5 bg-green-700">
  //             Print
  //           </Button>
  //         </div>

  //       <form>
  //         <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">

  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">To:</Label>
  //             <Input
  //               type="text"
  //               className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>



  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">Date:</Label>
  //             <Input
  //               type="date"
  //               className="mt-1 rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>

  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">From:</Label>
  //             <Input
  //               type="text"
  //               className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>
  //         </div>

  //         <div>
  //            <br></br>


  //           <h3 className='font-medium text-gray-900 mb-2'>Respectfully Referring</h3>
  //           <h6 className='text-gray-400 mb-2 text-sm '>Name (Last Name, First Name, Middle Name)</h6>
  //           <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  //             <Input
  //               type="text"
  //               placeholder="Last Name"
  //               className="w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //             <Input
  //               type="text"
  //               placeholder="First Name"
  //               className="w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //             <Input
  //               type="text"
  //               placeholder="Middle Name"
  //               className="w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>
  //         </div>

  //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  //         <div>
  //             <Label className="block text-sm font-medium mt-4 text-gray-700">Address:</Label>
  //             <Input
  //               type="text"
  //               placeholder="House No., Street, Purok/Sitio, Barangay"
  //               className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>


  //           <div>
  //             <Label className="block text-sm font-medium mt-4 text-gray-700">Age:</Label>
  //             <Input
  //               type="text"
  //               className="mt-1 w-20 rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>
  //         </div>

  //         <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">Exposure:</Label>



  //             <select className="mt-1 w-full h-10 rounded-lg border-gray-900 p-2 text-sm shadow-sm" >
  //             <DropdownMenu>
  //               <option value="Bite">Bite</option>
  //               <option value="Non-Bite">Non-Bite</option>
  //             </DropdownMenu>
  //             </select>
  //           </div>

  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">Site of Exposure:</Label>
  //             <Input
  //               type="text"
  //               className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>
  //         </div>

  //         <div className="grid grid-cols gap-4 m-4 sm:grid-cols-2">
  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">Biting Animal:</Label>
  //             <Input
  //               type="text"
  //               className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>

  //           <div>
  //             <Label className="block text-sm font-medium text-gray-700">Laboratory Exam (if any):</Label>
  //             <Input
  //               type="text"
  //               className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //           </div>
  //         </div>

  //         <div>
  //           <Label className="block text-sm font-medium text-gray-700">Actions Desired:</Label>
  //           <Textarea
  //             placeholder="Describe the required actions..."
  //             rows={4}
  //             className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //             />
  //         </div>

  //         <div>
  //           <Label className="block text-sm font-medium text-gray-700">Referred By:</Label>
  //           <Input
  //             type="text"
  //             className="mt-1 w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm"
  //           />
  //         </div>

  //         <div className="mt-6 flex justify-end gap-4">
  //                 <Button
  //                   type="button"
  //                   onClick={() => setIsModalOpen(false)} // Close the modal
  //                   className="inline-block rounded-lg bg-red-600 px-5 text-sm font-medium text-white"
  //                 >
  //                   Cancel
  //                 </Button>
  //                 <Button
  //                   type="submit"
  //                   className="inline-block rounded-lg bg-green-600 px-5 hover:bg-green-800 text-sm font-medium text-white"
  //                 >
  //                   Save
  //                 </Button>
  //                 </div>
  //             </form>
  //           </div>
  //         </div>
  //       </div>
  //     )}
; 


export default AnimalBites;
