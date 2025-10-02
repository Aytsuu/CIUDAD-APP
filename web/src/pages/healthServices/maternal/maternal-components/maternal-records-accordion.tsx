"use client";

import { Link } from "react-router-dom"
import { Calendar, CheckCircle2, Eye, HeartHandshake } from "lucide-react"
import type { JSX } from "react"

import { Button } from "@/components/ui/button/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Patient {
  pat_id: string;
  age?: number;
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
    per_sex: string;
    per_dob?: string;
    ageTime?: "yrs";
  };
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_external_sitio?: string;
  };
  sitio?: string;
  pat_type: string;
  patrec_type?: string;
}

interface MaternalRecord {
  id: string;
  pregnancyId: string;
  dateCreated: string;
  address: string;
  sitio: string;
  type: "Transient" | "Resident";
  recordType: "Prenatal" | "Postpartum Care";
  status: "Active" | "Completed" | "Pregnancy Loss";
  gestationalWeek?: number;
  gestationalFormatted?: string;
  expectedDueDate?: string
  deliveryDate?: string
  prenatal_end_date?: string
  postpartum_end_date?: string
  notes?: string
  visitNumber?: number
  postpartum_assessment?: {
    ppa_id: string;
    ppa_date: string;
    ppa_lochial_discharges: string;
    ppa_blood_pressure: string;
    ppa_feedings: string;
    ppa_findings: string;
    ppa_nurses_notes: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface PregnancyGroup {
  pregnancyId: string;
  status: "Active" | "Completed" | "Pregnancy Loss";
  startDate: string;
  expectedDueDate?: string;
  deliveryDate?: string;
  records: MaternalRecord[];
  hasPrenatal: boolean;
  hasPostpartum: boolean;
}

interface PregnancyAccordionProps {
  pregnancyGroups: PregnancyGroup[]
  selectedPatient: Patient | null
  getStatusBadge: (status: "Active" | "Completed" | "Pregnancy Loss") => JSX.Element
  getRecordTypeBadge: (recordType: "Prenatal" | "Postpartum Care") => JSX.Element
  onCompletePregnancy?: (pregnancyId: string) => void
  onCompleteRecord?: (recordId: string, recordType: "Prenatal" | "Postpartum Care") => void
  onPregnancyLossRecord?: (recordId: string, recordType: "Prenatal") => void
}

export function PregnancyAccordion({
  pregnancyGroups,
  selectedPatient,
  getStatusBadge,
  getRecordTypeBadge,
  onCompletePregnancy,
  onCompleteRecord,
  onPregnancyLossRecord,
}: PregnancyAccordionProps) {
  if (pregnancyGroups.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No pregnancy records found</p>
      </div>
    );
  }

  const handleCompleteRecord = (recordId: string, recordType: "Prenatal" | "Postpartum Care") => {
    if (onCompleteRecord) {
      onCompleteRecord(recordId, recordType);
    } else {
      console.log(`Completing record: ${recordId} of type ${recordType} (no onCompleteRecord prop provided)`);
    }
  }

  const handlePregnancyLossRecord = (recordId: string, recordType: "Prenatal") => {
    if (onPregnancyLossRecord) {
      onPregnancyLossRecord(recordId, recordType)
    } else {
      console.log(`Marking record: ${recordId} of type ${recordType} as pregnancy loss (no onPregnancyLossRecord prop provided)`)
    }
  }
  
  // determine if a record should have a complete button
  const shouldShowCompleteButton = (record: MaternalRecord, pregnancy: PregnancyGroup, sortedRecords: MaternalRecord[]) => {
    // No complete button for Pregnancy Loss status
    if (pregnancy.status === "Pregnancy Loss") {
      return false;
    }

    const latestRecord = sortedRecords[0];

    // Show complete button for prenatal records if prenatal_end_date is not present and it's the latest record (Active pregnancies only)
    if (record.recordType === "Prenatal" && !record.prenatal_end_date && record.id === latestRecord.id && pregnancy.status === "Active") {
      return true;
    }

    // Show complete button for postpartum records if postpartum_end_date is not present and it's the latest record (Active or Completed pregnancies)
    if (record.recordType === "Postpartum Care" && !record.postpartum_end_date && record.id === latestRecord.id) {
      return true;
    }

    return false
  }

  const shouldShowPregnancyLossButton = (
    record: MaternalRecord,
    pregnancy: PregnancyGroup,
    sortedRecords: MaternalRecord[],
  ) => {
    const latestRecord = sortedRecords[0]

    if (record.recordType === "Prenatal" && record.id === latestRecord.id && pregnancy.status === "Active") {
      return true
    }

    return false
  }

  
  return (
    <TooltipProvider>
      <Accordion type="single" collapsible className="w-full p-4">
        {pregnancyGroups.map((pregnancy) => {
          const sortedRecords = pregnancy.records.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

          return (
            <AccordionItem key={pregnancy.pregnancyId} value={pregnancy.pregnancyId} className="border shadow-lg rounded-lg mb-4">
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
                        {pregnancy.expectedDueDate && <span>Due: {new Date(pregnancy.expectedDueDate).toLocaleDateString()}</span>}
                        {pregnancy.deliveryDate && <span>Delivered: {new Date(pregnancy.deliveryDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pregnancy.hasPrenatal && getRecordTypeBadge("Prenatal")}
                    {pregnancy.hasPostpartum && getRecordTypeBadge("Postpartum Care")}
                    <span className="text-sm text-gray-500">({pregnancy.records.length === 1 ? pregnancy.records.length + " record" : pregnancy.records.length + " records"})</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {sortedRecords.map((record, recordIndex) => {
                    // const showUpdateButton = shouldShowUpdateButton(record, pregnancy, sortedRecords)
                    const showCompleteButton = shouldShowCompleteButton(record, pregnancy, sortedRecords)
                    const showPregnancyLossbutton = shouldShowPregnancyLossButton(record, pregnancy, sortedRecords)
                    const visitNumber = record.visitNumber || (sortedRecords.length - recordIndex)
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
                                Date created: {new Date(record.dateCreated).toLocaleDateString()}
                              </span>
                              <div className="flex gap-1">
                                <TooltipLayout
                                  trigger={
                                    <Link
                                      to={
                                        record.recordType === "Prenatal"
                                          ? "/services/maternal/prenatal/history"
                                          : "/services/maternal/postpartum/history"
                                      }
                                      state={{ 
                                        params: { 
                                          patientData: selectedPatient, 
                                          recordId: record.id,
                                          pregnancyId: record.pregnancyId,
                                          visitNumber: visitNumber,
                                          ...(record.recordType === "Postpartum Care" && record.postpartum_assessment && {
                                            postpartumRecord: {
                                              ppr_id: record.id,
                                              delivery_date: record.deliveryDate,
                                              postpartum_assessment: record.postpartum_assessment
                                            }
                                          })
                                          
                                        } 
                                      }}
                                    >
                                      <Button variant="outline" size="sm" className="h-8 bg-transparent">
                                        <Eye className="w-3 h-3" /> 
                                        View
                                      </Button>
                                    </Link>
                                  }
                                  content="View detailed history"
                                />
                                {showCompleteButton && (
                                  <TooltipLayout
                                    trigger={
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 bg-green-500 text-white border-green-200 hover:bg-green-400 hover:text-white"
                                        onClick={() => {
                                          // For prenatal records, mark the pregnancy as complete
                                          if (record.recordType === "Prenatal" && onCompletePregnancy) {
                                            onCompletePregnancy(record.pregnancyId);
                                          } else {
                                            handleCompleteRecord(record.id, record.recordType);
                                          }
                                        }}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Complete
                                      </Button>
                                    }
                                    content={`Mark ${record.recordType.toLowerCase()} as completed`}
                                  />
                                )}

                                {showPregnancyLossbutton && (
                                  <TooltipLayout
                                    trigger={
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 bg-red-500 text-white border-red-200 hover:bg-red-400 hover:text-white"
                                        onClick={() => {
                                          if (record.recordType === "Prenatal" && onPregnancyLossRecord) {
                                            onPregnancyLossRecord(record.pregnancyId, "Prenatal")
                                          }
                                          handlePregnancyLossRecord(record.id, "Prenatal")
                                        }}
                                      >
                                        <HeartHandshake className="w-3 h-3" />
                                        Pregnancy Loss
                                      </Button>
                                    }
                                    content="Mark prenatal to reflect pregnancy loss outcome"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              {record.recordType === "Prenatal" && record.gestationalFormatted && (
                                <p className="text-gray-600">
                                  <strong>Gestational Age:</strong> {record.gestationalFormatted}
                                </p>
                              )}
                              {record.prenatal_end_date && (
                                <p className="text-gray-600">
                                  <strong>Prenatal End Date:</strong> {new Date(record.prenatal_end_date).toLocaleDateString()}
                                </p>
                              )}
                              {record.postpartum_end_date && (
                                <p className="text-gray-600">
                                  <strong>Postpartum End Date:</strong> {new Date(record.postpartum_end_date).toLocaleDateString()}
                                </p>
                              )}
                              {record.notes && (
                                <p className="text-gray-600">
                                  <strong>Next Visit:</strong> {record.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </TooltipProvider>
  );
}