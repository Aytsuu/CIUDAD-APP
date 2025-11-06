import React, { useState, useMemo } from "react"
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native"
import { Search, AlertCircle, Calendar, User, FileText, ChevronLeft, RefreshCw } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { format } from "date-fns"
import { useAppointmentsByResidentId, CombinedAppointmentsResponse } from "./fetch"
import PageLayout from "@/screens/_PageLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"

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

type FilterType = "All" | "Pending" | "Completed" | "Missed"
type TabType = "pending" | "completed" | "missed" 

// Components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
        }
      case 'completed':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
        }
      case 'missed':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
        }
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
        }
    }
  }

  const statusConfig = getStatusConfig(status)
  return (
    <View className={`px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${statusConfig.color}`}>
        {status}
      </Text>
    </View>
  )
}

const TabBar: React.FC<{
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  counts: { pending: number; completed: number; missed: number; }
}> = ({ activeTab, setActiveTab, counts }) => (
  <View className="flex-row justify-around bg-white p-2 border-b border-gray-200">
    <TouchableOpacity
      onPress={() => setActiveTab('pending')}
      className={`flex-1 items-center py-3 ${activeTab === 'pending' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-600'}`}>
        Pending ({counts.pending})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('completed')}
      className={`flex-1 items-center py-3 ${activeTab === 'completed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>
        Completed ({counts.completed})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab('missed')}
      className={`flex-1 items-center py-3 ${activeTab === 'missed' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'missed' ? 'text-blue-600' : 'text-gray-600'}`}>
        Missed ({counts.missed})
      </Text>
    </TouchableOpacity>
  
  </View>
)

const AppointmentCard: React.FC<{
  appointment: ScheduleRecord
  actualStatus: string
  onPress: () => void
}> = ({ appointment, actualStatus, onPress }) => {
  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (e) {
      return "Invalid Date"
    }
  }

  // Get appointment type badge
  const getAppointmentTypeBadge = (type: string) => {
    const typeConfig = {
      'Follow-up': { color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
      'Consultation': { color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
      'Prenatal': { color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
    }[type] || { color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' };

    return (
      <View className={`px-2 py-1 rounded-full border ${typeConfig.bgColor} ${typeConfig.borderColor}`}>
        <Text className={`text-xs font-semibold ${typeConfig.color}`}>
          {type}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm"
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <User color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {appointment.patrecType} 
                </Text>
                {/* <Text className="text-sm text-gray-500">ID: {appointment.id}</Text> */}
              </View>
              <StatusBadge status={actualStatus} />
            </View>
          </View>
         
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Scheduled: <Text className="font-medium text-gray-900">{formatDateSafely(appointment.scheduledDate)}</Text>
          </Text>
        </View>
        <View className="flex-row items-center mb-3">
          <FileText size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Reason: <Text className="font-medium text-gray-900">{appointment.purpose}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function MyAppointmentsScreen() {
  const { user } = useAuth()
  const rp_id = user?.rp;
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("pending")

  const { data: appointments = {
    follow_up_appointments: [],
    med_consult_appointments: [],
    prenatal_appointments: []
  }, isLoading, isError, refetch } = useAppointmentsByResidentId(rp_id || "")

  // Utility functions
  const getAppointmentStatus = (scheduledDate: string, currentStatus: string) => {
    console.log("getAppointmentStatus called with:", { scheduledDate, currentStatus })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentDate = new Date(scheduledDate)
    appointmentDate.setHours(0, 0, 0, 0)

    if (appointmentDate < today && currentStatus.toLowerCase() === "pending") {
      console.log(`Appointment on ${scheduledDate} marked as Missed (was ${currentStatus})`)
      return "Missed"
    }
    return currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)
  }

  const userAppointments = useMemo(() => {
    // Type guard to ensure appointments has the correct structure
    const apptData = appointments as CombinedAppointmentsResponse;
    
    if (!apptData || (
      apptData.follow_up_appointments.length === 0 && 
      apptData.med_consult_appointments.length === 0 && 
      apptData.prenatal_appointments.length === 0
    )) {
      console.warn("No appointments data")
      return []
    }

    console.log("Raw appointments data:", apptData)

    const transformed: ScheduleRecord[] = []

    // Process follow-up appointments
    if (apptData.follow_up_appointments && apptData.follow_up_appointments.length > 0) {
      apptData.follow_up_appointments.forEach((visit: any) => {
        try {
          const record: ScheduleRecord = {
            id: visit.followv_id || visit.id || 0,
            scheduledDate: visit.followv_date || "",
            purpose: visit.followv_description || "Follow-up Visit",
            status: (visit.followv_status || "Pending").toLowerCase() as "Pending" | "Completed" | "Missed",
            sitio: "",
            type: "Resident",
            patrecType: "Follow-up",
            // Add created/requested date for sorting
            createdAt: visit.created_at || visit.followv_date || "", // Use created_at if available
          }
          console.log("Transformed follow-up record:", record)
          transformed.push(record)
        } catch (error) {
          console.error("Error transforming follow-up visit data:", error, visit)
        }
      })
    }

    // Process medical consultation appointments
    if (apptData.med_consult_appointments && apptData.med_consult_appointments.length > 0) {
      apptData.med_consult_appointments.forEach((consult: any) => {
        try {
          const record: ScheduleRecord = {
            id: consult.id || 0,
            scheduledDate: consult.scheduled_date || "",
            purpose: consult.chief_complaint || "Medical Consultation",
            status: (consult.status || "Pending").toLowerCase() as "Pending" | "Completed" | "Missed",
            sitio: "",
            type: "Resident",
            patrecType: "Medical Consultation",
            createdAt: consult.created_at || consult.scheduled_date || "",
          }
          console.log("Transformed consultation record:", record)
          transformed.push(record)
        } catch (error) {
          console.error("Error transforming consultation data:", error, consult)
        }
      })
    }

    // Process prenatal appointments
    if (apptData.prenatal_appointments && apptData.prenatal_appointments.length > 0) {
      apptData.prenatal_appointments.forEach((prenatal: any) => {
        try {
          const record: ScheduleRecord = {
            id: prenatal.par_id || 0,
            scheduledDate: prenatal.requested_date || "",
            purpose: prenatal.reason || "Prenatal Appointment",
            status: (prenatal.status || "Pending").toLowerCase() as "Pending" | "Completed" | "Missed",
            sitio: "",
            type: "Resident",
            patrecType: "Prenatal",
            createdAt: prenatal.requested_at || prenatal.created_at || "", // Use requested_at for prenatal
          }
          console.log("Transformed prenatal record:", record)
          transformed.push(record)
        } catch (error) {
          console.error("Error transforming prenatal data:", error, prenatal)
        }
      })
    }

    console.log("All transformed appointments:", transformed)
    return transformed
  }, [appointments])

  // Filter and sort appointments based on search and active tab
  const filteredAppointments = useMemo(() => {
    const result = userAppointments
      .map((appt: any) => ({ ...appt, status: getAppointmentStatus(appt.scheduledDate, appt.status) }))
      .filter((appt: any) => {
        if (activeTab === 'pending' && appt.status !== 'Pending') return false
        if (activeTab === 'completed' && appt.status !== 'Completed') return false
        if (activeTab === 'missed' && appt.status !== 'Missed') return false

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

    // Sort by created/requested date (latest first)
    result.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      
      return dateB - dateA // Latest first
    })

    return result
  }, [userAppointments, searchQuery, activeTab])

  // Calculate stats for tabs
  const counts = useMemo(() => {
    return {
      pending: userAppointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Pending").length,
      completed: userAppointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Completed").length,
      missed: userAppointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Missed").length,
    }
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

  if (isLoading) { return <LoadingState/> }

  if (isError) {
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Appointments</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading appointments</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load appointment data. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg"
          >
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
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">My Appointments</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-1 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search appointments..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

        {/* Appointments List */}
        {userAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Calendar size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No appointments found</Text>
            <Text className="text-gray-600 text-center mt-2">
              There are no appointments scheduled yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => `appointment-${item.id}`}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={21}
            renderItem={({ item }) => {
              const actualStatus = getAppointmentStatus(item.scheduledDate, item.status)
              return (
                <AppointmentCard
                  appointment={item}
                  actualStatus={actualStatus}
                  onPress={() => console.log("")}
                />
              ) 
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <Calendar size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">No appointments in this category</Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab} appointments match your search.`
                    : `No ${activeTab} appointments found.`}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </PageLayout>
  )
}
