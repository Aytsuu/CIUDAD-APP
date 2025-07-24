// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Form } from "@/components/ui/form/form"
// import { Button } from "@/components/ui/button/button"
// import { Calendar, Trash2, Loader2, Plus } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { VaccinesSchema, type VaccineType } from "@/form-schema/chr-schema"
// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import ChildVaccines from "./ChildVaccines"
// import { Combobox } from "@/components/ui/combobox"
// import { Label } from "@/components/ui/label"
// import { toast } from "sonner"
// import { api2 } from "@/api/api"
// import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
// import { FormInput } from "@/components/ui/form/form-input"
// import type { ColumnDef } from "@tanstack/react-table"
// import { DataTable } from "@/components/ui/table/data-table"
// import { Checkbox } from "@/components/ui/checkbox"

// type Page1Props = {
//   onPrevious: () => void
//   onNext: () => void
//   updateFormData: (data: Partial<VaccineType>) => void
//   formData: VaccineType
// }

// type VaccineRecord = {
//   vacStck_id?: string
//   vaccineType?: string
//   dose?: string
//   date?: string
//   vac_id?: string
//   vac_name?: string
//   expiry_date?: string
// }

// type ExistingVaccineRecord = {
//   vac_id?: string
//   vaccineType?: string
//   dose?: string
//   date?: string
//   vac_name?: string
// }

// const fetchVaccinesWithStock = async () => {
//   try {
//     const response = await api2.get("/inventory/vaccine_stocks/")
//     const stocks = response.data
//     if (!stocks || !Array.isArray(stocks)) {
//       console.log("No vaccine stocks available.")
//       return {
//         default: [],
//         formatted: [],
//       }
//     }
//     const availableStocks = stocks.filter((stock) => {
//       const isExpired = stock.inv_details?.expiry_date && new Date(stock.inv_details.expiry_date) < new Date()
//       return stock.vacStck_qty_avail > 0 && !isExpired
//     })
//     return {
//       default: availableStocks,
//       formatted: availableStocks.map((stock) => ({
//         id: `${stock.vacStck_id.toString()},${stock.vac_id},${stock.vaccinelist?.vac_name || "Unknown"},${
//           stock.inv_details?.expiry_date || ""
//         }`,
//         name: `${stock.vaccinelist?.vac_name || "Unknown"} (Exp: ${
//           stock.inv_details?.expiry_date ? new Date(stock.inv_details.expiry_date).toLocaleDateString() : "N/A"
//         })`,
//       })),
//     }
//   } catch (error) {
//     console.error("Error fetching vaccine stocks:", error)
//     toast.error("Failed to load vaccine stocks")
//     throw error
//   }
// }

// const fetchVaccineList = async () => {
//   try {
//     const response = await api2.get("/inventory/vac_list/")
//     const vaccines = response.data
//     if (!vaccines || !Array.isArray(vaccines)) {
//       console.log("No vaccines available.")
//       return {
//         default: [],
//         formatted: [],
//       }
//     }
//     return {
//       default: vaccines,
//       formatted: vaccines.map((vaccine) => ({
//         id: `${vaccine.vac_id.toString()},${vaccine.vac_name}`,
//         name: `${vaccine.vac_name}`,
//       })),
//     }
//   } catch (error) {
//     console.error("Error fetching vaccine list:", error)
//     toast.error("Failed to load vaccine list")
//     throw error
//   }
// }

// export default function ChildHRPage3({ onPrevious, onNext, updateFormData, formData }: Page1Props) {
//   const form = useForm<VaccineType>({
//     defaultValues: {
//       vaccines: [],
//       hasExistingVaccination: formData.hasExistingVaccination || false,
//       existingVaccines: [],
//     },
//     resolver: zodResolver(VaccinesSchema),
//   })

//   const [vaccines, setVaccines] = useState<VaccineRecord[]>(formData.vaccines ?? [])
//   const [existingVaccines, setExistingVaccines] = useState<ExistingVaccineRecord[]>(formData.existingVaccines ?? [])
//   const [selectedVaccineId, setSelectedVaccineId] = useState<string>("")
//   const [selectedVaccineListId, setSelectedVaccineListId] = useState<string>("")
//   const [showVaccineList, setShowVaccineList] = useState<boolean>(formData.hasExistingVaccination || false)
//   const [vaccineOptions, setVaccineOptions] = useState<{
//     default: any[]
//     formatted: { id: string; name: string }[]
//   }>({ default: [], formatted: [] })
//   const [vaccineListOptions, setVaccineListOptions] = useState<{
//     default: any[]
//     formatted: { id: string; name: string }[]
//   }>({ default: [], formatted: [] })
//   const [isLoading, setIsLoading] = useState(false)
//   const [isLoadingVaccineList, setIsLoadingVaccineList] = useState(false)

//   const loadVaccines = useCallback(async () => {
//     setIsLoading(true)
//     try {
//       const data = await fetchVaccinesWithStock()
//       setVaccineOptions(data)
//     } catch (error) {
//       toast.error("Failed to load vaccines")
//     } finally {
//       setIsLoading(false)
//     }
//   }, [])

//   const loadVaccineList = useCallback(async () => {
//     setIsLoadingVaccineList(true)
//     try {
//       const data = await fetchVaccineList()
//       setVaccineListOptions(data)
//     } catch (error) {
//       toast.error("Failed to load vaccine list")
//     } finally {
//       setIsLoadingVaccineList(false)
//     }
//   }, [])

//   useEffect(() => {
//     loadVaccines()
//     loadVaccineList()
//   }, [loadVaccines, loadVaccineList])

//   useEffect(() => {
//     setVaccines(formData.vaccines ?? [])
//     setExistingVaccines(formData.existingVaccines ?? [])
//     setShowVaccineList(formData.hasExistingVaccination || false)

//     // Update form with existing data
//     form.setValue("hasExistingVaccination", formData.hasExistingVaccination || false)
//   }, [formData, form])

//   const handleVaccineSelection = useCallback(
//     (id: string) => {
//       setSelectedVaccineId(id)
//       if (id) {
//         const trimmedId = id.split(",")[0].trim()
//         form.setValue("vaccines.0.vacStck_id", trimmedId)
//         form.setValue("vaccines.0.dose", "1")
//         form.setValue("vaccines.0.date", new Date().toISOString().split("T")[0])
//       } else {
//         // Clear form values when no selection
//         form.setValue("vaccines.0.vacStck_id", "")
//         form.setValue("vaccines.0.dose", "")
//         form.setValue("vaccines.0.date", "")
//       }
//     },
//     [form],
//   )

//   const handleVaccineListSelection = useCallback(
//     (id: string) => {
//       setSelectedVaccineListId(id)
//       if (id) {
//         const trimmedId = id.split(",")[0].trim()
//         form.setValue("existingVaccines.0.vac_id", trimmedId)
//         form.setValue("existingVaccines.0.dose", "1")
//         form.setValue("existingVaccines.0.date", new Date().toISOString().split("T")[0])
//       } else {
//         // Clear form values when no selection
//         form.setValue("existingVaccines.0.vac_id", "")
//         form.setValue("existingVaccines.0.dose", "")
//         form.setValue("existingVaccines.0.date", "")
//       }
//     },
//     [form],
//   )

//   const handleShowVaccineListChange = (checked: boolean) => {
//     setShowVaccineList(checked)
//     form.setValue("hasExistingVaccination", checked)
//     if (!checked) {
//       setExistingVaccines([])
//       form.setValue("existingVaccines", [])
//       setSelectedVaccineListId("")
//     }
//   }

//   const addVac = () => {
//     const currentValues = form.getValues()
//     if (
//       selectedVaccineId &&
//       currentValues.vaccines?.[0]?.dose &&
//       currentValues.vaccines?.[0]?.date &&
//       currentValues.vaccines?.[0]?.vacStck_id
//     ) {
//       const [vacStck_id, vac_id, vac_name, expiry_date] = selectedVaccineId.split(",")

//       const vaccineToAdd = {
//         vacStck_id: vacStck_id.trim(),
//         vaccineType: vac_name.trim(),
//         dose: currentValues.vaccines[0].dose,
//         date: currentValues.vaccines[0].date,
//         vac_id: vac_id.trim(),
//         vac_name: vac_name.trim(),
//         expiry_date: expiry_date.trim(),
//       }

//       const updatedVaccines = [...vaccines, vaccineToAdd]
//       setVaccines(updatedVaccines)
//       updateFormData({
//         vaccines: updatedVaccines,
//         hasExistingVaccination: showVaccineList,
//         existingVaccines: existingVaccines,
//       })

//       // Reset selection and form values
//       setSelectedVaccineId("")
//       form.setValue("vaccines.0.vacStck_id", "")
//       form.setValue("vaccines.0.dose", "")
//       form.setValue("vaccines.0.date", "")
//     }
//   }

//   const addExistingVac = () => {
//     const currentValues = form.getValues()
//     if (
//       selectedVaccineListId &&
//       currentValues.existingVaccines?.[0]?.dose &&
//       currentValues.existingVaccines?.[0]?.date &&
//       currentValues.existingVaccines?.[0]?.vac_id
//     ) {
//       const [vac_id, vac_name] = selectedVaccineListId.split(",")

//       const vaccineToAdd = {
//         vac_id: vac_id.trim(),
//         vaccineType: vac_name.trim(),
//         dose: currentValues.existingVaccines[0].dose,
//         date: currentValues.existingVaccines[0].date,
//         vac_name: vac_name.trim(),
//       }

//       const updatedExistingVaccines = [...existingVaccines, vaccineToAdd]
//       setExistingVaccines(updatedExistingVaccines)
//       updateFormData({
//         vaccines,
//         hasExistingVaccination: true,
//         existingVaccines: updatedExistingVaccines,
//       })

//       // Reset selection and form values
//       setSelectedVaccineListId("")
//       form.setValue("existingVaccines.0.vac_id", "")
//       form.setValue("existingVaccines.0.dose", "")
//       form.setValue("existingVaccines.0.date", "")
//     }
//   }

//   const deleteVac = (vacStck_id: string) => {
//     const updatedVaccines = vaccines.filter((vac) => vac.vacStck_id !== vacStck_id)
//     setVaccines(updatedVaccines)
//     updateFormData({
//       vaccines: updatedVaccines,
//       hasExistingVaccination: showVaccineList,
//       existingVaccines: existingVaccines,
//     })
//   }

//   const deleteExistingVac = (vac_id: string) => {
//     const updatedExistingVaccines = existingVaccines.filter((vac) => vac.vac_id !== vac_id)
//     setExistingVaccines(updatedExistingVaccines)
//     updateFormData({
//       vaccines,
//       hasExistingVaccination: updatedExistingVaccines.length > 0,
//       existingVaccines: updatedExistingVaccines,
//     })
//   }

//   const vaccineColumns: ColumnDef<VaccineRecord>[] = [
//     {
//       accessorKey: "vaccineType",
//       header: "Vaccine Type",
//       cell: ({ row }) => <div className="font-medium">{row.original.vaccineType}</div>,
//     },
//     {
//       accessorKey: "dose",
//       header: "Dose",
//       cell: ({ row }) => <Badge variant="secondary">{row.original.dose}</Badge>,
//     },
//     {
//       accessorKey: "date",
//       header: "Date",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <Calendar className="h-4 w-4 text-muted-foreground" />
//           {row.original.date ? new Date(row.original.date).toLocaleDateString() : "N/A"}
//         </div>
//       ),
//     },
//     {
//       id: "actions",
//       cell: ({ row }) => (
//         <Button
//           variant="destructive"
//           size="sm"
//           type="button"
//           onClick={() => row.original.vacStck_id && deleteVac(row.original.vacStck_id)}
//           className="h-8"
//         >
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       ),
//     },
//   ]

//   const existingVaccineColumns: ColumnDef<ExistingVaccineRecord>[] = [
//     {
//       accessorKey: "vaccineType",
//       header: "Vaccine Type",
//       cell: ({ row }) => <div className="font-medium">{row.original.vaccineType}</div>,
//     },
//     {
//       accessorKey: "dose",
//       header: "Dose",
//       cell: ({ row }) => <Badge variant="outline">{row.original.dose}</Badge>,
//     },
//     {
//       accessorKey: "date",
//       header: "Date",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           <Calendar className="h-4 w-4 text-muted-foreground" />
//           {row.original.date ? new Date(row.original.date).toLocaleDateString() : "N/A"}
//         </div>
//       ),
//     },
//     {
//       id: "actions",
//       cell: ({ row }) => (
//         <Button
//           variant="destructive"
//           size="sm"
//           onClick={() => row.original.vac_id && deleteExistingVac(row.original.vac_id)}
//           className="h-8"
//         >
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       ),
//     },
//   ]

//   const onsubmitForm = (data: VaccineType) => {
//     console.log("PAGE 3:", data)
//     // Update with current state data instead of form data
//     updateFormData({
//       vaccines: vaccines,
//       hasExistingVaccination: showVaccineList,
//       existingVaccines: existingVaccines,
//     })
//     onNext()
//   }

//   return (
//     <div className="w-full bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onsubmitForm)} className="space-y-6">
//           <h3 className="font-semibold text-lg md:text-xl">Immunization Records</h3>
//           <div className="grid grid-cols-1 gap-6">
//             {/* Existing Vaccination Toggle */}
//             <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border">
//               <Checkbox
//                 id="hasExistingVaccination"
//                 checked={showVaccineList}
//                 onCheckedChange={handleShowVaccineListChange}
//               />
//               <Label htmlFor="hasExistingVaccination" className="text-sm font-medium">
//                 Does this child have existing vaccinations?
//               </Label>
//             </div>

//             {/* Existing Vaccination Form */}
//             {showVaccineList && (
//               <div className="border rounded-lg p-4 space-y-4">
//                 <h4 className="font-medium text-md text-green-800">Add Existing Vaccination</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
//                   <div className="md:col-span-2">
//                     <Label className="mb-2 block text-sm font-medium text-gray-700">Vaccine Name</Label>
//                     <Combobox
//                       options={vaccineListOptions.formatted}
//                       value={selectedVaccineListId}
//                       onChange={handleVaccineListSelection}
//                       placeholder={isLoadingVaccineList ? "Loading vaccines..." : "Search and select a vaccine"}
//                       triggerClassName="font-normal w-full"
//                       emptyMessage={
//                         <div className="flex gap-2 justify-center items-center">
//                           <Label className="font-normal text-[13px]">
//                             {isLoadingVaccineList ? <Loader2 className="h-4 w-4 animate-spin" /> : "No vaccines found."}
//                           </Label>
//                         </div>
//                       }
//                     />
//                   </div>
//                   <div>
//                     <FormInput
//                       control={form.control}
//                       name="existingVaccines.0.dose"
//                       label="Dose Number"
//                       type="number"
//                       min={1}
//                       maxLength={1}
//                       className="w-full"
//                     />
//                   </div>
//                   <div className="w-full">
//                     <FormDateTimeInput
//                       control={form.control}
//                       name="existingVaccines.0.date"
//                       label="Date Administered"
//                       type="date"
//                     />
//                   </div>
//                   <div className="flex justify-center">
//                     <Button
//                       type="button"
//                       className="bg-green-600 hover:bg-green-700 text-white w-full"
//                       onClick={addExistingVac}
//                       disabled={
//                         !selectedVaccineListId ||
//                         !form.watch("existingVaccines.0.dose") ||
//                         !form.watch("existingVaccines.0.date")
//                       }
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="p-2 w-full">
//                   {existingVaccines.length === 0 ? (
//                     <div className="text-center py-4 text-gray-500">No existing vaccines added yet</div>
//                   ) : (
//                     <DataTable columns={existingVaccineColumns} data={existingVaccines} />
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="flex justify-end mt-4">
//               <DialogLayout
//                 trigger={
//                   <Button variant="link" className="text-blue-600 italic underline p-0">
//                     View Full Vaccine Schedule →
//                   </Button>
//                 }
//                 className="max-w-[80%] lg:max-w-[60%] h-[80vh]"
//                 title="Vaccine Schedule"
//                 description="List of all vaccines to be administered according to schedule."
//                 mainContent={<ChildVaccines />}
//               />
//             </div>

//             {/* New Vaccination Form */}
//             <div className="border rounded-lg p-4 space-y-4">
//               <h4 className="font-medium text-md text-blue-800">Add New Vaccination</h4>
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
//                 <div className="md:col-span-2">
//                   <Label className="mb-2 block text-sm font-medium text-gray-700">Vaccine Name</Label>
//                   <Combobox
//                     options={vaccineOptions.formatted}
//                     value={selectedVaccineId}
//                     onChange={handleVaccineSelection}
//                     placeholder={isLoading ? "Loading vaccines..." : "Search and select a vaccine"}
//                     triggerClassName="font-normal w-full"
//                     emptyMessage={
//                       <div className="flex gap-2 justify-center items-center">
//                         <Label className="font-normal text-[13px]">
//                           {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "No available vaccines in stock."}
//                         </Label>
//                       </div>
//                     }
//                   />
//                 </div>
//                 <div>
//                   <FormInput
//                     control={form.control}
//                     name="vaccines.0.dose"
//                     label="Dose Number"
//                     type="number"
//                     min={1}
//                     maxLength={1}
//                     className="w-full"
//                   />
//                 </div>
//                 <div className="w-full">
//                   <FormDateTimeInput
//                     control={form.control}
//                     name="vaccines.0.date"
//                     label="Date Administered"
//                     type="date"
//                   />
//                 </div>
//                 <div className="flex justify-center">
//                   <Button
//                     type="button"
//                     className="bg-blue-600 hover:bg-blue-700 text-white w-full"
//                     onClick={addVac}
//                     disabled={!selectedVaccineId || !form.watch("vaccines.0.dose") || !form.watch("vaccines.0.date")}
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add
//                   </Button>
//                 </div>
//               </div>
//               <div className="p-2 w-full">
//                 {vaccines.length === 0 ? (
//                   <div className="text-center py-4 text-gray-500">No vaccines added yet</div>
//                 ) : (
//                   <DataTable columns={vaccineColumns} data={vaccines} />
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Navigation Buttons */}
//           <div className="flex flex-col sm:flex-row w-full justify-end gap-4 pt-4">
//             <Button variant="outline" type="button" onClick={onPrevious} className="w-full sm:w-auto bg-transparent">
//               Previous
//             </Button>
//             <Button type="submit" className="w-full sm:w-auto">
//               Next
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   )
// }
