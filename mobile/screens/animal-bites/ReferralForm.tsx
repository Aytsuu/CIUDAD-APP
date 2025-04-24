"use client"

import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Switch,
} from "react-native"
import { useRouter } from "expo-router"
import {
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  FileText,
  AlertCircle,
  ChevronDown,
  X,
  Phone,
  Clipboard,
  PawPrint,
} from "lucide-react-native"

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

// Simple date picker component
const SimpleDatePicker = ({
  visible,
  onClose,
  onSelect,
  initialDate,
}: {
  visible: boolean
  onClose: () => void
  onSelect: (date: Date) => void
  initialDate: Date
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date())

  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  const [day, setDay] = useState(selectedDate.getDate())
  const [month, setMonth] = useState(selectedDate.getMonth())
  const [year, setYear] = useState(selectedDate.getFullYear())

  const handleConfirm = () => {
    const newDate = new Date(year, month, day)
    onSelect(newDate)
    onClose()
  }

  if (!visible) return null

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-xl p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-6">
            {/* Day picker */}
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Day</Text>
              <View className="border border-gray-300 rounded-lg px-2 py-1">
                <ScrollView className="h-32" showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity
                      key={`day-${d}`}
                      className={`py-2 ${d === day ? "bg-blue-100 rounded" : ""}`}
                      onPress={() => setDay(d)}
                    >
                      <Text className={`text-center ${d === day ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Month picker */}
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">Month</Text>
              <View className="border border-gray-300 rounded-lg px-2 py-1">
                <ScrollView className="h-32" showsVerticalScrollIndicator={false}>
                  {months.map((m, index) => (
                    <TouchableOpacity
                      key={`month-${index}`}
                      className={`py-2 ${index === month ? "bg-blue-100 rounded" : ""}`}
                      onPress={() => setMonth(index)}
                    >
                      <Text
                        className={`text-center ${index === month ? "text-blue-600 font-medium" : "text-gray-700"}`}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Year picker */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">Year</Text>
              <View className="border border-gray-300 rounded-lg px-2 py-1">
                <ScrollView className="h-32" showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity
                      key={`year-${y}`}
                      className={`py-2 ${y === year ? "bg-blue-100 rounded" : ""}`}
                      onPress={() => setYear(y)}
                    >
                      <Text className={`text-center ${y === year ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <TouchableOpacity className="bg-blue-500 py-3 rounded-lg" onPress={handleConfirm}>
            <Text className="text-white font-semibold text-center">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// Dropdown component for reusability
const Dropdown = ({
  label,
  options,
  value,
  onSelect,
  placeholder = "Select an option",
  required = false,
}: {
  label: string
  options: string[]
  value: string
  onSelect: (value: string) => void
  placeholder?: string
  required?: boolean
}) => {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <View className="mb-3">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 flex-row justify-between items-center"
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</Text>
        <ChevronDown size={16} color="#6B7280" />
      </TouchableOpacity>

      {showDropdown && (
        <View className="absolute top-20 left-0 right-0 bg-white border border-gray-300 rounded-lg z-10 mt-1 shadow-md">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              className="px-3 py-2.5 border-b border-gray-200"
              onPress={() => {
                onSelect(option)
                setShowDropdown(false)
              }}
            >
              <Text className={option === value ? "text-blue-600 font-medium" : "text-gray-700"}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const ReferralForm = () => {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("referral")
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [activeDateField, setActiveDateField] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Referral Information
    referredTo: "",
    referredBy: "",
    dateReferred: new Date(),
    isTransient: false,

    // Patient Information
    patientName: "",
    age: "",
    gender: "",
    address: "",
    contact: "",

    // Exposure Details
    exposure: "",
    siteOfExposure: "",
    bitingAnimal: "",
    labExam: "",

    // Actions
    actionsDesired: "",
    status: "Pending",
  })

  // Options for dropdowns
  const genderOptions = ["Male", "Female", "Other"]
  const exposureOptions = ["Bite", "Scratch", "Lick on open wound", "Other"]
  const animalOptions = ["Dog", "Cat", "Bat", "Rat", "Monkey", "Other"]
  const labExamOptions = ["Pending", "Completed", "Negative", "Positive", "Not Required"]
  const referralToOptions = [
    "Animal Bite Center",
    "City Health Office",
    "Provincial Hospital",
    "Regional Hospital",
    "Private Clinic",
  ]

  const showDatePickerFor = (field: string) => {
    setActiveDateField(field)
    setDatePickerVisible(true)
  }

  const handleDateSelect = (date: Date) => {
    if (activeDateField === "dateReferred") {
      setFormData({ ...formData, dateReferred: date })
    }
  }

  const validateForm = () => {
    // Required fields for each section
    const requiredFields: Record<string, string[]> = {
      referral: ["referredTo", "referredBy"],
      patient: ["patientName", "age", "gender"],
      exposure: ["exposure", "siteOfExposure", "bitingAnimal"],
    }

    const currentRequiredFields = requiredFields[activeSection]
    const missingFields = currentRequiredFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingFields.length > 0) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (!validateForm()) return

    if (activeSection === "referral") {
      setActiveSection("patient")
    } else if (activeSection === "patient") {
      setActiveSection("exposure")
    } else if (activeSection === "exposure") {
      setActiveSection("actions")
    }
  }

  const handlePrevious = () => {
    if (activeSection === "patient") {
      setActiveSection("referral")
    } else if (activeSection === "exposure") {
      setActiveSection("patient")
    } else if (activeSection === "actions") {
      setActiveSection("exposure")
    }
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // In a real app, you would send this data to your API
    console.log("Submitting form data:", formData)

    // Generate a unique ID for the new referral
    const newReferral: Referral = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      age: Number.parseInt(formData.age),
      gender: formData.gender,
      address: formData.address,
      contact: formData.contact,
      referredBy: formData.referredBy,
      referredTo: formData.referredTo,
      dateReferred: formData.dateReferred.toISOString().split("T")[0],
      exposure: formData.exposure,
      siteOfExposure: formData.siteOfExposure,
      bitingAnimal: formData.bitingAnimal,
      labExam: formData.labExam,
      status: formData.status,
      actionsDesired: formData.actionsDesired,
      isTransient: formData.isTransient,
    }

    Alert.alert("Success", "Animal bite referral has been successfully saved.", [
      {
        text: "View Referrals",
        onPress: () => router.push("./screens/animal-bites/AnimalBites"),
      },
    ])
  }

  const renderSection = () => {
    switch (activeSection) {
      case "referral":
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Referral Information</Text>

            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Dropdown
                label="Referred To"
                options={referralToOptions}
                value={formData.referredTo}
                onSelect={(value) => setFormData({ ...formData, referredTo: value })}
                placeholder="Select facility"
                required
              />

              <Text className="text-sm font-medium text-gray-700 mb-1">
                Referred By <Text className="text-red-500">*</Text>
              </Text>
              <View className="relative mb-3">
                <TextInput
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pl-9"
                  placeholder="Enter referring doctor/facility"
                  value={formData.referredBy}
                  onChangeText={(text) => setFormData({ ...formData, referredBy: text })}
                />
                <View className="absolute left-3 top-3">
                  <User size={16} color="#6B7280" />
                </View>
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-1">Date of Referral</Text>
              <TouchableOpacity
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-3 flex-row justify-between items-center"
                onPress={() => showDatePickerFor("dateReferred")}
              >
                <Text>{formData.dateReferred.toLocaleDateString()}</Text>
                <Calendar size={16} color="#6B7280" />
              </TouchableOpacity>

              <View className="flex-row items-center mb-1">
                <Switch
                  value={formData.isTransient}
                  onValueChange={(value) => setFormData({ ...formData, isTransient: value })}
                  trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
                  thumbColor={formData.isTransient ? "#3b82f6" : "#f4f4f5"}
                />
                <Text className="ml-2 text-gray-700">Transient Patient</Text>
              </View>
              <Text className="text-xs text-gray-500 ml-12">Check if patient is not a resident of the area</Text>
            </View>
          </View>
        )

      case "patient":
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Patient Information</Text>

            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Full Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-3"
                placeholder="Enter patient's full name"
                value={formData.patientName}
                onChangeText={(text) => setFormData({ ...formData, patientName: text })}
              />

              <View className="flex-row gap-4 mb-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Age <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                    placeholder="Age"
                    keyboardType="numeric"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                  />
                </View>

                <View className="flex-1">
                  <Dropdown
                    label="Gender"
                    options={genderOptions}
                    value={formData.gender}
                    onSelect={(value) => setFormData({ ...formData, gender: value })}
                    required
                  />
                </View>
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
              <View className="relative mb-3">
                <TextInput
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pl-9"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
                <View className="absolute left-3 top-3">
                  <MapPin size={16} color="#6B7280" />
                </View>
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-1">Contact Number</Text>
              <View className="relative mb-1">
                <TextInput
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pl-9"
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                  value={formData.contact}
                  onChangeText={(text) => setFormData({ ...formData, contact: text })}
                />
                <View className="absolute left-3 top-3">
                  <Phone size={16} color="#6B7280" />
                </View>
              </View>
            </View>
          </View>
        )

      case "exposure":
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Exposure Details</Text>

            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Dropdown
                label="Type of Exposure"
                options={exposureOptions}
                value={formData.exposure}
                onSelect={(value) => setFormData({ ...formData, exposure: value })}
                required
              />

              <Text className="text-sm font-medium text-gray-700 mb-1">
                Site of Exposure <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-3"
                placeholder="e.g., Right arm, left leg, etc."
                value={formData.siteOfExposure}
                onChangeText={(text) => setFormData({ ...formData, siteOfExposure: text })}
              />

              <Dropdown
                label="Biting Animal"
                options={animalOptions}
                value={formData.bitingAnimal}
                onSelect={(value) => setFormData({ ...formData, bitingAnimal: value })}
                required
              />

              <Dropdown
                label="Laboratory Exam"
                options={labExamOptions}
                value={formData.labExam}
                onSelect={(value) => setFormData({ ...formData, labExam: value })}
              />
            </View>
          </View>
        )

      case "actions":
        return (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-gray-800">Actions Desired</Text>

            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-sm font-medium text-gray-700 mb-1">Actions Desired</Text>
              <TextInput
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-3"
                placeholder="Describe required actions"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.actionsDesired}
                onChangeText={(text) => setFormData({ ...formData, actionsDesired: text })}
              />

              <View className="bg-blue-50 rounded-lg p-3 mb-3">
                <View className="flex-row items-center">
                  <AlertCircle size={18} color="#1d4ed8" />
                  <Text className="ml-2 font-medium text-blue-800">Referral Status</Text>
                </View>
                <Text className="text-sm text-blue-700 mt-1">
                  This referral will be saved with a "Pending" status. You can update the status later.
                </Text>
              </View>

              <View className="bg-yellow-50 rounded-lg p-3">
                <View className="flex-row items-center">
                  <AlertCircle size={18} color="#a16207" />
                  <Text className="ml-2 font-medium text-yellow-800">Important Note</Text>
                </View>
                <Text className="text-sm text-yellow-700 mt-1">
                  Please ensure all information is accurate. After submission, a copy of this referral will be sent to
                  the receiving facility.
                </Text>
              </View>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Header with back button */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
              >
                <ChevronLeft size={24} color="#0369a1" />
              </TouchableOpacity>
              <Text className="text-xl font-semibold ml-3 text-gray-800">New Animal Bite Referral</Text>
            </View>

            {/* Form progress indicator */}
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity
                className={`flex-1 items-center ${activeSection === "referral" ? "opacity-100" : "opacity-60"}`}
                onPress={() => setActiveSection("referral")}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${activeSection === "referral" ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <Clipboard size={20} color="white" />
                </View>
                <Text className="text-xs font-medium">Referral</Text>
              </TouchableOpacity>

              <View className="w-6 h-1 bg-gray-300 self-center mt-1" />

              <TouchableOpacity
                className={`flex-1 items-center ${activeSection === "patient" ? "opacity-100" : "opacity-60"}`}
                onPress={() => setActiveSection("patient")}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${activeSection === "patient" ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <User size={20} color="white" />
                </View>
                <Text className="text-xs font-medium">Patient</Text>
              </TouchableOpacity>

              <View className="w-6 h-1 bg-gray-300 self-center mt-1" />

              <TouchableOpacity
                className={`flex-1 items-center ${activeSection === "exposure" ? "opacity-100" : "opacity-60"}`}
                onPress={() => setActiveSection("exposure")}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${activeSection === "exposure" ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <PawPrint size={20} color="white" />
                </View>
                <Text className="text-xs font-medium">Exposure</Text>
              </TouchableOpacity>

              <View className="w-6 h-1 bg-gray-300 self-center mt-1" />

              <TouchableOpacity
                className={`flex-1 items-center ${activeSection === "actions" ? "opacity-100" : "opacity-60"}`}
                onPress={() => setActiveSection("actions")}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${activeSection === "actions" ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <FileText size={20} color="white" />
                </View>
                <Text className="text-xs font-medium">Actions</Text>
              </TouchableOpacity>
            </View>

            {/* Form sections */}
            {renderSection()}

            {/* Navigation buttons */}
            <View className="flex-row justify-between mt-6 mb-4">
              {activeSection !== "referral" && (
                <TouchableOpacity className="px-6 py-3 bg-gray-200 rounded-lg" onPress={handlePrevious}>
                  <Text className="font-medium text-gray-700">Previous</Text>
                </TouchableOpacity>
              )}

              {activeSection !== "actions" ? (
                <TouchableOpacity className="px-6 py-3 bg-blue-500 rounded-lg ml-auto" onPress={handleNext}>
                  <Text className="font-medium text-white">Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity className="px-6 py-3 bg-green-500 rounded-lg ml-auto" onPress={handleSubmit}>
                  <Text className="font-medium text-white">Submit Referral</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom date picker */}
      <SimpleDatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelect={handleDateSelect}
        initialDate={formData.dateReferred}
      />
    </SafeAreaView>
  )
}

export default ReferralForm

