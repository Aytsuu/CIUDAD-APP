"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit, Printer, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CardLayout from "@/components/ui/card/card-layout"

// Mock patient data
const patientData = {
  id: "001",
  lastName: "Smith",
  firstName: "John",
  middleName: "David",
  gender: "Male",
  contactNumber: "09123456789",
  dateOfBirth: "1985-06-15",
  age: 38,
  address: {
    houseNo: "123",
    street: "Main Street",
    sitio: "Sitio A",
    barangay: "San Jose",
    city: "Manila",
    province: "Metro Manila",
  },
  patientType: "Resident",
  bloodType: "O+",
  emergencyContact: {
    name: "Jane Smith",
    relationship: "Wife",
    contactNumber: "09187654321",
  },
  medicalHistory: [
    { date: "2023-01-15", diagnosis: "Hypertension", notes: "Prescribed medication and lifestyle changes" },
    { date: "2022-11-03", diagnosis: "Influenza", notes: "Bed rest and fluids recommended" },
    { date: "2022-05-22", diagnosis: "Sprained ankle", notes: "Physical therapy recommended" },
  ],
  medications: [
    { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", startDate: "2023-01-15" },
    { name: "Paracetamol", dosage: "500mg", frequency: "As needed", startDate: "2022-11-03" },
  ],
  visits: [
    { date: "2023-01-15", reason: "Regular check-up", doctor: "Dr. Santos" },
    { date: "2022-11-03", reason: "Flu symptoms", doctor: "Dr. Reyes" },
    { date: "2022-05-22", reason: "Ankle injury", doctor: "Dr. Cruz" },
  ],
}

export default function ViewPatientsRecord() {
  const [activeTab, setActiveTab] = useState("overview")

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
            <p className="text-xs sm:text-sm text-darkGray">View Patient Record</p>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-buttonBlue hover:bg-buttonBlue/90">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-gray mb-6 sm:mb-8" />

      {/* Patient Information Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt={`${patientData.firstName} ${patientData.lastName}`} />
                <AvatarFallback>{`${patientData.firstName.charAt(0)}${patientData.lastName.charAt(0)}`}</AvatarFallback>
              </Avatar>
              <Badge className="bg-buttonBlue hover:bg-buttonBlue/90">{patientData.patientType}</Badge>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-medium">{patientData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{`${patientData.lastName}, ${patientData.firstName} ${patientData.middleName}`}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{patientData.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{patientData.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{patientData.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-medium">{patientData.bloodType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {`${patientData.address.houseNo} ${patientData.address.street}, ${patientData.address.sitio}, ${patientData.address.barangay}, ${patientData.address.city}, ${patientData.address.province}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="border-b bg-transparent">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger
              value="overview"
              className={`px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-buttonBlue data-[state=active]:text-buttonBlue rounded-none`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className={`px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-buttonBlue data-[state=active]:text-buttonBlue rounded-none`}
            >
              Records
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contact */}
            <CardLayout
              cardTitle="Emergency Contact"
              cardDescription="Primary contact in case of emergency"
              cardContent={
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{patientData.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">{patientData.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <p className="font-medium">{patientData.emergencyContact.contactNumber}</p>
                  </div>
                </div>
              }
              cardClassName="h-full"
            />

            {/* Current Medications */}
            <CardLayout
              cardTitle="Current Medications"
              cardDescription="Active prescriptions"
              cardContent={
                <div className="space-y-4">
                  {patientData.medications.map((medication, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{medication.name}</p>
                        <Badge variant="outline">{medication.dosage}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Frequency: {medication.frequency}</p>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(medication.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              }
              cardClassName="h-full"
            />

            {/* Medical History Summary */}
            <CardLayout
              cardTitle="Medical History"
              cardDescription="Recent diagnoses and conditions"
              cardContent={
                <div className="space-y-4">
                  {patientData.medicalHistory.map((record, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <p className="font-medium">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  ))}
                </div>
              }
              cardClassName="h-full md:col-span-2"
            />
          </div>
        </TabsContent>

        <TabsContent value="records" className="pt-6">
          <CardLayout
            cardTitle="Visit History"
            cardDescription="Record of all patient visits"
            cardContent={
              <div className="space-y-4">
                {patientData.visits.map((visit, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="font-medium text-lg">{new Date(visit.date).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">{visit.reason}</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <Badge variant="outline">{visit.doctor}</Badge>
                        <Button variant="link" size="sm" className="h-auto p-0 text-buttonBlue">
                          View details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More Records</Button>
                </div>
              </div>
            }
            cardClassName="w-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

