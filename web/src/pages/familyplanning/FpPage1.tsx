"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Button } from "@/components/ui/button/button"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"
import { ChevronLeft, Search, UserPlus } from "lucide-react"
import { useLocation, useNavigate } from "react-router"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"

// Ensure the component is properly typed
type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

export default function FamilyPlanningForm({ onNext2, updateFormData, formData }: Page1Props) {
  const form = useForm<FormData>({
    // resolver: zodResolver(page1Schema),
    defaultValues: formData,
    values: formData,
    mode: "onBlur", // Changed to onBlur for better user experience
  })

  useEffect(() => {
    form.reset(formData)
  }, [form, formData])

  const location = useLocation()
  const recordType = location.state?.recordType || "nonExistingPatient"

  // Get current values for conditional rendering
  const typeOfClient = form.watch("typeOfClient")
  const subTypeOfClient = form.watch("subTypeOfClient")
  const reasonForFP = form.watch("reasonForFP")
  // const reason = form.watch("reason")
  // const methodCurrentlyUsedValue = form.watch("methodCurrentlyUsed")

  const isNewAcceptor = typeOfClient === "New Acceptor"
  const isCurrentUser = typeOfClient === "Current User"
  const isChangingMethod = isCurrentUser && subTypeOfClient === "Changing Method"

  // Reset fields when type of client or subtype changes
  useEffect(() => {
    if (isNewAcceptor) {
      // For New Acceptor: Enable Reason for FP, disable Reason and Method Currently Used
      form.setValue("reason", "")
      form.setValue("methodCurrentlyUsed", undefined)
      form.setValue("otherMethod", "")
    } else if (isCurrentUser) {
      // For Current User: Disable Reason for FP
      form.setValue("reasonForFP", "")

      // Only enable Reason and Method Currently Used for Changing Method subtype
      if (!isChangingMethod) {
        // For Dropout/Restart or Changing Clinic: Disable Reason and Method Currently Used
        form.setValue("reason", "")
        form.setValue("methodCurrentlyUsed", undefined)
        form.setValue("otherMethod", "")
      }
    }
  }, [typeOfClient, subTypeOfClient, form, isNewAcceptor, isCurrentUser, isChangingMethod])

  const navigate = useNavigate()
  // Handle form submission
  const onSubmit = async (data: FormData) => {
    updateFormData(data)
    onNext2()
  }

  // Method options array
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

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4  p-4 text-center">Family Planning (FP) Form 1</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <strong className="text-lg">FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
              <p className="mt-2">
                Instructions for Physicians, Nurses, and Midwives.{" "}
                <strong>Make sure that the client is not pregnant by using the questions listed in SIDE B.</strong>{" "}
                Completely fill out or check the required information. Refer accordingly for any abnormal
                history/findings for further medical evaluation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between w-full ">
              {recordType === "existingPatient" || (
                <div className="flex items-center justify-between gap-3 mb-10">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                    <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
                  </div>

                  <Label>or</Label>

                  <button className="flex items-center gap-1 underline text-blue hover:bg-blue-600 hover:text-sky-500 transition-colors rounded-md">
                    <UserPlus className="h-4 w-4" />
                    Add Resident
                  </button>
                </div>
              )}

              <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
                <FormField
                  control={form.control}
                  name="isTransient"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "transient"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "transient" : "resident")
                          }}
                        />
                      </FormControl>
                      <FormLabel className="leading-none">Transient</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Client ID Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="clientID"
                render={({ field }) => (
                  <FormItem>
                    <Label>
                      CLIENT ID:<span className="text-red-500 ml-1">*</span>
                    </Label>
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
                      <Input {...field} className="w-full" />
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
                      <FormControl>
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
            </div>

            {/* Client Name Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>
                      NAME OF CLIENT<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className="w-full" />
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
                    <Label>
                      Date of Birth:<span className="text-red-500 ml-1">*</span>
                    </Label>
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
                    <Label>
                      Age<span className="text-red-500 ml-1">*</span>
                    </Label>
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
                    <Label className="flex">
                      Education Attainment<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <FormControl>
                      <SelectLayout
                        placeholder="Choose"
                        label=""
                        className="custom-class w-full"
                        options={[
                          { id: "elementary", name: "Elementary" },
                          { id: "highschool", name: "High school" },
                          { id: "shs", name: "Senior Highschool" },
                          { id: "collegegrad", name: "College level" },
                          { id: "collegelvl", name: "College Graduate" },
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
                  <FormItem className="col-span-1">
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
                      <Input {...field} placeholder="Barangay" className="w-full mt-8" />
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
                      <Input {...field} placeholder="Municipality/City" className="w-full mt-8" />
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
                    <Label>
                      NAME OF SPOUSE<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <FormControl>
                      <Input {...field} placeholder="Last name" className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spouse.s_givenName"
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
                    <Label>
                      Date of Birth:<span className="text-red-500 ml-1">*</span>
                    </Label>
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
                    <Label>
                      Age<span className="text-red-500 ml-1">*</span>
                    </Label>
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
                    <Label>
                      NO. OF LIVING CHILDREN<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder=""
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
                name="planToHaveMoreChildren"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3 ml-5">
                    <Label className="mb-2">PLAN TO HAVE MORE CHILDREN?</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          className="border"
                          checked={field.value}
                          onCheckedChange={() => field.onChange(true)}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="border ml-4"
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
                        className="custom-class w-full"
                        options={[
                          { id: "Lower", name: "Lower than 5,000" },
                          { id: "5,000-10,000", name: "5,000-10,000" },
                          { id: "10,000-30,000", name: "10,000-30,000" },
                          { id: "30,000-50,000", name: "30,000-50,000" },
                          { id: "50,000-80,000", name: "50,000-80,000" },
                          { id: "80,000-100,000", name: "80,000-100,000" },
                          { id: "100,000-200,000", name: "100,000-200,000" },
                          { id: "Higher", name: "Higher than 200,000" },
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
                  <h3 className="font-semibold mb-3">
                    Type of Client<span className="text-red-500 ml-1">*</span>
                  </h3>
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
                          <FormMessage />
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
                              <FormMessage />
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
                        <Label className={`font-semibold ${isCurrentUser ? "text-gray-400" : ""}`}>
                          Reason for FP
                          {isNewAcceptor && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="space-y-2 mt-2">
                          {["Spacing", "Limiting", "Others"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  value={option}
                                  checked={
                                    option === "Others"
                                      ? field.value && !["Spacing", "Limiting"].includes(field.value)
                                      : field.value === option
                                  }
                                  onChange={() => field.onChange(option)}
                                  disabled={isCurrentUser}
                                  className={isCurrentUser ? "opacity-50 cursor-not-allowed" : ""}
                                />
                              </FormControl>
                              <Label className={isCurrentUser ? "text-gray-400" : ""}>{option}</Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                        {(field.value === "Others" ||
                          (field.value && !["Spacing", "Limiting"].includes(field.value))) &&
                          !isCurrentUser && (
                            <div className="mt-2">
                              <Label className={isCurrentUser ? "text-gray-400" : ""}>Specify:</Label>
                              <Input
                                className="w-full mt-1"
                                placeholder="Specify reason"
                                value={field.value === "Others" ? "" : field.value}
                                onChange={(e) => {
                                  // If there's input, store the actual text
                                  // If empty, revert to just "Others"
                                  field.onChange(e.target.value || "Others")
                                }}
                                disabled={isCurrentUser}
                              />
                            </div>
                          )}
                      </FormItem>
                    )}
                  />

                  {/* Reason Section */}
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <Label
                          className={`font-semibold ${isNewAcceptor || (!isChangingMethod && isCurrentUser) ? "text-gray-400" : ""}`}
                        >
                          Reason
                          {isChangingMethod && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="space-y-2 mt-2">
                          {["Medical Condition", "Side Effects"].map((reasonOption) => (
                            <div key={reasonOption} className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  value={reasonOption}
                                  checked={field.value === reasonOption}
                                  onChange={() => field.onChange(reasonOption)}
                                  disabled={isNewAcceptor || (!isChangingMethod && isCurrentUser)}
                                  className={
                                    isNewAcceptor || (!isChangingMethod && isCurrentUser)
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }
                                />
                              </FormControl>
                              <Label
                                className={isNewAcceptor || (!isChangingMethod && isCurrentUser) ? "text-gray-400" : ""}
                              >
                                {reasonOption}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                        {field.value === "Side Effects" && isChangingMethod && (
                          <FormField
                            control={form.control}
                            name="otherReason"
                            render={({ field: otherField }) => (
                              <FormItem className="mt-2">
                                <Label className={!isChangingMethod ? "text-gray-400" : ""}>Specify:</Label>
                                <FormControl>
                                  <Input className="w-full" {...otherField} disabled={!isChangingMethod} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column - Method Currently Used */}
                <div className="col-span-5">
                  {typeOfClient === "Current User" && form.watch("subTypeOfClient") === "Changing Method" && (
                    <FormField
                      control={form.control}
                      name="methodCurrentlyUsed"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-semibold text-sm mb-3">
                            Method currently used (for Changing Method):
                            {isChangingMethod && <span className="text-red-500 ml-1">*</span>}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="COC">COC</SelectItem>
                              <SelectItem value="POP">POP</SelectItem>
                              <SelectItem value="Injectable">Injectable</SelectItem>
                              <SelectItem value="Implant">Implant</SelectItem>
                              <SelectItem value="IUD">IUD</SelectItem>
                              <SelectItem value="Interval">Interval</SelectItem>
                              <SelectItem value="Post Partum">Post Partum</SelectItem>
                              <SelectItem value="Condom">Condom</SelectItem>
                              <SelectItem value="BOM/CMM">BOM/CMM</SelectItem>
                              <SelectItem value="BBT">BBT</SelectItem>
                              <SelectItem value="STM">STM</SelectItem>
                              <SelectItem value="SDM">SDM</SelectItem>
                              <SelectItem value="LAM">LAM</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {typeOfClient === "New Acceptor" && (
                    <FormField
                      control={form.control}
                      name="methodCurrentlyUsed"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="font-semibold text-sm mb-3">Method Accepted:</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pills">1. Pills</SelectItem>
                              <SelectItem value="DMPA">2. DMPA</SelectItem>
                              <SelectItem value="Condom">3. Condom</SelectItem>
                              <SelectItem value="IUD-i">4. IUD-i</SelectItem>
                              <SelectItem value="IUD-pp">5. IUD-pp</SelectItem>
                              <SelectItem value="Implant">6. Implant</SelectItem>
                              <SelectItem value="Lactating Amenorrhea">7. Lactating Amenorrhea</SelectItem>
                              <SelectItem value="Bilateral Tubal Ligation">8. Bilateral Tubal Ligation</SelectItem>
                              <SelectItem value="Vasectomy">9. Vasectomy</SelectItem>
                              <SelectItem value="Source">10. Source (specify FP method)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {typeOfClient === "New Acceptor" && form.watch("methodCurrentlyUsed") === "Source" && (
                    <FormField
                      control={form.control}
                      name="otherMethod"
                      render={({ field }) => (
                        <FormItem className="w-full mt-4">
                          <FormLabel>Specify FP Method:</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Specify FP method" className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {typeOfClient === "Current User" &&
                    form.watch("subTypeOfClient") === "Changing Method" &&
                    form.watch("methodCurrentlyUsed") === "Others" && (
                      <FormField
                        control={form.control}
                        name="otherMethod"
                        render={({ field }) => (
                          <FormItem className="w-full mt-4">
                            <FormLabel>Specify Other Method:</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Specify other method" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={async () => {
                  // Validate the form
                  const isValid = await form.trigger()
                  if (isValid) {
                    // If valid, save data and proceed
                    const currentValues = form.getValues()
                    updateFormData(currentValues)
                    onNext2()
                  } else {
                    console.error("Please fill in all required fields")
                  }
                }}
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

