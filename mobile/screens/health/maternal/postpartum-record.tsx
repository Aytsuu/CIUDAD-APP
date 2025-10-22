import React, { useEffect, useState } from "react"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { FileText, ChevronLeft } from "lucide-react-native"

import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import PageLayout from "@/screens/_PageLayout"
import { usePatientPostpartumCompleteRecord } from "../admin/admin-maternal/queries/maternalFETCH"

interface PostpartumRecord {
  date: string
  familyNo: string
  name: string
  age: string
  husbandName: string
  address: string
  dateTimeOfDelivery: string
  placeOfDelivery: string
  attendedBy: string
  outcome: string
  ttStatus: string
  ironSupplementationDate: string
  lochialDischarges: string
  vitASupplementation: string
  numOfPadsPerDay: string
  mebendazoleGiven: string
  dateTimeInitiatedBF: string
  bloodPressure: string
  feeding: string
  findings: string
  nursesNotes: string
}

interface PostpartumCareHistoryProps {
  pprId?: string
}

export default function PostpartumCareHistory({ pprId: propPprId }: PostpartumCareHistoryProps) {
  const [postpartumRecords, setPostpartumRecords] = useState<PostpartumRecord[]>([])
  const [pprId, setPprId] = useState<string>("")
  
  const params = useLocalSearchParams()
  
  // Get postpartum record ID from props or route params
  useEffect(() => {
    if (propPprId) {
      setPprId(propPprId)
    } else if (params?.pprId) {
      setPprId(params.pprId as string)
    }
  }, [propPprId, params])

  // Fetch postpartum records using the hook
  const { data: postpartumData, isLoading, error } = usePatientPostpartumCompleteRecord(pprId)

  // Transform API data to display format
  useEffect(() => {
    if (postpartumData) {
      const record = postpartumData
      const personalInfo = record.patient_details?.personal_info
      const address = record.patient_details?.address
      const family = record.patient_details?.family
      const deliveryRecord = record.delivery_records?.[0]
      const vitalSigns = record.vital_signs
      const assessment = record.assessments?.[0]
      
      // Check if patient is resident and get spouse information
      const isResident = record.patient_details?.pat_type?.toLowerCase() === "resident"
      const fatherInfo = record.patient_details?.family?.family_heads?.father?.personal_info
      const spouseInfo = record.spouse
      
      // Calculate age
      const age = personalInfo?.per_dob ? 
        Math.floor((new Date().getTime() - new Date(personalInfo.per_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() 
        : ""

      const transformedRecord: PostpartumRecord = {
        date: assessment?.ppa_date_of_visit || "N/A",
        familyNo: family?.fam_id || "N/A",
        name: `${personalInfo?.per_lname || ""}, ${personalInfo?.per_fname || ""} ${personalInfo?.per_mname || ""}`.trim(),
        age: age,
        husbandName: isResident && fatherInfo ? 
          `${fatherInfo.per_lname || ""}, ${fatherInfo.per_fname || ""} ${fatherInfo.per_mname || ""}`.trim() :
          spouseInfo ? `${spouseInfo.spouse_lname || ""}, ${spouseInfo.spouse_fname || ""} ${spouseInfo.spouse_mname || ""}`.trim() : "N/A",
        address: `${address?.add_street || ""} ${address?.add_sitio || ""} ${address?.add_barangay || ""} ${address?.add_city || ""} ${address?.add_province || ""}`.trim(),
        dateTimeOfDelivery: deliveryRecord ? 
          `${deliveryRecord.ppdr_date_of_delivery || ""} ${deliveryRecord.ppdr_time_of_delivery || ""}`.trim() : "N/A",
        placeOfDelivery: deliveryRecord?.ppdr_place_of_delivery || "N/A",
        attendedBy: deliveryRecord?.ppdr_attended_by || "N/A",
        outcome: deliveryRecord?.ppdr_outcome || "N/A",
        ttStatus: "N/A",
        ironSupplementationDate: "N/A",
        lochialDischarges: record.ppr_lochial_discharges || "N/A",
        vitASupplementation: record.ppr_vit_a_date_given || "N/A",
        numOfPadsPerDay: record.ppr_num_of_pads?.toString() || "N/A",
        mebendazoleGiven: record.ppr_mebendazole_date_given || "N/A",
        dateTimeInitiatedBF: record.ppr_date_of_bf && record.ppr_time_of_bf ? 
          `${record.ppr_date_of_bf} ${record.ppr_time_of_bf}`.trim() : "N/A",
        bloodPressure: vitalSigns ? `${vitalSigns.vital_bp_systolic}/${vitalSigns.vital_bp_diastolic}` : "N/A",
        feeding: assessment?.ppa_feeding || "N/A",
        findings: assessment?.ppa_findings || "N/A",
        nursesNotes: assessment?.ppa_nurses_notes || "N/A"
      }
      
      setPostpartumRecords([transformedRecord])
    }
  }, [postpartumData])

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-sm text-red-600 text-center px-4">
          Failed to load postpartum records. Please try again.
        </Text>
      </View>
    )
  }

  const hasData = postpartumRecords && postpartumRecords.length > 0

  const fieldLabels = [
    { key: "date", label: "Date" },
    { key: "familyNo", label: "Family No." },
    { key: "name", label: "Name" },
    { key: "age", label: "Age" },
    { key: "husbandName", label: "Husband's Name" },
    { key: "address", label: "Address" },
    { key: "dateTimeOfDelivery", label: "Date and Time of Delivery" },
    { key: "placeOfDelivery", label: "Place of Delivery" },
    { key: "attendedBy", label: "Attended By" },
    { key: "outcome", label: "Outcome" },
    { key: "ttStatus", label: "TT Status" },
    { key: "ironSupplementationDate", label: "Iron Supplementation Date" },
    { key: "lochialDischarges", label: "Lochial Discharges" },
    { key: "vitASupplementation", label: "Vit A Supplementation" },
    { key: "numOfPadsPerDay", label: "No. of Pad / Day" },
    { key: "mebendazoleGiven", label: "Mebendazole Given" },
    { key: "dateTimeInitiatedBF", label: "Date and Time Initiated BF" },
    { key: "bloodPressure", label: "B/P" },
    { key: "feeding", label: "Feeding" },
    { key: "findings", label: "Findings" },
    { key: "nursesNotes", label: "Nurses Notes" },
  ]

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Postpartum Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        {hasData ? (
          <View className="gap-6">
            {postpartumRecords.map((record, recordIndex) => (
              <View
                key={recordIndex}
                className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm mb-4"
              >
                <View className="bg-blue-50 px-4 py-3 border-b border-gray-300">
                  <Text className="text-sm font-semibold text-gray-800">
                    Postpartum Record - {record.name}
                  </Text>
                </View>

                <View className="bg-white">
                  {fieldLabels.map((field, fieldIndex) => (
                    <View
                      key={fieldIndex}
                      className={`flex-row border-b border-gray-200 ${fieldIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <View className="flex-1 px-4 py-3 border-r border-gray-300 justify-center">
                        <Text className="text-[13px] font-medium text-gray-700">{field.label}</Text>
                      </View>
                      <View className="flex-[1.5] px-4 py-3 justify-center">
                        <Text className="text-[13px] text-gray-900">
                          {record[field.key as keyof PostpartumRecord] || "N/A"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Card className="bg-white border-slate-200">
            <CardContent className="items-center py-16 px-4">
              <FileText size={64} color="#CBD5E1" />
              <Text className="text-lg font-medium text-slate-700 mb-2 mt-4">
                No Postpartum Records Available
              </Text>
              <Text className="text-sm text-slate-600 text-center">
                No postpartum records have been documented for this patient.
              </Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </PageLayout>
  )
}
