// import { useEffect, useState } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { ColumnDef } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button/button";
// import ReferralFormModal from "@/pages/animalbites/referralform";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Input } from "@/components/ui/input";
// import { Eye, Search, Trash } from "lucide-react";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Link } from "react-router-dom";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { getAnimalbiteDetails, getAnimalbitePatients, getAnimalbiteReferrals } from "./api/get-api";

// // Define Patient Type
// type Patient = {
//   id: number;
//   fname: string;
//   lname: string;
//   gender: string;
//   age: string;
//   date: string;
//   transient: boolean;
//   exposure: string;
//   siteOfExposure: string;
//   bitingAnimal: string;
//   actions: string;
//   refferedby: string;
// };

// // Helper function
// const calculateAge = (birthDate: string): string => {
//   const today = new Date();
//   const birthDateObj = new Date(birthDate);

//   let age = today.getFullYear() - birthDateObj.getFullYear();
//   const monthDiff = today.getMonth() - birthDateObj.getMonth();
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
//     age--;
//   }

//   return age.toString();
// };

// function AnimalBites() {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterValue, setFilterValue] = useState("All");

//   useEffect(() => {
//         const fetchPatients = async () => {
//         try {
//             const data = await getAnimalbitePatients();
//             const referral = await getAnimalbiteReferrals();
//             const bite_details = await getAnimalbiteDetails();
//             const animalBiteRecords = data.filter((item: any) => item.patrec_type === "Animal Bites");
//             console.log("Fetched data:", animalBiteRecords);
//             console.log("Bite details:", bite_details);
//             console.log("Referral:", referral);
//             const formattedPatients: Patient[] = animalBiteRecords.map((item: any, index: number) => {
//                 // Find the referral associated with the current patient record
//                 const patientReferral = referral.find((ref: any) => ref.patrec === item.patrec_id);
                
//                 // Find the bite detail associated with the referral
//                 const bitedetail = bite_details.find((detail: any) => detail.referral === patientReferral?.referral_id);
//                 console.log("Bite detail:", bitedetail);
//                 return {
//                     id: index + 1,
//                     fname: item.pat_details.personal_info.per_fname,
//                     lname: item.pat_details.personal_info.per_lname,
//                     gender: item.pat_details.personal_info.per_sex,
//                     age: item.pat_details.personal_info?.per_dob ? calculateAge(item.pat_details.personal_info?.per_dob) : "N/A",
//                     date: item.created_at?.slice(0, 10) || "N/A",
//                     exposure: bitedetail?.exposure_type,
//                     siteOfExposure: bitedetail?.exposure_site,
//                     bitingAnimal: bitedetail?.biting_animal,
//                     actions: bitedetail?.actions_taken,
//                     referredby: bitedetail?.referredby,
//                 };
//             });
//             setPatients(formattedPatients);
//         } catch (error) {
//             console.error("Failed to fetch patients:", error);
//         }
//     };
//     fetchPatients();
// }, []);

//   // useEffect(() => {
//   //   const fetchBiteDetails = async () => {
//   //     try {
//   //       const data = await getAnimalbitePatients();
//   //       const bite_details = await getAnimalbiteDetails();
        
//   //       const animalBiteRecords = data.filter((item: any) => item.patrec_type === "Animal Bites");


//   //       console.log("Fetched data:", animalBiteRecords);
//   //       console.log("Bite details:", bite_details)

//   //       const formattedPatients: Patient[] = animalBiteRecords.map((item: any, index: number) => {
        
//   //         return {
//   //           id: index + 1,
//   //           fname: item.pat_details.personal_info.per_fname,
//   //           lname: item.pat_details.personal_info.per_lname,
//   //           gender: item.pat_details.personal_info.per_sex,
//   //           age: item.pat_details.personal_info?.per_dob ? calculateAge(item.pat_details.personal_info?.per_dob) : "N/A",
//   //           date: item.created_at?.slice(0, 10) || "N/A", 
//   //           // transient: item.pat_details?.transient ?? false,
//   //           exposure: item.bite_details.exposure_type, 
//   //           siteOfExposure: item.bite_details.exposure_site, 
//   //           bitingAnimal: item.bite_details.biting_animal, 
//   //           actions: item.bite_details.actions_taken, 
//   //           };
//   //       });
  
//   //       setPatients(formattedPatients);
//   //     } catch (error) {
//   //       console.error("Failed to fetch patients:", error);
//   //     }
//   //   };
  
//   //   fetchBiteDetails();
//   // }, []);
  

//   // Define Columns for DataTable
//   const columns: ColumnDef<Patient>[] = [
//     { accessorKey: "id", header: "#" },
//     {
//       accessorKey: "fullName",
//       header: "Patient",
//       cell: ({ row }) => {
//         const patient = row.original;
//         const fullName = `${patient.lname}, ${patient.fname}`;
//         return (
//           <div className="flex justify-start min-w-[200px] px-2">
//             <div className="flex flex-col w-full">
//               <div className="font-medium truncate">{fullName}</div>
//               <div className="text-sm text-darkGray">
//                 {patient.gender}, {patient.age} years old
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     { accessorKey: "date", header: "Date" },
//     { accessorKey: "exposure", header: "Exposure" },
//     { accessorKey: "siteOfExposure", header: "Site of Exposure" },
//     // {
//     //   accessorKey: "transient",
//     //   header: "Transient",
//     //   cell: ({ row }) => (row.original.transient ? "Yes" : "No"),
//     // },
    
//     { accessorKey: "bitingAnimal", header: "Biting Animal" },
//     { accessorKey: "actions", header: "Actions Taken" },
//     { accessorKey: "referredby", header: "Referred by" },
//     {
//       accessorKey: "button",
//       header: "",
//       cell: ({ row }) => (
//         <div className="flex justify-center">
//           <TooltipLayout
//             trigger={
//               <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
//                 <Link to={`/Animalbite_individual/${row.original.id}`}>
//                   <Eye size={15} />
//                 </Link>
//               </div>
//             }
//             content="View"
//           />
//           <TooltipLayout
//             trigger={
//               <DialogLayout
//                 trigger={
//                   <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
//                     <Trash size={16} />
//                   </div>
//                 }
//                 className=""
//                 mainContent={<></>}
//               />
//             }
//             content="Delete"
//           />
//         </div>
//       ),
//     },
//   ];

//   // Function to handle search input change
//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(event.target.value);
//   };

//   // Filtering logic
//   const filteredPatients = patients.filter((patient) => {
//     const searchString = `${patient.fname} ${patient.lname} ${patient.age} ${patient.gender} ${patient.date} ${patient.exposure} ${patient.siteOfExposure} ${patient.transient} ${patient.bitingAnimal}`.toLowerCase();
//     const matchesSearch = searchString.includes(searchQuery.toLowerCase());

//     const matchesFilter = filterValue === "All" 
//       || (filterValue === "Bite" && patient.exposure === "Bite")
//       || (filterValue === "Non-bite" && patient.exposure === "Non-bite");

//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="w-full h-full flex flex-col">
//       {/* Header Section */}
//       <div className="flex-col items-center mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//           Animal Bite Records
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage and view patient information
//         </p>
//       </div>
//       <hr className="border-gray mb-5 sm:mb-8" />

//       {/* Search, Filter & Button Section */}
//       <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
//         <div className="flex flex-col md:flex-row gap-4 w-full">
//           <div className="flex gap-x-2">
//             <div className="relative flex-1">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//                 size={17}
//               />
//               <Input
//                 placeholder="Search..."
//                 className="pl-10 w-72 bg-white"
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//               />
//             </div>

//             <SelectLayout
//               placeholder="Filter by"
//               label=""
//               className="w-full md:w-[200px] bg-white"
//               options={[
//                 { id: "All", name: "All" },
//                 { id: "Bite", name: "Bite" },
//                 { id: "Non-bite", name: "Non-bite" },
//               ]}
//               value={filterValue}
//               onChange={(value) => setFilterValue(value)}
//             />
//           </div>
//         </div>

//         {/* New Record Button */}
//         <div className="flex justify-end">
//           <DialogLayout
//             trigger={
//               <Button className="font-medium py-2 px-4 rounded-md shadow-sm">
//                 New Record
//               </Button>
//             }
//             className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
//             mainContent={<ReferralFormModal onClose={() => console.log("Closing modal")} />}
//             title=""
//             description=""
//           />
//         </div>
//       </div>

//       {/* Table Container */}
//       <div className="h-full w-full rounded-md">
//         <div className="w-full bg-white overflow-x-auto">
//           <DataTable columns={columns} data={filteredPatients} />
//         </div>
//         <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//           <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//             Showing 1-{filteredPatients.length} of {filteredPatients.length} rows
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AnimalBites;


import type React from "react"

import { useState } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import ReferralFormModal from "./referralform"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Input } from "@/components/ui/input"
import { Eye, Search, Trash } from "lucide-react"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Link } from "react-router-dom"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUniqueAnimalbitePatients } from "./api/animal-bite-service"
import { TooltipProvider } from "@radix-ui/react-tooltip"

// Define Patient Type
type Patient = {
  id: string
  fname: string
  lname: string
  gender: string
  age: string
  date: string
  transient: boolean
  exposure: string
  siteOfExposure: string
  bitingAnimal: string
  actions: string
  referredto?: string
  recordCount: number
}

// Helper function
const calculateAge = (birthDate: string): string => {
  const today = new Date()
  const birthDateObj = new Date(birthDate)

  let age = today.getFullYear() - birthDateObj.getFullYear()
  const monthDiff = today.getMonth() - birthDateObj.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }

  return age.toString()
}

function AnimalBites() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // React Query hook for unique patients
  const { data: uniquePatients = [], isLoading } = useQuery({
    queryKey: ["unique-animalbite-patients"],
    queryFn: getUniqueAnimalbitePatients,
  })

  // Process the data to create a unified patient list
  const patients: Patient[] = uniquePatients.map((item: any) => {
    const personalInfo = item.pat_details.personal_info
    const mostRecentReferral = item.mostRecentReferral
    const mostRecentBiteDetail = item.mostRecentBiteDetail

    return {
      id: personalInfo.pat_id.toString(), // Use pat_id for routing
      fname: personalInfo.per_fname,
      lname: personalInfo.per_lname,
      gender: personalInfo.per_sex,
      age: personalInfo?.per_dob ? calculateAge(personalInfo?.per_dob) : "N/A",
      date: item.created_at?.slice(0, 10) || "N/A",
      transient: mostRecentReferral?.transient || false,
      exposure: mostRecentBiteDetail?.exposure_type || "N/A",
      siteOfExposure: mostRecentBiteDetail?.exposure_site || "N/A",
      bitingAnimal: mostRecentBiteDetail?.biting_animal || "N/A",
      actions: mostRecentBiteDetail?.actions_taken || "N/A",
      referredto: mostRecentBiteDetail?.referredby || "N/A",
      recordCount: item.recordCount || 0,
    }
  })

  // Create a function to add new patient to the table
  const handleAddPatient = (newPatient: any) => {
    // Invalidate and refetch queries to get fresh data
    queryClient.invalidateQueries({ queryKey: ["unique-animalbite-patients"] })

    // Close the modal
    setIsModalOpen(false)
  }

  // Define Columns for DataTable
  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original
        const fullName = `${patient.lname}, ${patient.fname}`
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <Link to={`/Animalbite_individual/${patient.id}`} className="hover:text-blue-600 hover:underline">
                <div className="font-medium truncate">{fullName}</div>
                <div className="text-sm text-darkGray">
                  {patient.gender}, {patient.age} years old • {patient.recordCount} record(s)
                </div>
              </Link>
            </div>
          </div>
        )
      },
    },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "exposure", header: "Exposure Type" },
    { accessorKey: "siteOfExposure", header: "Site of Exposure" },
    { accessorKey: "bitingAnimal", header: "Biting Animal" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const actions = row.original.actions
        return actions && actions.length > 30 ? `${actions.substring(0, 30)}...` : actions || "N/A"
      },
    },
    { accessorKey: "referredto", header: "Referred by" },
    {
      accessorKey: "button",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <TooltipProvider>
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                  <Link to={`/Animalbite_individual/${row.original.id}`}>
                    <Eye size={15} />
                  </Link>
                </div>
              }
              content="View Records"
            />
          </TooltipProvider>
          <TooltipProvider>
            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                      <Trash size={16} />
                    </div>
                  }
                  className=""
                  mainContent={<></>}
                />
              }
              content="Delete"
            />
          </TooltipProvider>
        </div>
      ),
    },
  ]

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  // Filtering logic
  const filteredPatients = patients.filter((patient) => {
    const searchString =
      `${patient.fname} ${patient.lname} ${patient.age} ${patient.gender} ${patient.date} ${patient.exposure} ${patient.siteOfExposure} ${patient.bitingAnimal}`.toLowerCase()
    const matchesSearch = searchString.includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterValue === "All" ||
      (filterValue === "Bite" && patient.exposure === "Bite") ||
      (filterValue === "Non-bite" && patient.exposure === "Non-bite")

    return matchesSearch && matchesFilter
  })

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Animal Bite Records</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view patient information</p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Search, Filter & Button Section */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input
                placeholder="Search..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <SelectLayout
              placeholder="Filter by"
              label=""
              className="w-full md:w-[200px] bg-white"
              options={[
                { id: "All", name: "All" },
                { id: "Bite", name: "Bite" },
                { id: "Non-bite", name: "Non-bite" },
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />
          </div>
        </div>

        <DialogLayout
          trigger={<Button className="font-medium py-2 px-4 rounded-md shadow-sm">New Record</Button>}
          className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
          mainContent={<ReferralFormModal onClose={() => setIsModalOpen(false)} onAddPatient={handleAddPatient} />}
          title=""
          description=""
        />
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading patient records...</p>
          </div>
        ) : (
          <div className="w-full bg-white overflow-x-auto">
            <DataTable columns={columns} data={filteredPatients} />
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-{filteredPatients.length} of {filteredPatients.length} unique patients
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnimalBites

