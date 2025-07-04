"use client"

import PageLayout from "@/screens/_PageLayout"
import { useRouter } from "expo-router"
import { TouchableOpacity, View, Text, ActivityIndicator, Alert } from "react-native"
import { useGetWeeklyAR } from "../queries/reportFetch"
import { ChevronLeft, Search, FileText, Calendar, Users, Paperclip } from "lucide-react-native"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const StatusBadge = ({ status }: { status: any }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <View className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
      <Text className={`text-xs font-medium ${getStatusColor().split(" ")[1]}`}>
        {status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
      </Text>
    </View>
  )
}

const WARCard = ({ item, onPress }: { item: any; onPress: (item: any) => void }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1">WAR #{item.id}</Text>
          <StatusBadge status={item.status} />
        </View>
        <View className="items-end">
          <Text className="text-gray-500 text-xs">Created</Text>
          <Text className="text-gray-900 text-sm font-medium">{formatDate(item.created_at)}</Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-600 text-sm">For: {formatDate(item.created_for)}</Text>
          </View>
          {item.war_files && item.war_files.length > 0 && (
            <View className="flex-row items-center">
              <Paperclip size={14} className="text-gray-400 mr-1" />
              <Text className="text-gray-500 text-xs">
                {item.war_files.length} file{item.war_files.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
        {item.war_composition && item.war_composition.length > 0 && (
          <View className="flex-row items-center">
            <Users size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-500 text-sm">
              {item.war_composition.length} composition{item.war_composition.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const EmptyState = () => (
  <View className="flex-1 justify-center items-center py-16">
    <FileText size={48} className="text-gray-300 mb-4" />
    <Text className="text-gray-500 text-lg font-medium mb-2">No Reports Found</Text>
    <Text className="text-gray-400 text-sm text-center px-8">
      There are no weekly acknowledgement reports available at the moment.
    </Text>
  </View>
)

const LoadingState = () => (
  <View className="flex-1 justify-center items-center py-16">
    <ActivityIndicator size="large" className="text-blue-600 mb-4" />
    <Text className="text-gray-500 text-base">Loading reports...</Text>
  </View>
)

export default () => {
  const router = useRouter()
  const { data: weeklyAR, isLoading, error } = useGetWeeklyAR()

  const handleWARPress = (war: any) => {
    Alert.alert("WAR Options", `What would you like to do with WAR #${war.id}?`, [
      { text: "View Details", onPress: () => console.log("View WAR:", war.id) },
      { text: "Edit", onPress: () => console.log("Edit WAR:", war.id) },
      { text: "Cancel", style: "cancel" },
    ])
  }

  // Group WAR items by month and year based on created_for
  const groupWARByMonth = (wars: any[]) => {
    if (!wars || wars.length === 0) return {}

    const grouped = wars.reduce((acc, war) => {
      if (!war.created_for) return acc

      const date = new Date(war.created_for)
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })

      if (!acc[monthYear]) {
        acc[monthYear] = {
          items: [],
          date: date,
          count: 0,
        }
      }

      acc[monthYear].items.push(war)
      acc[monthYear].count++

      return acc
    }, {})

    // Sort by date (most recent first)
    const sortedEntries = Object.entries(grouped).sort(([, a], [, b]) => {
      return (b as any).date.getTime() - (a as any).date.getTime()
    })

    return Object.fromEntries(sortedEntries)
  }

  const groupedWAR = weeklyAR ? groupWARByMonth(weeklyAR) : {}
  const monthKeys = Object.keys(groupedWAR)

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Acknowledgement Reports</Text>}
      >
        <View className="flex-1 justify-center items-center py-16">
          <Text className="text-red-500 text-lg font-medium mb-2">Error Loading Reports</Text>
          <Text className="text-gray-500 text-sm text-center px-8">
            Unable to load weekly acknowledgement reports. Please try again.
          </Text>
        </View>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="flex justify-center items-center">
          <Text className="text-gray-900 text-[13px]">Weekly</Text>
          <Text className="text-gray-900 text-[13px]">Accomplishment Reports</Text>
        </View>
      }
      rightAction={
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Search size={20} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-white">
        <View className="flex-1">
          {isLoading ? (
            <LoadingState />
          ) : !weeklyAR || weeklyAR.length === 0 ? (
            <EmptyState />
          ) : (
            <Accordion type="single" className="px-5 pt-4" defaultValue={monthKeys.length > 0 ? [monthKeys[0]] : []}>
              {monthKeys.map((monthYear) => {
                const monthData = groupedWAR[monthYear] as { items: any[]; date: Date; count: number }
                return (
                  <AccordionItem key={monthYear} value={monthYear} className="border-0">
                    <AccordionTrigger className="rounded-t-lg px-4 py-3">
                      <View className="flex-row justify-between items-center flex-1">
                        <Text className="text-gray-900 font-semibold text-base">{monthYear}</Text>
                        <View className="bg-blue-100 px-2 py-1 rounded-full mr-4">
                          <Text className="text-blue-800 text-xs font-medium">
                            {monthData.count} report{monthData.count !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                      {monthData.items.map((war: any) => (
                        <WARCard key={war.id} item={war} onPress={handleWARPress} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </View>
      </View>
    </PageLayout>
  )
}
