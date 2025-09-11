
import React, { useState, useMemo } from "react"
import {
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ScrollView,
} from "react-native"
import {
  Search,
  ArrowLeft,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Filter,
  ChevronLeft,
} from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { format } from "date-fns"
import { useAllFollowUpVisits } from "../../my-schedules/fetch"
import PageLayout from "@/screens/_PageLayout"

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
}

type FilterType = "All" | "Pending" | "Completed" | "Missed" | "Cancelled"

export default function AdminAppointmentsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [showFilters, setShowFilters] = useState(false)

  // Large page size to fetch all data
  const appointmentsPerPage = 1000

  // Fetch data using the API hook
  const { data: paginatedData, isLoading, error, refetch } = useAllFollowUpVisits({
    page: 1,
    page_size: appointmentsPerPage,
  })

  // Debugging: Log API response
  console.log("API Response:", paginatedData)
  console.log("Raw results:", paginatedData?.results)

  // Utility functions defined before useMemo
  const getAppointmentStatus = (scheduledDate: string, currentStatus: string) => {
    console.log("getAppointmentStatus called with:", { scheduledDate, currentStatus })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const appointmentDate = new Date(scheduledDate)
    appointmentDate.setHours(0, 0, 0, 0)

    if (appointmentDate < today && currentStatus === "Pending") {
      console.log(`Appointment on ${scheduledDate} marked as Missed (was Pending)`)
      return "Missed"
    }
    return currentStatus
  }

  const formatDateSafely = (dateString: string) => {
    if (!dateString) {
      console.warn("formatDateSafely: No date string provided")
      return "N/A"
    }
    try {
      const formatted = format(new Date(dateString), "MMM dd, yyyy")
      console.log(`Formatted date ${dateString} to ${formatted}`)
      return formatted
    } catch (e) {
      console.error("formatDateSafely error:", e, { dateString })
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Pending: "bg-yellow-500 border-yellow-500",
      Completed: "bg-green-500 border-green-500",
      Missed: "bg-red-500 border-red-500",
      Cancelled: "bg-gray-500 border-gray-500",
    }
    const selectedColor = colors[status as keyof typeof colors] || colors.Cancelled
    console.log(`Status ${status} mapped to color class: ${selectedColor}`)
    return selectedColor
  }

  // Transform API data to match ScheduleRecord type
  const appointments = useMemo(() => {
    if (!paginatedData?.results) {
      console.warn("No results in paginatedData")
      return []
    }

    const transformed = paginatedData.results
      .map((visit: any) => {
        console.log("Processing visit:", visit)
        try {
          const patientDetails = visit.patient_details
          if (!patientDetails) {
            console.warn("No patient details found for visit:", visit)
            return null
          }

          const patientInfo = patientDetails.personal_info || {}
          const address = patientDetails.address || {}

          const calculateAge = (dob: string) => {
            if (!dob) {
              console.warn("No DOB provided for age calculation")
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
              console.log(`Calculated age for DOB ${dob}: ${age} yrs`)
              return { age: Math.max(0, age), ageTime: "yrs" }
            } catch (e) {
              console.error("Error calculating age:", e, { dob })
              return { age: 0, ageTime: "yrs" }
            }
          }

          const ageInfo = calculateAge(patientInfo.per_dob)

          const formatDate = (dateStr: string) => {
            if (!dateStr) {
              console.warn("No date string for formatDate")
              return new Date().toISOString().split("T")[0]
            }
            try {
              const formatted = new Date(dateStr).toISOString().split("T")[0]
              console.log(`Formatted date ${dateStr} to ${formatted}`)
              return formatted
            } catch (e) {
              console.error("Error formatting date:", e, { dateStr })
              return dateStr
            }
          }

          const record: ScheduleRecord = {
            id: visit.followv_id || visit.id || 0,
            patient: {
              firstName: patientInfo.per_fname || "Unknown",
              lastName: patientInfo.per_lname || "Unknown",
              middleName: patientInfo.per_mname || "",
              gender: patientInfo.per_sex || "Unknown",
              age: ageInfo.age,
              ageTime: ageInfo.ageTime,
              patientId: patientDetails.pat_id || patientInfo.pat_id || "",
            },
            scheduledDate: formatDate(visit.followv_date || visit.date),
            purpose: visit.followv_description || visit.description || visit.purpose || "Follow-up Visit",
            status: (visit.followv_status || visit.status || "Pending").charAt(0).toUpperCase() +
              (visit.followv_status || visit.status || "Pending").slice(1) as "Pending" | "Completed" | "Missed" | "Cancelled",
            sitio: address.add_sitio || address.location || "Unknown",
            type: patientDetails.pat_type === "Transient" ? "Transient" : "Resident",
            patrecType: patientDetails.patrec_type || "Unknown",
          }

          console.log("Transformed record:", record)
          return record
        } catch (error) {
          console.error("Error transforming visit data:", error, visit)
          return null
        }
      })
      .filter(Boolean)

    console.log("Transformed appointments:", transformed)
    return transformed
  }, [paginatedData])

  // Filter appointments (client-side filtering)
  const filteredAppointments = useMemo(() => {
    let result = appointments

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      result = result.filter(
        (appointment: { patient: { firstName: string; lastName: string; patientId: string }; purpose: string }) =>
          appointment.patient.firstName.toLowerCase().includes(lowerCaseQuery) ||
          appointment.patient.lastName.toLowerCase().includes(lowerCaseQuery) ||
          appointment.patient.patientId.toLowerCase().includes(lowerCaseQuery) ||
          appointment.purpose.toLowerCase().includes(lowerCaseQuery),
      )
      console.log("Applied search filter:", { searchQuery, resultCount: result.length })
    }

    if (activeFilter !== "All") {
      result = result.filter((appointment: { scheduledDate: string; status: string }) => getAppointmentStatus(appointment.scheduledDate, appointment.status) === activeFilter)
      console.log("Applied status filter:", { activeFilter, resultCount: result.length })
    }

    console.log("Final filtered appointments:", result)
    return result // No sorting by date to show all appointments
  }, [appointments, searchQuery, activeFilter])

  // Calculate stats for display
  const stats = useMemo(() => {
    const stats = {
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter((a: { scheduledDate: string; status: string }) => getAppointmentStatus(a.scheduledDate, a.status) === "Pending").length,
      completedAppointments: appointments.filter((a: { scheduledDate: string; status: string }) => getAppointmentStatus(a.scheduledDate, a.status) === "Completed").length,
      missedAppointments: appointments.filter((a: { scheduledDate: string; status: string }) => getAppointmentStatus(a.scheduledDate, a.status) === "Missed").length,
    }
    console.log("Stats calculated:", stats)
    return stats
  }, [appointments])

  const onRefresh = React.useCallback(async () => {
    console.log("Refresh triggered")
    setRefreshing(true)
    try {
      await refetch()
      console.log("Refetch successful")
    } catch (e) {
      console.error("Refetch error:", e)
    }
    setRefreshing(false)
  }, [refetch])

  const handleFilterPress = (filter: FilterType) => {
    console.log("Filter selected:", filter)
    setActiveFilter(filter)
    setShowFilters(false)
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 font-medium">Loading appointments...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-red-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-red-500 text-xl font-bold mb-2 mt-4">Error</Text>
          <Text className="text-gray-700 text-center leading-6">
            Failed to load appointment data. Please try again later.
          </Text>
          <TouchableOpacity onPress={onRefresh} className="mt-6 px-6 py-3 bg-red-500 rounded-xl">
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          headerTitle={<Text className="text-gray-900 text-[13px]">All Appointments</Text>}
          rightAction={<TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-100 rounded-xl"
          >
            <Filter size={20} color="#3B82F6" />
          </TouchableOpacity>}
        >
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white shadow-md">

        {/* Search and Filter Bar */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center p-3 border border-gray-200 bg-white rounded-2xl shadow-sm">
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

          {/* Filter Dropdown */}
          {showFilters && (
            <View className="bg-white rounded-2xl shadow-md p-4 mt-2">
              {["All", "Pending", "Completed", "Missed", "Cancelled"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => handleFilterPress(filter as FilterType)}
                  className={`py-2 px-4 rounded-lg ${activeFilter === filter ? "bg-blue-50" : ""}`}
                >
                  <Text className={`font-medium text-base ${activeFilter === filter ? "text-blue-600" : "text-gray-700"}`}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Stats and Appointments */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => `appointment-${item.id}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={21}
        ListHeaderComponent={() => (
          <View className="p-4">
            {/* Statistics Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <View className="flex-row items-center mb-2">
                    <Calendar size={20} color="#3B82F6" />
                    <Text className="ml-2 text-gray-600 text-sm font-medium">Total</Text>
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</Text>
                </View>
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <View className="flex-row items-center mb-2">
                    <Clock size={20} color="#F59E0B" />
                    <Text className="ml-2 text-gray-600 text-sm font-medium">Pending</Text>
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">{stats.pendingAppointments}</Text>
                </View>
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <View className="flex-row items-center mb-2">
                    <Users size={20} color="#10B981" />
                    <Text className="ml-2 text-gray-600 text-sm font-medium">Completed</Text>
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">{stats.completedAppointments}</Text>
                </View>
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <View className="flex-row items-center mb-2">
                    <TrendingUp size={20} color="#EF4444" />
                    <Text className="ml-2 text-gray-600 text-sm font-medium">Missed</Text>
                  </View>
                  <Text className="text-3xl font-bold text-gray-900">{stats.missedAppointments}</Text>
                </View>
              </View>
            </ScrollView>
            {/* Appointments Header */}
            <View className="mt-4 mb-2 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">Appointments ({filteredAppointments.length})</Text>
            </View>
          </View>
        )}
        renderItem={({ item: appointment }) => {
          const actualStatus = getAppointmentStatus(appointment.scheduledDate, appointment.status)
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl shadow-md border border-gray-200 mx-4 mb-4 overflow-hidden"
              activeOpacity={0.8}
              onPress={() => {
                console.log("View appointment:", { id: appointment.id, patient: appointment.patient.patientId })
              }}
            >
              {/* Appointment Header */}
              <View className="p-5">
                <View className="flex-row items-center mb-4">
                  {/* Avatar */}
                  <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-4 shadow-md">
                    <User color="white" size={24} />
                  </View>
                  {/* Patient Info */}
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-900 mb-1">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-1">ID: {appointment.patient.patientId}</Text>
                    <View className="flex-row items-center">
                      <View className={`px-3 py-1 rounded-full border ${getStatusColor(actualStatus)}`}>
                        <Text className="text-xs font-semibold">{actualStatus}</Text>
                      </View>
                    </View>
                  </View>
                  {/* Schedule ID Badge */}
                  <View className="bg-blue-100 px-3 py-2 rounded-xl">
                    <Text className="text-blue-700 font-bold text-sm">#{appointment.id}</Text>
                  </View>
                </View>
                {/* Appointment Details */}
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Calendar size={16} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Date: <Text className="font-semibold text-gray-900">{formatDateSafely(appointment.scheduledDate)}</Text>
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm">
                      Age: <Text className="font-semibold text-gray-900">{appointment.patient.age} {appointment.patient.ageTime}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <FileText size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      Purpose: <Text className="font-semibold text-gray-900">{appointment.purpose}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <User size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      Type: <Text className="font-semibold text-gray-900">{appointment.type}</Text> • Sitio: <Text className="font-semibold text-gray-900">{appointment.sitio}</Text>
                    </Text>
                  </View>
                </View>
              </View>
              {/* Action Indicator */}
              <View className="bg-blue-600 px-5 py-3">
                <Text className="text-white font-semibold text-center">View Appointment Details →</Text>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={() => (
          <View className="p-6 items-center">
            <Calendar size={48} color="#D1D5DB" />
            <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">No Appointments Found</Text>
            <Text className="text-gray-500 text-center leading-6">
              {searchQuery
                ? "No appointments match your search criteria."
                : "There are no appointments scheduled yet."}
            </Text>
          </View>
        )}
      />
    </View>
    </PageLayout>
  )
}