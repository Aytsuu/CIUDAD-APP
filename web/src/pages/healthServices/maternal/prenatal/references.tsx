// import { useEffect, useState } from "react"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import type { z } from "zod"
// import ReferralFormSchema from "@/form-schema/animal-bite-schema"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Button } from "@/components/ui/button/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage
// } from "@/components/ui/form/form"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select/select"
// import { Link } from "react-router"
// import { Combobox } from "@/components/ui/combobox"
// import { api } from "@/api/api"
// import { toast } from "sonner"
// import { Label } from "@/components/ui/label"
// import { FormInput } from "@/components/ui/form/form-input"
// import { FormTextArea } from "@/components/ui/form/form-text-area"
// import { bitedetails, patient, referral } from "./db-request/postrequest"

// const SelectField = ({
//   name,
//   label,
//   options,
//   control
// }: {
//   name: string
//   label: string
//   options: string[]
//   control: any
// }) => (
//   <FormField
//     control={control}
//     name={name}
//     render={({ field }) => (
//       <FormItem>
//         <Label>{label}</Label>
//         <FormControl>
//           <Select onValueChange={field.onChange} value={field.value}>
//             <SelectTrigger>
//               <SelectValue placeholder={`Select ${label}`} />
//             </SelectTrigger>
//             <SelectContent>
//               {options.map(option => (
//                 <SelectItem key={option} value={option}>
//                   {option}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// )

// type ReferralFormModalProps = {
//   onClose: () => void
//   onAddPatient?: (patient: any) => void
// }

// interface PatientRecord {
//   personal_info: any
//   pat_id: any
//   patrec_id: number
//   per_fname: string
//   per_lname: string
//   per_mname: string
//   per_dob: string
//   per_age: string
//   per_sex: string
//   per_address: string
// }

// const calculateAge = (dobStr: string): number => {
//   const dob = new Date(dobStr)
//   const today = new Date()
//   const age = today.getFullYear() - dob.getFullYear()
//   const hasHadBirthday =
//     today.getMonth() > dob.getMonth() ||
//     (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())
//   return hasHadBirthday ? age : age - 1
// }

// export default function ReferralFormModal({ onClose, onAddPatient }: ReferralFormModalProps) {
//   const form = useForm<z.infer<typeof ReferralFormSchema>>({
//     resolver: zodResolver(ReferralFormSchema),
//     defaultValues: {
//       pat_id: undefined,
//       receiver: "",
//       sender: "",
//       date: "",
//       transient: false,
//       p_lname: "",
//       p_fname: "",
//       p_mname: "",
//       p_address: "",
//       p_age: 0,
//       p_gender: "",
//       exposure_type: "",
//       exposure_site: "",
//       biting_animal: "",
//       p_actions: "",
//       p_referred: ""
//     }
//   })

//   const [patients, setPatients] = useState<{ default: PatientRecord[]; formatted: { id: string; name: string }[] }>({
//     default: [],
//     formatted: []
//   })
//   const [selectedPatientId, setSelectedPatientId] = useState<string>("")
//   const [loading, setLoading] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)


//   useEffect(() => {
//     const fetchPatients = async () => {
//       setLoading(true)
//       try {
//         const response = await api.get("patientrecords/patient/")
//         const patientData = response.data

//         const formatted = patientData.map((patient: any) => ({
//           id: patient.pat_id.toString(),
//           name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim()
//         }))

//         setPatients({
//           default: patientData,
//           formatted
//         })
//       } catch (error) {
//         console.error("Error fetching patients:", error)
//         toast.error("Failed to load patient records")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchPatients()
//   }, [])


//   const handlePatientSelection = (id: string) => {
//     setSelectedPatientId(id)
//     const selectedPatient = patients.default.find(p => p.pat_id.toString() === id)

//     if (selectedPatient) {
//       console.log("Selected Patient:", selectedPatient)
//       setSelectedPatientId(selectedPatient.pat_id.toString());
//       const personalInfo = selectedPatient.personal_info;
//       form.setValue("pat_id", selectedPatient.pat_id)
//       form.setValue("p_lname", personalInfo?.per_lname)
//       form.setValue("p_fname", personalInfo?.per_fname)
//       form.setValue("p_mname", personalInfo?.per_mname)
//       form.setValue("p_address", personalInfo?.per_address)
//       form.setValue("p_age", calculateAge(personalInfo?.per_dob))
//       form.setValue("p_gender", personalInfo?.per_sex)
//     }
//   }

//   const onSubmit = async () => {
//     console.log("Form values before submission:", form.getValues())
//     const isValid = await form.trigger()
//     if (!isValid) return

//     const values = form.getValues()
//     setIsSubmitting(true)
//     setError(null)

//     try {
//       const animalbite_record_id = await patient(values)
//       const referral_id = await referral({ ...values, animalbite_record_id })
//       await bitedetails({ ...values, referral_id })
//       onAddPatient?.({ id: referral_id, ...values })
//       onClose()
//     } catch (err: any) {
//       console.error("❌ Submission error:", err)
//       setError(err?.message || "Something went wrong")
//       toast.error(err?.message || "Submission failed. Please try again.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="p-3">
//       <h2 className="text-xl font-bold mb-4 border-l-4 border-green-600 pl-2">Animal Bites Referral Form</h2>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
//       )}

//       <Form {...form}>
//         <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="p-4 space-y-4">
//           <div className="grid md:grid-cols-2 gap-4">
//             <FormInput control={form.control} name="receiver" label="Receiver" />
//             <FormInput control={form.control} name="sender" label="Sender" />
//             <FormInput control={form.control} name="date" label="Date" type="date" />
//             <FormField
//               control={form.control}
//               name="transient"
//               render={({ field }) => (
//                 <FormItem className="flex items-center gap-2 mt-3">
//                   <FormControl>
//                     <Checkbox checked={field.value} onCheckedChange={field.onChange} />
//                   </FormControl>
//                   <Label>Transient</Label>
//                 </FormItem>
//               )}
//             />
//           </div>

//           <div className="border-t pt-4 mt-4">
//             <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
//             <div className="flex flex-col sm:flex-row items-center mb-5 justify-between w-full">
//               <Combobox
//                 options={patients.formatted}
//                 value={selectedPatientId}
//                 onChange={handlePatientSelection}
//                 placeholder={loading ? "Loading patients..." : "Select a patient"}
//                 triggerClassName="font-normal w-[30rem]"
//                 emptyMessage={
//                   <div className="flex gap-2 justify-center items-center">
//                     <Label className="font-normal text-[13px]">
//                       {loading ? "Loading..." : "No patient found."}
//                     </Label>
//                     <Link to="/patient-records/new">
//                       <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
//                         Register New Patient
//                       </Label>
//                     </Link>
//                   </div>
//                 }
//               />
//             </div>
//             <div className="grid md:grid-cols-3 gap-4">
//               {[
//                 { name: "p_lname", label: "Last Name" },
//                 { name: "p_fname", label: "First Name" },
//                 { name: "p_mname", label: "Middle Name" },
//                 { name: "p_address", label: "Address" },
//                 { name: "p_age", label: "Age", type: "number" },
//                 { name: "p_gender", label: "Gender" }
//               ].map(({ name, label, type }) => (
//                 <FormInput key={name} control={form.control} name={name} label={label} type={type} readOnly />
//               ))}
//             </div>
//           </div>

//           <div className="border-t pt-4 mt-4">
//             <h3 className="text-lg font-semibold mb-4">Animal Bite Details</h3>
//             <div className="grid md:grid-cols-3 gap-4">
//               <SelectField control={form.control} name="exposure_type" label="Type of Exposure" options={["Bite", "Non-bite"]} />
//               <FormInput control={form.control} name="exposure_site" label="Site of Exposure" />
//               <FormInput control={form.control} name="biting_animal" label="Biting Animal" />
//               <FormTextArea control={form.control} name="p_actions" label="Actions Taken" />
//               <FormInput control={form.control} name="p_referred" label="Referred by" />
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
//             <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
//               Submit
//             </Button>
//             <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40 w-full sm:w-1/2">
//               {JSON.stringify(form.getValues(), null, 2)}
//             </pre>
//           </div>
//         </form>
//       </Form>
//     </div>
//   )
// }