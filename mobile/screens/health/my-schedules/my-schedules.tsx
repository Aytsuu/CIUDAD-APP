// my-schedules.tsx - With Enhanced Sorting Feature
import React, { useState, useMemo } from "react"
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, Modal } from "react-native"
import { Search, AlertCircle, Calendar, ChevronLeft, RefreshCw, ArrowUpDown, X } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { format } from "date-fns"
import { useAppointmentsByResidentId, CombinedAppointmentsResponse } from "./fetch"
import PageLayout from "@/screens/_PageLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type ScheduleRecord = {
  id: number
  scheduledDate: string
  purpose: string
  status: "Pending" | "Completed" | "Missed"
  sitio: string
  type: "Transient" | "Resident"
  patrecType: string
  createdAt?: string
}

type TabType = "pending" | "completed" | "missed"
type SortOption = "date_desc" | "date_asc" | "type" | "status"

// Sort Modal Component
const SortModal: React.FC<{
  visible: boolean
  onClose: () => void
  currentSort: SortOption
  onSelectSort: (sort: SortOption) => void
}> = ({ visible, onClose, currentSort, onSelectSort }) => {
  const sortOptions: { value: SortOption; label: string; description: string }[] = [
    { value: "date_desc", label: "Date (Newest First)", description: "Latest appointments first" },
    { value: "date_asc", label: "Date (Oldest First)", description: "Earliest appointments first" },
  ]

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[70%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
            <View>
              <Text className="text-lg font-semibold text-gray-900">Sort By</Text>
              <Text className="text-sm text-gray-500 mt-0.5">Choose how to organize your appointments</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
              <X size={18} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View className="p-4">
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelectSort(option.value)
                  onClose()
                }}
                className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                  currentSort === option.value
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <View className="flex-1">
                  <Text className={`font-medium ${
                    currentSort === option.value ? "text-blue-700" : "text-gray-900"
                  }`}>
                    {option.label}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{option.description}</Text>
                </View>
                {currentSort === option.value && (
                  <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const TabBar: React.FC<{
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  counts: { pending: number; completed: number; missed: number }
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    {(["pending", "completed", "missed"] as TabType[]).map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => setActiveTab(tab)}
        className={`flex-1 items-center py-3 ${activeTab === tab ? "border-b-2 border-blue-600" : ""}`}
      >
        <Text className={`text-sm font-medium ${activeTab === tab ? "text-blue-600" : "text-gray-600"}`}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)

const AppointmentCard: React.FC<{
  appointment: ScheduleRecord
  actualStatus: string
}> = ({ appointment, actualStatus }) => {
  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (e) {
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    const statusConfig = {
      "Pending": { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
      "Completed": { color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
      "Missed": { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
    }[status] || { color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" }

    return statusConfig
  }

  const statusConfig = getStatusColor(actualStatus)

  return (
    <Card className="mb-3 bg-white border-gray-200 rounded-2xl">
      <CardContent className="p-5 mt-1 bg-gray-100 rounded-2xl">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
              <Calendar size={20} color="#2563EB" />
            </View>
            <View className="ml-3">
              <Text className="font-semibold text-lg text-gray-900">
                {appointment.patrecType}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {formatDateSafely(appointment.scheduledDate)}
              </Text>
            </View>
          </View>
          <Badge 
            variant="outline" 
            className={`${statusConfig.bgColor} ${statusConfig.borderColor}`}
          >
            <Text className={`text-xs font-medium ${statusConfig.color}`}>
              {actualStatus}
            </Text>
          </Badge>
        </View>
        
        <View className="mb-3">
          <Text className="text-gray-600 text-sm font-medium mb-1">Purpose</Text>
          <Text className="text-gray-900 leading-5">{appointment.purpose}</Text>
        </View>

      
      </CardContent>
    </Card>
  )
}

export default function MyAppointmentsScreen() {
  const { user } = useAuth()
  const rp_id = user?.rp
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("pending")
  const [sortBy, setSortBy] = useState<SortOption>("date_desc")
  const [showSortModal, setShowSortModal] = useState(false)

  const {
    data: appointments = {
      follow_up_appointments: [],
      med_consult_appointments: [],
      prenatal_appointments: [],
    },
    isLoading,
    isError,
    refetch,
  } = useAppointmentsByResidentId(rp_id || "")

  const getAppointmentStatus = (scheduledDate: string, currentStatus: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentDate = new Date(scheduledDate)
    appointmentDate.setHours(0, 0, 0, 0)

    if (appointmentDate < today && currentStatus.toLowerCase() === "pending") {
      return "Missed"
    }
    return currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
  }

  const userAppointments = useMemo(() => {
    const apptData = appointments as CombinedAppointmentsResponse

    if (
      !apptData ||
      (apptData.follow_up_appointments.length === 0 &&
        apptData.med_consult_appointments.length === 0 &&
        apptData.prenatal_appointments.length === 0)
    ) {
      return []
    }

    const transformed: ScheduleRecord[] = []

    // Process follow-up appointments
    if (apptData.follow_up_appointments && apptData.follow_up_appointments.length > 0) {
      apptData.follow_up_appointments.forEach((visit: any) => {
        try {
          transformed.push({
            id: visit.followv_id || visit.id || 0,
            scheduledDate: visit.followv_date || "",
            purpose: visit.followv_description || "Follow-up Visit",
            status: (visit.followv_status || "Pending").toLowerCase() as "Pending" | "Completed" | "Missed",
            sitio: "",
            type: "Resident",
            patrecType: "Follow-up",
            createdAt: visit.created_at || visit.followv_date || "",
          })
        } catch (error) {
          console.error("Error transforming follow-up visit data:", error, visit)
        }
      })
    }

    // Process medical consultation appointments
    if (apptData.med_consult_appointments && apptData.med_consult_appointments.length > 0) {
      apptData.med_consult_appointments.forEach((consult: any) => {
        try {
          transformed.push({
            id: consult.id || 0,
            scheduledDate: consult.scheduled_date || "",
            purpose: consult.chief_complaint || "Medical Consultation",
            status: (consult.status || "Pending").toLowerCase() as "Pending" | "Completed" | "Missed",
            sitio: "",
            type: "Resident",
            patrecType: "Medical Consultation",
            createdAt: consult.created_at || consult.scheduled_date || "",
          })
        } catch (error) {
          console.error("Error transforming consultation data:", error, consult)
        }
      })
    }

    // Process prenatal appointments
    if (apptData.prenatal_appointments && apptData.prenatal_appointments.length > 0) {
      apptData.prenatal_appointments.forEach((prenatal: any) => {
        try {
          transformed.push({
            id: prenatal.par_id || 0,
            scheduledDate: prenatal.requested_date || "",
            purpose: prenatal.reason || "Prenatal Appointment",
            status: (prenatal.status || "Pending").toLowerCase() as "Pending" | "Completed" | "Missed",
            sitio: "",
            type: "Resident",
            patrecType: "Prenatal",
            createdAt: prenatal.requested_at || prenatal.created_at || "",
          })
        } catch (error) {
          console.error("Error transforming prenatal data:", error, prenatal)
        }
      })
    }

    return transformed
  }, [appointments])

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    let result = userAppointments
      .map((appt: any) => ({ ...appt, status: getAppointmentStatus(appt.scheduledDate, appt.status) }))
      .filter((appt: any) => {
        // Filter by tab
        if (activeTab === "pending" && appt.status !== "Pending") return false
        if (activeTab === "completed" && appt.status !== "Completed") return false
        if (activeTab === "missed" && appt.status !== "Missed") return false

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          return (
            appt.purpose.toLowerCase().includes(query) ||
            appt.scheduledDate.toLowerCase().includes(query) ||
            appt.patrecType.toLowerCase().includes(query)
          )
        }
        return true
      })

    // Apply sorting
    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
        case "date_asc":
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        case "type":
          return a.patrecType.localeCompare(b.patrecType)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return result
  }, [userAppointments, searchQuery, activeTab, sortBy])

  // Calculate stats for tabs and pending count
  const counts = useMemo(() => {
    const pending = userAppointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Pending").length
    const completed = userAppointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Completed").length
    const missed = userAppointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Missed").length

    return { pending, completed, missed }
  }, [userAppointments])

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (e) {
      console.error("Refetch error:", e)
    }
    setRefreshing(false)
  }, [refetch])

  if (isLoading) {
    return <LoadingState />
  }

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 font-semibold text-base">My Appointments</Text>}
      >
        <View className="flex-1 justify-center items-center bg-white px-6">
          <View className="bg-red-50 p-4 rounded-2xl mb-4">
            <AlertCircle size={40} color="#DC2626" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">Unable to Load Appointments</Text>
          <Text className="text-gray-500 text-center text-sm mb-6">
            Failed to load appointment data. Please check your connection and try again.
          </Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-xl">
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 font-semibold text-base">My Appointments</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-white">
        {/* Search Bar and Sort Button */}
        <View className="px-4 pt-1 pb-4">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl ">
              <Search size={18} color="#6B7280" className="ml-4" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 font-medium"
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowSortModal(true)}
              className="bg-blue-600 rounded-2xl px-4 py-3 flex-row items-center"
            >
              <ArrowUpDown size={18} color="white" />
              {/* <Text className="text-white font-medium text-sm ml-2">{getSortLabel(sortBy)}</Text> */}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts}  />
<View className="mb-3"></View>
        {/* Appointments List */}
        {userAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
              <Calendar size={32} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-1 text-center">No Appointments Yet</Text>
            <Text className="text-gray-500 text-center text-sm">
              You don't have any scheduled appointments at this time.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredAndSortedAppointments}
            keyExtractor={(item) => `appointment-${item.id}-${item.patrecType}`}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={["#2563EB"]}
                tintColor="#2563EB"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const actualStatus = getAppointmentStatus(item.scheduledDate, item.status)
              return <AppointmentCard appointment={item} actualStatus={actualStatus} />
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                  <Calendar size={32} color="#9CA3AF" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-1 text-center">No Appointments Found</Text>
                <Text className="text-gray-500 text-center text-sm px-8">
                  {searchQuery
                    ? `No ${activeTab} appointments match your search.`
                    : `You don't have any ${activeTab} appointments.`}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Sort Modal */}
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        currentSort={sortBy}
        onSelectSort={setSortBy}
      />
    </PageLayout>
  )
}