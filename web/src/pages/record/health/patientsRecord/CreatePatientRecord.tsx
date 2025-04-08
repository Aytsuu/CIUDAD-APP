"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft, Save, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { toast } from "@/hooks/use-toast"
import CardLayout from "@/components/ui/card/card-layout"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { useLocation } from "react-router"
import { generateDefaultValues } from "@/pages/record/health/patientsRecord/generateDefaultValues"
import { personal } from "@/pages/record/health/patientsRecord/patientPostRequest"
import { FormDateInput } from "@/components/ui/form/form-date-input";



export default function CreatePatientRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const location = useLocation()
  const defaultValues = generateDefaultValues(patientRecordSchema)
  const { params } = location.state || { params: {} }

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof patientRecordSchema>>({
    resolver: zodResolver(patientRecordSchema),
    defaultValues,
  })

  const submit = async () => {
    setIsSubmitting(true)
    try {
      const res = await personal(form.getValues())

      if (res) {
        toast({
          title: "Success",
          description: "Patient record has been created successfully",
        })
        form.reset(defaultValues)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Header - Stacks vertically on mobile */}
          <Button
            className="bg-white text-black p-2 self-start"
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Patients Records</h1>
            <p className="text-xs sm:text-sm text-darkGray">Create Patient Record</p>
          </div>
        </div>
      </div>
      <Separator className="bg-gray mb-2 sm:mb-4" />

      <div className="mb-4 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for existing patients..."
            className="w-full pl-10 bg-white border-muted"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground pl-1">
          Check if patient already exists by name, contact number, or ID
        </p>
      </div>

      <CardLayout
        cardTitle="Patients Information"
        cardDescription="Fill in the required fields to create a new patient record"
        cardContent={
          <div className="w-full mx-auto border-none">
            <Separator className="w-full bg-gray" />
            <div className="pt-4">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit()
                  }}
                  className="space-y-6"
                >
                  {/* Personal Information Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Last Name */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Last Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* First Name */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            First Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Middle Name */}
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Middle Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter middle name" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Gender <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Contact Number */}
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Contact Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact number" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Date of Birth <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Patient Type */}
                    <FormField
                      control={form.control}
                      name="patientType"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            Patient Type <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select patient type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Resident">Resident</SelectItem>
                              <SelectItem value="Transient">Transient</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Section */}
                  <h3 className="text-md font-medium pt-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="houseNo"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">
                            House Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter House No." {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Street</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street address" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sitio"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Sitio</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Sitio" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="barangay"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Barangay</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Barangay" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter City" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium">Province</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Province" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-buttonBlue hover:bg-buttonBlue/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Save Record
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        }
        cardClassName="border-none pb-2 p-3"
        cardHeaderClassName="pb-2 bt-2 text-xl"
        cardContentClassName="pt-0"
      />
    </div>
  )
}

