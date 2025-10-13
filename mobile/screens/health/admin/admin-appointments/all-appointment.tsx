import React, { useState, useMemo, useCallback, useEffect } from "react"
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList } from "react-native"
import { Search, AlertCircle, Calendar, User, FileText, ChevronLeft, MapPin, RefreshCw, ChevronRight, ChevronLeft as ChevronLeftIcon } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { format } from "date-fns"
import { useAllFollowUpVisits } from "../../my-schedules/fetch"
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
}

type TabType = "pending" | "completed" | "missed" | "cancelled"

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Pagination Component
const Pagination: React.FC<{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading: boolean
}> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <View className="flex-row items-center justify-center py-4 px-2 bg-white border-t border-gray-200">
      {/* Previous Button */}
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={`flex-row items-center px-3 py-2 rounded-lg mr-2 ${
          currentPage === 1 || isLoading ? 'opacity-50' : 'bg-gray-100'
        }`}
      >
        <ChevronLeftIcon size={16} color="#374151" />
        <Text className="ml-1 text-sm font-medium text-gray-700">Prev</Text>
      </TouchableOpacity>

      {/* Page Numbers */}
      <View className="flex-row items-center mx-2">
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <Text className="px-3 py-2 text-gray-500">...</Text>
            ) : (
              <TouchableOpacity
                onPress={() => onPageChange(page as number)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg mx-1 min-w-10 items-center ${
                  currentPage === page
                    ? 'bg-blue-600'
                    : 'bg-gray-100'
                } ${isLoading ? 'opacity-50' : ''}`}
              >
                <Text
                  className={`text-sm font-medium ${
                    currentPage === page ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={`flex-row items-center px-3 py-2 rounded-lg ml-2 ${
          currentPage === totalPages || isLoading ? 'opacity-50' : 'bg-gray-100'
        }`}
      >
        <Text className="mr-1 text-sm font-medium text-gray-700">Next</Text>
        <ChevronRight size={16} color="#374151" />
      </TouchableOpacity>
    </View>
  )
}

// Results Info Component
const ResultsInfo: React.FC<{
  currentPage: number
  pageSize: number
  totalCount: number
  isLoading: boolean
}> = ({ currentPage, pageSize, totalCount, isLoading }) => {
  if (isLoading || totalCount === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <View className="bg-blue-50 px-4 py-2 border-b border-blue-200">
      <Text className="text-blue-800 text-sm text-center">
        Showing {startItem}-{endItem} of {totalCount.toLocaleString()} appointments
      </Text>
    </View>
  )
}

// Keep your existing StatusBadge, TabBar, and AppointmentCard components the same...
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
  onPress: () => void
}> = ({ appointment, onPress }) => {
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
            <StatusBadge status={appointment.status} />
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
      </View>
    </TouchableOpacity>
  )
}

export default function AdminAppointmentsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10 // Records per page

  // Debounced search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, activeTab])

  // Backend-powered API call with pagination
  const { data: paginatedData, isLoading, error, refetch } = useAllFollowUpVisits({
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearchQuery,
    tab: activeTab,
    sort_by: 'followv_date',
    sort_order: 'desc'
  })

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!paginatedData?.count) return 0
    return Math.ceil(paginatedData.count / pageSize)
  }, [paginatedData?.count, pageSize])

  // Simple data transformation
  const appointments = useMemo(() => {
    if (!paginatedData?.results) return []
    
    const transformed = paginatedData.results.map((visit: any) => {
      try {
        const patientDetails = visit.patient_details
        if (!patientDetails) return null

        const patientInfo = patientDetails.personal_info || {}
        const address = patientDetails.address || {}
        const rpIdInfo = patientDetails.rp_id || {}

        // Calculate age safely
        const calculateAge = (dob: string) => {
          if (!dob) return { age: 0, ageTime: "yrs" }
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

        // Normalize status
        const rawStatus = visit.followv_status || "pending"
        let normalizedStatus: "Pending" | "Completed" | "Missed" | "Cancelled"
        
        switch (rawStatus.toLowerCase()) {
          case 'completed':
            normalizedStatus = "Completed"
            break
          case 'pending':
            normalizedStatus = "Pending"
            break
          case 'missed':
            normalizedStatus = "Missed"
            break
          case 'cancelled':
            normalizedStatus = "Cancelled"
            break
          default:
            normalizedStatus = "Pending"
        }

        // Get patient type
        const patientType = patientDetails.pat_type === "Transient" ? "Transient" : "Resident"

        const record: ScheduleRecord = {
          id: visit.followv_id || visit.id || 0,
          patient: {
            firstName: patientInfo.per_fname || "Unknown",
            lastName: patientInfo.per_lname || "Unknown",
            middleName: patientInfo.per_mname || "",
            gender: patientInfo.per_sex || "Unknown",
            age: ageInfo.age,
            ageTime: ageInfo.ageTime,
            patientId: patientDetails.pat_id || rpIdInfo.rp_id || "Unknown",
          },
          scheduledDate: visit.followv_date || new Date().toISOString().split("T")[0],
          purpose: visit.followv_description || "Follow-up Visit",
          status: normalizedStatus,
          sitio: address.add_sitio || "Unknown Sitio",
          type: patientType,
          patrecType: patientDetails.pat_type || "Unknown",
        }

        return record
      } catch (error) {
        console.error('Error transforming visit:', visit.followv_id, error)
        return null
      }
    }).filter(Boolean) as ScheduleRecord[]

    return transformed
  }, [paginatedData])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (e) {
      console.error("Refetch error:", e)
    }
    setRefreshing(false)
  }, [refetch])

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  // Handle appointment press
  const handleAppointmentPress = useCallback((appointment: ScheduleRecord) => {
    console.log("View appointment:", { 
      id: appointment.id, 
      patientId: appointment.patient.patientId,
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`
    })
  }, [])

  // Get counts from backend or calculate from current data
  const counts = useMemo(() => {
    if (paginatedData?.counts) {
      return {
        pending: paginatedData.counts.pending || 0,
        completed: paginatedData.counts.completed || 0,
        missed: paginatedData.counts.missed || 0,
        cancelled: paginatedData.counts.cancelled || 0,
      }
    } else {
      // For page-based pagination, we might not have all counts
      // You could make a separate API call to get counts, or estimate from current data
      return {
        pending: 0,
        completed: 0,
        missed: 0,
        cancelled: 0,
      }
    }
  }, [paginatedData?.counts])

  if (isLoading) {
    return <LoadingState />
  }

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
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center p-3 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search by name, ID, or purpose..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={handleTabChange} counts={counts} />

        {/* Results Info */}
        <ResultsInfo
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={paginatedData?.count || 0}
          isLoading={isLoading}
        />

        {/* Appointments List */}
        <View className="flex-1">
          <FlatList
            data={appointments}
            keyExtractor={(item) => `appointment-${item.id}-${currentPage}`}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#3B82F6']} 
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-20">
                <Calendar size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                  {searchQuery || activeTab !== 'pending' ? 'No appointments found' : 'No appointments scheduled'}
                </Text>
                <Text className="text-gray-500 text-center">
                  {searchQuery
                    ? `No ${activeTab} appointments match "${searchQuery}"`
                    : `No ${activeTab} appointments found`}
                </Text>
                {(searchQuery || activeTab !== 'pending') && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('')
                      setActiveTab('pending')
                    }}
                    className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Show All Appointments</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                onPress={() => handleAppointmentPress(item)}
              />
            )}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </View>
      </View>
    </PageLayout>
  )
}