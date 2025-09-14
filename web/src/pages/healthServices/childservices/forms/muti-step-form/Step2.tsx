"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { ChildDetailsSchema, type FormData } from "@/form-schema/chr-schema/chr-schema"
import { Button } from "@/components/ui/button/button"
import { Baby, Calendar, ChevronLeft, Trash2, Plus, Pencil } from "lucide-react"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import CardLayout from "@/components/ui/card/card-layout"
import { type_of_feeding_options } from "./options"
import {Page2Props} from "./types";


export default function ChildHRPage2({
  onPrevious,
  onNext,
  updateFormData,
  formData,
  historicalBFChecks,
  mode
}: Page2Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(ChildDetailsSchema),
    mode: "onChange",
    defaultValues: {
      ...formData,
      BFchecks: formData.BFchecks || [],
      dateNewbornScreening: formData.dateNewbornScreening || "",
      type_of_feeding: formData.type_of_feeding || "",
      tt_status: formData.tt_status || "",
    },
  })
  
  useEffect(() => {
    console.log(historicalBFChecks)
  }
  , [historicalBFChecks])

  const { handleSubmit, watch, setValue, getValues, formState, control } = form
  const { errors, isValid, isSubmitting } = formState
  const BFchecks = watch("BFchecks")
  
  const [currentBFDate, setCurrentBFDate] = useState<string>("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Debug form state
  useEffect(() => {
    console.log("Form errors:", errors)
    console.log("Form is valid:", isValid)
    console.log("Form values:", getValues())
    console.log("Historical BF checks:", historicalBFChecks)
  }, [errors, isValid, getValues, historicalBFChecks])

  // Update parent form data on change
  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as Partial<FormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateFormData])

  const handleNext = async (data: FormData) => {
    try {
      console.log("Submitting form with data:", data)
      updateFormData(data)
      onNext()
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Helper function to get BF ID by date from historical data
  const getBFIdByDate = (date: string): number | undefined => {
    const bfCheck = historicalBFChecks.find(check => check.ebf_date === date);
    return bfCheck?.ebf_id;
  };

  // Helper function to check if date exists in historical data
  const isDateInHistorical = (date: string): boolean => {
    return historicalBFChecks.some(check => check.ebf_date === date);
  };

  const handleAddDate = () => {
    if (!currentBFDate) {
      console.log("No current BF date provided")
      return
    }
    
    try {
      const currentBFChecks = getValues("BFchecks") || []
      
      // Check if date already exists in current form data
      if (editingIndex === null && currentDates.includes(currentBFDate)) {
        alert("This date has already been added")
        return
      }
      
      // Check if date exists in historical data
      if (editingIndex === null && isDateInHistorical(currentBFDate)) {
        alert("This date already exists in historical records")
        return
      }

      // Create new BF check object
      const newBFCheck: any = {
        ebf_date: currentBFDate,
        created_at: new Date().toISOString(),
      };

      // Update BF checks array
      const updatedBFChecks = editingIndex !== null
        ? currentBFChecks.map((check, i) => (i === editingIndex ? newBFCheck : check))
        : [...currentBFChecks, newBFCheck];

      // Update BF dates array for backward compatibility
      const updatedDates = editingIndex !== null
        ? currentDates.map((date, i) => (i === editingIndex ? currentBFDate : date))
        : [...currentDates, currentBFDate];

      setValue("BFchecks", updatedBFChecks, {
        shouldValidate: true,
        shouldDirty: true,
      })
      
     

      setEditingIndex(null)
      setCurrentBFDate("")
    } catch (error) {
      console.error("Error adding BF date:", error)
    }
  }


  const handleDeleteDate = (index: number) => {
    const currentBFChecks = getValues("BFchecks") || []
    
    const updatedBFChecks = currentBFChecks.filter((_, i) => i !== index)
  
    setValue("BFchecks", updatedBFChecks, {
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
    updateFormData(currentFormData)
    onPrevious()
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleNext, (errors) => {
            console.error("Form validation errors:", errors)
          })}
          className="space-y-8"
          noValidate
        >
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Medical Information */}
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
                  <div className="p-4 space-y-6">
                    <FormDateTimeInput
                      control={form.control}
                      name="dateNewbornScreening"
                      label="Date of Newborn Screening"
                      type="date"
                    />
                    <FormMessage />
                    <FormField
                      control={control}
                      name="newbornInitiatedbf"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="h-5 w-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={mode === "addnewchildhealthrecord"}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Is newborn Initiated on breastfeeding within 1 hour after birth?
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormSelect
                      control={form.control}
                      name="nbscreening_result"
                      label="Newborn Screening Result"
                      options={[
                        { id: "normal", name: "Normal" },
                        { id: "referred", name: "Referred" },
                        { id: "done", name: "Done" },
                        { id: "with_results", name: "With Results" },
                        { id: "with_positive_results", name: "With Positive Results" },
                      ]}
                    />
                  </div>
                }
              />
             
              {/* TT Status */}
              <FormSelect
                control={form.control}
                name="tt_status"
                label="TT Status"
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

            <div>
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
                    <div className="mt-5">
                      <FormSelect
                        control={form.control}
                        name="type_of_feeding"
                        label="Type of feeding"
                        options={type_of_feeding_options}
                      />
                    </div>
                    
                    {/* BF Checks Form Field */}
                    <FormField
                      control={control}
                      name="BFchecks"
                      render={() => (
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
                    
                    {/* Historical BF Checks */}
                    {historicalBFChecks?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-white px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Previous BF Checks
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          {historicalBFChecks.map((check, index) => (
                            <div
                              key={`hist-${check.ebf_id || index}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{check.ebf_date}</span>
                                {check.ebf_id && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    ID: {check.ebf_id}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Historical</span>
                                {check.created_at && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(check.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Newly Added BF Checks */}
                    {(BFchecks ?? []).length > 0 ? (
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-white px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            New BF Checks
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          {(BFchecks ?? []).map((check, index) => (
                            <div
                              key={`new-${index}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">{check.ebf_date}</span>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  New
                                </span>
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
                      (!historicalBFChecks || historicalBFChecks.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Baby className="h-8 w-8 mx-auto mb-2" />
                          <p>No BF dates recorded yet</p>
                        </div>
                      )
                    )}
                    
                    {/* Summary Information */}
                    {(historicalBFChecks.length > 0 || (BFchecks ?? []).length > 0) && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">Summary</h4>
                        <div className="text-sm text-blue-700">
                          <p>Historical BF Checks: {historicalBFChecks.length}</p>
                          <p>New BF Checks: {(BFchecks ?? []).length}</p>
                          <p>Total BF Checks: {historicalBFChecks.length + (BFchecks ?? []).length}</p>
                        </div>
                      </div>
                    )}
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
              className="flex items-center gap-2 px-6"
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