import { View } from "react-native"
import { Clock, CalendarCheck } from "lucide-react-native"

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
}

interface PregnancyVisitTrackerProps {
  pregnancies: PregnancyDataDetails[]
}

export default function PregnancyVisitTracker({ pregnancies }: PregnancyVisitTrackerProps) {
  if (!pregnancies || pregnancies.length === 0) {
    return (
      <View className="items-center py-4">
        <Text className="text-center text-gray-500">No pregnancy data available</Text>
      </View>
    )
  }

  const normalizeStatus = (statusRaw: string | undefined): "Active" | "Completed" | "Pregnancy Loss" => {
    if (!statusRaw) return "Pregnancy Loss"
    const s = statusRaw.toLowerCase()
    if (s === "active") return "Active"
    if (s === "completed") return "Completed"
    return "Pregnancy Loss"
  }

  // counts
  const completedPregnancies = pregnancies.filter((p) => normalizeStatus(p.status) === "Completed").length

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
              <View className="flex-row items-center mb-1">
                <Clock size={16} color="#10B981" />
                <Text className="text-sm font-semibold ml-1 text-gray-900">1-3 months</Text>
              </View>
              <Text className="text-xs text-gray-500 font-medium italic text-center">Atleast 1 visit</Text>
            </View>
            <View className="items-center py-3">
              <Text className="text-sm font-bold text-gray-900">Date</Text>
            </View>
          </View>

          {/* 2nd trimester */}
          <View className="flex-1 border border-gray-200 rounded-md p-3">
            <View className="items-center mb-2">
              <View className="flex-row items-center mb-1">
                <Clock size={16} color="#10B981" />
                <Text className="text-sm font-semibold ml-1 text-gray-900">4-6 months</Text>
              </View>
              <Text className="text-xs text-gray-500 font-medium italic text-center">Atleast 2 visit</Text>
            </View>
            <View className="items-center py-3">
              <Text className="text-sm font-bold text-gray-900">Date</Text>
            </View>
          </View>

          {/* 3rd trimester */}
          <View className="flex-1 border border-gray-200 rounded-md p-3">
            <View className="items-center mb-2">
              <View className="flex-row items-center mb-1">
                <Clock size={16} color="#10B981" />
                <Text className="text-sm font-semibold ml-1 text-gray-900">7-9 months</Text>
              </View>
              <Text className="text-xs text-gray-500 font-medium italic text-center">Atleast 5 visit</Text>
            </View>
            <View className="items-center py-3">
              <Text className="text-sm font-bold text-gray-900">Date</Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}
