// import type React from "react";
// import { useState, useEffect, useMemo } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import type { ColumnDef } from "@tanstack/react-table";
// import { Button } from "@/components/ui/button/button";
// import ReferralFormModal from "./referralform";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Input } from "@/components/ui/input";
// import { Eye, Search, Trash } from "lucide-react";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Link } from "react-router-dom";
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import { TooltipProvider } from "@radix-ui/react-tooltip";
// import { getAnimalbiteReferrals } from "./api/get-api";
// import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
// import { toast } from "sonner";
// import { deleteAnimalBitePatient } from "./db-request/postrequest";

// // Type definition for table display
// type UniquePatientDisplay = {
//   patientId: string;
//   fname: string;
//   lname: string;
//   gender: string;
//   age: string;
//   date: string;
//   transient: boolean;
//   exposure: string;
//   siteOfExposure: string;
//   bitingAnimal: string;
//   actions_taken: string;
//   referredby: string;
//   recordCount: number;
// };

// // Age calculation
// const calculateAge = (dobString: string): string => {
//   if (!dobString) return "N/A";
//   const dob = new Date(dobString);
//   if (isNaN(dob.getTime())) return "N/A";
//   const today = new Date();
//   let age = today.getFullYear() - dob.getFullYear();
//   const m = today.getMonth() - dob.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
//   return age >= 0 ? age.toString() : "N/A";
// };

// const Overall: React.FC = () => {
//   const [patients, setPatients] = useState<UniquePatientDisplay[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterValue, setFilterValue] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [selectedPatientForDeletion, setSelectedPatientForDeletion] = useState<UniquePatientDisplay | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isReferralFormOpen, setIsReferralFormOpen] = useState(false);

//   const fetchAnimalBiteRecords = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getAnimalbiteReferrals();
//       const grouped = new Map<string, any[]>();

//       data.forEach((record: any) => {
//         if (!grouped.has(record.patient_id)) {
//           grouped.set(record.patient_id, []);
//         }
//         grouped.get(record.patient_id)?.push(record);
//       });

//       const result: UniquePatientDisplay[] = Array.from(grouped.entries()).map(([patientId, records]) => {
//         records.sort((a, b) => new Date(b.referral_date).getTime() - new Date(a.referral_date).getTime());
//         const latest = records[0];
//         return {
//           id: latest.patient_id,
//           fname: latest.patient_fname,
//           lname: latest.patient_lname,
//           gender: latest.patient_sex,
//           age: calculateAge(latest.patient_dob),
//           date: latest.referral_date,
//           transient: latest.referral_transient,
//           exposure: latest.exposure_type,
//           siteOfExposure: latest.exposure_site,
//           bitingAnimal: latest.biting_animal,
//           actions: latest.actions_taken,
//           referredby: latest.referredby,
//           recordCount: records.length,
//         };
//       });

//       setPatients(result);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError("Failed to load animal bite records. Please try again.");
//       toast.error("Failed to load animal bite records.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnimalBiteRecords();
//   }, []);

//   const handleDeletePatient = (patient: UniquePatientDisplay) => {
//     setSelectedPatientForDeletion(patient);
//     setDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!selectedPatientForDeletion) return;
//     setIsDeleting(true);
//     try {
//       await deleteAnimalBitePatient(selectedPatientForDeletion.id);
//       toast.success(`Deleted records for ${selectedPatientForDeletion.fname} ${selectedPatientForDeletion.lname}`);
//       fetchAnimalBiteRecords();
//     } catch (err) {
//       toast.error("Failed to delete patient records");
//     } finally {
//       setIsDeleting(false);
//       setDeleteDialogOpen(false);
//       setSelectedPatientForDeletion(null);
//     }
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//   };

//   const filteredPatients = useMemo(() => {
//     return patients.filter((p) => {
//       const str = `${p.fname} ${p.lname} ${p.age} ${p.gender} ${p.date} ${p.exposure} ${p.siteOfExposure} ${p.bitingAnimal}`.toLowerCase();
//       const matchesSearch = str.includes(searchQuery.toLowerCase());
//       const matchesFilter =
//         filterValue === "All" ||
//         (filterValue === "Bite" && p.exposure === "Bite") ||
//         (filterValue === "Non-bite" && p.exposure === "Non-bite");
//       return matchesSearch && matchesFilter;
//     });
//   }, [patients, searchQuery, filterValue]);

//   const columns: ColumnDef<UniquePatientDisplay>[] = [
//     {
//       accessorKey: "id",
//       header: "#",
//       cell: ({ row }) => row.index + 1,
//     },
//     {
//       accessorKey: "fullName",
//       header: "Patient",
//       cell: ({ row }) => {
//         const p = row.original;
//         return (
//           <div className="flex justify-start min-w-[200px] px-2">
//             <div className="flex flex-col w-full">
//               <Link to={`/Animalbite_individual/${p.id}`} className="hover:text-blue-600 hover:underline">
//                 <div className="font-medium truncate">{`${p.lname}, ${p.fname}`}</div>
//                 <div className="text-sm text-darkGray">
//                   {p.gender}, {p.age} years old
//                   {p.recordCount > 1 && (
//                     <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
//                       {p.recordCount} records
//                     </span>
//                   )}
//                 </div>
//               </Link>
//             </div>
//           </div>
//         );
//       },
//     },
//     { accessorKey: "date", header: "Date" },
//     { accessorKey: "exposure", header: "Exposure Type" },
//     { accessorKey: "siteOfExposure", header: "Site of Exposure" },
//     // {
//     //   accessorKey: "transient",
//     //   header: "Transient",
//     //   cell: ({ row }) => (row.original.transient ? "Yes" : "No"),
//     // },
//     { accessorKey: "bitingAnimal", header: "Biting Animal" },
//     {
//       accessorKey: "actions",
//       header: "Actions Taken",
//       cell: ({ row }) => {
//         const actions = row.original.actions;
//         return actions.length > 30 ? `${actions.substring(0, 30)}...` : actions;
//       },
//     },
//     { accessorKey: "referredby", header: "Referred by" },
//     {
//       accessorKey: "button",
//       header: "",
//       cell: ({ row }) => (
//         <div className="flex justify-center gap-2">
//           <TooltipProvider>
//             <TooltipLayout
//               trigger={
//                 <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
//                   <Link to={`/Animalbite_individual/${row.original.id}`}>
//                     <Eye size={15} />
//                   </Link>
//                 </div>
//               }
//               content="View Details"
//             />
//           </TooltipProvider>
//           <TooltipProvider>
//             <TooltipLayout
//               trigger={
//                 <div
//                   className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"
//                   onClick={() => handleDeletePatient(row.original)}
//                 >
//                   <Trash size={16} />
//                 </div>
//               }
//               content="Delete All Records"
//             />
//           </TooltipProvider>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="container mx-auto p-3 py-10">
//      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex-col items-center mb-4">
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//             Animal Bites Records
//           </h1>
//           <p className="text-xs sm:text-sm text-darkGray">
//             Manage and view family planning records
//           </p>
          
//         </div>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-10" />
//       <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
//         <div className="flex gap-x-2">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
//             <Input
//               placeholder="Search..."
//               className="pl-10 w-72 bg-white"
//               value={searchQuery}
//               onChange={handleSearchChange}
//             />
//           </div>

//           <SelectLayout
//             placeholder="Filter by"
//             label=""
//             className="w-[200px] bg-white"
//             options={[
//               { id: "All", name: "All" },
//               { id: "Bite", name: "Bite" },
//               { id: "Non-bite", name: "Non-bite" },
//             ]}
//             value={filterValue}
//             onChange={(value) => setFilterValue(value)}
//           />
//         </div>

//         <Button onClick={() => setIsReferralFormOpen(true)} className="font-medium py-2 px-4 rounded-md shadow-sm">
//           New Record
//         </Button>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <p className="text-center">Loading patient records...</p>
//         </div>
//       ) : error ? (
//         <div className="text-red-600 text-center py-6">{error}</div>
//       ) : (
//         <div className="w-full bg-white overflow-x-auto">
//           <DataTable columns={columns} data={filteredPatients} />
//           <p className="text-xs sm:text-sm text-darkGray mt-2">
//             Showing {filteredPatients.length} of {patients.length} records
//           </p>
//         </div>
//       )}

//       <DialogLayout
//         isOpen={isReferralFormOpen}
//         onClose={() => {
//           setIsReferralFormOpen(false);
//           window.location.reload();
//         }}
//         className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
//         title=""
//         description=""
//         mainContent={
//           <ReferralFormModal
//             onClose={() => {
//               setIsReferralFormOpen(false);
//               window.location.reload();
//             }}
//             onAddPatient={(newPatient) => {
//               console.log("New patient added:", newPatient);
//             }}
//           />
//         }
//       />

//       <ConfirmationDialog
//         isOpen={deleteDialogOpen}
//         onOpenChange={setDeleteDialogOpen}
//         onConfirm={handleDeleteConfirm}
//         title="Delete Patient Records"
//         description={
//           selectedPatientForDeletion
//             ? `Are you sure you want to delete all records for ${selectedPatientForDeletion.fname} ${selectedPatientForDeletion.lname}?`
//             : "Are you sure you want to delete this patient's records?"
//         }
//       />

//       {isDeleting && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg flex items-center gap-3">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//             <span>Deleting patient records...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Overall;

"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button/button"
import ReferralFormModal from "./referralform"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Input } from "@/components/ui/input"
import { Search, Trash } from "lucide-react"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Link } from "react-router-dom"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { getAnimalBitePatientDetails } from "./api/get-api"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal"
import { toast } from "sonner"
import { deleteAnimalBitePatient } from "./db-request/postrequest"

// Type definition for table display
type UniquePatientDisplay = {
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
  actions_taken: string
  referredby: string
  recordCount: number
}

// Age calculation
const calculateAge = (dobString: string): string => {
  if (!dobString) return "N/A"
  const dob = new Date(dobString)
  if (isNaN(dob.getTime())) return "N/A"
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age >= 0 ? age.toString() : "N/A"
}

const Overall: React.FC = () => {
  const [patients, setPatients] = useState<UniquePatientDisplay[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterValue, setFilterValue] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPatientForDeletion, setSelectedPatientForDeletion] = useState<UniquePatientDisplay | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReferralFormOpen, setIsReferralFormOpen] = useState(false)

  const fetchAnimalBiteRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all animal bite records (backend now sorts by latest)
      const allRecords = await getAnimalBitePatientDetails()
      console.log("Fetched records:", allRecords)

      // Group records by patient ID
      const patientGroups = new Map<string, any[]>()

      allRecords.forEach((record: any) => {
        const patientId = record.patient_id
        if (!patientGroups.has(patientId)) {
          patientGroups.set(patientId, [])
        }
        patientGroups.get(patientId)?.push(record)
      })

      // Create unique patient display objects with latest record and count
      const uniquePatients: UniquePatientDisplay[] = []

      patientGroups.forEach((records, patientId) => {
        // The backend should already sort by latest, so the first record is the most recent.
        // No client-side sort needed here if backend ordering is reliable.
        const latestRecord = records[0] 

        if (latestRecord) {
          uniquePatients.push({
            id: patientId,
            fname: latestRecord.patient_fname || "Unknown",
            lname: latestRecord.patient_lname || "Unknown",
            gender: latestRecord.patient_sex || "Unknown",
            age: calculateAge(latestRecord.patient_dob),
            date: latestRecord.referral_date,
            transient: latestRecord.referral_transient,
            exposure: latestRecord.exposure_type,
            siteOfExposure: latestRecord.exposure_site,
            bitingAnimal: latestRecord.biting_animal,
            actions_taken: latestRecord.actions_taken || "",
            referredby: latestRecord.referredby || "",
            recordCount: records.length,
          })
        }
      })

      setPatients(uniquePatients)
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to load animal bite records. Please try again.")
      toast.error("Failed to load animal bite records.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnimalBiteRecords()
  }, [])

  const handleDeletePatient = (patient: UniquePatientDisplay) => {
    setSelectedPatientForDeletion(patient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPatientForDeletion) return
    setIsDeleting(true)
    try {
      await deleteAnimalBitePatient(selectedPatientForDeletion.id)
      toast.success(`Deleted records for ${selectedPatientForDeletion.fname} ${selectedPatientForDeletion.lname}`)
      fetchAnimalBiteRecords() // Refresh data after deletion
    } catch (err) {
      toast.error("Failed to delete patient records")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedPatientForDeletion(null)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleReferralFormClose = () => {
    setIsReferralFormOpen(false)
    // Refresh data after form closes
    fetchAnimalBiteRecords()
  }

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const str =
        `${p.fname} ${p.lname} ${p.age} ${p.gender} ${p.date} ${p.exposure} ${p.siteOfExposure} ${p.bitingAnimal}`.toLowerCase()
      const matchesSearch = str.includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterValue === "All" ||
        (filterValue === "Bite" && p.exposure === "Bite") ||
        (filterValue === "Non-bite" && p.exposure === "Non-bite")
      return matchesSearch && matchesFilter
    })
  }, [patients, searchQuery, filterValue])

  const columns: ColumnDef<UniquePatientDisplay>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              {/* Link to individual history using patient's pat_id */}
              <Link to={`/Animalbite_individual/${p.id}`} className="hover:text-blue-600 hover:underline">
                <div className="font-medium truncate">{`${p.lname}, ${p.fname}`}</div>
                <div className="text-sm text-darkGray">
                  {p.gender}, {p.age} years old
                  {p.recordCount > 1 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-sm font-bold p-1 rounded">
                        {p.recordCount} records
                    </span>

                  )}
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
      accessorKey: "actions_taken",
      header: "Actions Taken",
      cell: ({ row }) => {
        const actions = row.original.actions_taken
        return actions && actions.length > 30 ? `${actions.substring(0, 30)}...` : actions
      },
    },
    { accessorKey: "referredby", header: "Referred by" },
    {
      accessorKey: "button",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          {/* <TooltipProvider>
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                  <Link to={`/Animalbite_individual/${row.original.id}`}>
                    <Eye size={15} />
                  </Link>
                </div>
              }
              content="View Details"
            />
          </TooltipProvider> */}
          <TooltipProvider>
            <TooltipLayout
              trigger={
                <div
                  className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"
                  onClick={() => handleDeletePatient(row.original)}
                >
                  <Trash size={16} />
                </div>
              }
              content="Delete All Records"
            />
          </TooltipProvider>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto p-3 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Animal Bites Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view animal bite records</p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex gap-x-2">
          <div className="relative">
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
            className="w-[200px] bg-white"
            options={[
              { id: "All", name: "All" },
              { id: "Bite", name: "Bite" },
              { id: "Non-bite", name: "Non-bite" },
            ]}
            value={filterValue}
            onChange={(value) => setFilterValue(value)}
          />
        </div>

        <Button onClick={() => setIsReferralFormOpen(true)} className="font-medium py-2 px-4 rounded-md shadow-sm">
          New Record
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading patient records...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-6">{error}</div>
      ) : (
        <div className="w-full bg-white overflow-x-auto">
          <DataTable columns={columns} data={filteredPatients} />
          <p className="text-xs sm:text-sm text-darkGray mt-2">
            Showing {filteredPatients.length} of {patients.length} records
          </p>
        </div>
      )}

      <DialogLayout
        isOpen={isReferralFormOpen}
        onClose={handleReferralFormClose}
        className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
        title=""
        description=""
        mainContent={
          <ReferralFormModal
            onClose={handleReferralFormClose}
            onAddPatient={(newPatient) => {
              console.log("New patient added:", newPatient)
              fetchAnimalBiteRecords() // Refresh data after adding
            }}
          />
        }
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Records"
        description={
          selectedPatientForDeletion
            ? `Are you sure you want to delete all records for ${selectedPatientForDeletion.fname} ${selectedPatientForDeletion.lname}?`
            : "Are you sure you want to delete this patient's records?"
        }
      />

      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Deleting patient records...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overall
