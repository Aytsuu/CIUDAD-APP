"use client"

import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormTextArea } from "@/components/ui/form/form-text-area"

import { BHWFormSchema } from "./bhw-form"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form/form"

import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { Separator } from "@/components/ui/separator"


export default function BHWNoteForm() {
   const defaultValues = generateDefaultValues(BHWFormSchema)

   const form = useForm<z.infer<typeof BHWFormSchema>>({
      resolver: zodResolver(BHWFormSchema),
      defaultValues,
   })

   const handleSubmit = async () => {
      let isValid = false

      isValid = await form.trigger(["staffId", "dateToday", "weight", "height", "surveillanceCasesCount"])
   }

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
                        <Label className=" text-md font-semibold">Child Anthropometric Measurement</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="grid grid-cols-2 gap-2 mb-5">
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

                        <div className="flex flex-col border p-5 rounded-lg">
                              <Label>Measurement Completion List</Label>
                           <div className="flex h-[200px] border p-5 mt-3 rounded-md overflow-y-auto">

                           </div>
                        </div>
                     </div>

                     <div className="mb-5">
                        <Label className=" text-md font-semibold">Disease Surveillance Cases</Label>
                        <Separator className="mt-2 mb-4"/>
                        <div className="grid grid-cols-2 gap-2">
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
                     </div>

                     <div className="mb-5">
                        <FormTextArea
                           control={form.control}
                           label="Description"
                           name="description"
                        />
                     </div>

                     <div className="flex justify-end">
                        <Button type="submit">Save Notes</Button>
                     </div>
                     
                  </div>
               </div>
            </div>
         </Form>
      </LayoutWithBack>
   )
}