"use client"

import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormTextArea } from "@/components/ui/form/form-text-area"

import { BHWFormSchema } from "./bhw-form"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { useForm, useFieldArray } from "react-hook-form"
import { Form } from "@/components/ui/form/form"

import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import { Plus, Trash2 } from "lucide-react"

import { NutritionalStatusCalculator } from "@/components/ui/nutritional-status-calculator"


export default function BHWNoteForm() {
   const defaultValues = generateDefaultValues(BHWFormSchema)
   const { user } = useAuth()
   const staffId = user?.staff?.staff_id || ""
   const today = new Date().toISOString().split("T")[0]

   const form = useForm<z.infer<typeof BHWFormSchema>>({
      resolver: zodResolver(BHWFormSchema),
      defaultValues,
   })

   form.setValue("staffId", staffId)
   form.setValue("dateToday", today)

   // Field array for dynamic "others" diseases
   const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "surveillanceCasesCount.others"
   })

   const handleNutritionalStatusChange = (status: any) => {
      // Save the nutritional status to your form
      form.setValue("nutritionalStatus", status)
      console.log("Nutritional Status:", status)
   }

   const weight = form.watch("weight")
   const height = form.watch("height")
   const age = form.watch("age") // You need to add this field
   const gender = form.watch("gender") // You need to add this field
   const muac = form.watch("muac")

   // const handleSubmit = async () => {
   //    let isValid = false

   //    isValid = await form.trigger(["staffId", "dateToday", "weight", "height", "surveillanceCasesCount"])
   // }

   return (
      <LayoutWithBack
         title="BHW Note Form"
         description="Create Barangay Health Worker notes"
      >
         <Form {...form}>
            <div className="bg-white p-4 rounded-md shadow-md w-full">
               <div className="p-4">
                  <div className="flex justify-center">
                     <h3 className="py-3 font-bold text-lg">Barangay Health Worker Daily Notes</h3>
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

                     <div className="mb-5">
                        <FormTextArea
                           control={form.control}
                           label="Description"
                           name="description"
                        />
                     </div>
                     
                     <div className="mb-5">
                        <Label className=" text-md font-semibold">Child Anthropometric Measurement</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="grid grid-cols-4 gap-2 mb-5">
                           <FormInput
                              control={form.control}
                              label="Age"
                              placeholder="e.g., 2 years 3 months"
                              name="age"
                           />
                           <FormInput
                              control={form.control}
                              label="Gender"
                              placeholder="Male or Female"
                              name="gender"
                           />
                           <FormInput
                              control={form.control}
                              label="Weight"
                              placeholder="Enter weight"
                              name="weight"
                           />
                           <FormInput
                              control={form.control}
                              label="Height"
                              placeholder="Enter height"
                              name="height"
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
                              <Label>Measurement Completion List for the Month of October</Label>
                           <div className="flex h-[200px] border p-5 mt-3 rounded-md overflow-y-auto">

                           </div>
                        </div>
                     </div>


                     <div className="mb-5">
                        <Label className=" text-md font-semibold">Referrals/Follow-up Cases</Label>
                        <Separator className="mt-2 mb-4"/>
                        {/* <div className="grid grid-cols-5 gap-2 border p-3">
                           <FormInput
                              control={form.control}
                              label="Fever"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.feverCount"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Dengue"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.dengueCount"
                              type="number"
                           />
                            <FormInput
                              control={form.control}
                              label="Diarrhea"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.diarrheaCount"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Pneumonia"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.pneumoniaCount"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Measles"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.measlesCount"
                              type="number"
                           />

                           <FormInput
                              control={form.control}
                              label="Typhoid Fever"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.typhoidFeverCount"
                              type="number"
                           />
                            <FormInput
                              control={form.control}
                              label="Hepatitis"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.hepatitisCount"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Influenza"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.influenzaCount"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Hypertensive"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.hypertensiveCount"
                              type="number"
                           />
                           <FormInput
                              control={form.control}
                              label="Diabetes Mellitus"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.diabetesMellitusCount"
                              type="number"
                           />

                            <FormInput
                              control={form.control}
                              label="Tuberculosis"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.tuberculosisCount"
                              type="number"
                           />
                            <FormInput
                              control={form.control}
                              label="Leprosy"
                              placeholder="Enter count"
                              name="surveillanceCasesCount.leprosyCount"
                              type="number"
                           />
                        </div> */}

                        {/* Others - Dynamic Fields */}
                        <div className="mt-4">
                           <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-semibold">Illness</Label>
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 onClick={() => append({ diseaseName: "", count: 0 })}
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
                                          <FormInput
                                             control={form.control}
                                             label={index === 0 ? "Illness Name" : ""}
                                             placeholder="Enter illness name"
                                             name={`surveillanceCasesCount.others.${index}.diseaseName`}
                                          />
                                       </div>
                                       <div className="w-32">
                                          <FormInput
                                             control={form.control}
                                             label={index === 0 ? "Count" : ""}
                                             placeholder="Count"
                                             name={`surveillanceCasesCount.others.${index}.count`}
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
                        <Button type="submit">Submit</Button>
                     </div>
                  </div>
               </div>
            </div>
         </Form>
      </LayoutWithBack>
   )
}