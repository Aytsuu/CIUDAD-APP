"use client"

import type React from "react"
import { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { Calendar, Eye } from "lucide-react-native"
import { router } from "expo-router"

import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"

interface Patient {
  pat_id: string
  age?: number
  personal_info: {
    per_fname: string
    per_lname: string
    per_mname: string
    per_sex: string
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
  gestationalFormatted?: string
  expectedDueDate?: string
  deliveryDate?: string
  prenatal_end_date?: string
  postpartum_end_date?: string
  notes?: string
  visitNumber?: number
  postpartum_assessment?: {
    ppa_id: string
    ppa_date: string
    ppa_lochial_discharges: string
    ppa_blood_pressure: string
    ppa_feedings: string
    ppa_findings: string
    ppa_nurses_notes: string
    created_at: string
    updated_at: string
  }[]
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
  getStatusBadge: (status: "Active" | "Completed" | "Pregnancy Loss") => React.ReactElement
  getRecordTypeBadge: (recordType: "Prenatal" | "Postpartum Care") => React.ReactElement
  onCompletePregnancy?: (pregnancyId: string) => void
}

export function PregnancyAccordion({
  pregnancyGroups,
  getStatusBadge,
  getRecordTypeBadge,
}: PregnancyAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  if (pregnancyGroups.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500 text-center">No pregnancy records found</Text>
      </View>
    )
  }

  const toggleExpanded = (pregnancyId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(pregnancyId)) {
      newExpanded.delete(pregnancyId)
    } else {
      newExpanded.add(pregnancyId)
    }
    setExpandedItems(newExpanded)
  }

  // determine if a record should have a complete button
 

  return (
    <View className="p-4">
      {pregnancyGroups.map((pregnancy) => {
        const sortedRecords = pregnancy.records.sort(
          (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
        )
        const isExpanded = expandedItems.has(pregnancy.pregnancyId)

        return (
          <View key={pregnancy.pregnancyId} className="border border-gray-200 shadow-sm rounded-lg mb-4 bg-white">
            <TouchableOpacity
              onPress={() => toggleExpanded(pregnancy.pregnancyId)}
              className="px-4 py-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-semibold text-lg text-gray-900">{pregnancy.pregnancyId}</Text>
                    {getStatusBadge(pregnancy.status)}
                  </View>
                  <View className="flex-row items-center gap-4 mt-1">
                    <View className="flex-row items-center gap-1">
                      <Calendar size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600">
                        Started: {new Date(pregnancy.startDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {pregnancy.expectedDueDate && (
                    <Text className="text-sm text-gray-600 mt-1">
                      Due: {new Date(pregnancy.expectedDueDate).toLocaleDateString()}
                    </Text>
                  )}
                  {pregnancy.deliveryDate && (
                    <Text className="text-sm text-gray-600 mt-1">
                      Delivered: {new Date(pregnancy.deliveryDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <View className="flex-row items-center gap-2 mb-1">
                    {pregnancy.hasPrenatal && getRecordTypeBadge("Prenatal")}
                    {pregnancy.hasPostpartum && getRecordTypeBadge("Postpartum Care")}
                  </View>
                  <Text className="text-sm text-gray-500">
                    ({pregnancy.records.length === 1 ? "1 record" : `${pregnancy.records.length} records`})
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View className="px-4 pb-4 border-t border-gray-100">
                <View className="space-y-3 mt-3">
                  {sortedRecords.map((record, recordIndex) => {
                    const visitNumber = record.visitNumber || sortedRecords.length - recordIndex

                    return (
                      <Card key={record.id} className="border-l-4 mb-2 border-l-blue-200 bg-white">
                        <View className="p-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-sm font-medium text-gray-900">Record #{record.id}</Text>
                                    {getRecordTypeBadge(record.recordType)}
                                </View>
                                <Text className="text-sm text-gray-500">
                                    {new Date(record.dateCreated).toLocaleDateString()}
                                </Text>
                            </View>

                            <View className="space-y-2">
                                {record.recordType === "Prenatal" && record.gestationalFormatted && (
                                <Text className="text-sm text-gray-600">
                                    <Text className="font-medium">Gestational Age:</Text> {record.gestationalFormatted}
                                </Text>
                                )}
                                {record.prenatal_end_date && (
                                <Text className="text-sm text-gray-600">
                                    <Text className="font-medium">Prenatal End Date:</Text>{" "}
                                    {new Date(record.prenatal_end_date).toLocaleDateString()}
                                </Text>
                                )}
                                {record.postpartum_end_date && (
                                <Text className="text-sm text-gray-600">
                                    <Text className="font-medium">Postpartum End Date:</Text>{" "}
                                    {new Date(record.postpartum_end_date).toLocaleDateString()}
                                </Text>
                                )}
                                {record.notes && (
                                <Text className="text-sm text-gray-600">
                                    <Text className="font-medium">Visited:</Text> {record.notes}
                                </Text>
                                )}
                            </View>
                            
                            </View>
                            <View className="flex-row gap-2 mb-3 justify-end">
                                <TouchableOpacity 
                                    className="flex-row items-center bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg"
                                    onPress={() => {
                                        if (record.recordType === "Postpartum Care") {
                                            // Navigate to postpartum screen with postpartum record ID
                                            console.log("To postpartum with pprId:", record.id)
                                            router.push({
                                                pathname: "/(health)/maternal/postpartum",
                                                params: { 
                                                    pprId: record.id 
                                                }
                                            })
                                        } else if (record.recordType === "Prenatal") {
                                            // Navigate to prenatal screen with prenatal form ID
                                            console.log("To prenatal with pfId:", record.id)
                                            router.push({
                                                pathname: "/(health)/maternal/prenatal",
                                                params: { 
                                                    pfId: record.id 
                                                }
                                            })
                                        }
                                    }}
                                >
                                    <Eye size={14} color="#374151" />
                                    <Text className="ml-1 text-sm text-gray-700">View</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    )
                  })}
                </View>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}
