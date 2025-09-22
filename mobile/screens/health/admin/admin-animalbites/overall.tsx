import React, { useState, useMemo } from "react"
import { View, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, FlatList } from "react-native"
import { Search, ChevronLeft, AlertCircle, Package, User, Calendar, FileText, Users, TrendingUp, Filter, ChevronRight, UserCheck, UserPlus } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link, router } from "expo-router"
import { format } from "date-fns"
import { useAnimalBitePatientSummary } from "./db-request/get-query"
import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"

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
  const [page, setPage] = useState(1)
  const patientsPerPage = 10

  const { data: patientSummary, isLoading, isError, error, refetch, isFetching } = useAnimalBitePatientSummary()

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
      const count = Number(p.record_count) || 0
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
    await refetch()
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

  const handleFilterPress = (filter: FilterType) => {
    setActiveFilter(filter)
    setPage(1)
  }

  const handleRecordPress = (patientId: string) => {
    try {
      router.push({
        pathname: "/admin/animalbites/individual",
        params: { patientId },
      });
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const filterOptions = [
    { id: "all", name: "All Types" },
    { id: "resident", name: "Residents" },
    { id: "transient", name: "Transients" },
  ];

  const renderPatientItem = ({ item: patient }: { item: PatientSummary }) => (
    <View className="px-4 mb-3">
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          <TouchableOpacity
            onPress={() => handleRecordPress(patient.patient_id)}
            accessibilityLabel={`View records for ${patient.patient_fname} ${patient.patient_lname}`}
            className="p-4"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-slate-900 mb-1">
                  {patient.patient_fname} {patient.patient_lname}
                </Text>
                <View className="flex-row items-center">
                  <Badge 
                    variant={patient.patient_type === "Transient" ? "secondary" : "default"}
                    className="mr-2"
                  >
                    <Text className="text-xs">{patient.patient_type}</Text>
                  </Badge>
                  <Text className="text-xs text-slate-500">
                    ID: {patient.patient_id}
                  </Text>
                </View>
              </View>
              <View className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <ChevronRight size={16} color="#64748b" />
              </View>
            </View>

            {/* Info Grid */}
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Age & Gender
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {patient.patient_age} years, {patient.patient_sex}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Records
                </Text>
                <Text className="text-sm text-slate-700 font-medium">
                  {patient.record_count} record{patient.record_count !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Address if available */}
            {patient.patient_address && patient.patient_address !== "Address Not Available" && (
              <View className="mb-3">
                <Text className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                  Address
                </Text>
                <Text className="text-sm text-slate-700 font-medium" numberOfLines={2}>
                  {patient.patient_address}
                </Text>
              </View>
            )}

            {/* Date */}
            <View className="pt-3 border-t border-slate-100">
              <Text className="text-xs text-slate-500">
                Latest Record: {formatDateSafely(patient.record_created_at)}
              </Text>
            </View>
          </TouchableOpacity>
        </CardContent>
      </Card>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Stats Cards */}
      <View className="px-4 py-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <Users size={24} color="#3b82f6" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-blue-900">
                      {stats.totalPatients}
                    </Text>
                    <Text className="text-sm text-blue-700">Patients</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <UserCheck size={24} color="#059669" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-green-900">
                      {stats.residentPatients}
                    </Text>
                    <Text className="text-sm text-green-700">Residents</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          <View className="flex-1">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <UserPlus size={24} color="#d97706" />
                  <View className="ml-3">
                    <Text className="text-2xl font-bold text-amber-900">
                      {stats.transientPatients}
                    </Text>
                    <Text className="text-sm text-amber-700">Transients</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 mb-4">
        {/* Search Bar */}
        <Card className="mb-3 bg-white border-slate-200">
          <CardContent className="p-0">
            <View className="flex-row items-center px-4 py-3">
              <Search size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 text-slate-900 ml-3"
                placeholder="Search by name or patient ID..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                accessibilityLabel="Search animal bite records"
              />
            </View>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-2">
            <View className="flex-row justify-between">
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleFilterPress(option.id as FilterType)}
                  className={`flex-1 items-center py-2 rounded-lg mx-1 ${
                    activeFilter === option.id ? "bg-blue-600" : "bg-slate-50"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      activeFilter === option.id ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="px-4">
      <Card className="bg-white border-slate-200">
        <CardContent className="items-center justify-center py-12">
          <Package size={48} color="#94a3b8" />
          <Text className="text-lg font-medium text-slate-900 mt-4">
            No patients found
          </Text>
          <Text className="text-slate-500 text-center mt-2">
            {searchQuery
              ? "No patients match your search criteria."
              : "There are no animal bite patients recorded yet."}
          </Text>
        </CardContent>
      </Card>
    </View>
  );

  const renderFooter = () => {
    if (filteredPatients.length === 0 || totalPages <= 1) return null;
    
    return (
      <View className="px-4 mb-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between">
              <Button
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant={page === 1 ? "secondary" : "default"}
                className={page === 1 ? "bg-slate-200" : "bg-blue-600"}
              >
                <Text
                  className={`font-medium ${
                    page === 1 ? "text-slate-400" : "text-white"
                  }`}
                >
                  Previous
                </Text>
              </Button>

              <Text className="text-slate-600 font-medium">
                Page {page} of {totalPages}
              </Text>

              <Button
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant={page === totalPages ? "secondary" : "default"}
                className={page === totalPages ? "bg-slate-200" : "bg-blue-600"}
              >
                <Text
                  className={`font-medium ${
                    page === totalPages ? "text-slate-400" : "text-white"
                  }`}
                >
                  Next
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    );
  };

  if (isLoading) { return <LoadingState/> }

  if (isError) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <AlertCircle size={24} color="#ef4444" />
        <Text className="text-slate-900 font-medium mt-3 text-center">
          Something went wrong
        </Text>
        <Text className="text-slate-500 text-sm mt-1 text-center">
          {error?.message}
        </Text>
        <Button onPress={() => refetch()} className="mt-4 bg-blue-600">
          <Text className="text-white font-medium">Try Again</Text>
        </Button>
      </View>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Animal Bite Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-slate-50">
        <FlatList
          data={paginatedPatients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => `patient-${item.patient_id}`}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching || refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
        />
      </View>
    </PageLayout>
  )
}