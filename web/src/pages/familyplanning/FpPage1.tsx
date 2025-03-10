"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Button } from "@/components/ui/button"
import { type FormData, page1Schema } from "@/form-schema/FamilyPlanningSchema"

// Ensure the component is properly typed
type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

export default function FamilyPlanningForm({ onNext2, updateFormData, formData }: Page1Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(page1Schema), // Use page-specific schema
    defaultValues: formData,
    values: formData,
    mode: "onTouched", 
  })

  useEffect(() => {
    form.reset(formData)
  }, [form, formData])

  // Log when the component mounts or formData changes
  useEffect(() => {
    console.log("FamilyPlanningForm received formData:", formData)
  }, [formData])

  // Add this debugging function
  const debugValidation = async () => {
    try {
      // Try to validate the current form values against the schema
      const result = await page1Schema.parseAsync(form.getValues())
      console.log("Validation succeeded:", result)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  // Add a debug button temporarily
  useEffect(() => {
    // Add a debug button to the page
    const debugButton = document.createElement("button")
    debugButton.textContent = "Debug Validation"
    debugButton.style.position = "fixed"
    debugButton.style.top = "10px"
    debugButton.style.right = "10px"
    debugButton.style.zIndex = "9999"
    debugButton.onclick = debugValidation

    document.body.appendChild(debugButton)

    return () => {
      document.body.removeChild(debugButton)
    }
  }, [])

  const onSubmitForm = async (data: FormData) => {
    console.log("PAGE 1 Submitted Data:", data)
    // Update the parent component's state with the form data
    updateFormData(data)
    // Navigate to the next page
    onNext2()
  }

  // Add a function to save data without navigating
  const saveFormData = () => {
    const currentValues = form.getValues()
    console.log("Saving current form data:", currentValues)
    updateFormData(currentValues)
  }

  const methodCurrentlyUsed = [
    { id: "COC", name: "COC" },
    { id: "IUD", name: "IUD" },
    { id: "BOM/CMM", name: "BOM/CMM" },
    { id: "LAM", name: "LAM" },
    { id: "POP", name: "POP" },
    { id: "Interval", name: "Interval" },
    { id: "BBT", name: "BBT" },
    { id: "SDM", name: "SDM" },
    { id: "Injectable", name: "Injectable" },
    { id: "Post Partum", name: "Post Partum" },
    { id: "STM", name: "STM" },
    { id: "Implant", name: "Implant" },
    { id: "Condom", name: "Condom" },
  ]

  // Get current values for conditional rendering
  const typeOfClient = form.watch("typeOfClient")
  const subTypeOfClient = form.watch("subTypeOfClient")

  // Update the conditional variables that determine which sections should be enabled
  // Replace the existing conditional variables (around line 60-63) with these:

  // Determine which sections should be enabled
  const isNewAcceptor = typeOfClient === "New Acceptor"
  const isCurrentUser = typeOfClient === "Current User"

  // Reset fields when type of client changes
  useEffect(() => {
    if (isNewAcceptor) {
      // For New Acceptor: Enable Reason for FP, disable Reason and Method Currently Used
      form.setValue("reason", "")
      form.setValue("methodCurrentlyUsed", undefined)
      form.setValue("otherMethod", "")
    } else if (isCurrentUser) {
      // For Current User: Disable Reason for FP, enable Reason and Method Currently Used
      form.setValue("reasonForFP", "")
      form.setValue("otherReasonForFP", "")
    }
  }, [typeOfClient, form, isNewAcceptor, isCurrentUser])

  useEffect(() => {
    const subscription = form.watch(() => {
      console.log("Form errors:", form.formState.errors)
    })
    return () => subscription.unsubscribe()
  }, [form])

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 border-l-4 p-4 text-center">
          Family Planning (FP) Form 1
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="p-4 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <strong className="text-lg">FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
              <p className="mt-2">
                Instructions for Physicians, Nurses, and Midwives.{" "}
                <strong>Make sure that the client is not pregnant by using the questions listed in SIDE B.</strong>{" "}
                Completely fill out or check the required information. Refer accordingly for any abnormal
                history/findings for further medical evaluation.
              </p>
            </div>

            {/* Client ID Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="clientID"
                render={({ field }) => (
                  <FormItem>
                    <Label>CLIENT ID:</Label>
                    <FormControl>
                      <Input {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="philhealthNo"
                render={({ field }) => (
                  <FormItem>
                    <Label>PHILHEALTH NO:</Label>
                    <FormControl>
                      <Input {...field} className=" w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NHTS Checkbox */}
              <FormField
                control={form.control}
                name="nhts_status"
                render={({ field }) => (
                  <FormItem className="ml-5 mt-2 flex flex-col">
                    <Label className="mb-2">NHTS?</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl className="">
                        <Checkbox checked={field.value} onCheckedChange={() => field.onChange(true)} />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={!field.value}
                          onCheckedChange={() => field.onChange(false)}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pantawid 4Ps Checkbox */}
              <FormField
                control={form.control}
                name="pantawid_4ps"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="mb-2 mt-2">Pantawid Pamilya Pilipino (4Ps)</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox className="" checked={field.value} onCheckedChange={() => field.onChange(true)} />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className=" ml-4"
                          checked={!field.value}
                          onCheckedChange={() => field.onChange(false)}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Name Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>NAME OF CLIENT</Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className=" w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="givenName"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Given name" className="w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleInitial"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Middle Initial" className="w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>Date of Birth:</Label>
                    <FormControl>
                      <Input type="date" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>Age</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Age"
                        className="w-full"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationalAttainment"
                render={({ field }) => (
                  <FormItem className="col-span-1 mt-2">
                    <Label className="flex">Education Attainment</Label>
                    <FormControl>
                      <SelectLayout
                        placeholder="Choose"
                        label=""
                        className="custom-class w-full"
                        options={[
                          { id: "Elementary", name: "Elementary" },
                          { id: "HighSchool", name: "High school" },
                          { id: "SeniorHighschool", name: "Senior Highschool" },
                          { id: "Collegelvl", name: "College level" },
                          { id: "Collegegrad", name: "College Graduate" },
                        ]}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem className="col-span-1 sm:col-span-2 md:col-span-1">
                    <Label>Occupation</Label>
                    <FormControl>
                      <Input {...field} placeholder="Occupation" className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <FormField
                control={form.control}
                name="address.houseNumber"
                render={({ field }) => (
                  <FormItem className="col-span-1 ">
                    <Label>ADDRESS</Label>
                    <FormControl>
                      <Input {...field} placeholder="No." className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Street" className="w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.barangay"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Barangay" className=" w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.municipality"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Municipality/City" className=" w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.province"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Province" className="w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Spouse Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              <FormField
                control={form.control}
                name="spouse.s_lastName"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>NAME OF SPOUSE</Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className=" w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_givenName"
                render={({ field }) => (
                  <FormItem className="col-span-1 ">
                    <FormControl>
                      <Input {...field} placeholder="Given name" className=" w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_middleInitial"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormControl>
                      <Input {...field} placeholder="Middle Initial" className="w-full mt-8" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_dateOfBirth"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>Date of Birth:</Label>
                    <FormControl>
                      <Input type="date" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_age"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>Age</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Age"
                        className="w-full"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_occupation"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>Occupation</Label>
                    <FormControl>
                      <Input {...field} placeholder="Occupation" className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Children and Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <FormField
                control={form.control}
                name="numOfLivingChildren"
                render={({ field }) => (
                  <FormItem>
                    <Label>NO. OF LIVING CHILDREN</Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder=""
                        className=" w-full"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planToHaveMoreChildren"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3 ml-5 ">
                    <Label className="mb-2">PLAN TO HAVE MORE CHILDREN?</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          className="border "
                          checked={field.value}
                          onCheckedChange={() => field.onChange(true)}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="border  ml-4"
                          checked={!field.value}
                          onCheckedChange={() => field.onChange(false)}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="averageMonthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <Label>AVERAGE MONTHLY INCOME</Label>
                    <FormControl>
                      <SelectLayout
                        placeholder="Choose"
                        label=""
                        className="custom-class  w-full"
                        options={[
                          { id: "5,000-10,000k", name: "5,000-10,000" },
                          { id: "10,000k-30,000k", name: "10,000-30,000" },
                          { id: "30,000-50,000", name: "30,000-50,000" },
                          { id: "50,000-80,000", name: "50,000-80,000" },
                          { id: "80,000-100,000", name: "80,000-100,000" },
                          { id: "100,000-200,000", name: "100,000-200,000" },
                          { id: "Higher", name: "Higher" },
                        ]}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Type and Methods Section */}
            <div className="border border-t-black w-full p-4 rounded-md mt-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Type of Client Section - Left Column */}
                <div className="col-span-3">
                  <h3 className="font-semibold mb-3">Type of Client</h3>
                  {["New Acceptor", "Current User"].map((type) => (
                    <FormField
                      key={type}
                      control={form.control}
                      name="typeOfClient"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 mb-2">
                          <FormControl>
                            <input
                              type="radio"
                              value={type}
                              checked={field.value === type}
                              onChange={() => {
                                field.onChange(type)
                                if (type !== "Current User") {
                                  form.setValue("subTypeOfClient", "")
                                }
                              }}
                            />
                          </FormControl>
                          <Label>{type}</Label>
                        </FormItem>
                      )}
                    />
                  ))}
                  {form.watch("typeOfClient") === "Current User" && (
                    <div className="ml-6 mt-2">
                      {["Changing Method", "Changing Clinic", "Dropout/Restart"].map((subType) => (
                        <FormField
                          key={subType}
                          control={form.control}
                          name="subTypeOfClient"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 mb-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  value={subType}
                                  checked={field.value === subType}
                                  onChange={() => field.onChange(subType)}
                                />
                              </FormControl>
                              <Label>{subType}</Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Middle Column - Reasons */}
                <div className="col-span-4 space-y-6">
                  {/* Reason for FP Section */}
                  <FormField
                    control={form.control}
                    name="reasonForFP"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <Label className={`font-semibold ${isCurrentUser ? "text-gray-400" : ""}`}>Reason for FP</Label>
                        <div className="space-y-2 mt-2">
                          {["Spacing", "Limiting", "Others"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  value={option}
                                  checked={field.value === option}
                                  onChange={() => field.onChange(option)}
                                  disabled={isCurrentUser}
                                  className={isCurrentUser ? "opacity-50 cursor-not-allowed" : ""}
                                />
                              </FormControl>
                              <Label className={isCurrentUser ? "text-gray-400" : ""}>{option}</Label>
                              {option === "Others" && field.value === "Others" && !isCurrentUser && (
                                <FormField
                                  control={form.control}
                                  name="otherReasonForFP"
                                  
                                  render={({ field: otherField }) => (
                                    <Input className="w-32" placeholder="Specify" {...otherField} disabled={isCurrentUser} />
                                  )}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reason Section */}
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <Label className={`font-semibold ${isNewAcceptor ? "text-gray-400" : ""}`}>Reason</Label>
                        <div className="space-y-2 mt-2">
                          {["Medical Condition", "Side Effects"].map((reasonOption) => (
                            <div key={reasonOption} className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  value={reasonOption}
                                  checked={field.value === reasonOption}
                                  onChange={() => field.onChange(reasonOption)}
                                  disabled={isNewAcceptor}
                                  className={isNewAcceptor ? "opacity-50 cursor-not-allowed" : ""}
                                />
                              </FormControl>
                              <Label className={isNewAcceptor ? "text-gray-400" : ""}>{reasonOption}</Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column - Method Currently Used */}
                <div className="col-span-5">
                  <h3 className="font-semibold text-sm mb-3">Method currently used (for Changing Method):</h3>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                    {methodCurrentlyUsed.map((method) => (
                      <FormField
                        key={method.id}
                        control={form.control}
                        name="methodCurrentlyUsed"
                        render={({ field }) => (
                          <FormItem className="flex items-center">
                            <FormControl>
                              <input
                                type="radio"
                                value={method.name}
                                checked={field.value === method.name}
                                onChange={() => field.onChange(method.name)}
                                disabled={isNewAcceptor}
                                className={isNewAcceptor ? "opacity-50 cursor-not-allowed" : ""}
                              />
                            </FormControl>
                            <Label className={`text-sm whitespace-nowrap ml-2 ${isNewAcceptor ? "text-gray-400" : ""}`}>
                              {method.name}
                            </Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <FormField
                      control={form.control}
                      name="methodCurrentlyUsed"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="radio"
                              value="Others"
                              checked={field.value === "Others"}
                              onChange={() => {
                                field.onChange("Others")
                                if (field.value !== "Others") {
                                  form.setValue("otherMethod", "")
                                }
                              }}
                              disabled={isNewAcceptor}
                              className={isNewAcceptor ? "opacity-50 cursor-not-allowed" : ""}
                            />
                          </FormControl>
                          <Label className={`text-sm ${isNewAcceptor ? "text-gray-400" : ""}`}>Others</Label>
                        </FormItem>
                      )}
                    />
                    {form.watch("methodCurrentlyUsed") === "Others" && (
                      <>
                        <span className={`text-sm ${isNewAcceptor ? "text-gray-400" : ""}`}>specify:</span>
                        <FormField
                          control={form.control}
                          name="otherMethod"
                          render={({ field }) => (
                            <Input type="text" className="w-32" {...field} disabled={isNewAcceptor} />
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={form.handleSubmit(
                  // Success handler
                  (data) => {
                    console.log("Form is valid, proceeding to next page")
                    updateFormData(data)
                    onNext2()
                  },
                  // Error handler
                  (errors) => {
                    console.error("Validation errors:", errors)
                    // Scroll to the first error
                    const firstError = document.querySelector(".text-destructive")
                    if (firstError) {
                      firstError.scrollIntoView({ behavior: "smooth", block: "center" })
                    }
                  },
                )}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

