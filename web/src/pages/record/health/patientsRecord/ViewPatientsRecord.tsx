"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft, Edit, Printer, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import CardLayout from "@/components/ui/card/card-layout"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form"
import { useLocation } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ViewPatientRecord() {
  const [activeTab, setActiveTab] = useState("personal")

  // Mock data for a patient record
  const patientData = {
    lastName: "Smith",
    firstName: "John",
    middleName: "David",
    gender: "male",
    contact: "555-123-4567",
    dateOfBirth: "1985-06-15",
    patientType: "Resident",
    houseNo: "123",
    street: "Main Street",
    sitio: "Sitio A",
    barangay: "San Jose",
    city: "Metro City",
    province: "Central Province",
    // Additional mock data for medical history
    bloodType: "O+",
    allergies: "None",
    chronicConditions: "Hypertension",
    lastVisit: "2023-11-10",
    // Mock data for visits
    visits: [
      { date: "2023-11-10", reason: "Regular checkup", doctor: "Dr. Johnson" },
      { date: "2023-08-22", reason: "Fever", doctor: "Dr. Martinez" },
      { date: "2023-05-15", reason: "Vaccination", doctor: "Dr. Williams" },
    ],
  }

  const location = useLocation()
  const { params } = location.state || { params: {} }

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof patientRecordSchema>>({
    resolver: zodResolver(patientRecordSchema),
    defaultValues: patientData,
  })

  // Get patient initials for avatar
  const getInitials = () => {
    return `${patientData.firstName.charAt(0)}${patientData.lastName.charAt(0)}`
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Patient Record</h1>
            <p className="text-xs sm:text-sm text-darkGray">View patient information</p>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button className="gap-1 bg-buttonBlue hover:bg-buttonBlue/90">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        </div>
      </div>
      <Separator className="bg-gray mb-4 sm:mb-6" />

      {/* Patient Summary Card */}
      <div className="mb-6">
        <CardLayout
          cardTitle=""
          cardDescription=""
          cardContent={
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{`${patientData.firstName} ${patientData.middleName ? patientData.middleName + " " : ""}${patientData.lastName}`}</h2>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>
                    ID: <span className="font-medium text-foreground">P-10025</span>
                  </span>
                  <span>•</span>
                  <span>{calculateAge(patientData.dateOfBirth)} years old</span>
                  <span>•</span>
                  <span>{patientData.gender === "male" ? "Male" : "Female"}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant={patientData.patientType === "Resident" ? "default" : "secondary"}>
                    {patientData.patientType}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5">
                    Blood Type: {patientData.bloodType}
                  </Badge>
                </div>
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg"
          cardHeaderClassName="hidden"
          cardContentClassName="p-4"
        />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="personal" className="w-full ml-2" onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          <TabsTrigger
            value="personal"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent ml-6"
          >
            Personal Information
          </TabsTrigger>
          <TabsTrigger
            value="medical"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Medical History
          </TabsTrigger>
          <TabsTrigger
            value="visits"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Visit History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0">
          <CardLayout
            cardTitle="Personal Information"
            cardDescription="Patient's personal and contact details"
            cardContent={
              <div className="w-full mx-auto border-none">
                <Separator className="w-full bg-gray" />
                <div className="pt-4">
                  <Form {...form}>
                    <form className="space-y-6">
                      {/* Personal Information Section */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Last Name */}
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* First Name */}
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">First Name</FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                              <FormLabel className="text-sm font-medium">Gender</FormLabel>
                              <Select disabled defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-muted/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Contact Number */}
                        <FormField
                          control={form.control}
                          name="contact"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">Contact Number</FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Date of Birth */}
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} disabled className="bg-muted/30" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Patient Type */}
                        <FormField
                          control={form.control}
                          name="patientType"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-medium">Patient Type</FormLabel>
                              <Select disabled defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-muted/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Resident">Resident</SelectItem>
                                  <SelectItem value="Transient">Transient</SelectItem>
                                </SelectContent>
                              </Select>
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
                              <FormLabel className="text-sm font-medium">House Number</FormLabel>
                              <FormControl>
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
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
                                <Input {...field} disabled className="bg-muted/30" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            cardHeaderClassName="pb-2"
            cardContentClassName="pt-0"
          />
        </TabsContent>

        <TabsContent value="medical" className="mt-0">
          <CardLayout
            cardTitle="Medical History"
            cardDescription="Patient's medical information and history"
            cardContent={
              <div className="w-full mx-auto border-none">
                <Separator className="w-full bg-gray" />
                <div className="pt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Blood Type</h3>
                      <div className="p-3 bg-muted/30 rounded-md border">{patientData.bloodType}</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Allergies</h3>
                      <div className="p-3 bg-muted/30 rounded-md border">{patientData.allergies}</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Chronic Conditions</h3>
                      <div className="p-3 bg-muted/30 rounded-md border">{patientData.chronicConditions}</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Last Visit</h3>
                      <div className="p-3 bg-muted/30 rounded-md border">
                        {new Date(patientData.lastVisit).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Medical Notes</h3>
                    <div className="p-3 bg-muted/30 rounded-md border min-h-[100px]">
                      Patient has been managing hypertension with medication for the past 3 years. Regular check-ups
                      show stable condition. Recommended to maintain current medication and follow up every 3 months.
                    </div>
                  </div>
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            cardHeaderClassName="pb-2"
            cardContentClassName="pt-0"
          />
        </TabsContent>

        <TabsContent value="visits" className="mt-0">
          <CardLayout
            cardTitle="Visit History"
            cardDescription="Record of patient visits and consultations"
            cardContent={
              <div className="w-full mx-auto border-none">
                <Separator className="w-full bg-gray" />
                <div className="pt-4">
                  <div className="space-y-4">
                    {patientData.visits.map((visit, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{new Date(visit.date).toLocaleDateString()}</span>
                            <span className="text-sm text-muted-foreground">{visit.reason}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{visit.doctor}</Badge>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
            cardClassName="border shadow-sm rounded-lg"
            cardHeaderClassName="pb-2"
            cardContentClassName="pt-0"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

