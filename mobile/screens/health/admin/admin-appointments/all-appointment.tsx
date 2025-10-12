import React, { useState, useMemo } from "react"
import { View,TouchableOpacity,TextInput,RefreshControl,FlatList} from "react-native"
import { Search,AlertCircle,Calendar,User,FileText,ChevronLeft,MapPin,RefreshCw} from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { format } from "date-fns"
import { useAllAppointments } from "../../my-schedules/fetch"
import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"

type ScheduleRecord = {
  id: number
  patient: {
    firstName: string
    lastName: string
    middleName: string
    gender: string
    age: number
    ageTime: string
    patientId: string
  }
  scheduledDate: string
  purpose: string
  status: "Pending" | "Completed" | "Missed" | "Cancelled"
  sitio: string
  type: "Transient" | "Resident"
  patrecType: string
  appoint_type: string
}

type FilterType = "All" | "Pending" | "Completed" | "Missed" | "Cancelled"
type TabType = "pending" | "completed" | "missed" | "cancelled"

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
      case 'cancelled':
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
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
  counts: { pending: number; completed: number; missed: number; cancelled: number }
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
    <TouchableOpacity
      onPress={() => setActiveTab('cancelled')}
      className={`flex-1 items-center py-3 ${activeTab === 'cancelled' ? 'border-b-2 border-blue-600' : ''}`}
    >
      <Text className={`text-sm font-medium ${activeTab === 'cancelled' ? 'text-blue-600' : 'text-gray-600'}`}>
        Cancelled ({counts.cancelled})
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
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {appointment.patient.patientId}</Text>
              </View>
            </View>
          </View>
          <View className="items-end">
            <StatusBadge status={actualStatus} />
            <View className="bg-blue-100 px-2 py-1 rounded-lg mt-2">
              <Text className="text-blue-700 font-bold text-xs">#{appointment.id}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="p-4 space-y-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-700">
              {formatDateSafely(appointment.scheduledDate)}
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            {appointment.patient.age} {appointment.patient.ageTime}
          </Text>
        </View>

        <View className="flex-row items-start">
          <FileText size={16} color="#6B7280" className="mt-0.5" />
          <Text className="ml-2 text-sm text-gray-700 flex-1">
            {appointment.purpose}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MapPin size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-700">
              {appointment.sitio}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600">
              {appointment.type}
            </Text>
            
          </View>
          
        </View>

        <View className="flex-row items-center">
            <Text className="text-sm text-gray-600">
              {appointment.appoint_type}
            </Text>
            
          </View>
      </View>
    </TouchableOpacity>
  )
}

export default function AdminAppointmentsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("pending")

  // Large page size to fetch all data
  const appointmentsPerPage = 1000

  // Fetch data using the API hook
const { data: paginatedData, isLoading, error, refetch } = useAllAppointments({
  page: 1,
  page_size: appointmentsPerPage,
  status: 'all', // or filter by status
  type: 'all',   // or filter by type: 'follow-up', 'medical', 'prenatal'
})

  // Utility functions
  const getAppointmentStatus = (scheduledDate: string, currentStatus: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentDate = new Date(scheduledDate)
    appointmentDate.setHours(0, 0, 0, 0)

    if (appointmentDate < today && currentStatus === "Pending") {
      return "Missed"
    }
    return currentStatus
  }

  // Transform API data to match ScheduleRecord type
  const appointments = useMemo(() => {
  if (!paginatedData?.results) {
    return []
  }

  const transformed = paginatedData.results
    .map((appointment: any) => {
      try {
        const patientDetails = appointment.patient_details
        if (!patientDetails) {
          return null
        }

        const patientInfo = patientDetails.personal_info || {}
        const address = patientDetails.address || {}

        const calculateAge = (dob: string) => {
          if (!dob) {
            return { age: 0, ageTime: "yrs" }
          }
          try {
            const birthDate = new Date(dob)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--
            }
            return { age: Math.max(0, age), ageTime: "yrs" }
          } catch (e) {
            return { age: 0, ageTime: "yrs" }
          }
        }

        const ageInfo = calculateAge(patientInfo.per_dob)

        const formatDate = (dateStr: string) => {
          if (!dateStr) {
            return new Date().toISOString().split("T")[0]
          }
          try {
            return new Date(dateStr).toISOString().split("T")[0]
          } catch (e) {
            return dateStr
          }
        }

        const record: ScheduleRecord = {
          id: appointment.id,
          patient: {
            firstName: patientInfo.per_fname || "Unknown",
            lastName: patientInfo.per_lname || "Unknown",
            middleName: patientInfo.per_mname || "",
            gender: patientInfo.per_sex || "Unknown",
            age: ageInfo.age,
            ageTime: ageInfo.ageTime,
            patientId: patientDetails.pat_id || "",
          },
          scheduledDate: formatDate(appointment.scheduled_date),
          purpose: appointment.purpose || "Appointment",
          status: (appointment.status || "Pending").charAt(0).toUpperCase() +
            (appointment.status || "Pending").slice(1) as "Pending" | "Completed" | "Missed" | "Cancelled",
          sitio: address.add_sitio || address.location || "Unknown",
          type: patientDetails.pat_type === "Transient" ? "Transient" : "Resident",
          patrecType: appointment.type === 'prenatal' ? 'Prenatal' : 
                     appointment.type === 'medical-consultation' ? 'Consultation' : 'Follow-up',
        }

        return record
      } catch (error) {
        console.error("Error transforming appointment:", error, appointment)
        return null
      }
    })
    .filter(Boolean)

  return transformed
}, [paginatedData])

  // Filter appointments based on active tab and search query
  const filteredAppointments = useMemo(() => {
    let result = appointments

    // Filter by search query first
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      result = result.filter(
        (appointment: any) =>
          appointment.patient.firstName.toLowerCase().includes(lowerCaseQuery) ||
          appointment.patient.lastName.toLowerCase().includes(lowerCaseQuery) ||
          appointment.patient.patientId.toLowerCase().includes(lowerCaseQuery) ||
          appointment.purpose.toLowerCase().includes(lowerCaseQuery) ||
          appointment.sitio.toLowerCase().includes(lowerCaseQuery)
      )
    }

    // Filter by active tab
    result = result.filter((appointment: any) => {
      const actualStatus = getAppointmentStatus(appointment.scheduledDate, appointment.status)
      return actualStatus.toLowerCase() === activeTab
    })

    // Sort by date (most recent first)
    result.sort((a: any, b: any) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())

    return result
  }, [appointments, searchQuery, activeTab])

  // Calculate stats for tabs
  const counts = useMemo(() => {
    return {
      pending: appointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Pending").length,
      completed: appointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Completed").length,
      missed: appointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Missed").length,
      cancelled: appointments.filter((a: any) => getAppointmentStatus(a.scheduledDate, a.status) === "Cancelled").length,
    }
  }, [appointments])

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (e) {
      console.error("Refetch error:", e)
    }
    setRefreshing(false)
  }, [refetch])

  const handleAppointmentPress = (appointment: ScheduleRecord) => {
    console.log("View appointment:", { id: appointment.id, patient: appointment.patient.patientId })
    // Navigate to appointment details or perform action
  }

  if (isLoading) { return <LoadingState/>}

  if (error) {
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
        headerTitle={<Text className="text-gray-900 text-lg font-semibold">All Appointments</Text>}
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">All Appointments</Text>}
      rightAction={<View className="w-10 h-10" />
      }
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
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
        {appointments.length === 0 ? (
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
                  onPress={() => handleAppointmentPress(item)}
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