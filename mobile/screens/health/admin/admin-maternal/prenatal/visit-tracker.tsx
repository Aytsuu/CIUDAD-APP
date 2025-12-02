import React from "react"
import { View } from "react-native"
import { CalendarCheck, Check } from "lucide-react-native"

import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"

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
  postpartum_record?: {
    ppr_id: string
    delivery_date: string | "N/A"
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
  follow_up?: {
    followv_id: number
    followv_date: string
    followv_status: string
    followv_description: string
    created_at: string
    completed_at: string | null
    patrec: number
  }[]
}

interface PregnancyVisitTrackerProps {
  pregnancies: PregnancyDataDetails[]
}

interface VisitCheckmarksProps {
  requiredVisits: number
  completedVisits: number
}

function VisitCheckmarks({ requiredVisits, completedVisits }: VisitCheckmarksProps) {
  return (
    <View className="flex-row gap-2 justify-center items-center flex-wrap">
      {Array.from({ length: requiredVisits }).map((_, index) => {
        const isCompleted = index < completedVisits
        return (
          <View
            key={index}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
              isCompleted ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-300"
            }`}
          >
            <Check size={14} color={isCompleted ? "white" : "#9CA3AF"} />
          </View>
        )
      })}
    </View>
  )
}

export default function PregnancyVisitTracker({ pregnancies }: PregnancyVisitTrackerProps) {
  // Ensure pregnancies is always an array
  const pregnanciesArray = Array.isArray(pregnancies) ? pregnancies : []
  
  if (pregnanciesArray.length === 0) {
    return (
      <View className="items-center py-4">
        <Text className="text-center text-gray-500">No pregnancy data available</Text>
      </View>
    )
  }

  // Helper function: Calculate which trimester a follow-up visit belongs to
  const getFollowUpTrimester = (
    followUpDate: string,
    pregnancyStartDate: string
  ): "1-3 months" | "4-6 months" | "7-9 months" | "unknown" => {
    const followUp = new Date(followUpDate)
    const pregnancyStart = new Date(pregnancyStartDate)
    
    // Calculate months difference
    const monthsDiff = 
      (followUp.getFullYear() - pregnancyStart.getFullYear()) * 12 +
      (followUp.getMonth() - pregnancyStart.getMonth())
    
    if (monthsDiff >= 0 && monthsDiff < 3) {
      return "1-3 months"
    } else if (monthsDiff >= 3 && monthsDiff < 6) {
      return "4-6 months"
    } else if (monthsDiff >= 6 && monthsDiff < 9) {
      return "7-9 months"
    }
    
    return "unknown"
  }

  // Helper function: Count completed visits per trimester
  const countVisitsByTrimester = () => {
    let firstTrimester = 0
    let secondTrimester = 0
    let thirdTrimester = 0

    // Process each pregnancy (including all statuses, not just "active")
    pregnanciesArray.forEach((pregnancy) => {
      const pregnancyStartDate = pregnancy.created_at
      const followUps = pregnancy.follow_up || []
      const prenatalForms = pregnancy.prenatal_form || []

      // Count only the FIRST prenatal form creation as the initial visit
      if (prenatalForms.length > 0) {
        const firstPrenatalForm = prenatalForms[0]
        const trimester = getFollowUpTrimester(firstPrenatalForm.created_at, pregnancyStartDate)
        
        switch (trimester) {
          case "1-3 months":
            firstTrimester++
            break
          case "4-6 months":
            secondTrimester++
            break
          case "7-9 months":
            thirdTrimester++
            break
        }
      }

      // Count completed follow-ups by trimester
      followUps.forEach((visit) => {
        // Only count completed visits
        if (visit.followv_status.toLowerCase() === "completed") {
          const trimester = getFollowUpTrimester(visit.followv_date, pregnancyStartDate)
          
          switch (trimester) {
            case "1-3 months":
              firstTrimester++
              break
            case "4-6 months":
              secondTrimester++
              break
            case "7-9 months":
              thirdTrimester++
              break
          }
        }
      })
    })

    return {
      first: firstTrimester,
      second: secondTrimester,
      third: thirdTrimester,
    }
  }

  // Calculate actual visit counts
  const visitCounts = countVisitsByTrimester()
  const firstTrimesterVisits = visitCounts.first
  const secondTrimesterVisits = visitCounts.second
  const thirdTrimesterVisits = visitCounts.third

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <View className="flex-row items-center mb-3 gap-1">
          <CalendarCheck size={24} color="#EF4444" />
          <Text className="text-lg font-semibold text-gray-900">8 ANC Visit Tracker</Text>
        </View>

        <View className="flex-row gap-2">
          {/* 1st trimester */}
          <View className="flex-1 border border-gray-200 rounded-md p-3">
            <View className="items-center mb-2">
              <View className="flex-row items-center justify-center mb-1">
                <Text className="text-sm font-semibold text-gray-900">1st Trimester</Text>
              </View>
              <View className="flex-row justify-center">
                <Text className="text-[11px] text-black/50 font-bold italic text-center">1-3 months</Text>
              </View>
            </View>
            <View className="items-center gap-2 py-2">
              <Text className="text-xs text-gray-600">Minimum: 1 visit</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {firstTrimesterVisits} {firstTrimesterVisits === 1 ? "visit" : "visits"}
              </Text>
              <VisitCheckmarks requiredVisits={1} completedVisits={firstTrimesterVisits} />
            </View>
          </View>

          {/* 2nd trimester */}
          <View className="flex-1 border border-gray-200 rounded-md p-3">
            <View className="items-center mb-2">
              <View className="flex-row items-center justify-center mb-1">
                <Text className="text-sm font-semibold text-gray-900">2nd Trimester</Text>
              </View>
              <View className="flex-row justify-center">
                <Text className="text-[11px] text-black/50 font-bold italic text-center">4-6 months</Text>
              </View>
            </View>
            <View className="items-center gap-2 py-2">
              <Text className="text-xs text-gray-600">Minimum: 2 visits</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {secondTrimesterVisits} {secondTrimesterVisits === 1 ? "visit" : "visits"}
              </Text>
              <VisitCheckmarks requiredVisits={2} completedVisits={secondTrimesterVisits} />
            </View>
          </View>

          {/* 3rd trimester */}
          <View className="flex-1 border border-gray-200 rounded-md p-3">
            <View className="items-center mb-2">
              <View className="flex-row items-center justify-center mb-1">
                <Text className="text-sm font-semibold text-gray-900">3rd Trimester</Text>
              </View>
              <View className="flex-row justify-center">
                <Text className="text-[11px] text-black/50 font-bold italic text-center">7-9 months</Text>
              </View>
            </View>
            <View className="items-center gap-2 py-2">
              <Text className="text-xs text-gray-600">Minimum: 5 visits</Text>
              <Text className="text-sm font-semibold text-gray-800">
                {thirdTrimesterVisits} {thirdTrimesterVisits === 1 ? "visit" : "visits"}
              </Text>
              <VisitCheckmarks requiredVisits={5} completedVisits={thirdTrimesterVisits} />
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}
