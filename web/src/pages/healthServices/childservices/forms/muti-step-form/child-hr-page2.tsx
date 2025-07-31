"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { ChildDetailsSchema, type FormData } from "@/form-schema/chr-schema/chr-schema"
import { Button } from "@/components/ui/button/button" // Corrected import path
import { Baby, Calendar, ChevronLeft, Trash2, Plus, Pencil, Check } from "lucide-react"
import { DisabilityComponent } from "@/components/ui/add-search-disability"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import CardLayout from "@/components/ui/card/card-layout"
import { type_of_feeding_options } from "./options"
import {Page2Props} from "./types"


export default function ChildHRPage2({
  onPrevious,
  onNext,
  updateFormData,
  formData,
  historicalBFdates,
  patientHistoricalDisabilities, // Destructure the prop
  mode,
}: Page2Props) {
  const isaddnewchildhealthrecordMode = mode === "addnewchildhealthrecord"

  const form = useForm<FormData>({
    resolver: zodResolver(ChildDetailsSchema),
    mode: "onChange",
    defaultValues: {
      ...formData,
      disabilityTypes: formData.disabilityTypes || [],
      BFdates: formData.BFdates || [], // Initialized here
      dateNewbornScreening: formData.dateNewbornScreening || "",
      type_of_feeding: formData.type_of_feeding || "",
      tt_status: formData.tt_status || "",
    },
  })

  const { handleSubmit, reset, watch, setValue, getValues, formState, control } = form
  const { errors, isValid, isSubmitting } = formState
  const BFdates = watch("BFdates")
  const [currentBFDate, setCurrentBFDate] = useState<string>("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Extract historical disability IDs for the DisabilityComponent
  const historicalDisabilityIds = patientHistoricalDisabilities.map((d) => d.disability_details.disability_id)

  // Debug form state
  useEffect(() => {
    console.log("Form errors:", errors)
    console.log("Form is valid:", isValid)
    console.log("Form values:", getValues())
  }, [errors, isValid, getValues])

  // Removed the useEffect that was resetting the form based on formData changes.
  // The `defaultValues` in `useForm` handles initial population.

  // Update parent form data on change - This is crucial for persistence
  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as Partial<FormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateFormData])

  const handleNext = async (data: FormData) => {
    try {
      console.log("Submitting form with data:", data)
      const finalData = {
        ...data,
        disabilityTypes: data.disabilityTypes || [],
      }
      updateFormData(finalData)
      onNext()
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Helper to format date from YYYY-MM to "Month YYYY"
  const formatMonthYear = (dateString: string) => {
    if (!dateString) return ""
    // If it's already in "Month YYYY" format, return as is
    if (dateString.includes(" ")) {
      return dateString
    }
    // Assuming dateString is YYYY-MM
    const [year, month] = dateString.split("-")
    if (!year || !month) return ""
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    if (isNaN(date.getTime())) return ""
    return date.toLocaleString("default", { month: "long", year: "numeric" })
  }

  // Helper to convert "Month YYYY" to YYYY-MM for input type="month"
  const convertToYYYYMM = (formattedDate: string) => {
    if (!formattedDate) return ""
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const parts = formattedDate.split(" ")
    if (parts.length === 2) {
      const monthIndex = monthNames.indexOf(parts[0])
      const year = parts[1]
      if (monthIndex !== -1) {
        const monthNum = (monthIndex + 1).toString().padStart(2, "0")
        return `${year}-${monthNum}`
      }
    }
    return ""
  }

  const handleAddDate = () => {
    if (!currentBFDate) {
      console.log("No current BF date provided")
      return
    }
    try {
      // Convert to consistent format
      const formattedDate = formatMonthYear(currentBFDate)
      console.log("Formatted date:", formattedDate)
      // Get current dates from form
      const currentDates = getValues("BFdates") || []
      console.log("Current BF dates:", currentDates)
      // Check for duplicates
      if (editingIndex === null && currentDates.includes(formattedDate)) {
        console.log("Duplicate date detected")
        alert("This date has already been added")
        return
      }
      // Update dates array
      const updatedDates =
        editingIndex !== null
          ? currentDates.map((date, i) => (i === editingIndex ? formattedDate : date))
          : [...currentDates, formattedDate]
      console.log("Updated dates:", updatedDates)
      // Update form state
      setValue("BFdates", updatedDates, {
        shouldValidate: true,
        shouldDirty: true,
      })
      // Reset editing state
      setEditingIndex(null)
      setCurrentBFDate("")
      console.log("BF dates updated successfully")
    } catch (error) {
      console.error("Error adding BF date:", error)
    }
  }

  const handleEditDate = (index: number) => {
    const currentBFDates = getValues("BFdates") || []
    const dateToEdit = currentBFDates[index]
    // Convert the stored "Month YYYY" format back to YYYY-MM for the input field
    setCurrentBFDate(convertToYYYYMM(dateToEdit))
    setEditingIndex(index)
  }

  const handleDeleteDate = (index: number) => {
    const currentBFDates = getValues("BFdates") || []
    const updatedDates = currentBFDates.filter((_, i) => i !== index)
    setValue("BFdates", updatedDates, {
      shouldValidate: true,
      shouldDirty: true,
    })
    if (editingIndex === index) {
      setEditingIndex(null)
      setCurrentBFDate("")
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setCurrentBFDate("")
  }

  const handlePrevious = () => {
    const currentFormData = getValues()
    updateFormData({
      ...currentFormData,
      disabilityTypes: currentFormData.disabilityTypes || [],
    })
    onPrevious()
  }

  return (
    <>
     <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">
            Page 2 of 4
          </div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleNext, (errors) => {
            console.error("Form validation errors:", errors);
          })}
          className="space-y-8"
          noValidate
        >
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Medical Information (sidebar-like) */}
            <div className="space-y-6">
              {/* Newborn Screening Card */}
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-lg text-gray-800">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Newborn Screening
                  </div>
                }
                description=""
                content={
                  <div className="p-4">
                    <FormDateTimeInput
                      control={form.control}
                      name="dateNewbornScreening"
                      label="Date of Newborn Screening"
                      type="date"
                    />
                    <FormMessage />
                  </div>
                }
              />
              {/* Breastfeeding Section */}
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-lg text-gray-800">
                    <Baby className="h-5 w-5 text-pink-600" />
                    Exclusive Breastfeeding Monitoring
                  </div>
                }
                description=""
                content={
                  <div className="space-y-6">
                    <div className="w-[200px] mt-5">
                      <FormSelect
                        control={form.control}
                        name="type_of_feeding"
                        label="Type of feeding"
                        options={type_of_feeding_options}
                      />
                    </div>
                    {/* BF Dates Form Field */}
                    <FormField
                      control={control}
                      name="BFdates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breastfeeding Check Dates</FormLabel>
                          {/* Add/Edit Date Section */}
                          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                              <div className="flex-1 min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {editingIndex !== null ? "Edit BF Date" : "Add BF Date"}
                                </label>
                                <input
                                  type="month"
                                  value={currentBFDate}
                                  onChange={(e) => setCurrentBFDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={handleAddDate}
                                disabled={!currentBFDate}
                                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                              >
                                {editingIndex !== null ? (
                                  <>
                                    <Pencil className="h-4 w-4" />
                                    Update
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4" />
                                    Add
                                  </>
                                )}
                              </Button>
                              {editingIndex !== null && (
                                <Button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Historical Dates */}
                    {historicalBFdates?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-white px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Previous BF Checks
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          {historicalBFdates.map((date, index) => (
                            <div
                              key={`hist-${index}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{date}</span>
                              </div>
                              <span className="text-xs text-gray-500">Historical</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Newly Added Dates */}
                    {(BFdates ?? []).length > 0 ? (
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-white px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            New BF Checks
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          {(BFdates ?? []).map((date, index) => (
                            <div
                              key={`new-${index}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">{date}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  onClick={() => handleEditDate(index)}
                                  className="p-2 text-blue-500 bg-white hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => handleDeleteDate(index)}
                                  className="p-2 text-red-500 hover:bg-red-50 bg-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (!historicalBFdates || historicalBFdates.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Baby className="h-8 w-8 mx-auto mb-2" />
                          <p>No BF dates recorded yet</p>
                        </div>
                      )
                    )}
                  </div>
                }
              />
              {/* TT Status */}
              <FormSelect
                control={form.control}
                name="tt_status"
                label="TT Status"
                readOnly={isaddnewchildhealthrecordMode}
                options={[
                  { id: "none", name: "None" },
                  { id: "TT1", name: "TT1" },
                  { id: "TT2", name: "TT2" },
                  { id: "TT3", name: "TT3" },
                  { id: "TT4", name: "TT4" },
                  { id: "TT5", name: "TT5" },
                ]}
              />
            </div>
            {/* Right Column - Disability Information */}
            <div className="space-y-6">
              <CardLayout
                title={
                  <div className="flex items-center gap-2 text-lg text-gray-800">
                    <Check className="h-5 w-5 text-green-600" />
                    Disability Assessment
                  </div>
                }
                description=""
                content={
                  <div className="p-4">
                    {/* Display Historical Disabilities */}
                    {patientHistoricalDisabilities && patientHistoricalDisabilities.length > 0 && (
                      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Patient's Historical Disabilities
                        </h3>
                        <ul className="space-y-2">
                          {Array.from(
                            new Map(
                              patientHistoricalDisabilities
                                .filter((d) => d.disability_details)
                                .map((d) => [d.disability_details.disability_id, d]),
                            ).values(),
                          ).map((disability, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="font-medium">{disability.disability_details.disability_name}</span>
                              <span className="text-xs text-gray-500">
                                (Added: {new Date(disability.disability_details.created_at).toLocaleDateString()})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <FormLabel className="text-sm font-medium leading-none text-gray-700 mb-4 block">
                      Does the child have any known disabilities?
                    </FormLabel>
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="disabilityTypes"
                        render={({ field }) => (
                          <FormItem>
                            <DisabilityComponent
                              selectedDisabilities={field.value || []}
                              onDisabilitySelectionChange={(selected) => {
                                field.onChange(selected);
                              }}
                              isRequired={false}
                              historicalDisabilityIds={historicalDisabilityIds}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2 px-6 py-2 hover:bg-zinc-100 transition-colors duration-200 bg-transparent"
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2  px-6"
            >
              {isSubmitting ? "Processing..." : "Continue"}
              <ChevronLeft className="h-4 w-4 rotate-180 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
  
    </>
  )
}
