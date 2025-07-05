"use client"

import { Link } from "react-router-dom"
import { Calendar, CheckCircle2 } from "lucide-react"
import type { JSX } from "react"

import { Button } from "@/components/ui/button/button"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { TooltipProvider } from "@/components/ui/tooltip"

interface Patient {
  pat_id: string
  age?: number
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
    per_sex: string;
    per_dob?: string
    ageTime?: "yrs"
  }
  address?: {
    add_street?: string
    add_barangay?: string
    add_city?: string
    add_province?: string
    add_external_sitio?: string
  }
  sitio?: string
  pat_type: string
  patrec_type?: string
}

interface MaternalRecord {
  id: string
  pregnancyId: string
  dateCreated: string
  address: string
  sitio: string
  type: "Transient" | "Resident"
  recordType: "Prenatal" | "Postpartum Care"
  status: "Active" | "Completed" | "Pregnancy Loss"
  gestationalWeek?: number
  expectedDueDate?: string
  deliveryDate?: string
  notes?: string
}

interface PregnancyGroup {
  pregnancyId: string
  status: "Active" | "Completed" | "Pregnancy Loss"
  startDate: string
  expectedDueDate?: string
  deliveryDate?: string
  records: MaternalRecord[]
  hasPrenatal: boolean
  hasPostpartum: boolean
}

interface PregnancyAccordionProps {
  pregnancyGroups: PregnancyGroup[]
  selectedPatient: Patient | null
  getStatusBadge: (status: "Active" | "Completed" | "Pregnancy Loss") => JSX.Element
  getRecordTypeBadge: (recordType: "Prenatal" | "Postpartum Care") => JSX.Element
  onCompletePregnancy?: (pregnancyId: string) => void
}

export function PregnancyAccordion({
  pregnancyGroups,
  selectedPatient,
  getStatusBadge,
  getRecordTypeBadge,
  onCompletePregnancy,
}: PregnancyAccordionProps) {
  if (pregnancyGroups.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No pregnancy records found</p>
      </div>
    )
  }

  const handleCompletePregnancy = (pregnancyId: string) => {
    if (onCompletePregnancy) {
      onCompletePregnancy(pregnancyId)
    } else {
      console.log(`Completing pregnancy: ${pregnancyId} (no onCompletePregnancy prop provided)`)
    }
  }

  // determine if a record should have an update button
  const shouldShowUpdateButton = (
    record: MaternalRecord,
    pregnancy: PregnancyGroup,
    sortedRecords: MaternalRecord[],
  ) => {
    if(pregnancy.status != "Active") {
      return false
    }

    const latestRecord = sortedRecords[0] 

    // if pregnancy is Active, only the latest record gets update button
    if (pregnancy.status === "Active") {
      return record.id === latestRecord.id
    }

    // if pregnancy is Completed, only the latest postpartum record gets update button (if exists)
    if (pregnancy.status === "Completed") {
      // Get the latest postpartum record
      const latestPostpartumRecord = sortedRecords.find((r) => r.recordType === "Postpartum Care")

      // only the latest postpartum record gets update button (if it exists)
      if (latestPostpartumRecord) {
        return record.id === latestPostpartumRecord.id
      }

      // if no postpartum record exists, no update button for any record
      return false
    }

    return false
  }

  return (
    <TooltipProvider>
      <Accordion type="single" collapsible className="w-full p-4">
        {pregnancyGroups.map((pregnancy) => {

          const sortedRecords = pregnancy.records.sort(
            (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
          )

          return (
            <AccordionItem key={pregnancy.pregnancyId} value={pregnancy.pregnancyId} className="border rounded-lg mb-4">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{pregnancy.pregnancyId}</h3>
                        {getStatusBadge(pregnancy.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Started: {new Date(pregnancy.startDate).toLocaleDateString()}
                        </span>
                        {pregnancy.expectedDueDate && (
                          <span>Due: {new Date(pregnancy.expectedDueDate).toLocaleDateString()}</span>
                        )}
                        {pregnancy.deliveryDate && (
                          <span>Delivered: {new Date(pregnancy.deliveryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pregnancy.hasPrenatal && getRecordTypeBadge("Prenatal")}
                    {pregnancy.hasPostpartum && getRecordTypeBadge("Postpartum Care")}
                    <span className="text-sm text-gray-500">({pregnancy.records.length} records)</span>

                    {/* complete button - only show for Active pregnancies */}
                    {pregnancy.status === "Active" && (
                      <TooltipLayout
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={(e) => {
                              e.stopPropagation() // Prevent accordion toggle
                              handleCompletePregnancy(pregnancy.pregnancyId)
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        }
                        content="Mark this pregnancy as completed"
                      />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {sortedRecords.map((record) => {
                    const showUpdateButton = shouldShowUpdateButton(record, pregnancy, sortedRecords)

                    return (
                      <Card key={record.id} className="border-l-4 border-l-blue-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-medium">Record #{record.id}</CardTitle>
                              {getRecordTypeBadge(record.recordType)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {new Date(record.dateCreated).toLocaleDateString()}
                              </span>
                              <div className="flex gap-1">
                                <TooltipLayout
                                  trigger={
                                    <Button variant="outline" size="sm" className="h-8 px-2 bg-transparent">
                                      <Link
                                        to={
                                          record.recordType === "Prenatal"
                                            ? "/prenatalindividualhistory"
                                            : "/postpartumindividualhistory"
                                        }
                                        state={{ params: { patientData: selectedPatient, recordId: record.id } }}
                                      >
                                        View
                                      </Link>
                                    </Button>
                                  }
                                  content="View detailed history"
                                />
                                {showUpdateButton && (
                                  <TooltipLayout
                                    trigger={
                                      <Button variant="default" size="sm" className="h-8 px-2">
                                        <Link
                                          to=""
                                          state={{ params: { patientData: selectedPatient, recordId: record.id } }}
                                        >
                                          Update
                                        </Link>
                                      </Button>
                                    }
                                    content="Update record"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <strong>Address:</strong> {record.address}
                              </p>
                              <p className="text-gray-600">
                                <strong>Sitio:</strong> {record.sitio}
                              </p>
                              <p className="text-gray-600">
                                <strong>Type:</strong> {record.type}
                              </p>
                            </div>
                            <div>
                              {record.gestationalWeek && (
                                <p className="text-gray-600">
                                  <strong>Gestational Week:</strong> {record.gestationalWeek}
                                </p>
                              )}
                              {record.notes && (
                                <p className="text-gray-600">
                                  <strong>Notes:</strong> {record.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </TooltipProvider>
  )
}
