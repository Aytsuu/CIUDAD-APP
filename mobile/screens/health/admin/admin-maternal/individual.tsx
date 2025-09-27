"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { View, TouchableOpacity, TextInput, ScrollView, RefreshControl } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Search, Heart, Baby, Clock, CheckCircle, HeartHandshake, RefreshCw, ChevronLeft } from "lucide-react-native"

import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import PageLayout from "@/screens/_PageLayout"

import PregnancyVisitTracker from "../admin-maternal/prenatal/visit-tracker"
import { PregnancyAccordion } from "../admin-maternal/prenatal/pregnancy-accordion"

import { usePregnancyDetails } from "./queries/maternalFETCH"

interface Patient {
  pat_id: string
  age: number
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
    add_sitio?: string
  }
  pat_type: string
  patrec_type?: string
}

// accordion data types
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

// pregnancy details types for fetching
interface PregnancyDataDetails {
  pregnancy_id: string
  status: string
  created_at: string
  updated_at: string
  prenatal_end_date?: string
  postpartum_end_date?: string
  pat_id: string
  prenatal_form?: {
    pf_id: string
    pf_lmp: string
    pf_edc: string
    created_at: string
  }[]
  prenatal_care?: {
    pf_id: string
    pfpc_aog_wks: number
    pfpc_aog_days: number
  }[]
  postpartum_record?: {
    ppr_id: string
    delivery_date: string | "Unknown"
    created_at: string
    updated_at: string
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
  }[]
}

// Badge Components
const StatusBadge = React.memo<{ status: "Active" | "Completed" | "Pregnancy Loss" }>(({ status }) => {
  if (status === "Active") {
    return (
      <View className="flex-row items-center bg-green-50 border border-green-200 px-2 py-1 rounded-full">
        <Clock size={12} color="#15803d" />
        <Text className="ml-1 text-xs font-medium text-green-700">Active</Text>
      </View>
    )
  } else if (status === "Completed") {
    return (
      <View className="flex-row items-center bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
        <CheckCircle size={12} color="#374151" />
        <Text className="ml-1 text-xs font-medium text-gray-700">Completed</Text>
      </View>
    )
  } else if (status === "Pregnancy Loss") {
    return (
      <View className="flex-row items-center bg-red-50 border border-red-200 px-2 py-1 rounded-full">
        <HeartHandshake size={12} color="#dc2626" />
        <Text className="ml-1 text-xs font-medium text-red-700">Pregnancy Loss</Text>
      </View>
    )
  }
  return (
    <View className="flex-row items-center bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
      <Text className="text-xs font-medium text-gray-700">Unknown</Text>
    </View>
  )
})

const RecordTypeBadge = React.memo<{ recordType: "Prenatal" | "Postpartum Care" }>(({ recordType }) => {
  return recordType === "Prenatal" ? (
    <View className="flex-row items-center bg-pink-50 border border-pink-200 px-2 py-1 rounded-full">
      <Heart size={12} color="#be185d" />
    </View>
  ) : (
    <View className="flex-row items-center bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
      <Baby size={12} color="#1d4ed8" />
    </View>
  )
})

// Filter Picker Component
const FilterPicker = React.memo<{
  selectedFilter: string
  onFilterChange: (filter: string) => void
}>(({ selectedFilter, onFilterChange }) => {
  const filters = ["All", "Active", "Completed", "Pregnancy Loss"]

  return (
    <View className="flex-row bg-gray-100 rounded-lg p-1">
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          onPress={() => onFilterChange(filter)}
          className={`flex-1 py-2 px-3 rounded-md ${selectedFilter === filter ? "bg-white shadow-sm" : ""}`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              selectedFilter === filter ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
})

export default function IndividualMaternalRecordScreen() {
  const params = useLocalSearchParams()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const {
    data: pregnancyData,
    isLoading: pregnancyDataLoading,
    refetch,
  } = usePregnancyDetails(selectedPatient?.pat_id || "")

  const getLatestFollowupVisit = () => {
    let followUpData = [];
    
    if (pregnancyData && typeof pregnancyData === 'object' && 'results' in pregnancyData) {
      // Handle paginated response structure: { count, next, previous, results: [...] }
      const results = (pregnancyData as any).results;
      if (Array.isArray(results) && results.length > 0) {
        followUpData = results[0]?.follow_up || [];
      }
    } else if (Array.isArray(pregnancyData) && pregnancyData.length > 0) {
      // Handle direct array response
      followUpData = pregnancyData[0]?.follow_up || [];
    }
    
    return followUpData;
  };

  const latestFollowupVisit = getLatestFollowupVisit();
  const nextFollowVisit = [...latestFollowupVisit]
    .filter(visit => visit.followv_status === 'pending') // Only show pending visits
    .sort((a, b) => new Date(a.followv_date).getTime() - new Date(b.followv_date).getTime())[0];
  console.log('Next Follow-up Visit:', nextFollowVisit);

  const dateWords = () => {
    return new Date(nextFollowVisit?.followv_date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    if (params.patientData) {
      try {
        const patientData = JSON.parse(params.patientData as string)
        console.log("Parsed patient data:", patientData) // Debug log
        setSelectedPatient(patientData)
      } catch (error) {
      }
    } else if (params.pat_id) {
      setSelectedPatient({
        pat_id: params.pat_id as string,
        age: 0,
        personal_info: {
          per_fname: "Unknown",
          per_lname: "Patient",
          per_mname: "",
          per_sex: "Female",
          ageTime: "yrs",
        },
        pat_type: "Unknown",
      })
    }
  }, [params])

  useEffect(() => {
  }, [pregnancyData, pregnancyDataLoading])

  const groupPregnancies = useCallback(
    (
      pregnancies: PregnancyDataDetails[],
      patientType: string,
      patientAddress: Patient["address"] | undefined,
    ): PregnancyGroup[] => {
      const grouped: Record<string, PregnancyGroup> = {}

      // Add explicit checks for array and valid data
      if (!pregnancies || !Array.isArray(pregnancies) || pregnancies.length === 0) {
        console.log("No valid pregnancies data:", pregnancies)
        return []
      }

      pregnancies.forEach((pregnancy) => {
        // Add null checks for pregnancy object
        if (!pregnancy || !pregnancy.pregnancy_id) {
          console.warn("Invalid pregnancy object:", pregnancy)
          return
        }

        if (!grouped[pregnancy.pregnancy_id]) {
          grouped[pregnancy.pregnancy_id] = {
            pregnancyId: pregnancy.pregnancy_id,
            status: normalizeStatus(pregnancy.status),
            startDate: pregnancy.created_at ? pregnancy.created_at.split("T")[0] : "Unknown",
            expectedDueDate: pregnancy.prenatal_form?.[0]?.pf_edc || undefined,
            deliveryDate: pregnancy.postpartum_record?.[0]?.delivery_date || undefined,
            records: [],
            hasPrenatal: false,
            hasPostpartum: false,
          }
        }

        const currPregnancyGroup = grouped[pregnancy.pregnancy_id]

        // Process prenatal forms
        pregnancy.prenatal_form?.forEach((pf) => {
          const addressParts = [
            patientAddress?.add_street,
            patientAddress?.add_barangay,
            patientAddress?.add_city,
            patientAddress?.add_province,
          ].filter(Boolean)

          const correspondingCare = pregnancy.prenatal_care?.find((care) => care.pf_id === pf.pf_id)
          const aogWks = correspondingCare?.pfpc_aog_wks
          const aogDays = correspondingCare?.pfpc_aog_days
          const gestationalFormatted =
            aogWks !== undefined && aogDays !== undefined ? `${aogWks} weeks ${aogDays} days` : undefined

          currPregnancyGroup.records.push({
            id: pf.pf_id,
            pregnancyId: pregnancy.pregnancy_id,
            dateCreated: pf.created_at ? pf.created_at.split("T")[0] : "Unknown",
            address: addressParts.length > 0 ? addressParts.join(", ") : "Not Provided",
            sitio: patientAddress?.add_external_sitio || patientAddress?.add_sitio || "Not Provided",
            type: patientType as "Transient" | "Resident",
            recordType: "Prenatal",
            status: normalizeStatus(pregnancy.status),
            gestationalWeek: aogWks,
            gestationalFormatted: gestationalFormatted,
            expectedDueDate: pf.pf_edc,
            prenatal_end_date: pregnancy.prenatal_end_date,
            notes: `Prenatal visit on ${pf.created_at ? pf.created_at.split("T")[0] : "Unknown"}`,
          })
          currPregnancyGroup.hasPrenatal = true
          if (pf.pf_edc && !currPregnancyGroup.expectedDueDate) {
            currPregnancyGroup.expectedDueDate = pf.pf_edc
          }
        })

        // Process postpartum records
        pregnancy.postpartum_record?.forEach((ppr) => {
          const addressParts = [
            patientAddress?.add_street,
            patientAddress?.add_barangay,
            patientAddress?.add_city,
            patientAddress?.add_province,
          ].filter(Boolean)

          currPregnancyGroup.records.push({
            id: ppr.ppr_id,
            pregnancyId: pregnancy.pregnancy_id,
            dateCreated: ppr.created_at ? ppr.created_at.split("T")[0] : "Unknown",
            address: addressParts.length > 0 ? addressParts.join(", ") : "Not Provided",
            sitio: patientAddress?.add_sitio || "Not Provided",
            type: patientType as "Transient" | "Resident",
            recordType: "Postpartum Care",
            status: normalizeStatus(pregnancy.status),
            deliveryDate: ppr.delivery_date,
            postpartum_end_date: pregnancy.postpartum_end_date,
            notes: `Postpartum care on ${ppr.created_at ? ppr.created_at.split("T")[0] : "Unknown"}`,
            postpartum_assessment: ppr.postpartum_assessment || [],
          })
          currPregnancyGroup.hasPostpartum = true
          if (ppr.delivery_date && !currPregnancyGroup.deliveryDate) {
            currPregnancyGroup.deliveryDate = ppr.delivery_date
          }
        })

        // Sort records
        currPregnancyGroup.records.sort((a, b) => {
          if (a.recordType === "Postpartum Care" && b.recordType === "Prenatal") {
            return -1
          }
          if (a.recordType === "Prenatal" && b.recordType === "Postpartum Care") {
            return 1
          }
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        })
      })

      return Object.values(grouped).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    },
    [],
  )

  // Helper to normalize backend status to UI-expected casing
  const normalizeStatus = (statusRaw: string | undefined): "Active" | "Completed" | "Pregnancy Loss" => {
    if (!statusRaw) return "Pregnancy Loss"
    const s = statusRaw.toLowerCase()
    if (s === "active") return "Active"
    if (s === "completed") return "Completed"
    return "Pregnancy Loss"
  }

  // using memo for grouped pregnancies
  const pregnancyGroups: PregnancyGroup[] = useMemo(() => {
    if (pregnancyData && selectedPatient) {

      // Extract the results array from the paginated API response
      let pregnanciesArray: PregnancyDataDetails[] = []

      if (pregnancyData && typeof pregnancyData === "object" && "results" in pregnancyData) {
        // Handle paginated response structure: { count, next, previous, results: [...] }
        const results = (pregnancyData as any).results
        if (Array.isArray(results)) {
          pregnanciesArray = results
        }
      } else if (Array.isArray(pregnancyData)) {
        // Handle direct array response
        pregnanciesArray = pregnancyData
      } else if (pregnancyData && typeof pregnancyData === "object") {
        // Handle single object response
        pregnanciesArray = [pregnancyData as PregnancyDataDetails]
      }


      const grouped = groupPregnancies(pregnanciesArray, selectedPatient.pat_type, selectedPatient.address)
      return grouped
    }
    return []
  }, [pregnancyData, selectedPatient, groupPregnancies])

  const filteredGroups = pregnancyGroups.filter((group) => {
    switch (selectedFilter) {
      case "All":
        return true
      case "Active":
        return group.status === "Active"
      case "Completed":
        return group.status === "Completed"
      case "Pregnancy Loss":
        return group.status === "Pregnancy Loss"
      default:
        return true
    }
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error("Error fetching records")
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  if (pregnancyDataLoading) {
    return <LoadingState />
  }

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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Maternal Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          {selectedPatient ? (
            <View className="mb-5">
              <View className="mb-4">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedPatient.personal_info?.per_fname} {selectedPatient.personal_info?.per_lname}
                    </Text>
                    <Text className="text-gray-600 text-sm">ID: {selectedPatient.pat_id}</Text>
                  </CardContent>
                </Card>
              </View>

              <PregnancyVisitTracker
                pregnancies={
                  pregnancyData?.results ||
                  (Array.isArray(pregnancyData) ? pregnancyData : pregnancyData ? [pregnancyData] : [])
                }
              />
            </View>
          ) : (
            <View className="mb-5">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <Text className="text-center text-gray-500">No patient selected</Text>
                  <Text className="text-gray-400 text-xs mt-2 text-center">
                    {params.pat_id || "missing"}
                  </Text>
                </CardContent>
              </Card>
            </View>
          )}

          {/* Upcoming Follow-up Visit */}
          <View className="flex rounded-md w-full border border-blue-400 mb-5 bg-blue-200 shadow-md">
            {nextFollowVisit ? (
              <View className="p-3 flex-row justify-between items-center w-full">
                <View className="flex-row items-center">
                  <Clock size={18} color="#2563eb" style={{ marginRight: 8 }} />
                  <Text className="font-semibold text-blue-700">Upcoming follow-up visit</Text>
                </View>
                <Text className="text-sm italic text-blue-700">
                  {nextFollowVisit?.followv_description} on <Text className="font-bold">{dateWords()}</Text>
                </Text>
              </View>
            ) : (
              <View className="p-3">
                <Text className="font-semibold text-white">No follow-up visit</Text>
              </View>
            )}
          </View>

          {/* Controls */}
          <View className="mb-4 space-y-3">
            <View className="flex-row items-center space-x-2">
               <View className="flex-1 flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <Search size={17} color="#6B7280" />
                  <TextInput
                     placeholder="Search..."
                     className="flex-1 ml-2 text-gray-800"
                     placeholderTextColor="#9CA3AF"
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                  />
              </View>
            </View>
          </View>

          {/* Records List */}
          <View className="bg-white rounded-lg border border-gray-200">
            <View className="flex-row justify-between p-4 border-b border-gray-200">
               <Text className="text-sm text-gray-600">
                  Showing{" "}
                  {filteredGroups.length === 1
                     ? filteredGroups.length + " pregnancy"
                     : filteredGroups.length + " pregnancies"}
               </Text>
               <View className="flex-row gap-2">
                  <View className="flex-row items-center bg-pink-50 border border-pink-200 px-2 py-1 rounded-full">
                     <Heart size={12} color="#be185d" />
                     <Text className="text-sm ml-1 text-[#be185d]">Prenatal</Text>
                  </View>
                  <View className="flex-row items-center bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                     <Baby size={12} color="#1d4ed8" />
                     <Text className="text-sm ml-1 text-[#1d4ed8]">Postpartum</Text>
                  </View>
               </View>
               
            </View>

            {filteredGroups.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-gray-500 text-center">No pregnancy records found</Text>
              </View>
            ) : (
              <PregnancyAccordion
                  pregnancyGroups={filteredGroups}
                  selectedPatient={selectedPatient}
                  getStatusBadge={(status) => <StatusBadge status={status} />}
                  getRecordTypeBadge={(recordType) => <RecordTypeBadge recordType={recordType} />}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  )
}
