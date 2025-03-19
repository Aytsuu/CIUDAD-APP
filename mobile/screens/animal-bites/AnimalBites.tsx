"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
} from "lucide-react-native"
import ReferralForm from '@/screens/animal-bites/ReferralForm'


// Define the type for a referral
interface Referral {
  id: string
  patientName: string
  age: number
  gender: string
  address: string
  contact: string
  referredBy: string
  referredTo: string
  dateReferred: string
  exposure: string
  siteOfExposure: string
  bitingAnimal: string
  labExam: string
  status: string
  actionsDesired: string
  isTransient: boolean
}

// Mock data for animal bite referrals
const MOCK_REFERRALS: Referral[] = [
  {
    id: "1",
    patientName: "Caballes Katrina Shin",
    age: 32,
    gender: "Female",
    address: "123 Main St, Barangay 1, City",
    contact: "09123456789",
    referredBy: "Dr. Santos",
    referredTo: "Animal Bite Center",
    dateReferred: "2023-03-15",
    exposure: "Bite",
    siteOfExposure: "Right arm",
    bitingAnimal: "Dog",
    labExam: "Pending",
    status: "Pending",
    actionsDesired: "Anti-rabies vaccination",
    isTransient: false,
  },
  {
    id: "2",
    patientName: "Garcia Maria Elena",
    age: 28,
    gender: "Female",
    address: "456 Oak St, Barangay 2, City",
    contact: "09187654321",
    referredBy: "Dr. Reyes",
    referredTo: "City Health Office",
    dateReferred: "2023-03-17",
    exposure: "Bite",
    siteOfExposure: "Left hand",
    bitingAnimal: "Cat",
    labExam: "Completed",
    status: "Completed",
    actionsDesired: "Anti-rabies vaccination and wound care",
    isTransient: true,
  },
  {
    id: "3",
    patientName: "Santos Juan Carlos",
    age: 42,
    gender: "Male",
    address: "789 Pine St, Barangay 3, City",
    contact: "09198765432",
    referredBy: "Dr. Cruz",
    referredTo: "Provincial Hospital",
    dateReferred: "2023-03-10",
    exposure: "Scratch",
    siteOfExposure: "Right leg",
    bitingAnimal: "Cat",
    labExam: "Negative",
    status: "In Progress",
    actionsDesired: "Wound assessment and vaccination",
    isTransient: false,
  },
  {
    id: "4",
    patientName: "Reyes Anna Marie",
    age: 19,
    gender: "Female",
    address: "101 Cedar St, Barangay 4, City",
    contact: "09123459876",
    referredBy: "Dr. Garcia",
    referredTo: "Animal Bite Center",
    dateReferred: "2023-03-18",
    exposure: "Bite",
    siteOfExposure: "Left ankle",
    bitingAnimal: "Dog",
    labExam: "Pending",
    status: "Scheduled",
    actionsDesired: "Anti-rabies vaccination and tetanus shot",
    isTransient: false,
  },
  {
    id: "5",
    patientName: "Tan Michael Joseph",
    age: 56,
    gender: "Male",
    address: "202 Maple St, Barangay 5, City",
    contact: "09187659012",
    referredBy: "Dr. Lim",
    referredTo: "Regional Hospital",
    dateReferred: "2023-03-12",
    exposure: "Bite",
    siteOfExposure: "Right hand",
    bitingAnimal: "Monkey",
    labExam: "Positive",
    status: "Critical",
    actionsDesired: "Immediate rabies treatment and wound care",
    isTransient: true,
  },
  {
    id: "6",
    patientName: "Cruz Emily Rose",
    age: 23,
    gender: "Female",
    address: "303 Birch St, Barangay 6, City",
    contact: "09198761234",
    referredBy: "Dr. Tan",
    referredTo: "City Health Office",
    dateReferred: "2023-03-16",
    exposure: "Bite",
    siteOfExposure: "Neck",
    bitingAnimal: "Bat",
    labExam: "Pending",
    status: "In Progress",
    actionsDesired: "Rabies immunoglobulin and vaccination",
    isTransient: false,
  },
]

const AnimalBites = () => {
  const router = useRouter()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filter options
  const filterOptions = ["All", "Pending", "In Progress", "Completed", "Scheduled", "Critical"]

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setReferrals(MOCK_REFERRALS)
      setFilteredReferrals(MOCK_REFERRALS)
      setLoading(false)
    }, 1000)
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setReferrals(MOCK_REFERRALS)
      applyFilters(searchQuery, activeFilter)
      setRefreshing(false)
    }, 1000)
  }

  const applyFilters = (query: string, filter: string) => {
    let result = [...referrals]

    // Apply search query
    if (query) {
      result = result.filter(
        (referral) =>
          referral.patientName.toLowerCase().includes(query.toLowerCase()) ||
          referral.referredBy.toLowerCase().includes(query.toLowerCase()) ||
          referral.referredTo.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Apply status filter
    if (filter !== "All") {
      result = result.filter((referral) => referral.status === filter)
    }

    setFilteredReferrals(result)
  }

  useEffect(() => {
    applyFilters(searchQuery, activeFilter)
  }, [searchQuery, activeFilter, referrals])

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter)
    setShowFilterMenu(false)
  }

  const navigateToAddRecord = () => {
    // Use the imported ReferralForm component
    setSelectedReferral(null);
    setShowDetails(true);
  };

  const handleReferralPress = (referral: Referral) => {
    setSelectedReferral(referral)
    setShowDetails(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "Critical":
        return "bg-red-100 text-red-800"
      case "Pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle size={14} color="#15803d" />
      case "In Progress":
        return <Clock size={14} color="#1d4ed8" />
      case "Scheduled":
        return <Calendar size={14} color="#a16207" />
      case "Critical":
        return <AlertCircle size={14} color="#b91c1c" />
      case "Pending":
        return <Clock size={14} color="#6b7280" />
      default:
        return null
    }
  }

  const renderReferralItem = ({ item }: { item: Referral }) => (
    <TouchableOpacity
      className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm"
      onPress={() => handleReferralPress(item)}
      activeOpacity={0.7}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-gray-800">{item.patientName}</Text>
          <View className={`px-2 py-0.5 rounded-full flex-row items-center ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
            <Text className="text-xs ml-1 font-medium">{item.status}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-1">
          <User size={14} color="#6b7280" />
          <Text className="text-sm text-gray-500 ml-1">
            {item.age} years, {item.gender}
          </Text>
          {item.isTransient && (
            <View className="ml-2 px-2 py-0.5 bg-purple-100 rounded-full">
              <Text className="text-xs text-purple-800 font-medium">Transient</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center mb-1">
          <MapPin size={14} color="#6b7280" />
          <Text className="text-sm text-gray-500 ml-1" numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
          <View>
            <Text className="text-xs text-gray-500">Referred By</Text>
            <Text className="text-sm font-medium text-gray-700">{item.referredBy}</Text>
          </View>

          <View>
            <Text className="text-xs text-gray-500">Date</Text>
            <Text className="text-sm font-medium text-gray-700">
              {new Date(item.dateReferred).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row items-center">
            <ChevronRight size={20} color="#9ca3af" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const ReferralDetailModal = () => {
    if (!selectedReferral) return <ReferralForm />;

    return (
      <View className="absolute inset-0 bg-black/50 justify-end z-10">
        <View className="bg-white rounded-t-3xl p-5 h-4/5">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => setShowDetails(false)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ChevronLeft size={24} color="#0369a1" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Referral Details</Text>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Patient Info Section */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-2">{selectedReferral.patientName}</Text>
              <View className="flex-row items-center mb-1">
                <User size={16} color="#6b7280" />
                <Text className="text-gray-600 ml-2">
                  {selectedReferral.age} years, {selectedReferral.gender}
                </Text>
              </View>
              <View className="flex-row items-center mb-1">
                <MapPin size={16} color="#6b7280" />
                <Text className="text-gray-600 ml-2">{selectedReferral.address}</Text>
              </View>
              <View className="flex-row items-center">
                <Phone size={16} color="#6b7280" />
                <Text className="text-gray-600 ml-2">{selectedReferral.contact}</Text>
              </View>

              {selectedReferral.isTransient && (
                <View className="mt-2 px-3 py-1 bg-purple-100 self-start rounded-full">
                  <Text className="text-purple-800 font-medium">Transient Patient</Text>
                </View>
              )}
            </View>

            {/* Referral Info Section */}
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
              <Text className="text-base font-semibold text-gray-800 mb-3">Referral Information</Text>

              <View className="flex-row mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Referred By</Text>
                  <Text className="text-sm font-medium text-gray-700">{selectedReferral.referredBy}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Referred To</Text>
                  <Text className="text-sm font-medium text-gray-700">{selectedReferral.referredTo}</Text>
                </View>
              </View>

              <View className="flex-row mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Date Referred</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {new Date(selectedReferral.dateReferred).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Status</Text>
                  <View
                    className={`mt-1 px-2 py-0.5 rounded-full self-start flex-row items-center ${getStatusColor(selectedReferral.status)}`}
                  >
                    {getStatusIcon(selectedReferral.status)}
                    <Text className="text-xs ml-1 font-medium">{selectedReferral.status}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Exposure Details Section */}
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
              <Text className="text-base font-semibold text-gray-800 mb-3">Exposure Details</Text>

              <View className="flex-row mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Type of Exposure</Text>
                  <Text className="text-sm font-medium text-gray-700">{selectedReferral.exposure}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Site of Exposure</Text>
                  <Text className="text-sm font-medium text-gray-700">{selectedReferral.siteOfExposure}</Text>
                </View>
              </View>

              <View className="flex-row mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Biting Animal</Text>
                  <Text className="text-sm font-medium text-gray-700">{selectedReferral.bitingAnimal}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Laboratory Exam</Text>
                  <Text className="text-sm font-medium text-gray-700">{selectedReferral.labExam}</Text>
                </View>
              </View>
            </View>

            {/* Actions Section */}
            <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
              <Text className="text-base font-semibold text-gray-800 mb-2">Actions Desired</Text>
              <Text className="text-sm text-gray-700">{selectedReferral.actionsDesired}</Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity className="flex-1 mr-2 bg-blue-500 py-3 rounded-lg items-center">
                <Text className="text-white font-semibold">Update Status</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 ml-2 bg-gray-200 py-3 rounded-lg items-center">
                <Text className="text-gray-700 font-semibold">Print Referral</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-blue-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0369a1" />
        <Text className="mt-4 text-gray-600">Loading referrals...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm mr-3"
          >
            <ChevronLeft size={24} color="#0369a1" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Animal Bites</Text>
        </View>

        {/* Search and filter bar */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white rounded-l-xl shadow-sm flex-row items-center px-3">
            <Search size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 py-3 px-2"
              placeholder="Search Patient"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {/* Filter button */}
          <TouchableOpacity
            className="bg-white px-3 rounded-r-xl shadow-sm flex-row items-center"
            onPress={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={18} color={activeFilter !== "All" ? "#3B82F6" : "#9CA3AF"} />
          </TouchableOpacity>

          {/* Add record button */}
          <TouchableOpacity className="ml-3 bg-blue-600 px-4 py-3 rounded-xl shadow-sm" onPress={navigateToAddRecord}>
            <Text className="text-white font-medium">Add record</Text>
          </TouchableOpacity>
        </View>

        {/* Filter dropdown */}
        {showFilterMenu && (
          <View className="absolute top-32 left-4 bg-white rounded-lg shadow-lg z-10 w-40">
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                className={`px-4 py-3 border-b border-gray-100 ${activeFilter === filter ? "bg-blue-50" : ""}`}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text className={`${activeFilter === filter ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats summary */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-white rounded-lg p-3 flex-1 mr-2 shadow-sm">
            <Text className="text-xs text-gray-500">Total Referrals</Text>
            <Text className="text-xl font-bold text-gray-800">{referrals.length}</Text>
          </View>
          <View className="bg-white rounded-lg p-3 flex-1 mr-2 shadow-sm">
            <Text className="text-xs text-gray-500">Pending</Text>
            <Text className="text-xl font-bold text-blue-600">
              {referrals.filter((p) => p.status === "Pending").length}
            </Text>
          </View>
          <View className="bg-white rounded-lg p-3 flex-1 shadow-sm">
            <Text className="text-xs text-gray-500">Critical</Text>
            <Text className="text-xl font-bold text-red-600">
              {referrals.filter((p) => p.status === "Critical").length}
            </Text>
          </View>
        </View>

        {/* Referral list */}
        {filteredReferrals.length > 0 ? (
          <FlatList
            data={filteredReferrals}
            renderItem={renderReferralItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0369a1"]} />}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-10 bg-white rounded-xl">
            <Text className="text-gray-500 text-lg">No referrals found</Text>
            <Text className="text-gray-400 text-sm mt-1">Try adjusting your filters</Text>
            <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-lg" onPress={navigateToAddRecord}>
              <Text className="text-white font-medium">Add New Referral</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Detail Modal */}
      {showDetails && <ReferralDetailModal />}
    </SafeAreaView>
  )
}

export default AnimalBites

