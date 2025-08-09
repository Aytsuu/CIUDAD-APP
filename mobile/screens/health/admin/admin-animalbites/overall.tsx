import React, { useState, useMemo } from "react"
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, FlatList } from "react-native"
import { Search, ChevronLeft, AlertCircle, Package, User, Calendar, FileText, Users, TrendingUp, Filter, ArrowLeft } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Link, router } from "expo-router"
import { format } from "date-fns"
import { useAnimalBitePatientSummary } from "./db-request/get-query"

type PatientSummary = {
  patient_id: string
  patient_fname: string
  patient_lname: string
  patient_mname?: string
  patient_sex: string
  patient_age: number
  patient_type: string
  patient_address: string
  record_count: number
  record_created_at: string
  first_record_date: string
}

type FilterType = 'all' | 'resident' | 'transient'

export default function AnimalBiteOverallScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const patientsPerPage = 10

  const { data: patientSummary, isLoading, isError, error, refetch } = useAnimalBitePatientSummary()

  const patients: PatientSummary[] = useMemo(() => {
    if (!patientSummary) return []
    return patientSummary
  }, [patientSummary])

  const filteredPatients = useMemo(() => {
    let result = patients
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      result = result.filter(
        (patient) =>
          patient.patient_fname.toLowerCase().includes(lowerCaseQuery) ||
          patient.patient_lname.toLowerCase().includes(lowerCaseQuery) ||
          patient.patient_id.toLowerCase().includes(lowerCaseQuery)
      )
    }
    if (activeFilter !== 'all') {
      result = result.filter((patient) =>
        patient.patient_type.toLowerCase() === activeFilter
      )
    }
    return result
  }, [patients, searchQuery, activeFilter])

  const paginatedPatients = useMemo(() => {
    const startIndex = (page - 1) * patientsPerPage
    return filteredPatients.slice(startIndex, startIndex + patientsPerPage)
  }, [filteredPatients, page])

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)

  const stats = useMemo(() => {
    const totalRecords = patients.reduce((sum, p) => {
    const count = Number(p.record_count) || 0 // Convert to number, default to 0 if invalid
    return sum + count
  }, 0)

    return {
      totalPatients: patients.length,
      residentPatients: patients.filter((p) => p.patient_type === "Resident").length,
      transientPatients: patients.filter((p) => p.patient_type === "Transient").length,
      totalRecords: totalRecords,
      showingPatients: `${Math.min(page * patientsPerPage, filteredPatients.length)} of ${filteredPatients.length}`
    }
  }, [patients, page, filteredPatients])

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
    setPage(1)
  }, [refetch])

  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return "Invalid Date"
    }
  }

  const getPatientInitials = (fname: string, lname: string) => {
    return `${fname.charAt(0)}${lname.charAt(0)}`.toUpperCase()
  }

  const handleFilterPress = (filter: FilterType) => {
    setActiveFilter(filter)
    setShowFilters(false)
    setPage(1)
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50">
        <View className="bg-white p-8 rounded-2xl items-center shadow-sm">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 font-medium">Loading animal bite records...</Text>
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-red-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-red-500 text-xl font-bold mb-2 mt-4">Error</Text>
          <Text className="text-gray-700 text-center leading-6">
            Failed to load patient data. {error?.message || "Please try again later."}
          </Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-6 px-6 py-3 bg-red-500 rounded-xl">
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center p-4 pt-12">
         <TouchableOpacity onPress={() => router.back()} className="p-2">
                     <ArrowLeft size={24} color="#333" />
                   </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">Animal Bite Records</Text>
          </View>
        </View>

        {/* Search and Filter Bar */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center space-x-3">
            <View className="flex-1 flex-row items-center p-2 border border-gray-200 bg-gray-50 rounded-xl">
              <Search size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Search by name or patient ID..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 rounded-xl"
            >
              <Filter size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Filter Dropdown */}
          {showFilters && (
            <View className="bg-white rounded-xl shadow-md p-3 mt-2">
              <TouchableOpacity
                onPress={() => handleFilterPress('all')}
                className={`py-2 px-3 rounded-lg ${activeFilter === 'all' ? 'bg-blue-50' : ''}`}
              >
                <Text className={`font-medium ${activeFilter === 'all' ? 'text-blue-700' : 'text-gray-700'}`}>
                  All Patients ({patients.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFilterPress('resident')}
                className={`py-2 px-3 rounded-lg ${activeFilter === 'resident' ? 'bg-blue-50' : ''}`}
              >
                <Text className={`font-medium ${activeFilter === 'resident' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Residents ({stats.residentPatients})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleFilterPress('transient')}
                className={`py-2 px-3 rounded-lg ${activeFilter === 'transient' ? 'bg-blue-50' : ''}`}
              >
                <Text className={`font-medium ${activeFilter === 'transient' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Transients ({stats.transientPatients})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Cards */}
        <View className="p-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <View className="flex-row items-center mb-2">
                  <Users size={20} color="#3B82F6" />
                  <Text className="ml-2 text-gray-600 text-sm font-medium">Total Patients</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.totalPatients}</Text>
              </View>
{/* 
              <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 min-w-[150px]">
              <View className="flex-row items-center mb-2">
                <FileText size={20} color="#10B981" />
                <Text className="ml-2 text-gray-600 text-sm font-medium">Total Records</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-800">{stats.totalRecords}</Text>
            </View> */}

              <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <View className="flex-row items-center mb-2">
                  <User size={20} color="#8B5CF6" />
                  <Text className="ml-2 text-gray-600 text-sm font-medium">Residents</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.residentPatients}</Text>
              </View>

              <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <View className="flex-row items-center mb-2">
                  <TrendingUp size={20} color="#F59E0B" />
                  <Text className="ml-2 text-gray-600 text-sm font-medium">Transients</Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800">{stats.transientPatients}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Patient List Header */}
        <View className="px-4 mb-2 mt-3 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">
            Patients ({filteredPatients.length})
          </Text>
          <Text className="text-gray-500 text-sm">
            Showing {stats.showingPatients}
          </Text>
        </View>

        {/* Patient List */}
        <View className="px-4 pb-6">
          {filteredPatients.length === 0 ? (
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 items-center">
              <Package size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">No Patients Found</Text>
              <Text className="text-gray-500 text-center leading-6">
                {searchQuery
                  ? "No patients match your search criteria."
                  : "There are no animal bite patients recorded yet."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={paginatedPatients}
              keyExtractor={(item) => `patient-${item.patient_id}`}
              scrollEnabled={false}
              renderItem={({ item: patient }) => (
                <Link href={`/admin/animalbites/individual?patientId=${patient.patient_id}`} asChild>
                  <TouchableOpacity
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-3"
                    activeOpacity={0.7}
                  >
                    {/* Patient Header */}
                    <View className="p-5">
                      <View className="flex-row items-center mb-4">
                        {/* Avatar */}
                        <View className="w-14 h-14 bg-gray-400 rounded-full items-center justify-center mr-4 shadow-md">
                          <User color="white" />
                        </View>

                        {/* Patient Info */}
                        <View className="flex-1">
                          <Text className="font-bold text-lg text-gray-800 mb-1">
                            {patient.patient_fname} {patient.patient_lname}
                          </Text>
                          <Text className="text-gray-500 text-sm mb-1">ID: {patient.patient_id}</Text>
                          <View className="flex-row items-center">
                            <View
                              className={`px-3 py-1 rounded-full ${
                                patient.patient_type === "Transient"
                                  ? "bg-orange-100 border border-orange-200"
                                  : "bg-green-100 border border-green-200"
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold ${
                                  patient.patient_type === "Transient" ? "text-orange-700" : "text-green-700"
                                }`}
                              >
                                {patient.patient_type}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Record Count Badge */}
                        {/* <View className="bg-blue-100 px-3 py-2 rounded-xl">
                          <Text className="text-blue-700 font-bold text-sm">
                            {patient.record_count} record{patient.record_count !== 1 ? "s" : ""}
                          </Text>
                        </View> */}
                      </View>

                      {/* Patient Details */}
                      <View className="bg-gray-50 rounded-lg p-4">
                        <View className="flex-row justify-between items-center mb-2">
                          <View className="flex-row items-center">
                            <User size={16} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-2">
                              Age: <Text className="font-semibold text-gray-800">{patient.patient_age}</Text>
                            </Text>
                          </View>
                          <Text className="text-gray-600 text-sm">
                            Gender: <Text className="font-semibold text-gray-800">{patient.patient_sex}</Text>
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                          <Calendar size={16} color="#6B7280" />
                          <Text className="text-gray-600 text-sm ml-2">
                            Latest Record:{" "}
                            <Text className="font-semibold text-gray-800">
                              {formatDateSafely(patient.record_created_at)}
                            </Text>
                          </Text>
                        </View>

                        {patient.patient_address && patient.patient_address !== "Address Not Available" && (
                          <View className="flex-row text-gray-800 items-start">
                            <Package size={16} color="#6B7280" className="mt-0.5" />
                            <Text className="text-gray-600 text-sm ml-2 flex-1" numberOfLines={2}>
                              {patient.patient_address}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Action Indicator */}
                    <View className="bg-blue-600 px-5 py-3">
                      <Text className="text-white font-semibold text-center">View Patient History →</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              )}
            />
          )}
        </View>

        {/* Pagination Controls */}
        {filteredPatients.length > patientsPerPage && (
          <View className="px-4 pb-6">
            <View className="bg-white rounded-xl p-4 shadow-sm flex-row justify-between items-center">
              <TouchableOpacity
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-100' : 'bg-blue-50'}`}
              >
                <Text className={`font-medium ${page === 1 ? 'text-gray-400' : 'text-blue-700'}`}>Previous</Text>
              </TouchableOpacity>

              <Text className="text-gray-600">
                Page {page} of {totalPages}
              </Text>

              <TouchableOpacity
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg ${page === totalPages ? 'bg-gray-100' : 'bg-blue-50'}`}
              >
                <Text className={`font-medium ${page === totalPages ? 'text-gray-400' : 'text-blue-700'}`}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}