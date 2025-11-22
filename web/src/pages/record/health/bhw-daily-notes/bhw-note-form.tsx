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

import { useIllnessList, useMaternalStaff } from "@/pages/healthServices/maternal/queries/maternalFetchQueries"
import { useAddIllnessData } from "@/pages/healthServices/maternal/queries/maternalAddQueries"
import { useCreateBHWDailyNote } from "./queries/Add"


export default function BHWNoteForm() {
   const defaultValues = generateDefaultValues(BHWFormSchema)
   const navigate = useNavigate();

   const [selectedPatIdDisplay, setSelectedPatIdDisplay] = useState<string>("");
   const [selectedIllnessId, setSelectedIllnessId] = useState<string>("");

   const { data: staffData } = useMaternalStaff();
   const { data: illnessesData, refetch: refetchIllnesses } = useIllnessList();

   // Extract staff array from API response { staff: [...], count: N }
   const staffList: any[] = Array.isArray((staffData as any)?.staff)
      ? (staffData as any).staff
      : [];

   // Find staff by position field
   const midwife = staffList.find((staff: any) => staff.position === "ADMIN");
   const doctor = staffList.find((staff: any) => staff.position === "DOCTOR");

   // mutation for adding illness
   const addIllnessMutation = useAddIllnessData();
   
   // mutation for creating BHW daily note
   const createBHWMutation = useCreateBHWDailyNote();

   const { user } = useAuth()
   const staffId = user?.staff?.staff_id || ""
   
   const today = new Date().toISOString().split("T")[0]
   // Date object for date-based calculations
   const todayDate = new Date()
   const currentYear = new Date().toLocaleString('en-US', { year: 'numeric' })
   
   const form = useForm<z.infer<typeof BHWFormSchema>>({
      resolver: zodResolver(BHWFormSchema),
      defaultValues,
   })

   // for checking if date is 7 days before end of month
   const isSevenDaysBeforeEndOfMonth = (date: Date) => {
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const sevenDaysBefore = new Date(lastDay);
      sevenDaysBefore.setDate(lastDay.getDate() -7);

      return (
         date.getDate() === sevenDaysBefore.getDate() &&
         date.getMonth() === sevenDaysBefore.getMonth() && 
         date.getFullYear() === sevenDaysBefore.getFullYear()
      );
   }

   // Initialize staff/date once available
   useEffect(() => {
      if (staffId) form.setValue("staffId", staffId)
      if (today) form.setValue("dateToday", today)
   }, [staffId, today, form])

   // Populate noted/approved when staff list resolves
   // useEffect(() => {
   if (isSevenDaysBeforeEndOfMonth(todayDate)) {
      form.setValue("notedBy", midwife?.full_name || "")
      form.setValue("approvedBy", doctor?.full_name || "")
   }
   // }, [midwife, doctor, form])


   // handle patient selection
   const handlePatientSelect = (patient: any | null, patientId: string) => {
      setSelectedPatIdDisplay(patientId)
      console.log("Selected Patient:", patient)

      if (patient) {
         const personalInfo = patient?.personal_info

         const dob = personalInfo?.per_dob
         if (dob) {
            const ageData = calculateAgeFromDOB(dob)
            form.setValue("age", ageData.ageString)
         }

         // Convert "MALE"/"FEMALE" to "Male"/"Female"
         const rawGender = personalInfo?.per_sex
         if (rawGender) {
            const normalizedGender = rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
            if (normalizedGender === "Male" || normalizedGender === "Female") {
               form.setValue("gender", normalizedGender)
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

   const handleNutritionalStatusChange = (status: any) => {
      // Save the nutritional status to your form
      form.setValue("nutritionalStatus", status)
      console.log("Nutritional Status:", status)
   }

   const weight = form.watch("weight")
   const height = form.watch("height")
   const age = form.watch("age")
   const gender = form.watch("gender")
   const muac = form.watch("muac")


   const handleSubmit = async (data: z.infer<typeof BHWFormSchema>) => {
      try {
         console.log("Submitting BHW Daily Note:", data)
         await createBHWMutation.mutateAsync(data as any)

         navigate(-1);
         
         // Reset form after successful submission
         form.reset()
         setSelectedPatIdDisplay("")
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
                        <Label className=" text-md font-semibold">Child Anthropometric Measurement</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="grid grid-cols-2 mb-4">
                           <div className="border rounded-md">
                              <PatientSearch
                              onPatientSelect={handlePatientSelect}
                              value={selectedPatIdDisplay}
                              onChange={setSelectedPatIdDisplay}
                              ischildren={true}
                           />
                           </div>
                           
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-5">
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
                           onStatusChange={handleNutritionalStatusChange}
                        />

                        <div className="flex flex-col border p-5 rounded-lg mt-5">
                              <Label>{` OPT Completion List for the Year ${currentYear} `}</Label>
                           <div className="flex h-[200px] border p-5 mt-3 rounded-md overflow-y-auto">

                           </div>
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
                     
                     {/* {isSevenDaysBeforeEndOfMonth(todayDate) && ( */}
                        <div className="mb-10">
                           <span className="flex flex-row gap-2 items-center">
                              <Label className=" text-md font-semibold">Attendance Summary</Label>
                              <p className="text-black/70 text-xs">(to be fill-up on the day of reporting)</p>
                           </span>
                           <Separator className="mt-2 mb-4"/>
                           <div className="grid grid-cols-5 gap-2 mb-5">
                              <FormInput
                                 control={form.control}
                                 label="Number of Working Days"
                                 placeholder="Enter number of working days"
                                 name="numOfWorkingDays"
                                 type="number"
                              />
                              <FormInput
                                 control={form.control}
                                 label="Days Present"
                                 placeholder="Enter days present"
                                 name="daysPresent"
                                 type="number"
                              />
                              <FormInput
                                 control={form.control}
                                 label="Days Absent"
                                 placeholder="Enter days absent"
                                 name="daysAbsent"
                                 type="number"
                              />
                              <FormInput
                                 control={form.control}
                                 label="Noted By"
                                 placeholder="Noted By"
                                 name="notedBy"
                                 type="text"
                              />
                              <FormInput
                                 control={form.control}
                                 label="Approved By"
                                 placeholder="Approved By"
                                 name="approvedBy"
                                 type="text"
                              />
                           </div>
                        </div>
                     {/* )} */}
                     
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