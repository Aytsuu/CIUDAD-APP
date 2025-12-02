"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Plus, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useNavigate } from "react-router"

import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormTextArea } from "@/components/ui/form/form-text-area"

import { BHWFormSchema } from "./bhw-form"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { useForm, useFieldArray } from "react-hook-form"
import { Form } from "@/components/ui/form/form"
import { Label } from "@/components/ui/label"
import { FormSelect } from "@/components/ui/form/form-select"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import { showErrorToast } from "@/components/ui/toast"

import { calculateAgeFromDOB } from "@/helpers/ageCalculator"
import { capitalize } from "@/helpers/capitalize"

import { NutritionalStatusCalculator } from "@/components/ui/nutritional-status-calculator"
import { PatientSearch } from "@/components/ui/patientSearch"
import { IllnessCombobox } from "@/pages/healthServices/maternal/maternal-components/illness-combobox"

import { useIllnessList } from "@/pages/healthServices/maternal/queries/maternalFetchQueries"
import { useAddIllnessData } from "@/pages/healthServices/maternal/queries/maternalAddQueries"
import { useCreateBHWDailyNote } from "./queries/Add"
import { useQuery } from "@tanstack/react-query"
import { api2 } from "@/api/api"
import { Input } from "@/components/ui/input"


export default function BHWNoteForm() {
   const defaultValues = generateDefaultValues(BHWFormSchema)
   const navigate = useNavigate();

   const [selectedIllnessId, setSelectedIllnessId] = useState<string>("");
   const [patientDisplay, setPatientDisplay] = useState<string>("");

   const { data: illnessesData, refetch: refetchIllnesses } = useIllnessList();

   // mutation for adding illness
   const addIllnessMutation = useAddIllnessData();
   
   // mutation for creating BHW daily note
   const createBHWMutation = useCreateBHWDailyNote();

   const { user } = useAuth()
   const staffId = user?.staff?.staff_id || ""
   
   const today = new Date().toISOString().split("T")[0]
   
   const form = useForm<z.infer<typeof BHWFormSchema>>({
      resolver: zodResolver(BHWFormSchema),
      defaultValues,
   })

   // Initialize staff/date once available
   useEffect(() => {
      if (staffId) form.setValue("staffId", staffId)
      if (today) form.setValue("dateToday", today)
   }, [staffId, today, form])

   // single patient selection handler
   const handlePatientSelect = (patient: any | null, patientId: string) => {
      setPatientDisplay(patientId || "")
      if (patient) {
         const personalInfo = patient?.personal_info
         const dob = personalInfo?.per_dob
         if (dob) {
            const ageData = calculateAgeFromDOB(dob)
            form.setValue("age", ageData.ageString)
         }
         const rawGender = personalInfo?.per_sex
         if (rawGender) {
            const normalizedGender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
            if (normalizedGender === "Male" || normalizedGender === "Female") {
               form.setValue("gender", normalizedGender as any)
            }
         }
         if (patient.pat_id) form.setValue("pat_id", patient.pat_id.toString())
      } else {
         form.setValue("pat_id", "")
         form.setValue("age", "")
      }
   }

    // illness fetching
  const getIllnessOptions = () => {
    if (!illnessesData?.illnesses) return [];

    return illnessesData.illnesses.map((illness: any) => ({
      id: illness.ill_id?.toString() || "",
      name: illness.illname || "None",
    }));
  };

   const handleAddNewIllness = async (newIllness: string) => {
      try {
         const IllnessData = {
            illname: capitalize(newIllness),
         };

         await addIllnessMutation.mutateAsync(IllnessData as any);

         await refetchIllnesses();
      
      } catch (error) {
      showErrorToast("Failed to add illness");
      }
   };
   

   // Field array for dynamic illnesses
   const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "illnesses"
   })

   // Fetch patients with optional (is_opt = true) body measurements
   const [optSearch, setOptSearch] = useState("")
   const {
      data: optPatients,
      isLoading: isLoadingOpt,
      isError: isErrorOpt,
      error: errorOpt,
      refetch: refetchOpt
   } = useQuery({
      queryKey: ["bhwOptPatients", optSearch],
      queryFn: async () => {
         const res = await api2.get("/reports/bhw/patients-with-opt-measurements/", {
            params: { search: optSearch, page_size: 10 }
         })
         return res.data
      },
      staleTime: 5000,
      retry: 1
   })

   const weight = form.watch("weight")
   const height = form.watch("height")
   const age = form.watch("age")
   const gender = form.watch("gender") as any
   const muac = form.watch("muac")

   const handleSubmit = async (data: z.infer<typeof BHWFormSchema>) => {
      try {
         const payload: any = {
            staffId: data.staffId,
            dateToday: data.dateToday,
            description: data.description,
            illnesses: data.illnesses || [],
            body_measurement: {
               pat_id: data.pat_id,
               weight: data.weight,
               height: data.height,
               nutritionalStatus: data.nutritionalStatus,
            },
         }
         await createBHWMutation.mutateAsync(payload)

         navigate(-1);
         
         // Reset form after successful submission
         form.reset()
         setPatientDisplay("")
         setSelectedIllnessId("")
      } catch (error) {
         console.error("Failed to submit BHW Daily Note:", error)
         showErrorToast("Failed to submit BHW Daily Note")
      }
   }

   const handleFormError = (errors: any) => {
      console.log("Form validation errors:", errors)
      
      // Show the first error message
      const firstError = Object.values(errors)[0] as any
      if (firstError?.message) {
         showErrorToast(firstError.message)
      }
   }

   return (
      <LayoutWithBack
         title="BHW Note Form"
         description="Create Barangay Health Worker notes"
      >
         <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleFormError)}>
               <div className="bg-white p-6 rounded-md shadow-md w-full">
                  <div className="p-4">
                     <div className="flex justify-center">
                        <h3 className="py-3 font-bold text-lg">Barangay Health Worker Daily Notes</h3>
                     </div>
                  </div>
                  <div className="">
                     <div className="flex justify-between mb-5 gap-4">
                        <div className="flex w-[20rem] ">
                           <div className="flex-1">
                              <FormInput
                                 control={form.control}
                                 label="Staff ID"
                                 placeholder="Barangay Health Worker ID"
                                 name="staffId"
                              />
                           </div>
                          
                        </div>
                        
                        <div className="flex w-[15rem]">
                           <div className="flex-1">
                              <FormDateTimeInput
                                 control={form.control}
                                 label="Date"
                                 type="date"
                                 name="dateToday"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="mb-7">
                        <FormTextArea
                           control={form.control}
                           label="Additional Information"
                           placeholder="Enter description of field activities you have done today..."
                           name="description"
                        />
                     </div>
                     
                     <div className="mb-7">
                        <Label className=" text-md font-semibold">Child Anthropometric Measurements</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="grid grid-cols-2 mb-4">
                           <div className="border rounded-md">
                              <PatientSearch
                                 onPatientSelect={(p, pid) => handlePatientSelect(p, pid)}
                                 value={patientDisplay}
                                 onChange={(val) => setPatientDisplay(val)}
                                 ischildren={true}
                              />
                           </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                           <FormInput
                              control={form.control}
                              label="Age"
                              placeholder="e.g., 2 years 3 months"
                              name="age"
                           />
                           <FormSelect
                              control={form.control}
                              label="Gender"
                              placeholder="Select gender"
                              name="gender"
                              options={[
                                 { id: "Male", name: "Male" },
                                 { id: "Female", name: "Female" }
                              ]}
                           />
                           <FormInput
                              control={form.control}
                              label="Weight"
                              placeholder="Enter weight"
                              name="weight"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Height"
                              placeholder="Enter height"
                              name="height"
                              type="number"
                           />
                        </div>
                        <NutritionalStatusCalculator
                           weight={weight ? Number(weight) : undefined}
                           height={height ? Number(height) : undefined}
                           muac={muac}
                           age={age}
                           gender={gender as "Male" | "Female"}
                           onStatusChange={(status) => form.setValue("nutritionalStatus" as any, status)}
                        />
                     </div>

                     {/* Patients with is_opt body measurements */}
                     <div className="mb-7">
                        <Label className=" text-md font-semibold">Recent OPT Body Measurements</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="flex items-center gap-2 mb-3">
                           <Input
                              placeholder="Search by Patient ID"
                              value={optSearch}
                              onChange={(e) => setOptSearch(e.target.value)}
                              className="w-64"
                           />
                           <Button type="button" variant="outline" onClick={() => refetchOpt()}>
                              Search
                           </Button>
                        </div>
                        <div className="border rounded-md p-3 bg-gray-50">
                           {isLoadingOpt && <p className="text-sm text-gray-600">Loading OPT patients...</p>}
                           {isErrorOpt && (
                              <p className="text-sm text-red-600">Failed to load: {String((errorOpt as any)?.message || 'Unknown error')}</p>
                           )}
                           {!isLoadingOpt && !isErrorOpt && (
                              <div className="max-h-56 overflow-auto">
                                 {(optPatients?.results || []).length === 0 ? (
                                    <p className="text-sm text-gray-600">No records found.</p>
                                 ) : (
                                    <table className="w-full text-sm">
                                       <thead>
                                          <tr className="text-left text-gray-700">
                                             <th className="py-1 pr-2">Patient ID</th>
                                             <th className="py-1 pr-2">Name</th>
                                             <th className="py-1 pr-2">MUAC Status</th>
                                             <th className="py-1 pr-2">Created</th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {(optPatients?.results || []).map((item: any, idx: number) => (
                                             <tr key={idx} className="border-t border-gray-200">
                                                <td className="py-1 pr-2">{item?.pat_id || '-'}</td>
                                                <td className="py-1 pr-2">{item?.patient_name || '-'}</td>
                                                <td className="py-1 pr-2">{item?.measurement?.muac_status || '-'}</td>
                                                <td className="py-1 pr-2">{item?.measurement?.created_at || '-'}</td>
                                             </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 )}
                              </div>
                           )}
                        </div>
                     </div>

                     {/*Referrals/Follow-ups Dynamic Fields */}
                     <div className="mb-7">
                        <Label className=" text-md font-semibold">Referrals/Follow-up Cases</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="mt-4">
                           <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-semibold">Illness</Label>
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 onClick={() => append({ illnessName: "", count: 0 })}
                              >
                                 <Plus className="w-4 h-4 mr-1" />
                                 Add Illness
                              </Button>
                           </div>

                           {fields.length > 0 && (
                              <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                                 {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-end">
                                       <div className="flex-1">
                                          <IllnessCombobox
                                             options={getIllnessOptions()}
                                             value={selectedIllnessId}
                                             onChange={(value) => {
                                             setSelectedIllnessId(value);
               
                                             const selectedIllnessData =
                                                illnessesData?.illnesses?.find(
                                                   (illness: any) =>
                                                   illness.ill_id?.toString() === value
                                                );
               
                                             const illnessName =
                                                selectedIllnessData?.illname || value || "";
                                                form.setValue(`illnesses.${index}.illnessName`, illnessName);
                                             }}
                                             placeholder="Select or add previous illness"
                                             emptyMessage="No illnesses found"
                                             allowAddNew={true}
                                             onAddNew={handleAddNewIllness}
                                             triggerClassName="w-full"
                                          />
                                       </div>
                                       <div className="w-32">
                                          <FormInput
                                             control={form.control}
                                             label={index === 0 ? "Count" : ""}
                                             placeholder="Count"
                                             name={`illnesses.${index}.count`}
                                             type="number"
                                          />
                                       </div>
                                       <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => remove(index)}
                                          className="mb-0.5"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </Button>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {fields.length === 0 && (
                              <div className="text-center py-4 text-sm text-gray-500 border rounded-md bg-gray-50">
                                 No illnesses added. Click "Add Illness" to add count cases for an illness.
                              </div>
                           )}
                        </div>
                     </div>
                     
                     <div className="flex justify-end">
                        <Button type="submit" disabled={createBHWMutation.isPending}>
                           {createBHWMutation.isPending ? "Submitting..." : "Submit"}
                        </Button>
                     </div>
                  </div>
               </div>
            </form>
         </Form>
      </LayoutWithBack>
   )
}