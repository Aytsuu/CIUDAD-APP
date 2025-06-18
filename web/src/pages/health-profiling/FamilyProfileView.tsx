"use client"

import { ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button/button"
import { Link } from "react-router"

export default function FamilyProfileView() {
  return (
    <div className="container mx-auto py-6 space-y-8 max-w-[1200px]">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/family-profiling-main">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Family Profile Details</h1>
            <p className="text-sm text-muted-foreground">View complete family information</p>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Printer className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">I. Demographic Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Building Type</label>
              <p className="mt-1">Residential</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quarter</label>
              <p className="mt-1">Q1 2024</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Household No.</label>
              <p className="mt-1">H-001</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Family No.</label>
              <p className="mt-1">F-001</p>
            </div>
          </div>
        </section>

        {/* Father's Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Father's Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="mt-1">Dela Cruz</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="mt-1">Juan</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Middle Name</label>
              <p className="mt-1">Santos</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Birth Date</label>
              <p className="mt-1">January 15, 1980</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Civil Status</label>
              <p className="mt-1">Married</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Religion</label>
              <p className="mt-1">Catholic</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Educational Attainment</label>
              <p className="mt-1">College Graduate</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">PhilHealth ID</label>
              <p className="mt-1">1234-5678-9012</p>
            </div>
          </div>
        </section>

        {/* Mother's Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Mother's Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Name</label>
              <p className="mt-1">Dela Cruz</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">First Name</label>
              <p className="mt-1">Maria</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Middle Name</label>
              <p className="mt-1">Reyes</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Birth Date</label>
              <p className="mt-1">March 20, 1982</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Civil Status</label>
              <p className="mt-1">Married</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Religion</label>
              <p className="mt-1">Catholic</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Educational Attainment</label>
              <p className="mt-1">College Graduate</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">PhilHealth ID</label>
              <p className="mt-1">9876-5432-1098</p>
            </div>
          </div>
        </section>

        {/* Dependents Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Dependent's Information</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Birth Date</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Civil Status</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Educational Attainment</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Occupation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3">Juan Dela Cruz Jr.</td>
                  <td className="p-3">June 10, 2005</td>
                  <td className="p-3">Single</td>
                  <td className="p-3">High School</td>
                  <td className="p-3">Student</td>
                </tr>
                <tr>
                  <td className="p-3">Maria Dela Cruz</td>
                  <td className="p-3">August 15, 2008</td>
                  <td className="p-3">Single</td>
                  <td className="p-3">Elementary</td>
                  <td className="p-3">Student</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Environmental Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Environmental Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type of Housing Unit</label>
              <p className="mt-1">Single</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Source of Water</label>
              <p className="mt-1">Water District</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Toilet Facility</label>
              <p className="mt-1">Water-sealed</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Garbage Disposal</label>
              <p className="mt-1">Collected</p>
            </div>
          </div>
        </section>

        {/* Health Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Health Information</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-md font-medium">Non-Communicable Diseases</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span>Hypertension - Father</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  <span>Diabetes - Mother</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-md font-medium">Family Planning</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Method</label>
                  <p className="mt-1">Pills</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p className="mt-1">Health Center</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Survey Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Survey Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Interviewer</label>
              <p className="mt-1">Jane Smith</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Interviewed</label>
              <p className="mt-1">February 15, 2024</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supervisor</label>
              <p className="mt-1">John Doe</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Reviewed</label>
              <p className="mt-1">February 16, 2024</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}   
